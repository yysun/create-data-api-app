const { parse } = require('../config-parser');


// test('has databases', () => {
//   const config = `
// models:
//   - name: users
//     objects:
//       - table: users
//         get:
//           - int id
//           - varchar name
//           - varchar email`;
//   const result = parse(config);
//   expect(result.databases).not.toBe(undefined);
// });

test('should parse url params', () => {
  const config = `
models:
  - name: users
    objects:
      - table: users
        patch* /users/:id/:name:
          - int id PK
          - varchar name
          - varchar email`;
  const result = parse(config);
  const path = result.databases[0].paths[0];
  expect(path.params[0].name).toBe('id');
  expect(path.params[1].name).toBe('name');
});

test('should parse url queries', () => {
  const config = `
models:
  - name: users
    objects:
      - table: users
        patch* /users/?id=&name=:
          - int id PK
          - varchar name
          - varchar email`;
  const result = parse(config);
  const path = result.databases[0].paths[0];
  expect(path.queries[0].name).toBe('id');
  expect(path.queries[1].name).toBe('name');
});