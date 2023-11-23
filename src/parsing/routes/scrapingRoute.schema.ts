import { z } from 'zod'

import { defineRequestSchema } from '@/common/middleware/withSchema'
import { parsedGift } from '@/parsing/dto/ParsedGift.dto'

export const parseGiftFromPageSchema = defineRequestSchema({
  description: 'Parse gift',
  req: {
    query: z.strictObject({
      url: z.string(),
      proxyCode: z.string().optional(),
    }),
  },
  res: {
    description: 'Parsed gift',
    body: parsedGift,
  },
})
