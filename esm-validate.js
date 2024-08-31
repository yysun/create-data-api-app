import { z } from 'zod';

const typeMapping = {
  int: z.number().int(),
  string: z.string(),
  email: z.string().email(),
  password: z.string().min(8),
  varchar: z.string(),
};

function toZod(jsonSchema) {
  const zodSchema = {};
  for (const [key, value] of Object.entries(jsonSchema)) {
    let zodType = typeMapping[value.type];
    const message = value.message;
    if (!zodType) {
      throw new Error(`Unsupported type: ${value.type}`);
    }
    if (value.required) {
      zodType = zodType.nonempty({ message: message || `${key} is required` });
    }
    if (value.minLength) {
      zodType = zodType.min(value.minLength,  { message: message || `${key} must be at least ${value.minLength} characters` });
    }
    if (value.format) {
      zodType = zodType.regex(new RegExp(value.format), { message: message || `${key} format is invalid` });
    }
    zodSchema[key] = zodType;
  }
  return z.object(zodSchema);
}

export default (target, schema) => (req, res, next) => {
  const parsed = toZod(schema).safeParse(req[target]);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  req[target] = parsed.data;
  next();
}