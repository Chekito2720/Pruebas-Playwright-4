import { type Page, type Locator } from '@playwright/test';

export class TablesPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/tables');
  }

  rows(table: '#table1' | '#table2'): Locator {
    return this.page.locator(`${table} tbody tr`);
  }

  headers(table: '#table1' | '#table2'): Locator {
    return this.page.locator(`${table} thead th`);
  }

  /** Texto de una columna (índice base 0) en el orden actual de la tabla. */
  async column(table: '#table1' | '#table2', index: number): Promise<string[]> {
    return this.rows(table).evaluateAll(
      (rows, i) => rows.map((r) => (r.querySelectorAll('td')[i as number].textContent ?? '').trim()),
      index,
    );
  }

  async sortBy(table: '#table1' | '#table2', header: string) {
    await this.page.locator(`${table} thead th`, { hasText: header }).click();
  }
}
