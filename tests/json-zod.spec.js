const toZod = require( '../validate.js');

test('should convert to zod', () => {
  const jsonSchema = {
    id: { type: 'int'},
    name: { type: 'string' },
    email: { type: 'string' }
  };
  const zobj = toZod(jsonSchema);
  const data = {
    id: 123,
    name: "user",
    email: "user@example.com",
  };

  const result = zobj.parse(data);
  expect(result.id).toBe(123);
  expect(result.name).toBe('user');
  expect(result.email).toBe('user@example.com');
});



test('should set message', () => {
  const jsonSchema = {
    id: { type: 'int' },
    name: { type: 'string', min: 20, message: "need 20" },
    email: { type: 'string' }
  };
  const zobj = toZod(jsonSchema);
  const data = {
    id: 123,
    name: "user",
    email: "user@example.com",
  };
  const result = zobj.safeParse(data);
  expect(result.success).toBe(false);
  expect(result.error.errors[0].message).toBe('need 20');
});

test('should check email', () => {
  const jsonSchema = {
    id: { type: 'int' },
    name: { type: 'string' },
    email: { type: 'string', min:5, message: 'wrong email' }
  };
  const zobj = toZod(jsonSchema);
  const data = {
    id: 123,
    name: "user",
    email: "111",
  };

  const result = zobj.safeParse(data);
  expect(result.success).toBe(false);
  expect(result.error.errors[0].message).toBe('wrong email');
});

test('should allow optional', () => {
  const jsonSchema = {
    id: { type: 'int' },
    name: { type: 'string' },
    email: { type: 'string', optional: true }
  };
  const zobj = toZod(jsonSchema);
  const data = {
    id: 123,
    name: "user",
    // email: "user-example.com",
  };

  const result = zobj.safeParse(data);
  expect(result.success).toBe(true);
});

test('should allow optional - true', () => {
  const jsonSchema = {
    id: { type: 'int' },
    name: { type: 'string' },
    email: { type: 'string', optional: true }
  };
  const zobj = toZod(jsonSchema);
  const data = {
    id: 123,
    name: "user",
    // email: "user-example.com",
  };

  const result = zobj.safeParse(data);
  expect(result.success).toBe(true);
});


test('should allow optional - false', () => {
  const jsonSchema = {
    id: { type: 'int' },
    email: { type: 'string', message:"wrong email"}
  };
  const zobj = toZod(jsonSchema);
  const data = {
    id: 123,
    name: "user",
    // email: "user-example.com",
  };

  const result = zobj.safeParse(data);
  expect(result.success).toBe(false);
  // expect(result.error.errors[0].message).toBe('wrong email');
});