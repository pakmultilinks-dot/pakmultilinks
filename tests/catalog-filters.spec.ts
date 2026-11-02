import { expect, test } from "@playwright/test";
import { matchesCategory, matchesBrand, isCatalogProductAvailable } from "../src/lib/catalog-filters";
import type { Category, Product } from "../src/lib/types";

test("category filters show the available products on desktop and mobile", async ({ page, request }, testInfo) => {
  const {products, categories}: {products: Product[]; categories: Category[]} = await (await request.get('/api/catalog')).json();
  await page.goto('/shop', {waitUntil: 'domcontentloaded'});
  const mobile = testInfo.project.name === 'mobile';
  if (mobile) await page.locator('.catalog-mobile-filters summary:visible').click();
  const select = page.locator(mobile ? '#mobile-category' : '#desktop-category');
  const available = categories.filter(c=>products.some(p=>matchesCategory(p,c.slug,categories)));
  for (const category of available) {
    await select.selectOption(category.slug);
    const expected = products.filter(p=>matchesCategory(p,category.slug,categories)).length;
    await expect(page.locator('#product-results .product-card')).toHaveCount(Math.min(24,expected));
    await expect(page.getByRole('heading',{name:'No matching products'})).toHaveCount(0);
  }
  await select.selectOption('');
  await expect(page.locator('#product-results .product-card')).toHaveCount(Math.min(24,products.length));
  const availableOnly = page.locator(mobile ? '.catalog-mobile-filters' : 'aside[aria-label="Product filters"]').getByRole('checkbox',{name:'Available products only'});
  await availableOnly.check();
  await expect(page.locator('#product-results .product-card')).toHaveCount(Math.min(24,products.filter(isCatalogProductAvailable).length));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
});

test("category URL is an initial filter that can be cleared", async ({ page }, testInfo) => {
  await page.goto('/shop?category=tissue-paper-products', {waitUntil: 'domcontentloaded'});
  if(testInfo.project.name==='mobile') await page.locator('.catalog-mobile-filters summary:visible').click();
  const area=page.locator(testInfo.project.name==='mobile'?'.catalog-mobile-filters':'aside[aria-label="Product filters"]');
  await area.getByRole('button',{name:/Clear \d+ filter/}).click();
  await expect(area.getByLabel('Category',{exact:true})).toHaveValue('');
});

test("brand introduction follows products and filters remain in normal flow", async ({ page, request }, testInfo) => {
  const {products,categories}: {products:Product[];categories:Category[]} = await (await request.get('/api/catalog')).json();
  await page.goto('/brand/rose-petal', {waitUntil: 'domcontentloaded'});
  const order = await page.evaluate(()=>{
    const grid=document.querySelector('#product-results');
    const intro=[...document.querySelectorAll('h2')].find(h=>h.textContent?.includes('Official Rose Petal'));
    return Boolean(grid&&intro&&(grid.compareDocumentPosition(intro)&Node.DOCUMENT_POSITION_FOLLOWING));
  });
  expect(order).toBeTruthy();
  const mobile=testInfo.project.name==='mobile';
  if(mobile)await page.locator('.catalog-mobile-filters summary:visible').click();
  const select=page.locator(mobile?'#mobile-category':'#desktop-category');
  const brandProducts=products.filter(p=>matchesBrand(p,'Rose Petal'));
  for(const option of await select.locator('option').all()){
    const value=await option.getAttribute('value');if(!value)continue;
    expect(brandProducts.some(p=>matchesCategory(p,value,categories))).toBeTruthy();
    await select.selectOption(value);
    await expect(page.locator('#product-results .product-card').first()).toBeVisible();
  }
  if(!mobile)await expect(page.locator('aside[aria-label="Product filters"]')).toHaveCSS('position','static');
});

test("filters wait for JavaScript before accepting the first click", async ({ page }, testInfo) => {
  // Isolate script readiness from unrelated third-party product image downloads.
  await page.route('**/*', (route) => route.request().resourceType() === 'image' ? route.abort() : route.fallback());
  let releaseScripts!: () => void;
  const scriptsReady = new Promise<void>((resolve) => { releaseScripts = resolve; });
  await page.route(/\/_next\/static\/.*\.js(?:\?.*)?$/, async (route) => {
    await scriptsReady;
    await route.continue();
  });
  try {
    await page.goto('/shop?category=tissue-paper-products', { waitUntil: 'commit' });
    const mobile = testInfo.project.name === 'mobile';
    if (mobile) await page.locator('.catalog-mobile-filters summary:visible').click();
    const area = page.locator(mobile ? '.catalog-mobile-filters' : 'aside[aria-label="Product filters"]');
    const clear = area.getByRole('button', { name: /Clear \d+ filter/ });
    await expect(clear).toBeDisabled();
    releaseScripts();
    await expect(clear).toBeEnabled();
    await clear.click();
    await expect(area.getByLabel('Category', { exact: true })).toHaveValue('');
  } finally {
    releaseScripts();
  }
});
