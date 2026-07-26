import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("a visitor can get a grounded answer and inspect the source", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Ask the text/i }),
  ).toBeVisible();
  await expect(page.getByText("Private by design")).toBeVisible();

  await page.getByRole("button", { name: /Try a guided example/i }).click();
  await expect(page.getByLabel("Document text")).toHaveValue(
    /Northwind Remote Work Policy/,
    { timeout: 10_000 },
  );
  await expect(page.getByRole("textbox", { name: "Question" })).toHaveValue(
    "What equipment can a new employee buy, and what needs approval?",
  );

  await page.getByRole("button", { name: "Ask", exact: true }).click();
  const result = page.locator(".result-section");
  await expect(result.getByText("Grounded answer")).toBeVisible();
  await expect(result.getByRole("heading", { name: "Evidence used" })).toBeVisible();
  await expect(result.locator(".evidence-list").getByText(/manager approval/i)).toBeVisible();

  const citation = result.getByRole("button", { name: /Jump to evidence/ }).first();
  await expect(citation).toBeVisible();
  await citation.click();
  await expect(page.locator(".evidence-list article").first()).toBeVisible();
});

test("a visitor gets an honest no-answer when the source is silent", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Try an example" }).click();
  await page
    .getByRole("textbox", { name: "Question" })
    .fill("How many paid vacation days do I get?");
  await page.getByRole("button", { name: "Ask", exact: true }).click();

  const result = page.locator(".result-section");
  await expect(result.getByText("Honest answer")).toBeVisible();
  await expect(
    result.getByText(/I don’t have enough information/i),
  ).toBeVisible();
  await expect(
    result.getByText("No passage was strong enough to support an answer."),
  ).toBeVisible();
});

test("the learning challenge explains both choices in plain language", async ({
  page,
}) => {
  await page.goto("/#learn-rag");
  await page.getByRole("button", { name: "Answer it" }).click();
  await expect(page.getByText(/That would be a guess/i)).toBeVisible();

  await page.getByRole("button", { name: /Say “not enough info”/i }).click();
  await expect(page.getByText(/Exactly. The passage covers returns/i)).toBeVisible();
});

test("the RAG guide and privacy page are useful without JavaScript-only content", async ({
  page,
}) => {
  await page.goto("/learn/rag");
  await expect(
    page.getByRole("heading", {
      name: /RAG explained without the hand-waving/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByText("The right passage was never retrieved."),
  ).toBeVisible();
  await expect(page.getByText("Safe answer", { exact: true })).toBeVisible();

  await page.goto("/privacy");
  await expect(
    page.getByRole("heading", {
      name: /Your document is for your request/i,
    }),
  ).toBeVisible();
  await expect(page.getByText(/persist your document text/i)).toBeVisible();
});

test("public discovery files are available and correctly identify the site", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBe(true);
  expect(await robots.text()).toContain("Sitemap:");

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBe(true);
  expect(await sitemap.text()).toContain("/learn/rag");

  const llms = await request.get("/llms.txt");
  expect(llms.ok()).toBe(true);
  expect(await llms.text()).toContain(
    "free, open-source document question-answering application",
  );

  const manifest = await request.get("/manifest.webmanifest");
  expect(manifest.ok()).toBe(true);
  expect(await manifest.text()).toContain("Groundquote");
});

test("the homepage has no serious automated accessibility violations", async ({
  page,
}) => {
  await page.goto("/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();

  expect(results.violations).toEqual([]);
});

test("the key workflow fits a phone without horizontal scrolling", async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  await page.goto("/");

  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);

  await page.getByRole("button", { name: /Try a guided example/i }).click();
  await expect(page.getByRole("button", { name: "Ask", exact: true })).toBeVisible();
  await context.close();
});

test("keyboard users can reach the main call to action", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const navigation = page.getByRole("navigation");
  await expect(
    navigation.getByRole("link", { name: /Groundquote home/i }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Try it" })).toBeFocused();
});
