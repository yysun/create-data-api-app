const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

module.exports = file => {

  let config_exists = fs.existsSync(file);
  if (!config_exists) {
    console.log(`Config file not found: ${file}. \nCreating an example config.yaml`);
    const example_file = path.join(__dirname, 'config.yaml');
    fs.copyFileSync(example_file, file);
  }

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
      if (obj_keys[0] === 'table' || obj_keys[0] === 'view') {
        name = obj.table;
        type = 'table';
      } else if (obj_keys[0] === 'query') {
        name = obj.query;
        type = 'query';
      } else if (obj_keys[0] === 'procedure') {
        name = obj.procedure;
        type = 'procedure';
      } else return;

      obj_keys.forEach(key => {
        if (key === 'table' || key === 'query' || key === 'procedure' || key === 'select' || key === 'view') return;
        const authentication = key.includes('*');
        let [method, path] = key.replace(/\*/g, '').split(' ');
        const fields = parse_fields(obj[key]);
        obj[key] = fields;

        // path = `/${name}${path ? `${path}` : ''}`;
        path = path || `/${name}`;
        method = method.toLowerCase();
        // if (method === 'get' || method === 'delete') {
        //   const keys = fields.filter(field => field.keys);
        //   if (keys.length > 0) {
        //     path += keys.map(key => `/:${key.name}`).join('');
        //   }
        //   if (keys.length === 1 && keys.find(f => f.keys.includes('PK'))) {
        //     path = `/${name}/:${keys[0].name}`;
        //   }
        // }

        const prefix = config.databases.length > 1 ? `/${db.name}` : '';
        path = `${config.path}${prefix}${path}`
        const api = {
          name,
          type,
          func: `${name}.${key}`,
          path,
          method,
          fields,
          authentication,
          keys: fields.filter(f => f.keys),
          key_names: fields.filter(f => f.keys).map(f => `${f.name}`),
          field_names: fields.map(f => `${f.name}`)
        };
        db.paths.push(api);
      });
    });

  });
  return config;
}