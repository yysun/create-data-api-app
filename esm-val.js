import { z } from 'zod';
export const validate_body = (schema) => (req, res, next) => {
  const parsed = z.object(schema).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  req.body = parsed.data;
  next();
}

export const validate_query = (schema) => (req, res, next) => {
  const parsed = z.object(schema).safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.errors });
  }
  req.query = parsed.data;
  next();
}