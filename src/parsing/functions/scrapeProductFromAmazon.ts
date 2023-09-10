import axios from 'axios'
import { Container } from 'typedi'

import { appLogger } from '@/common/logging/appLogger'
import { ParsedGift } from '@/parsing/dto/ParsedGift.dto'
import { AppConfigService } from '@/common/AppConfigService'

const ASIN_DATA_API_ENDPOINT = 'https://api.asindataapi.com'

interface ProductPrice {
  amount: number
  currency: string
}

export async function scrapeProductFromAmazon(
  url: string,
): Promise<ParsedGift | undefined> {
  try {
    return scrapeIt(url)
  } catch (error) {
    appLogger.error({
      message: `Failed to parse product by url: ${url}`,
      error,
    })
    return undefined
  }
}

async function scrapeIt(url: string): Promise<ParsedGift | undefined> {
  const config = Container.get(AppConfigService)

  const result = await axios.get<{ product: any }>(
    `${ASIN_DATA_API_ENDPOINT}/request`,
    {
      params: {
        url,
        api_key: config.env.ASIN_DATA_API_KEY,
        type: 'product',
      },
    },
  )

  const productData = result.data.product
  const priceObj = getProductPriceObj(productData)
  return {
    name: productData.title,
    link: url,
    imagesUrls: productData.main_image ? [productData.main_image.link] : [],
    notes: productData.sub_title?.text,
    price: priceObj?.amount?.toString(),
    priceCurrency: priceObj?.currency,
  }
}

function getProductPriceObj(productData: any): ProductPrice | undefined {
  if (productData.buybox_winner) {
    if (productData.buybox_winner.price) {
      return productData.buybox_winner.price
    } else if (productData.buybox_winner.rrp) {
      return productData.buybox_winner.rrp
    }
  }

  if (productData.variants) {
    const currentVariant = productData.variants.find(
      (variant: any) => variant.is_current_product,
    )
    return currentVariant.price
  }
  return undefined
}
