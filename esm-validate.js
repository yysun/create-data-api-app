import { z } from 'zod';
export default (schema, target) => (req, res, next) => {
  const parsed = z.object(schema).safeParse(req[target]);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  req[target] = parsed.data;
  next();
}