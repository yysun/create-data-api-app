const { parse } = require('../config-parser');

test('should parse DDL and vlidation', () => {
  const config = `
models:
  - users:
    - table users:
        get /users:
          - int id   ;{required:true}
          - varchar name
          - email email
`;
  const result = parse(config);
  const path = result.models[0].paths[0];
  expect(path.fields[0].name).toBe('id');
  expect(path.fields[0].validation).toBe('{required:true}');
  expect(path.fields[1].name).toBe('name');
  expect(path.fields[2].name).toBe('email');
});

test('should parse url params', () => {
  const config = `
models:
  - users:
    - table users:
        get /users/:id/:name:
        - int id   ;{required:true}
        - varchar name
        - email email
`;
  const result = parse(config);
  const path = result.models[0].paths[0];
  expect(path.params[0].name).toBe('id');
  expect(path.params[1].name).toBe('name');
});

test('should parse url queries', () => {
  const config = `
models:
  - users:
    - table users:
        get /users?limit=&offset=&sort=:
          - int id
          - varchar name
          - varchar email
`;
  const result = parse(config);
  const path = result.models[0].paths[0];
  expect(path.queries[0].name).toBe('limit');
  expect(path.queries[1].name).toBe('offset');
  expect(path.queries[2].name).toBe('sort');
});