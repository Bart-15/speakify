import { AnyZodObject } from 'zod';

const validateResource = (schema: AnyZodObject, payload: unknown) => schema.parse(payload);

export default validateResource;
