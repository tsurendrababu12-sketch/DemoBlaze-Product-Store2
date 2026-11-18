# DemoBlaze Product Store Automation

Playwright end-to-end tests for the public [DemoBlaze Product Store](https://www.demoblaze.com/), written in TypeScript.

## Requirements

- Node.js 20 or newer
- npm
- Chromium installed for Playwright

## Setup

```powershell
npm ci
npx playwright install chromium
```

## Run

```powershell
npm test
npm run typecheck
npm run test:headed
npm run test:live
npm run report
```

Run `npm run typecheck` to validate TypeScript types without emitting files.

The suite targets Chromium and runs against the live DemoBlaze site. It uses a fresh browser context for each test, so cart state is not intentionally shared. Since the site is an external demo service, availability and backend behavior can affect results.

Use `npm run test:live` or `npm run test:headed` to watch the store journey in one headed Chromium window and page. The guided flow browses to Laptops, adds only the middle first-row product (`Sony vaio i7`), verifies it is the only cart item, and checks out; it does not add the Samsung phone or perform login. The live configuration runs a single guided test, disables retries to avoid relaunching the browser, and applies a 3-second slow-motion delay to browser actions (including clicks); Chromium closes after the flow finishes. The regular `npm test` run keeps its five tests isolated, retries failures up to 3 times, and has no slow-motion delay.

## Coverage

- Browse between laptop and phone categories and verify product filtering.
- Open product details, verify the product name and price, and add an item to the cart.
- Remove a cart item.
- Complete checkout and verify the purchase confirmation.
- Attempt login with an unknown username and verify the negative response.

## Design and reliability

- `pages/store-pages.ts` contains small Page Objects for catalog, product, and cart interactions. Tests keep business assertions visible in the spec.
- Locators prefer accessible roles and names, with stable IDs for site controls that do not expose reliable accessible names.
- Assertions and Playwright's locator/action waiting replace fixed sleeps; no `waitForTimeout()` is used.
- The regular test suite retries failures up to **3 times** in both local and CI runs. Traces are collected on the first retry and screenshots on failure. The guided live demo disables retries so a failing live run does not relaunch Chromium.
- The checkout test uses clearly fictitious order details. The login test uses a timestamped username so it does not depend on or create an account.

## Interview walkthrough

Start with `playwright.config.ts` to explain the common URL, browser project, retry policy, and diagnostic artifacts. Then show how the Page Objects keep repeated navigation and selectors out of the test flows, and how the specs assert user-visible outcomes rather than implementation details. Finally, explain that tests are independent and why the suite avoids fixed delays and persistent test accounts.
