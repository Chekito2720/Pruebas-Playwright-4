import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly heading: Locator;
  readonly username: Locator;
  readonly password: Locator;
  readonly submit: Locator;
  readonly flash: Locator;
  readonly logout: Locator;

  constructor(private readonly page: Page) {
    this.heading = page.locator('h2');
    this.username = page.locator('#username');
    this.password = page.locator('#password');
    this.submit = page.locator('button[type="submit"]');
    this.flash = page.locator('#flash');
    this.logout = page.locator('a[href="/logout"]');
  }

  async open() {
    await this.page.goto('/login');
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.submit.click();
  }
}
