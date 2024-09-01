const { create_validation } = require('../esm-index');

test('should parse DDL and vlidation', () => {
  const fields = [{ name: 'id', type: 'int', validation: '{required:true}' }];
  const type = 'body'
  const result = create_validation(type, fields);
  const expected = `
validate('body',{
    "id": { type: "int", required: true}
}),`;

  expect(result).toBe(expected);
});