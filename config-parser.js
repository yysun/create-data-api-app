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
  const config = fs.readFileSync(file, 'utf8');
  return parse(config);
}

function parse(text) {
  const config = yaml.load(text);

  const parse_field = fieldStr => {
    console.assert(typeof fieldStr === 'string', 'field must be a string:' + JSON.stringify(fieldStr));
    const [field, validation] = fieldStr.split(';');
    let [type, name, keys, comment] = field.split(' ');
    if (keys && keys.startsWith('"')) {
      comment = keys;
      keys = undefined;
    }
    if (comment) comment = comment.replace(/"/g, '');
    return { type, name, keys, comment, validation };
  }

  const parse_url = url => {
    const params = url.split('/').filter(p => p.startsWith(':')).map(p => p.replace(':', ''));
    const query = url.split('?')[1];
    const queries = query ? url.split('?')[1].split('&').map(q => q.split('=')[0]) : [];
    return [params, queries];
  }

  const ignoreChars = ['_', '.', '/', '-', '$'];

  const { models } = config;
  models.forEach(model => {
    const model_paths = [];
    for (const [name, objects] of Object.entries(model)) {
      if (ignoreChars.includes(name[0])) continue;
      // for all objects of model
      for (const obj of objects) {
        // each object has one key as object name and value as paths
        let [obj_name, paths] = Object.entries(obj)[0];
        if (ignoreChars.includes(obj_name[0])) continue;
        let [type, name] = obj_name.split(' ');

        for (let [key, fields] of Object.entries(paths)) {
          if (ignoreChars.includes(key[0])) continue;
          const authentication = key.includes('*');
          let [method, path] = key.replace(/\*/g, '').split(' ');

          fields = fields ? fields.map(field => parse_field(field)) :[];
          path = path || `/${name}`;
          method = method.toLowerCase();
          path = `${config.path}${path}`;
          let [params, queries] = parse_url(path);
          params = params.map(p => fields.find(f => f.name === p) || { name: p, type: 'string' });
          queries = queries.map(q => fields.find(f => f.name === q) || { name: q, type: 'string' });
          if (path.includes('?')) path = path.split('?')[0];
          const api = {
            name,
            type,
            path,
            method,
            params,
            queries,
            fields,
            authentication,
            keys: fields.filter(f => f.keys),
            key_names: fields.filter(f => f.keys).map(f => `${f.name}`),
            field_names: fields.map(f => `${f.name}`)
          };
          model_paths.push(api);
        }
      }
    }
    model.paths = model_paths;
  });
  config.databases = config.models;
  return config;
}

module.exports.parse = parse;