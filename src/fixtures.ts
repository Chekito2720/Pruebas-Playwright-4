import { test as base, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { TablesPage } from './pages/TablesPage';

type Fixtures = {
  loginPage: LoginPage;
  tablesPage: TablesPage;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  tablesPage: async ({ page }, use) => { await use(new TablesPage(page)); },
});

export { expect };
