import { expect, type Page } from '@playwright/test';

export const BASE_URL = 'https://the-internet.herokuapp.com';

export const VALID_USER = { username: 'tomsmith', password: 'SuperSecretPassword!' };

/** Atiende el siguiente diálogo (alert/confirm/prompt) y devuelve lo que vio. */
export async function handleDialog(
  page: Page,
  trigger: () => Promise<void>,
  opts: { accept?: boolean; text?: string } = {},
) {
  let seen: { type: string; message: string } | undefined;
  page.once('dialog', async (d) => {
    seen = { type: d.type(), message: d.message() };
    if (opts.accept === false) await d.dismiss();
    else await d.accept(opts.text);
  });
  await trigger();
  await expect.poll(() => seen, { timeout: 10_000 }).toBeTruthy();
  return seen!;
}

/** Convierte "$1,234.50" en 1234.5 */
export const money = (s: string) => Number(s.replace(/[^0-9.]/g, ''));
