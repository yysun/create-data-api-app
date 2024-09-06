// common js version of esm_validate.js for unit testing
const { z } = require('zod');

const typeMapping = {
  int: z.coerce.number().int(),  // Coerce string to int
  number: z.coerce.number(),     // Coerce string to number
  Boolean: z.coerce.boolean(),   // Coerce string to boolean
  string: z.string(),
  email: z.string().email(),
  password: z.string(),
  varchar: z.string(),
  date: z.coerce.date(),         // Coerce string to date
  datetime: z.coerce.date(),     // Coerce string to date
  time: z.string(),
  timestamp: z.coerce.date(),    // Coerce string to date
  array: z.array(),
  json: z.record(z.any()),
};

const zodMethods = [
  'min',       // For setting minimum value (numbers) or minimum length (strings/arrays)
  'max',       // For setting maximum value (numbers) or maximum length (strings/arrays)
  'length',    // For setting exact length (strings/arrays)
  'email',     // For validating emails
  'url',       // For validating URLs
  'uuid',      // For validating UUIDs
  'cuid',      // For validating CUIDs
  'regex',     // For matching against a regex pattern
  'includes',  // For checking if a string includes a certain substring
  'startsWith',// For checking if a string starts with a certain substring
  'endsWith',  // For checking if a string ends with a certain substring
  'int',       // For enforcing integer values (numbers)
  'positive',  // For enforcing positive numbers
  'negative',  // For enforcing negative numbers
  'nonnegative',// For enforcing non-negative numbers
  'nonpositive',// For enforcing non-positive numbers
  'finite',    // For enforcing finite numbers
  'safe',      // For enforcing safe integers
  'nonempty',  // For ensuring a string or array is not empty (only available for arrays)
  'array',     // For enforcing array validation rules
  'optional',  // For making a field optional
  'nullable',  // For allowing `null` values
  'refine',    // For adding custom validation logic
  'transform', // For transforming input values
  'default',   // For setting default values
  'catch',     // For setting a fallback value in case of validation failure
  'superRefine'// For adding advanced custom validation with context
];

module.exports = function toZod(jsonSchema) {
  const zodSchema = {};
  for (const [key, rules] of Object.entries(jsonSchema)) {
    const { type, message } = rules;
    let zodType = typeMapping[type];
    if (!zodType) {
      throw new Error(`Unsupported type: ${rules.type}`);
    }

    if ((!rules.hasOwnProperty('optional') || rules.optional === false) &&
      (type === 'string' || type === 'varchar')) {
      zodType = zodType.min(1, { message });
    }

    for (const [propKey, propValue] of Object.entries(rules)) {
      if (propKey === 'type' || propKey === 'message') continue;
      if (zodMethods.includes(propKey)) {
        zodType = zodType[propKey](propValue, { message });
      } else {
        throw new Error(`Unsupported property: ${propKey}`);
      }
    }
    zodSchema[key] = zodType;
  }
  return z.object(zodSchema);
}