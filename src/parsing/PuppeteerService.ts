import puppeteer, { Browser } from 'puppeteer'
import { Service } from 'typedi'

@Service()
export class PuppeteerService {
  private browser: Browser | undefined

  async getBrowser(): Promise<Browser> {
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
}
