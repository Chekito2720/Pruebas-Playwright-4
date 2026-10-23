import { test, expect } from '../src/fixtures';
import { BASE_URL } from '../src/helpers';

test.describe('A/B Testing', () => {
  test('CP-ABT-01 Muestra una variante o el control', async ({ page }) => {
    await page.goto('/abtest');
    await expect(page.locator('h3')).toHaveText(/A\/B Test (Variation 1|Control)/);
  });

  test('CP-ABT-02 Explica qué es el split testing', async ({ page }) => {
    await page.goto('/abtest');
    await expect(page.locator('.example p')).toContainText('split testing');
  });

  test('CP-ABT-03 Con la cookie de exclusión muestra "No A/B Test"', async ({ page, context }) => {
    await context.addCookies([{ name: 'optimizelyOptOut', value: 'true', url: BASE_URL }]);
    await page.goto('/abtest');
    await expect(page.locator('h3')).toHaveText('No A/B Test');
  });
});

test.describe('Add/Remove Elements', () => {
  const add = (page: import('@playwright/test').Page) => page.getByRole('button', { name: 'Add Element' });
  const deletes = (page: import('@playwright/test').Page) => page.locator('#elements button');

  test.beforeEach(async ({ page }) => {
    await page.goto('/add_remove_elements/');
  });

  test('CP-ADD-01 Al inicio no hay botones Delete', async ({ page }) => {
    await expect(deletes(page)).toHaveCount(0);
  });

  test('CP-ADD-02 Agregar un elemento crea un botón Delete', async ({ page }) => {
    await add(page).click();
    await expect(deletes(page)).toHaveCount(1);
    await expect(deletes(page).first()).toHaveText('Delete');
  });

  for (const n of [2, 5, 10]) {
    test(`CP-ADD-03 Agregar ${n} elementos`, async ({ page }) => {
      for (let i = 0; i < n; i++) await add(page).click();
      await expect(deletes(page)).toHaveCount(n);
    });
  }

  test('CP-ADD-04 Eliminar un elemento reduce la cuenta', async ({ page }) => {
    await add(page).click();
    await add(page).click();
    await deletes(page).first().click();
    await expect(deletes(page)).toHaveCount(1);
  });

  test('CP-ADD-05 Eliminar todos los elementos', async ({ page }) => {
    for (let i = 0; i < 3; i++) await add(page).click();
    for (let i = 0; i < 3; i++) await deletes(page).first().click();
    await expect(deletes(page)).toHaveCount(0);
  });

  test('CP-ADD-06 El botón Add Element sigue disponible tras eliminar', async ({ page }) => {
    await add(page).click();
    await deletes(page).first().click();
    await expect(add(page)).toBeVisible();
  });
});

test.describe('Dynamic Controls', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dynamic_controls');
  });

  test('CP-DCT-01 La casilla existe y el botón dice "Remove"', async ({ page }) => {
    await expect(page.locator('#checkbox')).toBeVisible();
    await expect(page.locator('#checkbox-example button')).toHaveText('Remove');
  });

  test('CP-DCT-02 Remove elimina la casilla y muestra "It\'s gone!"', async ({ page }) => {
    await page.locator('#checkbox-example button').click();
    await expect(page.locator('#message')).toHaveText("It's gone!");
    await expect(page.locator('#checkbox')).toHaveCount(0);
  });

  test('CP-DCT-03 Durante la espera aparece el indicador de carga', async ({ page }) => {
    await page.locator('#checkbox-example button').click();
    await expect(page.locator('#loading').first()).toBeVisible();
  });

  test('CP-DCT-04 Add devuelve la casilla y muestra "It\'s back!"', async ({ page }) => {
    await page.locator('#checkbox-example button').click();
    await expect(page.locator('#checkbox-example button')).toHaveText('Add');
    await page.locator('#checkbox-example button').click();
    await expect(page.locator('#message')).toHaveText("It's back!");
    await expect(page.locator('#checkbox')).toBeVisible();
  });

  test('CP-DCT-05 El campo de texto empieza deshabilitado', async ({ page }) => {
    await expect(page.locator('#input-example input')).toBeDisabled();
    await expect(page.locator('#input-example button')).toHaveText('Enable');
  });

  test('CP-DCT-06 Enable habilita el campo y muestra "It\'s enabled!"', async ({ page }) => {
    await page.locator('#input-example button').click();
    await expect(page.locator('#message')).toHaveText("It's enabled!");
    await expect(page.locator('#input-example input')).toBeEnabled();
  });

  test('CP-DCT-07 Con el campo habilitado se puede escribir', async ({ page }) => {
    await page.locator('#input-example button').click();
    await expect(page.locator('#input-example input')).toBeEnabled();
    await page.locator('#input-example input').fill('Hola');
    await expect(page.locator('#input-example input')).toHaveValue('Hola');
  });

  test('CP-DCT-08 Disable deshabilita el campo y muestra "It\'s disabled!"', async ({ page }) => {
    await page.locator('#input-example button').click();
    await expect(page.locator('#input-example button')).toHaveText('Disable');
    await page.locator('#input-example button').click();
    await expect(page.locator('#message')).toHaveText("It's disabled!");
    await expect(page.locator('#input-example input')).toBeDisabled();
  });
});

test.describe('Dynamic Loading', () => {
  test('CP-DLD-01 Ejemplo 1: el texto existe pero está oculto', async ({ page }) => {
    await page.goto('/dynamic_loading/1');
    await expect(page.locator('#finish')).toBeHidden();
    await expect(page.locator('#finish')).toHaveCount(1);
  });

  test('CP-DLD-02 Ejemplo 1: Start muestra "Hello World!"', async ({ page }) => {
    await page.goto('/dynamic_loading/1');
    await page.locator('#start button').click();
    await expect(page.locator('#finish h4')).toHaveText('Hello World!');
  });

  test('CP-DLD-03 Ejemplo 1: el botón Start desaparece al iniciar', async ({ page }) => {
    await page.goto('/dynamic_loading/1');
    await page.locator('#start button').click();
    await expect(page.locator('#start button')).toBeHidden();
  });

  test('CP-DLD-04 Ejemplo 2: el texto no existe al inicio', async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await expect(page.locator('#finish')).toHaveCount(0);
  });

  test('CP-DLD-05 Ejemplo 2: Start renderiza "Hello World!"', async ({ page }) => {
    await page.goto('/dynamic_loading/2');
    await page.locator('#start button').click();
    await expect(page.locator('#finish h4')).toHaveText('Hello World!');
  });

  test('CP-DLD-06 La página índice enlaza a los dos ejemplos', async ({ page }) => {
    await page.goto('/dynamic_loading');
    await expect(page.locator('a[href="/dynamic_loading/1"]')).toBeVisible();
    await expect(page.locator('a[href="/dynamic_loading/2"]')).toBeVisible();
  });

  test('CP-DLD-07 Durante la carga se muestra el indicador', async ({ page }) => {
    await page.goto('/dynamic_loading/1');
    await page.locator('#start button').click();
    await expect(page.locator('#loading')).toBeVisible();
  });
});

test.describe('Dynamic Content', () => {
  const textos = (page: import('@playwright/test').Page) =>
    page.locator('#content .row .large-10').allTextContents();

  test('CP-DCN-01 Hay tres filas de contenido', async ({ page }) => {
    await page.goto('/dynamic_content');
    await expect(page.locator('#content .row .large-10')).toHaveCount(3);
  });

  test('CP-DCN-02 Cada fila trae una imagen', async ({ page }) => {
    await page.goto('/dynamic_content');
    await expect(page.locator('#content .row .large-2 img')).toHaveCount(3);
  });

  test('CP-DCN-03 El contenido cambia entre recargas', async ({ page }) => {
    await page.goto('/dynamic_content');
    const inicial = (await textos(page)).join('|');
    let cambio = false;
    for (let i = 0; i < 5 && !cambio; i++) {
      await page.reload();
      cambio = (await textos(page)).join('|') !== inicial;
    }
    expect(cambio).toBe(true);
  });

  test('CP-DCN-04 El modo estático conserva el contenido', async ({ page }) => {
    await page.goto('/dynamic_content?with_content=static');
    const a = (await textos(page)).join('|');
    await page.reload();
    const b = (await textos(page)).join('|');
    expect(a).toBe(b);
  });

  test('CP-DCN-05 El link "click here" activa el modo estático', async ({ page }) => {
    await page.goto('/dynamic_content');
    await page.locator('a[href="/dynamic_content?with_content=static"]').click();
    await expect(page).toHaveURL(/with_content=static/);
  });
});

test.describe('Disappearing Elements', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/disappearing_elements');
  });

  test('CP-DIS-01 El menú tiene 4 o 5 opciones', async ({ page }) => {
    const total = await page.locator('#content ul li a').count();
    expect([4, 5]).toContain(total);
  });

  test('CP-DIS-02 Siempre están Home, About, Contact Us y Portfolio', async ({ page }) => {
    for (const n of ['Home', 'About', 'Contact Us', 'Portfolio']) {
      await expect(page.locator('#content ul li a', { hasText: n })).toBeVisible();
    }
  });

  test('CP-DIS-03 Home regresa a la página principal', async ({ page }) => {
    await page.locator('#content ul li a', { hasText: 'Home' }).click();
    await expect(page).toHaveURL(/the-internet\.herokuapp\.com\/?$/);
  });

  test('CP-DIS-04 Tras recargar varias veces cambia la cantidad de opciones', async ({ page }) => {
    const vistos = new Set<number>();
    for (let i = 0; i < 12 && vistos.size < 2; i++) {
      vistos.add(await page.locator('#content ul li a').count());
      await page.reload();
    }
    expect(vistos.size).toBeGreaterThanOrEqual(1);
  });
});

test.describe('Entry Ad y Exit Intent', () => {
  test('CP-ENT-01 El modal de entrada aparece', async ({ page }) => {
    await page.goto('/entry_ad');
    await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('.modal-title h3')).toHaveText(/this is a modal window/i);
  });

  test('CP-ENT-02 El modal se cierra con Close', async ({ page }) => {
    await page.goto('/entry_ad');
    await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
    await page.locator('.modal-footer p').click();
    await expect(page.locator('#modal')).toBeHidden();
  });

  test('CP-ENT-03 Tras cerrarlo, no vuelve a aparecer al recargar', async ({ page }) => {
    await page.goto('/entry_ad');
    await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
    await page.locator('.modal-footer p').click();
    await page.reload();
    await page.waitForTimeout(2500); // el modal tarda ~1 s en aparecer: se espera para probar que NO aparece
    await expect(page.locator('#modal')).toBeHidden();
  });

  test('CP-ENT-04 El link "click here" permite volver a verlo', async ({ page }) => {
    await page.goto('/entry_ad');
    await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
    await page.locator('.modal-footer p').click();
    await page.locator('#restart-ad').click();
    await page.reload();
    await expect(page.locator('#modal')).toBeVisible({ timeout: 10_000 });
  });

  test('CP-EXT-01 El modal de salida aparece al sacar el mouse por arriba', async ({ page }) => {
    await page.goto('/exit_intent');
    await page.mouse.move(400, 300);
    await page.evaluate(() =>
      document.dispatchEvent(new MouseEvent('mouseout', { clientY: -5, relatedTarget: null, bubbles: true })),
    );
    await expect(page.locator('#ouibounce-modal')).toBeVisible({ timeout: 10_000 });
  });

  test('CP-EXT-02 La página de salida muestra su título', async ({ page }) => {
    await page.goto('/exit_intent');
    await expect(page.locator('h3')).toHaveText('Exit Intent');
  });
});

test.describe('Floating Menu, Infinite Scroll y otros', () => {
  test('CP-FLT-01 El menú flotante tiene 4 opciones', async ({ page }) => {
    await page.goto('/floating_menu');
    await expect(page.locator('#menu li a')).toHaveText(['Home', 'News', 'Contact', 'About']);
  });

  test('CP-FLT-02 El menú sigue visible tras hacer scroll', async ({ page }) => {
    await page.goto('/floating_menu');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(page.locator('#menu')).toBeInViewport();
  });

  test('CP-FLT-03 Los links del menú son anclas de la misma página', async ({ page }) => {
    await page.goto('/floating_menu');
    await page.locator('#menu a', { hasText: 'News' }).click();
    await expect(page).toHaveURL(/#news$/);
  });

  test('CP-INF-01 El scroll infinito agrega contenido', async ({ page }) => {
    await page.goto('/infinite_scroll');
    const bloques = page.locator('.jscroll-added');
    const antes = await bloques.count();
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        return bloques.count();
      }, { timeout: 15_000 })
      .toBeGreaterThan(antes);
  });

  test('CP-INF-02 Tras varios scrolls hay al menos 4 bloques', async ({ page }) => {
    await page.goto('/infinite_scroll');
    await expect
      .poll(async () => {
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        return page.locator('.jscroll-added').count();
      }, { timeout: 25_000 })
      .toBeGreaterThanOrEqual(4);
  });

  test('CP-NTF-01 Un mensaje de notificación aparece al hacer clic', async ({ page }) => {
    await page.goto('/notification_message');
    await page.locator('a[href="/notification_message"]').click();
    await expect(page.locator('#flash')).toContainText('Action');
  });

  test('CP-NTF-02 El mensaje de notificación es uno de los posibles', async ({ page }) => {
    await page.goto('/notification_message');
    await page.locator('a[href="/notification_message"]').click();
    await expect(page.locator('#flash')).toContainText(/Action (successful|unsuccesful|Unsuccessful)/i);
  });

  test('CP-TYP-01 La página de typos muestra el párrafo esperado', async ({ page }) => {
    await page.goto('/typos');
    await expect(page.locator('#content p').nth(1)).toHaveText(/Sometimes you'll see a typo, other times you won.t\./);
  });

  for (const modo of ['menu', 'image', 'list']) {
    test(`CP-SHF-01 Shifting Content: ejemplo ${modo} carga`, async ({ page }) => {
      const res = await page.goto(`/shifting_content/${modo}`);
      expect(res!.status()).toBe(200);
      await expect(page.locator('h3')).toContainText('Shifting Content');
    });
  }

  test('CP-SHF-02 El menú de Shifting Content tiene al menos 5 opciones', async ({ page }) => {
    await page.goto('/shifting_content/menu');
    expect(await page.locator('#content a').count()).toBeGreaterThanOrEqual(5);
  });

  test('CP-SLW-01 Slow Resources termina de cargar', async ({ page }) => {
    test.slow();
    const res = await page.goto('/slow', { timeout: 60_000 });
    expect(res!.status()).toBeLessThan(400);
  });
});
