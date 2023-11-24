import puppeteer, { Browser, Page } from 'puppeteer'
import { Service } from 'typedi'

import { AppConfigService } from '@/common/AppConfigService'

@Service()
export class PuppeteerService {
  private browser: Browser | undefined
  private browserWithProxy: Browser | undefined
  private lastProxyCountry: string | undefined

  constructor(private config: AppConfigService) {}

  async newPage(proxyCountry?: string): Promise<Page> {
    const browser = await this.getBrowser(proxyCountry)
    const page = await browser.newPage()
    if (proxyCountry) {
      await page.authenticate({
        username: `brd-customer-hl_d40b5744-zone-residential-country-${proxyCountry}`,
        password: this.config.env.BRIGHT_DATA_PASSWORD,
      })
    }

    return page
  }

  async getBrowser(proxyCountry?: string): Promise<Browser> {
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
      return this.browser
    }
  }

  private async createBrowser(): Promise<Browser> {
    console.log('Launching browser...')
    this.browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    this.browser.on('disconnected', () => this.createBrowser())
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
