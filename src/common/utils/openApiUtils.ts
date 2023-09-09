import { generateSchema, OpenApiZodAny } from '@anatine/zod-openapi'
import { OpenAPIV3 } from 'openapi-types'
import { ZodObject, ZodSchema } from 'zod'

import { RequestSchema } from '@/common/middleware/withSchema'

interface ContentSchema {
  content: {
    'application/json': {
      schema: OpenAPIV3.SchemaObject
    }
  }
}

export interface DefineRoutesDocumentationOpts {
  errorResponses?: OpenAPIV3.ResponsesObject
  tags?: string[]
}

export const defineRoutesDocumentation = (
  docs: Array<
    [
      httpMethod: OpenAPIV3.HttpMethods,
      route: string,
      schema: RequestSchema,
      opts?: DefineRoutesDocumentationOpts,
    ]
    >,
  tags?: string[],
): OpenAPIV3.PathsObject => {
  return docs.reduce<OpenAPIV3.PathsObject>(
    (paths, [httpMethod, route, schema, opts]) => {
      return {
        ...paths,
        [route]: {
          [httpMethod]: {
            description: schema.description,
            parameters: definePathParams(schema),
            tags: defineTags(tags, opts?.tags),
            ...(schema.req?.body
              ? {
                requestBody: generateJsonSchema(schema.req.body),
              }
              : {}),
            responses: {
              200: schema.res
                ? generateJsonSchema(schema.res.body, schema.res.description)
                : {
                  description: 'Ok',
                },
              ...(opts?.errorResponses ? opts.errorResponses : {}),
            },
          },
        },
      }
    },
    {},
  )
}

function definePathParams(schema: RequestSchema): OpenAPIV3.ParameterObject[] {
  const getKeys = (schema: ZodSchema<any>) =>
    Object.entries((schema as ZodObject<any>).shape)
  return [
    ...(schema.req?.query
      ? getKeys(schema.req.query).map(([queryParam, paramSchema]) => {
        const schema = generateSchema(paramSchema as OpenApiZodAny)
        return {
          in: 'query',
          name: queryParam,
          schema,
          ...(schema.description ? { description: schema.description } : {}),
        }
      })
      : []),
    ...(schema.req?.params
      ? getKeys(schema.req.params).map(([pathParam, paramSchema]) => {
        const schema = generateSchema(paramSchema as OpenApiZodAny)
        return {
          in: 'path',
          name: pathParam,
          ...(schema.description ? { description: schema.description } : {}),
        }
      })
      : []),
  ]
}

function defineTags(tags1?: string[], tags2?: string[]): string[] {
  return [...(tags1 || []), ...(tags2 || [])]
}

export function generateJsonSchema(zodRef: OpenApiZodAny): ContentSchema
export function generateJsonSchema(
  zodRef: OpenApiZodAny,
  description: string,
): ContentSchema & { description: string }
export function generateJsonSchema(
  zodRef: OpenApiZodAny,
  description?: string,
) {
  const contentSchema = {
    content: {
      'application/json': {
        schema: generateSchema(zodRef) as OpenAPIV3.SchemaObject,
      },
    },
  }
  return description ? { ...contentSchema, description } : contentSchema
}
