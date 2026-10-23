# the-internet-playwright

Pruebas automatizadas con Playwright + TypeScript para https://the-internet.herokuapp.com (UI y API).

## Requisitos
- Node.js 18 o superior (`node -v`)

## Instalación
```bash
npm install
npx playwright install chromium
```

## Ejecución
```bash
npm test                               # toda la suite
npx playwright test forms.spec.ts      # un archivo
npx playwright test -g "CP-LOG-05"     # una prueba por nombre
npm run test:api                       # solo API
npm run test:headed                    # con navegador visible
npm run test:ui                        # modo interactivo
npm run list                           # lista todos los casos
npm run report                         # abre target/report
```

## Estructura
- `src/helpers.ts`: diálogos, credenciales y utilidades.
- `src/fixtures.ts`: entrega los page objects a las pruebas.
- `src/pages/`: LoginPage y TablesPage.
- `tests/`: 8 archivos `.spec.ts`.
