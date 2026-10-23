import { test, expect } from '../src/fixtures';

test.describe('Hovers', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/hovers');
  });

  test('CP-HOV-01 Hay tres perfiles', async ({ page }) => {
    await expect(page.locator('.figure')).toHaveCount(3);
  });

  for (const n of [1, 2, 3]) {
    test(`CP-HOV-02 Al pasar el mouse sobre el perfil ${n} aparece "name: user${n}"`, async ({ page }) => {
      const perfil = page.locator('.figure').nth(n - 1);
      await perfil.hover();
      await expect(perfil.locator('.figcaption h5')).toHaveText(`name: user${n}`);
      await expect(perfil.locator('.figcaption h5')).toBeVisible();
    });

    test(`CP-HOV-03 El perfil ${n} ofrece "View profile" hacia /users/${n}`, async ({ page }) => {
      const perfil = page.locator('.figure').nth(n - 1);
      await perfil.hover();
      await expect(perfil.locator('.figcaption a')).toHaveAttribute('href', `/users/${n}`);
    });
  }

  test('CP-HOV-04 "View profile" navega a /users/1', async ({ page }) => {
    const perfil = page.locator('.figure').first();
    await perfil.hover();
    await perfil.locator('.figcaption a').click();
    await expect(page).toHaveURL(/\/users\/1$/);
  });

  test('CP-HOV-05 Al mover el mouse a otro perfil solo ese muestra su dato', async ({ page }) => {
    await page.locator('.figure').nth(0).hover();
    await page.locator('.figure').nth(1).hover();
    await expect(page.locator('.figure').nth(1).locator('.figcaption h5')).toBeVisible();
  });
});

test.describe('Drag and Drop', () => {
  test('CP-DND-01 Al inicio las columnas son A y B', async ({ page }) => {
    await page.goto('/drag_and_drop');
    await expect(page.locator('#column-a header')).toHaveText('A');
    await expect(page.locator('#column-b header')).toHaveText('B');
  });

  test('CP-DND-02 Arrastrar A sobre B intercambia las columnas', async ({ page }) => {
    await page.goto('/drag_and_drop');
    await page.dragAndDrop('#column-a', '#column-b');
    await expect(page.locator('#column-a header')).toHaveText('B');
    await expect(page.locator('#column-b header')).toHaveText('A');
  });

  test('CP-DND-03 Arrastrar B sobre A intercambia las columnas', async ({ page }) => {
    await page.goto('/drag_and_drop');
    await page.dragAndDrop('#column-b', '#column-a');
    await expect(page.locator('#column-a header')).toHaveText('B');
  });

  test('CP-DND-04 Dos intercambios dejan las columnas como al inicio', async ({ page }) => {
    await page.goto('/drag_and_drop');
    await page.dragAndDrop('#column-a', '#column-b');
    await page.dragAndDrop('#column-a', '#column-b');
    await expect(page.locator('#column-a header')).toHaveText('A');
  });
});

test.describe('JQuery UI Menus', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jqueryui/menu');
  });

  test('CP-JQM-01 El menú tiene la opción Disabled deshabilitada', async ({ page }) => {
    await expect(page.locator('#menu li', { hasText: 'Disabled' }).first()).toHaveClass(/ui-state-disabled/);
  });

  test('CP-JQM-02 Enabled despliega Downloads y Back to JQuery UI', async ({ page }) => {
    await page.getByText('Enabled', { exact: true }).hover();
    await expect(page.getByText('Downloads', { exact: true })).toBeVisible();
    await expect(page.getByText('Back to JQuery UI', { exact: true })).toBeVisible();
  });

  test('CP-JQM-03 Downloads despliega PDF, CSV y Excel', async ({ page }) => {
    await page.getByText('Enabled', { exact: true }).hover();
    await page.getByText('Downloads', { exact: true }).hover();
    for (const t of ['PDF', 'CSV', 'Excel']) {
      await expect(page.getByText(t, { exact: true })).toBeVisible();
    }
  });

  for (const [opcion, archivo] of [['PDF', 'menu.pdf'], ['CSV', 'menu.csv'], ['Excel', 'menu.xls']]) {
    test(`CP-JQM-04 Descargar ${opcion} entrega ${archivo}`, async ({ page }) => {
      await page.getByText('Enabled', { exact: true }).hover();
      await page.getByText('Downloads', { exact: true }).hover();
      const [descarga] = await Promise.all([
        page.waitForEvent('download'),
        page.getByText(opcion, { exact: true }).click(),
      ]);
      expect(descarga.suggestedFilename()).toBe(archivo);
    });
  }

  test('CP-JQM-05 "Back to JQuery UI" regresa a /jqueryui', async ({ page }) => {
    await page.getByText('Enabled', { exact: true }).hover();
    await page.getByText('Back to JQuery UI', { exact: true }).click();
    await expect(page).toHaveURL(/\/jqueryui$/);
  });
});
