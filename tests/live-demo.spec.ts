import { expect, test } from '@playwright/test';
import { CartPage, HomePage, ProductPage } from '../pages/store-pages';

const laptopName = 'Sony vaio i7';

test('guided DemoBlaze store journey', async ({ page }) => {
  await test.step('Browse categories', async () => {
    const home = new HomePage(page);
    await home.open();
    await home.selectCategory('Laptops');
    await expect(home.product('MacBook air')).toBeVisible();
    await expect(home.product(laptopName)).toBeVisible();
  });

  await test.step('Select and add only the middle laptop', async () => {
    const home = new HomePage(page);
    await home.openProduct(laptopName);
    const product = new ProductPage(page);
    await expect(product.title).toHaveText(laptopName);
    await expect(product.price).toContainText('$');
    expect(await product.addToCart()).toBe('Product added');
  });

  await test.step('Verify the laptop is the only cart item', async () => {
    const cart = new CartPage(page);
    await cart.open();
    await expect(cart.rowFor(laptopName)).toBeVisible();
    await expect(cart.rows).toHaveCount(1);
  });

  await test.step('Complete checkout with the laptop only', async () => {
    const cart = new CartPage(page);
    await cart.placeOrder();

    await page.locator('#name').fill('Automation Buyer');
    await page.locator('#country').fill('Canada');
    await page.locator('#city').fill('Toronto');
    await page.locator('#card').fill('4111111111111111');
    await page.locator('#month').fill('12');
    await page.locator('#year').fill('2030');
    await page.getByRole('button', { name: 'Purchase' }).click();

    await expect(page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeVisible();
    await expect(page.getByText(/Amount: 790 USD/)).toBeVisible();
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeHidden();
  });
});
