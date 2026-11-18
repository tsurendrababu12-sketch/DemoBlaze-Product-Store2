import { expect, Locator, Page } from '@playwright/test';

export async function clickAndAcceptDialog(page: Page, action: () => Promise<void>): Promise<string> {
  const dialogPromise = new Promise<string>((resolve, reject) => {
    page.once('dialog', (dialog) => {
      const message = dialog.message();
      dialog.accept().then(() => resolve(message)).catch(reject);
    });
  });

  await action();
  return dialogPromise;
}

export class HomePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(this.page.locator('#nava')).toBeVisible();
  }

  product(name: string): Locator {
    return this.page.locator('.card-title').getByRole('link', { name, exact: true });
  }

  async selectCategory(name: 'Phones' | 'Laptops' | 'Monitors'): Promise<void> {
    await this.page.locator('#itemc').filter({ hasText: name }).click();
  }

  async openProduct(name: string): Promise<void> {
    await this.product(name).click();
    await expect(this.page.locator('h2.name')).toHaveText(name);
  }
}

export class ProductPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  get title(): Locator {
    return this.page.locator('h2.name');
  }

  get price(): Locator {
    return this.page.locator('.price-container');
  }

  async addToCart(): Promise<string> {
    return clickAndAcceptDialog(this.page, () =>
      this.page.getByRole('link', { name: 'Add to cart' }).click(),
    );
  }
}

export class CartPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async open(): Promise<void> {
    await this.page.getByRole('link', { name: 'Cart', exact: true }).click();
    await expect(this.page).toHaveURL(/cart\.html/);
  }

  get rows(): Locator {
    return this.page.locator('#tbodyid tr');
  }

  rowFor(productName: string): Locator {
    return this.rows.filter({ hasText: productName });
  }

  async placeOrder(): Promise<void> {
    await this.page.getByRole('button', { name: 'Place Order' }).click();
    await expect(this.page.locator('#orderModal')).toBeVisible();
  }
}
