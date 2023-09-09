import { OpenAPIV3 } from 'openapi-types'

import { defineRoutesDocumentation } from '@/common/utils/openApiUtils'
import { createUserSchema, getUsersSchema } from '@/user/routes/schema'

import HttpMethods = OpenAPIV3.HttpMethods

export const usersRouteApi = defineRoutesDocumentation(
  [
    [HttpMethods.POST, '/users/create', createUserSchema],
    [HttpMethods.GET, '/users', getUsersSchema],
  ],
  ['Users'],
)
