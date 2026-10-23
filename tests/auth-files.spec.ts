import { test, expect } from '../src/fixtures';

test.describe('Basic Auth', () => {
  test.describe('con credenciales correctas', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'admin' } });

    test('CP-BAS-01 Muestra el mensaje de acceso concedido', async ({ page }) => {
      await page.goto('/basic_auth');
      await expect(page.locator('.example p')).toContainText('Congratulations! You must have the proper credentials.');
    });

    test('CP-BAS-02 La página tiene el título "Basic Auth"', async ({ page }) => {
      await page.goto('/basic_auth');
      await expect(page.locator('h3')).toHaveText('Basic Auth');
    });

    test('CP-BAS-03 La respuesta es 200', async ({ page }) => {
      const res = await page.goto('/basic_auth');
      expect(res!.status()).toBe(200);
    });
  });

  test.describe('con credenciales incorrectas', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'mala' } });

    test('CP-BAS-04 Responde 401', async ({ page }) => {
      const res = await page.goto('/basic_auth');
      expect(res!.status()).toBe(401);
    });
  });

  test('CP-BAS-05 Sin credenciales responde 401', async ({ page }) => {
    const res = await page.goto('/basic_auth');
    expect(res!.status()).toBe(401);
  });
});

test.describe('Digest Authentication', () => {
  test.describe('con credenciales correctas', () => {
    test.use({ httpCredentials: { username: 'admin', password: 'admin' } });

    test('CP-DGT-01 Muestra el mensaje de acceso concedido', async ({ page }) => {
      await page.goto('/digest_auth');
      await expect(page.locator('.example p')).toContainText('Congratulations! You must have the proper credentials.');
    });

    test('CP-DGT-02 La respuesta es 200', async ({ page }) => {
      const res = await page.goto('/digest_auth');
      expect(res!.status()).toBe(200);
    });
  });

  test('CP-DGT-03 Sin credenciales responde 401', async ({ page }) => {
    const res = await page.goto('/digest_auth');
    expect(res!.status()).toBe(401);
  });
});

test.describe('File Upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/upload');
  });

  test('CP-UPL-01 La página muestra el título "File Uploader"', async ({ page }) => {
    await expect(page.locator('h3')).toHaveText('File Uploader');
  });

  test('CP-UPL-02 Subir un archivo de texto', async ({ page }) => {
    await page.locator('#file-upload').setInputFiles({ name: 'evidencia.txt', mimeType: 'text/plain', buffer: Buffer.from('hola') });
    await page.locator('#file-submit').click();
    await expect(page.locator('h3')).toHaveText('File Uploaded!');
    await expect(page.locator('#uploaded-files')).toHaveText('evidencia.txt');
  });

  for (const [nombre, tipo] of [
    ['reporte.pdf', 'application/pdf'],
    ['foto.png', 'image/png'],
    ['datos.csv', 'text/csv'],
    ['informe.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ]) {
    test(`CP-UPL-03 Subir "${nombre}"`, async ({ page }) => {
      await page.locator('#file-upload').setInputFiles({ name: nombre, mimeType: tipo, buffer: Buffer.from('contenido') });
      await page.locator('#file-submit').click();
      await expect(page.locator('#uploaded-files')).toHaveText(nombre);
    });
  }

  test('CP-UPL-04 El nombre con espacios se conserva', async ({ page }) => {
    await page.locator('#file-upload').setInputFiles({ name: 'mi archivo.txt', mimeType: 'text/plain', buffer: Buffer.from('x') });
    await page.locator('#file-submit').click();
    await expect(page.locator('#uploaded-files')).toContainText('mi archivo.txt');
  });

  test('CP-UPL-05 La zona de arrastre existe', async ({ page }) => {
    await expect(page.locator('#drag-drop-upload')).toBeVisible();
  });

  test('CP-UPL-06 El botón Upload es visible', async ({ page }) => {
    await expect(page.locator('#file-submit')).toBeVisible();
  });
});

test.describe('File Download', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/download');
  });

  test('CP-DWN-01 La página muestra el título "File Downloader"', async ({ page }) => {
    await expect(page.locator('h3')).toHaveText('File Downloader');
  });

  test('CP-DWN-02 Hay al menos un archivo disponible', async ({ page }) => {
    expect(await page.locator('.example a').count()).toBeGreaterThan(0);
  });

  test('CP-DWN-03 Todos los links apuntan a /download/', async ({ page }) => {
    const hrefs = await page.locator('.example a').evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).getAttribute('href')));
    for (const h of hrefs) expect(h).toMatch(/^download\//);
  });

  test('CP-DWN-04 Descargar el primer archivo entrega su nombre', async ({ page }) => {
    const link = page.locator('.example a').first();
    const nombre = (await link.textContent())!.trim();
    const [descarga] = await Promise.all([page.waitForEvent('download'), link.click()]);
    expect(descarga.suggestedFilename()).toBe(nombre);
  });

  test('CP-DWN-05 El archivo descargado no está vacío', async ({ page }) => {
    const [descarga] = await Promise.all([page.waitForEvent('download'), page.locator('.example a').first().click()]);
    const fs = await import('fs');
    expect(fs.statSync((await descarga.path())!).size).toBeGreaterThan(0);
  });
});

test.describe('Status Codes y Redirect', () => {
  const CODIGOS = [200, 301, 404, 500];

  test('CP-STS-01 La página lista los cuatro códigos', async ({ page }) => {
    await page.goto('/status_codes');
    for (const c of CODIGOS) {
      await expect(page.locator(`a[href="status_codes/${c}"]`)).toBeVisible();
    }
  });

  for (const c of CODIGOS) {
    test(`CP-STS-02 El link ${c} lleva a /status_codes/${c}`, async ({ page }) => {
      await page.goto('/status_codes');
      await page.locator(`a[href="status_codes/${c}"]`).click();
      await expect(page).toHaveURL(new RegExp(`/status_codes/${c}$`));
      await expect(page.locator('.example p')).toContainText(`${c} status code`);
    });
  }

  test('CP-STS-03 La página de código incluye link de regreso', async ({ page }) => {
    await page.goto('/status_codes/200');
    await expect(page.locator('a[href="/status_codes"]')).toBeVisible();
  });

  test('CP-RED-01 El link de redirección termina en /status_codes', async ({ page }) => {
    await page.goto('/redirector');
    await page.locator('#redirect').click();
    await expect(page).toHaveURL(/\/status_codes$/);
  });

  test('CP-RED-02 La página de redirección muestra su título', async ({ page }) => {
    await page.goto('/redirector');
    await expect(page.locator('h3')).toHaveText('Redirection');
  });
});
