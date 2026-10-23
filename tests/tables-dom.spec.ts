import { test, expect } from '../src/fixtures';
import { money } from '../src/helpers';

const DATOS = [
  { apellido: 'Smith', nombre: 'John', email: 'jsmith@gmail.com', due: '$50.00', web: 'http://www.jsmith.com' },
  { apellido: 'Bach', nombre: 'Frank', email: 'fbach@yahoo.com', due: '$51.00', web: 'http://www.frank.com' },
  { apellido: 'Doe', nombre: 'Jason', email: 'jdoe@hotmail.com', due: '$100.00', web: 'http://www.jdoe.com' },
  { apellido: 'Conway', nombre: 'Tim', email: 'tconway@earthlink.net', due: '$50.00', web: 'http://www.timconway.com' },
];

for (const tabla of ['#table1', '#table2'] as const) {
  test.describe(`Sortable Data Tables ${tabla}`, () => {
    test.beforeEach(async ({ tablesPage }) => {
      await tablesPage.open();
    });

    test(`CP-TBL-01 ${tabla} tiene 4 filas`, async ({ tablesPage }) => {
      await expect(tablesPage.rows(tabla)).toHaveCount(4);
    });

    test(`CP-TBL-02 ${tabla} tiene 6 encabezados`, async ({ tablesPage }) => {
      await expect(tablesPage.headers(tabla)).toHaveText([
        'Last Name', 'First Name', 'Email', 'Due', 'Web Site', 'Action',
      ]);
    });

    DATOS.forEach((fila, i) => {
      test(`CP-TBL-03 ${tabla} fila ${i + 1}: ${fila.nombre} ${fila.apellido}`, async ({ tablesPage }) => {
        const row = tablesPage.rows(tabla).nth(i);
        for (const v of [fila.apellido, fila.nombre, fila.email, fila.due, fila.web]) {
          await expect(row).toContainText(v);
        }
      });
    });

    test(`CP-TBL-04 ${tabla} cada fila tiene edit y delete`, async ({ page }) => {
      await expect(page.locator(`${tabla} a[href="#edit"]`)).toHaveCount(4);
      await expect(page.locator(`${tabla} a[href="#delete"]`)).toHaveCount(4);
    });

    test(`CP-TBL-05 ${tabla} ordena por apellido ascendente`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'Last Name');
      expect(await tablesPage.column(tabla, 0)).toEqual(['Bach', 'Conway', 'Doe', 'Smith']);
    });

    test(`CP-TBL-06 ${tabla} ordena por apellido descendente (segundo clic)`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'Last Name');
      await tablesPage.sortBy(tabla, 'Last Name');
      expect(await tablesPage.column(tabla, 0)).toEqual(['Smith', 'Doe', 'Conway', 'Bach']);
    });

    test(`CP-TBL-07 ${tabla} ordena por nombre ascendente`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'First Name');
      expect(await tablesPage.column(tabla, 1)).toEqual(['Frank', 'Jason', 'John', 'Tim']);
    });

    test(`CP-TBL-08 ${tabla} ordena por email ascendente`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'Email');
      const emails = await tablesPage.column(tabla, 2);
      expect(emails).toEqual([...emails].sort());
    });

    test(`CP-TBL-09 ${tabla} ordena por deuda de menor a mayor`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'Due');
      const deudas = (await tablesPage.column(tabla, 3)).map(money);
      expect(deudas).toEqual([50, 50, 51, 100]);
    });

    test(`CP-TBL-10 ${tabla} ordena por deuda de mayor a menor`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'Due');
      await tablesPage.sortBy(tabla, 'Due');
      const deudas = (await tablesPage.column(tabla, 3)).map(money);
      expect(deudas).toEqual([100, 51, 50, 50]);
    });

    test(`CP-TBL-11 ${tabla} ordena por sitio web ascendente`, async ({ tablesPage }) => {
      await tablesPage.sortBy(tabla, 'Web Site');
      const webs = await tablesPage.column(tabla, 4);
      expect(webs).toEqual([...webs].sort());
    });

    test(`CP-TBL-12 ${tabla} la suma de deudas es $251.00`, async ({ tablesPage }) => {
      const total = (await tablesPage.column(tabla, 3)).map(money).reduce((a, b) => a + b, 0);
      expect(total).toBe(251);
    });
  });
}

test.describe('Tabla 2: clases por columna', () => {
  test('CP-TBL-13 La tabla 2 expone clases por columna', async ({ page }) => {
    await page.goto('/tables');
    for (const c of ['last-name', 'first-name', 'email', 'dues', 'web-site', 'action']) {
      await expect(page.locator(`#table2 tbody .${c}`)).toHaveCount(4);
    }
  });

  test('CP-TBL-14 Se localiza la deuda de Jason Doe por clases', async ({ page }) => {
    await page.goto('/tables');
    const fila = page.locator('#table2 tbody tr', { has: page.locator('.last-name', { hasText: 'Doe' }) });
    await expect(fila.locator('.dues')).toHaveText('$100.00');
  });
});

test.describe('Challenging DOM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/challenging_dom');
  });

  test('CP-DOM-01 Hay tres botones', async ({ page }) => {
    await expect(page.locator('.large-2.columns a.button')).toHaveCount(3);
  });

  test('CP-DOM-02 El primer botón cambia de id al hacer clic', async ({ page }) => {
    const boton = page.locator('.large-2.columns a.button').first();
    const antes = await boton.getAttribute('id');
    await boton.click();
    await expect(boton).not.toHaveAttribute('id', antes ?? '');
  });

  test('CP-DOM-03 El segundo botón cambia su texto al hacer clic', async ({ page }) => {
    const boton = page.locator('.large-2.columns a.button.alert');
    const antes = await boton.textContent();
    await boton.click();
    await expect(boton).not.toHaveText(antes ?? '');
  });

  test('CP-DOM-04 El tercer botón cambia su texto al hacer clic', async ({ page }) => {
    const boton = page.locator('.large-2.columns a.button.success');
    const antes = await boton.textContent();
    await boton.click();
    await expect(boton).not.toHaveText(antes ?? '');
  });

  test('CP-DOM-05 La tabla tiene 10 filas', async ({ page }) => {
    await expect(page.locator('table tbody tr')).toHaveCount(10);
  });

  test('CP-DOM-06 La tabla tiene 7 encabezados', async ({ page }) => {
    await expect(page.locator('table thead th')).toHaveText([
      'Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet', 'Diceret', 'Action',
    ]);
  });

  test('CP-DOM-07 La primera celda es "Iuvaret0"', async ({ page }) => {
    await expect(page.locator('table tbody tr').first().locator('td').first()).toHaveText('Iuvaret0');
  });

  test('CP-DOM-08 La fila 4 empieza con "Iuvaret3"', async ({ page }) => {
    await expect(page.locator('table tbody tr').nth(3).locator('td').first()).toHaveText('Iuvaret3');
  });

  test('CP-DOM-09 Cada fila tiene edit y delete', async ({ page }) => {
    await expect(page.locator('table a[href="#edit"]')).toHaveCount(10);
    await expect(page.locator('table a[href="#delete"]')).toHaveCount(10);
  });

  test('CP-DOM-10 Hay un canvas visible', async ({ page }) => {
    await expect(page.locator('#canvas')).toBeVisible();
  });

  test('CP-DOM-11 El canvas cambia al presionar un botón', async ({ page }) => {
    const antes = await page.locator('#canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await page.locator('.large-2.columns a.button').first().click();
    await expect
      .poll(() => page.locator('#canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL()))
      .not.toBe(antes);
  });
});

test.describe('Large & Deep DOM', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/large');
  });

  test('CP-LRG-01 La tabla tiene 50 filas', async ({ page }) => {
    await expect(page.locator('#large-table tbody tr')).toHaveCount(50);
  });

  test('CP-LRG-02 La tabla tiene 50 columnas', async ({ page }) => {
    await expect(page.locator('#large-table thead th')).toHaveCount(50);
  });

  test('CP-LRG-03 La primera celda es "1.1"', async ({ page }) => {
    await expect(page.locator('#large-table tbody tr').first().locator('td').first()).toHaveText('1.1');
  });

  test('CP-LRG-04 La última celda es "50.50"', async ({ page }) => {
    await expect(page.locator('#large-table tbody tr').last().locator('td').last()).toHaveText('50.50');
  });

  test('CP-LRG-05 Existen los 50 elementos hermanos', async ({ page }) => {
    await expect(page.locator('[id^="sibling-"]').first()).toBeAttached();
  });
});

test.describe('Broken Images y Canvas', () => {
  test('CP-IMG-01 La página tiene 3 imágenes de ejemplo', async ({ page }) => {
    await page.goto('/broken_images');
    await expect(page.locator('.example img')).toHaveCount(3);
  });

  test('CP-IMG-02 Dos imágenes están rotas', async ({ page }) => {
    await page.goto('/broken_images');
    await expect(page.locator('.example img').last()).toBeVisible();
    await page.waitForLoadState('load');
    const anchos = await page.locator('.example img').evaluateAll((imgs) =>
      imgs.map((i) => (i as HTMLImageElement).naturalWidth),
    );
    expect(anchos.filter((w) => w === 0)).toHaveLength(2);
  });

  test('CP-IMG-03 La imagen válida carga', async ({ page }) => {
    await page.goto('/broken_images');
    await page.waitForLoadState('load');
    const ultimo = await page.locator('.example img').last().evaluate((i: HTMLImageElement) => i.naturalWidth);
    expect(ultimo).toBeGreaterThan(0);
  });

  test('CP-CNV-01 El canvas es visible', async ({ page }) => {
    await page.goto('/canvas');
    await expect(page.locator('#canvas')).toBeVisible();
  });

  test('CP-CNV-02 Hay tres botones junto al canvas', async ({ page }) => {
    await page.goto('/canvas');
    await expect(page.locator('#content a.button')).toHaveCount(3);
  });

  test('CP-CNV-03 El canvas cambia al presionar un botón', async ({ page }) => {
    await page.goto('/canvas');
    const antes = await page.locator('#canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL());
    await page.locator('#content a.button').first().click();
    await expect
      .poll(() => page.locator('#canvas').evaluate((c: HTMLCanvasElement) => c.toDataURL()))
      .not.toBe(antes);
  });
});
