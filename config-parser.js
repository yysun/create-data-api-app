const fs = require('fs');
const yaml = require('js-yaml');

module.exports = file => {

  const configFile = fs.readFileSync(file, 'utf8');
  const config = yaml.load(configFile);

  const parse_fields = fields => !Array.isArray(fields) ? [] :
    fields.map(field => {
      let [type, name, keys, comment] = field.split(' ');
      if (keys && keys.startsWith('"')) {
        comment = keys;
        keys = undefined;
      }
      if (comment) comment = comment.replace(/"/g, '');
      return { type, name, keys, comment };
    });


  config.databases.forEach(db => {

    db.paths = [];

    db.objects.forEach(obj => {

      const obj_keys = Object.keys(obj);

      let name, type;
      if (obj_keys.includes('table')) {
        name = obj.table;
        type = 'table';
      } else if (obj_keys.includes('query')) {
        name = obj.query;
        type = 'query';
      } else if (obj_keys.includes('procedure')) {
        name = obj.procedure;
        type = 'procedure';
      }

      Object.keys(obj).forEach(key => {
        if (key === 'table' || key === 'query' || key === 'procedure' || key === 'select') return;
        let [method, path] = key.split('-');
        const fields = parse_fields(obj[key]);
        obj[key] = fields;

        path = `${name}${path ? '/' + path : ''}`;
        method = method.toLowerCase();
        if (method === 'get' || method === 'delete' || method === 'patch') {
          const keys = fields.filter(field => field.keys && field.keys.includes('PK'));
          if (keys.length > 0) {
            path += keys.map(key => `/:${key.name}`).join('');
          }
        }

        const prefix = config.databases.length > 1 ? `/${db.name}` : '';
        path = `${config.path}${prefix}/${path}`
        const api = {
          name,
          type,
          func: `${name}:${key}`,
          path,
          method,
          fields,
          keys: fields.filter(f => f.keys),
          key_names: fields.filter(f => f.keys).map(f => `${f.name}`),
          field_names: fields.map(f => `${f.name}`)
        };


        db.paths.push(api);
      });
    });

  });
  console.log(JSON.stringify(config, null, 2));
  return config;
}