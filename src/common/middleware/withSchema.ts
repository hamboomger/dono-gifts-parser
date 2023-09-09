import { ZodError, ZodSchema, ZodType } from 'zod'
import { RequestHandler } from 'express'
import { Fls } from '@flares/pascal-case-code-flares'

export interface RequestSchema<
  ReqParams = any,
  ResBody = any,
  ReqQuery = any,
  ReqBody = any,
> {
  description: string
  req?: {
    params?: ZodSchema<ReqParams>
    query?: ZodSchema<ReqQuery, any, any>
    body?: ZodSchema<ReqBody, any, any>
  }
  res?: {
    body: ZodType<ResBody>
    description: string
  }
}

export const defineRequestSchema = <
  ReqParams = unknown,
  ResBody = Record<string, never>,
  ReqQuery = unknown,
  ReqBody = unknown,
>(
  schema: RequestSchema<ReqParams, ResBody, ReqQuery, ReqBody>,
) => schema

/**
 * Adds validation and typing to express routes
 */
export function /*  */ withSchema<
  ReqParams = never,
  ResBody = never,
  ReqQuery = never,
  ReqBody = never,
>(
  schema: RequestSchema<ReqParams, ResBody, ReqQuery, ReqBody>,
): RequestHandler<ReqParams, ResBody, ReqBody, ReqQuery> {
  return (req, res, next) => {
    const errors: { [requestPart: string]: ZodError } = {}
    if (schema.req?.body) {
      console.log(`REQUEST BODY: ${JSON.stringify(req.body)}`)
      const result = schema.req.body.safeParse(req.body)
      if (!result.success) {
        errors.body = result.error
      }
    }
    if (schema.req?.query) {
      const result = schema.req.query.safeParse(req.query)
      if (!result.success) {
        errors.query = result.error
      }
    }
    if (schema.req?.params) {
      const result = schema.req.params.safeParse(req.params)
      if (!result.success) {
        errors.params = result.error
      }
    }

    if (Object.keys(errors).length) {
      throw Fls.BadRequest400('Request validation failed', errors)
    } else {
      next()
    }
  }
}
