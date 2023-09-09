import { z } from 'zod'

export const createUserDto = z.strictObject({
  name: z.string(),
  email: z.string().email(),
})

export interface CreateUserDto extends z.infer<typeof createUserDto> {}
