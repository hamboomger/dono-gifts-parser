import puppeteer, { Browser, BrowserContext, Page } from 'puppeteer'
import { Service } from 'typedi'

import { AppConfigService } from '@/common/AppConfigService'

const TOTAL_REQUESTS_PER_SESSION = 5;

@Service()
export class PuppeteerService {
  private browser: Browser | undefined
  private browserWithProxy: Browser | undefined
  private lastProxyCountry: string | undefined
  private requestsCount: number;

  constructor(private config: AppConfigService) {
    this.requestsCount = 0
  }

  async newPage(proxyCountry?: string): Promise<{ page: Page, cleanUp: () => Promise<void> }> {
    const browser = await this.getBrowser(proxyCountry)
    const context = await browser.createIncognitoBrowserContext()
    const page = await context.newPage()
    if (proxyCountry) {
      await page.authenticate({
        username: `brd-customer-hl_d40b5744-zone-residential-country-${proxyCountry}`,
        password: this.config.env.BRIGHT_DATA_PASSWORD,
      })
    }

    async function cleanUp() {
      await page.close()
      await context.close()
    }

    return { page, cleanUp }
  }

  async getBrowser(proxyCountry?: string): Promise<Browser> {
    this.requestsCount += 1;

    if (proxyCountry) {
      if (!this.browserWithProxy || !this.browserWithProxy.isConnected()) {
        this.lastProxyCountry = proxyCountry

        return this.createBrowserWithProxy()
      } else if (this.lastProxyCountry !== proxyCountry) {
        this.lastProxyCountry = proxyCountry

        await this.browserWithProxy.close()
        return this.createBrowserWithProxy()
      } else {
        return this.browserWithProxy
      }
    }

    if (!this.browser || this.browser?.isConnected()) {
      return this.createBrowser()
    } else {
      if (this.requestsCount >= TOTAL_REQUESTS_PER_SESSION) {
        this.requestsCount = 0;
        await this.browser.close()
        return this.createBrowser()
      }
      return this.browser
    }
  }

  private async createBrowser(): Promise<Browser> {
    console.log('Launching browser...')
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    console.log('Init...Done')
    return this.browser
  }

  private async createBrowserWithProxy(): Promise<Browser> {
    console.log(`Launching browser with proxy...`)
    this.browserWithProxy = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--proxy-server=brd.superproxy.io:22225',
      ],
      ignoreHTTPSErrors: true,
    })
    console.log('Init...Done')
    return this.browserWithProxy
  }
}
