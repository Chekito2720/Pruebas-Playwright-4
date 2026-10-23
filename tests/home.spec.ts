import { test, expect } from '../src/fixtures';

// Todas las páginas de ejemplo públicas (se excluyen las que exigen autenticación o son lentas a propósito).
const PAGES = [
  'abtest', 'add_remove_elements/', 'broken_images', 'canvas', 'challenging_dom', 'checkboxes',
  'context_menu', 'disappearing_elements', 'drag_and_drop', 'dropdown', 'dynamic_content',
  'dynamic_controls', 'dynamic_loading', 'entry_ad', 'exit_intent', 'download', 'upload',
  'floating_menu', 'forgot_password', 'login', 'frames', 'geolocation', 'horizontal_slider',
  'hovers', 'infinite_scroll', 'inputs', 'jqueryui/menu', 'javascript_alerts', 'javascript_error',
  'key_presses', 'large', 'large_form', 'multiple_dropdown', 'windows', 'nested_frames',
  'notification_message', 'radio_buttons', 'readonly', 'redirector', 'shadowdom',
  'shifting_content', 'tables', 'status_codes', 'subdirectories', 'two_factor', 'typos', 'tinymce',
];

const SAFE_TITLES = ['login', 'checkboxes', 'dropdown', 'tables', 'inputs', 'hovers'];

test.describe('Home', () => {
  test('CP-HOME-01 El home muestra "Welcome to the-internet"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1.heading')).toHaveText('Welcome to the-internet');
  });

  test('CP-HOME-02 El home muestra "Available Examples"', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h2')).toHaveText('Available Examples');
  });

  test('CP-HOME-03 El título del home es "The Internet"', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle('The Internet');
  });

  test('CP-HOME-04 El home lista al menos 45 ejemplos', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('#content ul li a').count()).toBeGreaterThanOrEqual(45);
  });

  test('CP-HOME-05 El home incluye A/B Testing, Checkboxes y Form Authentication', async ({ page }) => {
    await page.goto('/');
    for (const n of ['A/B Testing', 'Checkboxes', 'Form Authentication', 'Dropdown', 'Sortable Data Tables']) {
      await expect(page.getByRole('link', { name: n, exact: true })).toBeVisible();
    }
  });

  test('CP-HOME-06 El pie de página menciona Elemental Selenium', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#page-footer')).toContainText('Elemental Selenium');
  });

  test('CP-HOME-07 La cinta "Fork me on GitHub" apunta al repositorio', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('a[href*="github.com/saucelabs/the-internet"]').first()).toBeVisible();
  });

  test('CP-HOME-08 Un link del home navega a su ejemplo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Checkboxes', exact: true }).click();
    await expect(page).toHaveURL(/\/checkboxes$/);
    await expect(page.locator('h3')).toHaveText('Checkboxes');
  });

  test('CP-HOME-09 Una ruta inexistente devuelve 404', async ({ page }) => {
    const res = await page.goto('/ruta-que-no-existe');
    expect(res!.status()).toBe(404);
  });

  test('CP-HOME-10 La página 404 muestra "Not Found"', async ({ page }) => {
    await page.goto('/ruta-que-no-existe');
    await expect(page.locator('body')).toContainText('Not Found');
  });

  for (const p of PAGES) {
    test(`CP-SMK-01 La página /${p} carga correctamente`, async ({ page }) => {
      const res = await page.goto(`/${p}`);
      expect(res!.status()).toBeLessThan(400);
      await expect(page.locator('h1, h2, h3, h4').first()).toBeVisible();
    });
  }

  for (const p of SAFE_TITLES) {
    test(`CP-SMK-02 El título de /${p} es "The Internet"`, async ({ page }) => {
      await page.goto(`/${p}`);
      await expect(page).toHaveTitle('The Internet');
    });
  }
});
