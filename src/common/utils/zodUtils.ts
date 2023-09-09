import { z, ZodTypeAny } from 'zod'

export const zSchemas = {
  paginationQuery: <T extends Record<string, ZodTypeAny>>(maxLimit: number) =>
    z.strictObject({
      limit: zfdTypes.number({ min: 0, max: maxLimit }).default(`${maxLimit}`),
      lastId: z.string().optional(),
    }),
}

export const refinements = {
  strIsNumber: (arg: string) => !isNaN(parseInt(arg)),
  strIsBoolean: (arg: string) =>
    ['0', '1', 'true', 'false'].includes(arg.toLowerCase()),
  // range is inclusive on both sides!
  numberInRange: (min?: number, max?: number) => (arg: number) =>
    (min !== undefined ? arg >= min : true) &&
    (max !== undefined ? arg <= max : true),
}

export const transforms = {
  strToNumber: (arg: string) => parseInt(arg),
  strToBoolean: (arg: string) => Boolean(JSON.parse(arg)),
}

export const zTypes = {
  unixTimestamp: () =>
    z
      .number()
      .min(0)
      .describe('Unix timestamp (seconds since the start of UNIX Epoch)'),
  ISODate: () => z.string().describe('ISO 8601-compliant date (YYYY-MM-DD)'),
}

export const zfdTypes = {
  boolean: () =>
    z
      .string()
      .refine(refinements.strIsBoolean, 'Should be a valid boolean')
      .transform(transforms.strToBoolean),
  number: (args?: { min?: number; max?: number }) =>
    z
      .string()
      .refine(refinements.strIsNumber, 'Should be a valid number')
      .transform(transforms.strToNumber)
      .refine(
        refinements.numberInRange(args?.min, args?.max),
        `Should be in range [${args?.min ?? ''}, ${args?.max ?? ''}]`,
      ),
  jsonArray: () =>
    z.string().transform((valueStr) => JSON.parse(valueStr) as string[]),
}
