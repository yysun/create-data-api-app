const { create_validation } = require('../esm-index');


test('should add required true', () => {
  const fields = [{ name: 'id', type: 'int'}];
  const type = 'body'
  const result = create_validation(type, fields);
  const expected = `
  validate('body',{
    "id": {"type":"int"}
  }),`;
  expect(result).toBe(expected);
});

test('should overwrite required', () => {
  const fields = [{ name: 'id', type: 'int', validation: '{"optional":true}' }];
  const type = 'body'
  const result = create_validation(type, fields);
  const expected = `
  validate('body',{
    "id": {"type":"int","optional":true}
  }),`;
  expect(result).toBe(expected);
});

test('should add more rules', () => {
  const fields = [{ name: 'id', type: 'int', validation: '{"min":6}' }];
  const type = 'body'
  const result = create_validation(type, fields);
  const expected = `
  validate('body',{
    "id": {"type":"int","min":6}
  }),`;
  expect(result).toBe(expected);
});


test('should pass message', () => {
  const fields = [{ name: 'id', type: 'int', validation: '{"min":6,"message":"min 6"}' }];
  const type = 'body'
  const result = create_validation(type, fields);
  const expected = `
  validate('body',{
    "id": {"type":"int","min":6,"message":"min 6"}
  }),`;
  expect(result).toBe(expected);
});