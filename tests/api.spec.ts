import { test, expect } from '../src/fixtures';
import { VALID_USER } from '../src/helpers';

const basic = (u: string, p: string) => `Basic ${Buffer.from(`${u}:${p}`).toString('base64')}`;

test.describe('API > Códigos de estado', () => {
  for (const c of [200, 404, 500]) {
    test(`CP-API-01 GET /status_codes/${c} responde ${c}`, async ({ request }) => {
      const res = await request.get(`/status_codes/${c}`);
      expect(res.status()).toBe(c);
    });
  }

  test('CP-API-02 GET /status_codes/301 responde 301 sin seguir la redirección', async ({ request }) => {
    const res = await request.get('/status_codes/301', { maxRedirects: 0 });
    expect(res.status()).toBe(301);
  });

  test('CP-API-03 El home responde 200 y es HTML', async ({ request }) => {
    const res = await request.get('/');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toContain('text/html');
  });

  test('CP-API-04 Una ruta inexistente responde 404', async ({ request }) => {
    const res = await request.get('/no-existe-zzz');
    expect(res.status()).toBe(404);
  });

  test('CP-API-05 /redirect responde con una redirección hacia /status_codes', async ({ request }) => {
    const res = await request.get('/redirect', { maxRedirects: 0 });
    expect([301, 302]).toContain(res.status());
    expect(res.headers()['location']).toContain('/status_codes');
  });
});

test.describe('API > Autenticación', () => {
  test('CP-API-06 Basic Auth con credenciales correctas responde 200', async ({ request }) => {
    const res = await request.get('/basic_auth', { headers: { Authorization: basic('admin', 'admin') } });
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Congratulations');
  });

  test('CP-API-07 Basic Auth con contraseña incorrecta responde 401', async ({ request }) => {
    const res = await request.get('/basic_auth', { headers: { Authorization: basic('admin', 'mala') } });
    expect(res.status()).toBe(401);
  });

  test('CP-API-08 Basic Auth sin cabecera responde 401', async ({ request }) => {
    const res = await request.get('/basic_auth');
    expect(res.status()).toBe(401);
  });

  test('CP-API-09 /authenticate con credenciales válidas redirige a /secure', async ({ request }) => {
    const res = await request.post('/authenticate', { form: VALID_USER, maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/secure');
  });

  test('CP-API-10 /authenticate con credenciales inválidas regresa a /login', async ({ request }) => {
    const res = await request.post('/authenticate', { form: { username: 'x', password: 'y' }, maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/login');
  });

  test('CP-API-11 /secure sin sesión redirige a /login', async ({ request }) => {
    const res = await request.get('/secure', { maxRedirects: 0 });
    expect(res.status()).toBe(302);
    expect(res.headers()['location']).toContain('/login');
  });

  test('CP-API-12 Tras autenticarse por API, /secure responde 200', async ({ request }) => {
    await request.post('/authenticate', { form: VALID_USER, maxRedirects: 0 });
    const res = await request.get('/secure');
    expect(res.status()).toBe(200);
    expect(await res.text()).toContain('Secure Area');
  });
});

test.describe('API > Contenido', () => {
  test('CP-API-13 /dropdown contiene las tres opciones', async ({ request }) => {
    const html = await (await request.get('/dropdown')).text();
    expect(html).toContain('Option 1');
    expect(html).toContain('Option 2');
  });

  test('CP-API-14 /tables contiene los datos de John Smith', async ({ request }) => {
    const html = await (await request.get('/tables')).text();
    expect(html).toContain('jsmith@gmail.com');
  });

  test('CP-API-15 /abtest responde 200', async ({ request }) => {
    expect((await request.get('/abtest')).status()).toBe(200);
  });

  test('CP-API-16 /download lista archivos descargables', async ({ request }) => {
    const html = await (await request.get('/download')).text();
    expect(html).toMatch(/href="download\//);
  });

  test('CP-API-17 /login contiene el formulario de autenticación', async ({ request }) => {
    const html = await (await request.get('/login')).text();
    expect(html).toContain('action="/authenticate"');
  });

  test('CP-API-18 /javascript_alerts contiene los tres botones', async ({ request }) => {
    const html = await (await request.get('/javascript_alerts')).text();
    for (const f of ['jsAlert()', 'jsConfirm()', 'jsPrompt()']) expect(html).toContain(f);
  });
});
