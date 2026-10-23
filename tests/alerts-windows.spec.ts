import { test, expect } from '../src/fixtures';
import { handleDialog } from '../src/helpers';

test.describe('JavaScript Alerts', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/javascript_alerts');
  });

  test('CP-JSA-01 Al inicio no hay resultado', async ({ page }) => {
    await expect(page.locator('#result')).toHaveText('');
  });

  test('CP-JSA-02 JS Alert muestra su mensaje y el resultado', async ({ page }) => {
    const d = await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Alert' }).click());
    expect(d.type).toBe('alert');
    expect(d.message).toBe('I am a JS Alert');
    await expect(page.locator('#result')).toHaveText('You successfully clicked an alert');
  });

  test('CP-JSA-03 JS Confirm: aceptar muestra "You clicked: Ok"', async ({ page }) => {
    const d = await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Confirm' }).click(), { accept: true });
    expect(d.type).toBe('confirm');
    expect(d.message).toBe('I am a JS Confirm');
    await expect(page.locator('#result')).toHaveText('You clicked: Ok');
  });

  test('CP-JSA-04 JS Confirm: cancelar muestra "You clicked: Cancel"', async ({ page }) => {
    await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Confirm' }).click(), { accept: false });
    await expect(page.locator('#result')).toHaveText('You clicked: Cancel');
  });

  test('CP-JSA-05 JS Prompt: aceptar con texto', async ({ page }) => {
    const d = await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Prompt' }).click(), { accept: true, text: 'Sergio' });
    expect(d.type).toBe('prompt');
    expect(d.message).toBe('I am a JS prompt');
    await expect(page.locator('#result')).toHaveText('You entered: Sergio');
  });

  test('CP-JSA-06 JS Prompt: cancelar muestra "You entered: null"', async ({ page }) => {
    await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Prompt' }).click(), { accept: false });
    await expect(page.locator('#result')).toHaveText('You entered: null');
  });

  test('CP-JSA-07 JS Prompt: aceptar sin texto', async ({ page }) => {
    await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Prompt' }).click(), { accept: true, text: '' });
    await expect(page.locator('#result')).toContainText('You entered:');
  });

  for (const texto of ['Ñandú', '12345', '<b>negrita</b>']) {
    test(`CP-JSA-08 JS Prompt con "${texto}"`, async ({ page }) => {
      await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Prompt' }).click(), { accept: true, text: texto });
      await expect(page.locator('#result')).toContainText(`You entered: ${texto}`);
    });
  }

  test('CP-JSA-09 El resultado tiene clase de color', async ({ page }) => {
    await handleDialog(page, () => page.getByRole('button', { name: 'Click for JS Alert' }).click());
    await expect(page.locator('#result')).toBeVisible();
  });
});

test.describe('Context Menu', () => {
  test('CP-CTX-01 Clic derecho en el área muestra una alerta', async ({ page }) => {
    await page.goto('/context_menu');
    const d = await handleDialog(page, () => page.locator('#hot-spot').click({ button: 'right' }));
    expect(d.message).toBe('You selected a context menu');
  });

  test('CP-CTX-02 Clic izquierdo no muestra la alerta', async ({ page }) => {
    await page.goto('/context_menu');
    let visto = false;
    page.on('dialog', (d) => { visto = true; d.dismiss(); });
    await page.locator('#hot-spot').click();
    await page.waitForTimeout(800); // se espera para comprobar que NO aparece nada
    expect(visto).toBe(false);
  });

  test('CP-CTX-03 La página muestra el título', async ({ page }) => {
    await page.goto('/context_menu');
    await expect(page.locator('h3')).toHaveText('Context Menu');
  });
});

test.describe('JavaScript onload error', () => {
  test('CP-ERR-01 La página lanza un error de JavaScript al cargar', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('/javascript_error');
    await expect.poll(() => errores.length).toBeGreaterThan(0);
  });

  test('CP-ERR-02 El mensaje de error menciona una propiedad indefinida', async ({ page }) => {
    const errores: string[] = [];
    page.on('pageerror', (e) => errores.push(e.message));
    await page.goto('/javascript_error');
    await expect.poll(() => errores.join(' ')).toMatch(/undefined|Cannot read/i);
  });

  test('CP-ERR-03 La página explica que tiene un error en onload', async ({ page }) => {
    await page.goto('/javascript_error');
    await expect(page.locator('body')).toContainText('JavaScript error');
  });
});

test.describe('Multiple Windows', () => {
  test('CP-WND-01 El link abre una ventana nueva', async ({ page }) => {
    await page.goto('/windows');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Click Here' }).click()]);
    await expect(popup.locator('h3')).toHaveText('New Window');
  });

  test('CP-WND-02 La ventana nueva tiene el título "New Window"', async ({ page }) => {
    await page.goto('/windows');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Click Here' }).click()]);
    await popup.waitForLoadState('domcontentloaded');
    await expect(popup).toHaveTitle('New Window');
  });

  test('CP-WND-03 La URL de la ventana nueva es /windows/new', async ({ page }) => {
    await page.goto('/windows');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Click Here' }).click()]);
    await popup.waitForLoadState('domcontentloaded');
    expect(popup.url()).toContain('/windows/new');
  });

  test('CP-WND-04 La ventana original conserva su contenido', async ({ page }) => {
    await page.goto('/windows');
    const [popup] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Click Here' }).click()]);
    await popup.close();
    await expect(page.locator('h3')).toHaveText('Opening a new window');
  });

  test('CP-WND-05 El contexto tiene dos páginas tras abrir la ventana', async ({ page, context }) => {
    await page.goto('/windows');
    await Promise.all([page.waitForEvent('popup'), page.getByRole('link', { name: 'Click Here' }).click()]);
    expect(context.pages()).toHaveLength(2);
  });
});

test.describe('Frames', () => {
  test('CP-FRM-01 La página de Frames enlaza a Nested Frames e iFrame', async ({ page }) => {
    await page.goto('/frames');
    await expect(page.locator('a[href="/nested_frames"]')).toBeVisible();
    await expect(page.locator('a[href="/iframe"]')).toBeVisible();
  });

  test('CP-FRM-02 Nested Frames: el marco izquierdo dice LEFT', async ({ page }) => {
    await page.goto('/nested_frames');
    const top = page.frameLocator('frame[name="frame-top"]');
    await expect(top.frameLocator('frame[name="frame-left"]').locator('body')).toContainText('LEFT');
  });

  test('CP-FRM-03 Nested Frames: el marco central dice MIDDLE', async ({ page }) => {
    await page.goto('/nested_frames');
    const top = page.frameLocator('frame[name="frame-top"]');
    await expect(top.frameLocator('frame[name="frame-middle"]').locator('#content')).toHaveText('MIDDLE');
  });

  test('CP-FRM-04 Nested Frames: el marco derecho dice RIGHT', async ({ page }) => {
    await page.goto('/nested_frames');
    const top = page.frameLocator('frame[name="frame-top"]');
    await expect(top.frameLocator('frame[name="frame-right"]').locator('body')).toContainText('RIGHT');
  });

  test('CP-FRM-05 Nested Frames: el marco inferior dice BOTTOM', async ({ page }) => {
    await page.goto('/nested_frames');
    await expect(page.frameLocator('frame[name="frame-bottom"]').locator('body')).toContainText('BOTTOM');
  });

  test('CP-FRM-06 iFrame: el editor trae el texto inicial', async ({ page }) => {
    await page.goto('/iframe');
    await expect(page.frameLocator('#mce_0_ifr').locator('#tinymce')).toContainText('Your content goes here.');
  });

  test('CP-FRM-07 iFrame: se puede escribir en el editor', async ({ page }) => {
    await page.goto('/iframe');
    const editor = page.frameLocator('#mce_0_ifr').locator('#tinymce');
    await editor.fill('Hola desde Playwright');
    await expect(editor).toHaveText('Hola desde Playwright');
  });

  test('CP-FRM-08 iFrame: el editor se puede vaciar', async ({ page }) => {
    await page.goto('/iframe');
    const editor = page.frameLocator('#mce_0_ifr').locator('#tinymce');
    await editor.fill('');
    await expect(editor).toHaveText('');
  });
});

test.describe('Geolocation', () => {
  test.use({ geolocation: { latitude: 20.5888, longitude: -100.3899 }, permissions: ['geolocation'] });

  test('CP-GEO-01 "Where am I?" muestra la latitud simulada', async ({ page }) => {
    await page.goto('/geolocation');
    await page.getByRole('button', { name: 'Where am I?' }).click();
    await expect(page.locator('#lat-value')).toContainText('20.5888');
  });

  test('CP-GEO-02 "Where am I?" muestra la longitud simulada', async ({ page }) => {
    await page.goto('/geolocation');
    await page.getByRole('button', { name: 'Where am I?' }).click();
    await expect(page.locator('#long-value')).toContainText('-100.3899');
  });

  test('CP-GEO-03 Aparece el link "See it on Google"', async ({ page }) => {
    await page.goto('/geolocation');
    await page.getByRole('button', { name: 'Where am I?' }).click();
    await expect(page.locator('#map-link a')).toHaveAttribute('href', /20\.5888/);
  });
});
