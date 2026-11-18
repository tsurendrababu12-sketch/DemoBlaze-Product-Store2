import { expect, test } from '@playwright/test';
import { CartPage, clickAndAcceptDialog, HomePage, ProductPage } from '../pages/store-pages';

const productName = 'Samsung galaxy s6';

async function addProductToCart(page: import('@playwright/test').Page): Promise<void> {
  const home = new HomePage(page);
  await home.open();
  await home.openProduct(productName);
  const product = new ProductPage(page);
  expect(await product.addToCart()).toBe('Product added');
}

test('browses product categories and shows matching products', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await expect(home.product(productName)).toBeVisible();

  await home.selectCategory('Laptops');
  await expect(home.product('MacBook air')).toBeVisible();
  await expect(home.product(productName)).toHaveCount(0);

  await home.selectCategory('Phones');
  await expect(home.product(productName)).toBeVisible();
});

test('shows product details and confirms adding a product to the cart', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await home.openProduct(productName);

  const product = new ProductPage(page);
  await expect(product.title).toHaveText(productName);
  await expect(product.price).toContainText('$');
  expect(await product.addToCart()).toBe('Product added');
});

test('removes a product from the cart', async ({ page }) => {
  await addProductToCart(page);
  const cart = new CartPage(page);
  await cart.open();

  const productRow = cart.rowFor(productName);
  await expect(productRow).toBeVisible();
  await productRow.getByRole('link', { name: 'Delete' }).click();
  await expect(productRow).toHaveCount(0);
});

test('completes checkout and confirms the order', async ({ page }) => {
  await addProductToCart(page);
  const cart = new CartPage(page);
  await cart.open();
  await expect(cart.rowFor(productName)).toBeVisible();

  await cart.placeOrder();
  await page.locator('#name').fill('Automation Buyer');
  await page.locator('#country').fill('Canada');
  await page.locator('#city').fill('Toronto');
  await page.locator('#card').fill('4111111111111111');
  await page.locator('#month').fill('12');
  await page.locator('#year').fill('2030');

  await page.getByRole('button', { name: 'Purchase' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeVisible();
  await expect(page.getByText(/Amount: 360 USD/)).toBeVisible();
  await page.getByRole('button', { name: 'OK' }).click();
  await expect(page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeHidden();
});

test('rejects login with an unknown username', async ({ page }) => {
  const home = new HomePage(page);
  await home.open();
  await page.getByRole('link', { name: 'Log in' }).click();
  await expect(page.locator('#logInModal')).toBeVisible();
  await page.locator('#loginusername').fill(`unknown-user-${Date.now()}`);
  await page.locator('#loginpassword').fill('invalid-password');

  const message = await clickAndAcceptDialog(page, () =>
    page.locator('#logInModal').getByRole('button', { name: 'Log in' }).click(),
  );
  expect(message).toBe('User does not exist.');
  await expect(page.locator('#logInModal')).toBeVisible();
});
