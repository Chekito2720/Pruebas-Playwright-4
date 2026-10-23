import { test, expect } from '../src/fixtures';
import { VALID_USER } from '../src/helpers';

test.describe('Form Authentication', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test('CP-LOG-01 La página muestra el título "Login Page"', async ({ loginPage }) => {
    await expect(loginPage.heading).toHaveText('Login Page');
  });

  test('CP-LOG-02 Muestra las credenciales de ayuda', async ({ page }) => {
    await expect(page.locator('h4.subheader')).toContainText('tomsmith');
    await expect(page.locator('h4.subheader')).toContainText('SuperSecretPassword!');
  });

  test('CP-LOG-03 Los campos y el botón están visibles', async ({ loginPage }) => {
    await expect(loginPage.username).toBeVisible();
    await expect(loginPage.password).toBeVisible();
    await expect(loginPage.submit).toBeVisible();
    await expect(loginPage.submit).toContainText('Login');
  });

  test('CP-LOG-04 El campo de contraseña está enmascarado', async ({ loginPage }) => {
    await expect(loginPage.password).toHaveAttribute('type', 'password');
  });

  test('CP-LOG-05 Login válido lleva al área segura', async ({ page, loginPage }) => {
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page).toHaveURL(/\/secure$/);
    await expect(loginPage.heading).toContainText('Secure Area');
  });

  test('CP-LOG-06 Login válido muestra el mensaje de éxito', async ({ loginPage }) => {
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(loginPage.flash).toContainText('You logged into a secure area!');
    await expect(loginPage.flash).toHaveClass(/success/);
  });

  test('CP-LOG-07 El área segura da la bienvenida', async ({ page, loginPage }) => {
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page.locator('h4.subheader')).toContainText('Welcome to the Secure Area');
  });

  test('CP-LOG-08 Usuario incorrecto muestra "Your username is invalid!"', async ({ loginPage }) => {
    await loginPage.login('usuario_malo', VALID_USER.password);
    await expect(loginPage.flash).toContainText('Your username is invalid!');
    await expect(loginPage.flash).toHaveClass(/error/);
  });

  test('CP-LOG-09 Contraseña incorrecta muestra "Your password is invalid!"', async ({ loginPage }) => {
    await loginPage.login(VALID_USER.username, 'mala');
    await expect(loginPage.flash).toContainText('Your password is invalid!');
  });

  test('CP-LOG-10 Campos vacíos muestran "Your username is invalid!"', async ({ loginPage }) => {
    await loginPage.submit.click();
    await expect(loginPage.flash).toContainText('Your username is invalid!');
  });

  test('CP-LOG-11 Solo la contraseña vacía muestra "Your password is invalid!"', async ({ loginPage }) => {
    await loginPage.username.fill(VALID_USER.username);
    await loginPage.submit.click();
    await expect(loginPage.flash).toContainText('Your password is invalid!');
  });

  test('CP-LOG-12 El usuario distingue mayúsculas de minúsculas', async ({ loginPage }) => {
    await loginPage.login('TOMSMITH', VALID_USER.password);
    await expect(loginPage.flash).toContainText('Your username is invalid!');
  });

  test('CP-LOG-13 La contraseña distingue mayúsculas de minúsculas', async ({ loginPage }) => {
    await loginPage.login(VALID_USER.username, 'supersecretpassword!');
    await expect(loginPage.flash).toContainText('Your password is invalid!');
  });

  test('CP-LOG-14 Usuario con espacios al inicio es rechazado', async ({ loginPage }) => {
    await loginPage.login(' tomsmith', VALID_USER.password);
    await expect(loginPage.flash).toContainText('Your username is invalid!');
  });

  for (const intento of ["' OR '1'='1", '<script>alert(1)</script>', 'admin"--']) {
    test(`CP-LOG-15 Entrada maliciosa "${intento}" no inicia sesión`, async ({ page, loginPage }) => {
      await loginPage.login(intento, intento);
      await expect(page).toHaveURL(/\/login$/);
      await expect(loginPage.flash).toHaveClass(/error/);
    });
  }

  test('CP-LOG-16 El mensaje de error se puede cerrar con la X', async ({ loginPage, page }) => {
    await loginPage.submit.click();
    await expect(loginPage.flash).toBeVisible();
    await page.locator('#flash a.close').click();
    await expect(loginPage.flash).toBeHidden();
  });

  test('CP-LOG-17 Un login fallido conserva al usuario en /login', async ({ page, loginPage }) => {
    await loginPage.login('x', 'y');
    await expect(page).toHaveURL(/\/login$/);
  });
});

test.describe('Área segura', () => {
  test('CP-SEC-01 /secure sin sesión redirige a /login', async ({ page, loginPage }) => {
    await page.goto('/secure');
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.flash).toContainText('You must login to view the secure area!');
  });

  test('CP-SEC-02 Logout regresa a /login con mensaje', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await loginPage.logout.click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(loginPage.flash).toContainText('You logged out of the secure area!');
  });

  test('CP-SEC-03 Tras el logout /secure vuelve a pedir login', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await loginPage.logout.click();
    await page.goto('/secure');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('CP-SEC-04 La sesión persiste al recargar el área segura', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await page.reload();
    await expect(page).toHaveURL(/\/secure$/);
  });

  test('CP-SEC-05 El botón Logout es visible en el área segura', async ({ page, loginPage }) => {
    await loginPage.open();
    await loginPage.login(VALID_USER.username, VALID_USER.password);
    await expect(page.locator('a.button.secondary')).toContainText('Logout');
  });
});

test.describe('Forgot Password', () => {
  test('CP-FGT-01 La página muestra el formulario', async ({ page }) => {
    await page.goto('/forgot_password');
    await expect(page.locator('h2')).toHaveText('Forgot Password');
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#form_submit')).toContainText('Retrieve password');
  });

  test('CP-FGT-02 El campo de email acepta texto', async ({ page }) => {
    await page.goto('/forgot_password');
    await page.locator('#email').fill('sergio@mail.com');
    await expect(page.locator('#email')).toHaveValue('sergio@mail.com');
  });
});

test.describe('Checkboxes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/checkboxes');
  });

  test('CP-CHB-01 Hay dos casillas', async ({ page }) => {
    await expect(page.locator('#checkboxes input[type="checkbox"]')).toHaveCount(2);
  });

  test('CP-CHB-02 La casilla 1 empieza desmarcada y la 2 marcada', async ({ page }) => {
    const boxes = page.locator('#checkboxes input[type="checkbox"]');
    await expect(boxes.nth(0)).not.toBeChecked();
    await expect(boxes.nth(1)).toBeChecked();
  });

  test('CP-CHB-03 Marcar la casilla 1', async ({ page }) => {
    const box = page.locator('#checkboxes input').nth(0);
    await box.check();
    await expect(box).toBeChecked();
  });

  test('CP-CHB-04 Desmarcar la casilla 2', async ({ page }) => {
    const box = page.locator('#checkboxes input').nth(1);
    await box.uncheck();
    await expect(box).not.toBeChecked();
  });

  test('CP-CHB-05 Marcar y desmarcar la casilla 1', async ({ page }) => {
    const box = page.locator('#checkboxes input').nth(0);
    await box.check();
    await box.uncheck();
    await expect(box).not.toBeChecked();
  });

  test('CP-CHB-06 Las dos casillas pueden estar marcadas a la vez', async ({ page }) => {
    await page.locator('#checkboxes input').nth(0).check();
    await expect(page.locator('#checkboxes input:checked')).toHaveCount(2);
  });
});

test.describe('Dropdown', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dropdown');
  });

  test('CP-DRP-01 Tiene tres opciones', async ({ page }) => {
    await expect(page.locator('#dropdown option')).toHaveCount(3);
  });

  test('CP-DRP-02 La opción por defecto está deshabilitada', async ({ page }) => {
    await expect(page.locator('#dropdown option').first()).toBeDisabled();
    await expect(page.locator('#dropdown option').first()).toHaveText('Please select an option');
  });

  test('CP-DRP-03 Elegir Option 1', async ({ page }) => {
    await page.locator('#dropdown').selectOption('1');
    await expect(page.locator('#dropdown')).toHaveValue('1');
  });

  test('CP-DRP-04 Elegir Option 2 por etiqueta', async ({ page }) => {
    await page.locator('#dropdown').selectOption({ label: 'Option 2' });
    await expect(page.locator('#dropdown')).toHaveValue('2');
  });

  test('CP-DRP-05 Cambiar de Option 1 a Option 2', async ({ page }) => {
    await page.locator('#dropdown').selectOption('1');
    await page.locator('#dropdown').selectOption('2');
    await expect(page.locator('#dropdown')).toHaveValue('2');
  });
});

test.describe('Inputs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inputs');
  });

  test('CP-INP-01 El campo numérico empieza vacío', async ({ page }) => {
    await expect(page.locator('input[type="number"]')).toHaveValue('');
  });

  test('CP-INP-02 Escribir un número', async ({ page }) => {
    await page.locator('input[type="number"]').fill('42');
    await expect(page.locator('input[type="number"]')).toHaveValue('42');
  });

  test('CP-INP-03 Flecha arriba incrementa', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    await input.click();
    await input.press('ArrowUp');
    await expect(input).toHaveValue('1');
  });

  test('CP-INP-04 Flecha abajo decrementa a negativo', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    await input.click();
    await input.press('ArrowDown');
    await expect(input).toHaveValue('-1');
  });

  test('CP-INP-05 Varias flechas arriba suman', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    await input.fill('10');
    for (let i = 0; i < 3; i++) await input.press('ArrowUp');
    await expect(input).toHaveValue('13');
  });

  test('CP-INP-06 Las letras no se aceptan', async ({ page }) => {
    const input = page.locator('input[type="number"]');
    await input.click();
    await input.pressSequentially('abc');
    await expect(input).toHaveValue('');
  });

  test('CP-INP-07 Se aceptan negativos', async ({ page }) => {
    await page.locator('input[type="number"]').fill('-7');
    await expect(page.locator('input[type="number"]')).toHaveValue('-7');
  });

  test('CP-INP-08 Se aceptan decimales', async ({ page }) => {
    await page.locator('input[type="number"]').fill('3.14');
    await expect(page.locator('input[type="number"]')).toHaveValue('3.14');
  });
});

test.describe('Radio Buttons y Multiple Dropdown', () => {
  test('CP-RBT-01 Cada radio se puede marcar', async ({ page }) => {
    await page.goto('/radio_buttons');
    const radios = page.locator('input[type="radio"]');
    const total = await radios.count();
    expect(total).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < total; i++) {
      await radios.nth(i).check();
      await expect(radios.nth(i)).toBeChecked();
    }
  });

  test('CP-RBT-02 Marcar un radio desmarca otro del mismo grupo', async ({ page }) => {
    await page.goto('/radio_buttons');
    const radios = page.locator('input[type="radio"]');
    const nombre = await radios.first().getAttribute('name');
    const grupo = page.locator(`input[type="radio"][name="${nombre}"]`);
    if ((await grupo.count()) < 2) test.skip(true, 'El grupo tiene un solo radio');
    await grupo.nth(0).check();
    await grupo.nth(1).check();
    await expect(grupo.nth(0)).not.toBeChecked();
  });

  test('CP-MLT-01 El select múltiple permite elegir varias opciones', async ({ page }) => {
    const res = await page.goto('/multiple_dropdown');
    if (!res || res.status() >= 400) test.skip(true, 'multiple_dropdown no disponible');
    const select = page.locator('select[multiple]').first();
    if ((await select.count()) === 0) test.skip(true, 'Sin select múltiple');
    const valores = await select.locator('option:not([disabled])').evaluateAll((o) =>
      o.slice(0, 2).map((x) => (x as HTMLOptionElement).value),
    );
    await select.selectOption(valores);
    const elegidos = await select.evaluate((el: HTMLSelectElement) =>
      Array.from(el.selectedOptions).map((o) => o.value),
    );
    expect(elegidos).toEqual(valores);
  });
});

test.describe('Key Presses', () => {
  const TECLAS: Array<[string, string]> = [
    ['Enter', 'ENTER'], ['Escape', 'ESCAPE'], ['Space', 'SPACE'], ['ArrowLeft', 'LEFT'],
    ['ArrowRight', 'RIGHT'], ['ArrowUp', 'UP'], ['ArrowDown', 'DOWN'], ['Backspace', 'BACK_SPACE'],
    ['Delete', 'DELETE'], ['Shift', 'SHIFT'], ['Control', 'CONTROL'], ['Alt', 'ALT'],
  ];

  for (const [tecla, esperado] of TECLAS) {
    test(`CP-KEY-01 La tecla ${tecla} muestra "${esperado}"`, async ({ page }) => {
      await page.goto('/key_presses');
      await page.locator('#target').press(tecla);
      await expect(page.locator('#result')).toHaveText(`You entered: ${esperado}`);
    });
  }

  for (const letra of ['a', 'q', 'z']) {
    test(`CP-KEY-02 La letra ${letra} se reporta`, async ({ page }) => {
      await page.goto('/key_presses');
      await page.locator('#target').press(letra);
      await expect(page.locator('#result')).toHaveText(new RegExp(`You entered: ${letra}`, 'i'));
    });
  }

  for (const digito of ['0', '5', '9']) {
    test(`CP-KEY-03 El dígito ${digito} se reporta`, async ({ page }) => {
      await page.goto('/key_presses');
      await page.locator('#target').press(digito);
      await expect(page.locator('#result')).toHaveText(`You entered: ${digito}`);
    });
  }

  test('CP-KEY-04 Al inicio no hay resultado', async ({ page }) => {
    await page.goto('/key_presses');
    await expect(page.locator('#result')).toHaveText('');
  });
});

test.describe('Horizontal Slider', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/horizontal_slider');
  });

  test('CP-SLD-01 El slider empieza en 0', async ({ page }) => {
    await expect(page.locator('#range')).toHaveText('0');
  });

  for (const v of ['0.5', '1', '2.5', '4', '5']) {
    test(`CP-SLD-02 Fijar el slider en ${v}`, async ({ page }) => {
      await page.locator('input[type="range"]').fill(v);
      await expect(page.locator('#range')).toHaveText(v);
    });
  }

  test('CP-SLD-03 Flecha derecha avanza 0.5', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await slider.focus();
    await slider.press('ArrowRight');
    await expect(page.locator('#range')).toHaveText('0.5');
  });

  test('CP-SLD-04 La tecla End lleva el slider a 5', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await slider.focus();
    await slider.press('End');
    await expect(page.locator('#range')).toHaveText('5');
  });

  test('CP-SLD-05 La tecla Home regresa el slider a 0', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await slider.fill('3');
    await slider.press('Home');
    await expect(page.locator('#range')).toHaveText('0');
  });

  test('CP-SLD-06 El slider tiene mínimo 0 y máximo 5', async ({ page }) => {
    const slider = page.locator('input[type="range"]');
    await expect(slider).toHaveAttribute('min', '0');
    await expect(slider).toHaveAttribute('max', '5');
    await expect(slider).toHaveAttribute('step', '0.5');
  });
});
