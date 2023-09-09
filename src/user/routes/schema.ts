import { defineRequestSchema } from '@/common/middleware/withSchema'
import { viewUserDto } from '@/user/dto/viewUser.dto'
import { createUserDto } from '@/user/dto/createUser.dto'

export const createUserSchema = defineRequestSchema({
  description: 'Create user',
  req: {
    body: createUserDto,
  },
  res: {
    description: 'Created user',
    body: viewUserDto,
  },
})

export const getUsersSchema = defineRequestSchema({
  description: 'Get all users',
  res: {
    description: 'All users',
    body: viewUserDto.array(),
  },
})
