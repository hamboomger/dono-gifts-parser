import { OpenAPIV3 } from 'openapi-types'

import HttpMethods = OpenAPIV3.HttpMethods

import { parseGiftFromPageSchema } from '@/parsing/routes/giftsRoute.schema'
import { defineRoutesDocumentation } from '@/common/utils/openApiUtils'

export const giftsRouteApiDocs = defineRoutesDocumentation(
  [[HttpMethods.GET, '/parse-gift-from-page', parseGiftFromPageSchema]],
  ['Gifts'],
)
