import { z } from 'zod'

import { refinements } from '@/common/utils/zodUtils'

export const priceField = () =>
  z
    .string()
    .refine(refinements.strIsNumber)
    .refine(
      (price) => parseFloat(price) >= 0,
      'Price should be greater or equal to 0',
    )

export const parsedGift = z.strictObject({
  name: z.string().optional(),
  link: z.string().optional(),
  notes: z.string().optional(),
  placeUrl: z.string().url().optional(),
  price: priceField().optional(),
  priceCurrency: z.string().optional(),
  imagesUrls: z.string().array(),
})

export interface ParsedGift extends z.infer<typeof parsedGift> {}
