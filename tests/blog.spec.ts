import { expect, test } from "@playwright/test";
import { BLOG_ARTICLES } from "../src/lib/blog-data";

test("blog archive is crawlable, searchable and filterable", async ({ page, request }) => {
  const response = await request.get("/blog");
  expect(response.ok()).toBeTruthy();
  const html = await response.text();
  for (const article of BLOG_ARTICLES) expect(html).toContain(`/blog/${article.slug}`);

  await page.goto("/blog");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const cards = page.locator("#all-guides article");
  await expect(cards).toHaveCount(20);
  await page.getByRole("button", { name: /^Washroom supplies/ }).click();
  await expect(cards).toHaveCount(BLOG_ARTICLES.filter((article) => article.category === "Washroom supplies").length);
  await page.getByRole("button", { name: /Clear filters/ }).click();
  await page.getByRole("searchbox", { name: "Search buying guides" }).fill("carton pricing");
  await expect(cards).toHaveCount(1);
  await page.getByRole("searchbox", { name: "Search buying guides" }).fill("no-matching-topic-xyz");
  await expect(page.getByRole("heading", { name: "No matching guides yet" })).toBeVisible();
  await page.getByRole("button", { name: /Clear filters/ }).click();
  await expect(cards).toHaveCount(20);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("published guides render metadata, answers and linked references", async ({ request }) => {
  for (const article of BLOG_ARTICLES) {
    const response = await request.get(`/blog/${article.slug}`);
    expect(response.status(), article.slug).toBe(200);
    const html = await response.text();
    expect(html).toContain('rel="canonical"');
    expect(html).toContain(`/blog/${article.slug}`);
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('"@type":"BlogPosting"');
    expect(html).toContain('id="quick-answer"');
    expect(html).toContain('id="references"');
    expect(html).not.toMatch(/Draft Scaffold|Forthcoming|in Preparation/);
    for (const section of article.sections) expect(html).toContain(`id="${section.id}"`);
  }
});

test("article links, table and questions are usable", async ({ page }) => {
  await page.goto("/blog/facial-tissue-vs-napkins-vs-paper-towels");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("table")).toHaveCount(1);
  await page.locator("#questions summary").first().click();
  await expect(page.locator("#questions details[open] p")).toBeVisible();
  await page.getByRole("navigation", { name: "In this guide" }).getByRole("link", { name: /What is the difference/ }).click();
  await expect(page).toHaveURL(/#three-formats$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
});

test("carton calculator handles real inputs and invalid quantities", async ({ page }) => {
  await page.goto("/blog/carton-vs-piece-price-guide");
  await page.getByRole("spinbutton", { name: "Price per carton (PKR)", exact: true }).fill("4800");
  await page.getByRole("spinbutton", { name: "Units per carton", exact: true }).fill("24");
  await page.getByRole("spinbutton", { name: "Number of cartons", exact: true }).fill("2");
  await page.getByRole("spinbutton", { name: "Delivery / other charges (PKR)", exact: true }).fill("480");
  await expect(page.getByRole("status")).toContainText("10,080");
  await expect(page.getByRole("status")).toContainText("210");
  await page.getByRole("spinbutton", { name: "Units per carton", exact: true }).fill("0");
  await expect(page.getByRole("status")).toContainText("positive whole numbers");
  await expect(page.getByRole("status")).not.toContainText("Infinity");
});

test("unknown guides return 404", async ({ request }) => {
  const response = await request.get("/blog/this-guide-does-not-exist");
  expect(response.status()).toBe(404);
});
