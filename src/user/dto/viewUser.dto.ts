import { z } from 'zod'

export const viewUserDto = z.strictObject({
  name: z.string().optional(),
  email: z.string(),
})

export interface ViewUserDto extends z.infer<typeof viewUserDto> {}
