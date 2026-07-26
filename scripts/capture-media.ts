import { mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { chromium, expect } from "@playwright/test";

async function main() {
const baseURL = process.env.CAPTURE_BASE_URL || "http://127.0.0.1:3000";
const screenshotsDir = path.resolve("docs/screenshots");
const demoDir = path.resolve("docs/demo");
const recordingDir = path.join(demoDir, ".recording");

await mkdir(screenshotsDir, { recursive: true });
await mkdir(demoDir, { recursive: true });
await rm(recordingDir, { recursive: true, force: true });
await mkdir(recordingDir, { recursive: true });

const browser = await chromium.launch({ channel: "chrome" });

const stillContext = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
});
const stillPage = await stillContext.newPage();

await stillPage.goto(baseURL, { waitUntil: "networkidle" });
await stillPage.screenshot({
  path: path.join(screenshotsDir, "home.png"),
  animations: "disabled",
});

await stillPage.getByRole("button", { name: /Try a guided example/i }).click();
await expect(stillPage.getByLabel("Document text")).toHaveValue(/Northwind/);
await stillPage.getByRole("button", { name: "Ask", exact: true }).click();
await expect(stillPage.getByText("Grounded answer")).toBeVisible({
  timeout: 30_000,
});
await stillPage.locator(".result-section").screenshot({
  path: path.join(screenshotsDir, "grounded-answer.png"),
  animations: "disabled",
});

await stillPage
  .getByRole("textbox", { name: "Question" })
  .fill("How many paid vacation days do I get?");
await stillPage.getByRole("button", { name: "Ask", exact: true }).click();
await expect(stillPage.getByText("Honest answer")).toBeVisible({
  timeout: 30_000,
});
await stillPage.locator(".result-section").screenshot({
  path: path.join(screenshotsDir, "safe-no-answer.png"),
  animations: "disabled",
});
await stillContext.close();

const mobileContext = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 1,
  isMobile: true,
  hasTouch: true,
  reducedMotion: "reduce",
});
const mobilePage = await mobileContext.newPage();
await mobilePage.goto(baseURL, { waitUntil: "networkidle" });
await mobilePage.screenshot({
  path: path.join(screenshotsDir, "mobile.png"),
  animations: "disabled",
});
await mobileContext.close();

const videoContext = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: {
    dir: recordingDir,
    size: { width: 1280, height: 720 },
  },
});
const videoPage = await videoContext.newPage();
const video = videoPage.video();

await videoPage.goto(baseURL, { waitUntil: "networkidle" });
await videoPage.waitForTimeout(900);
await videoPage.getByRole("button", { name: /Try a guided example/i }).click();
await videoPage.waitForTimeout(800);
await videoPage.getByRole("button", { name: "Ask", exact: true }).click();
await expect(videoPage.getByText("Grounded answer")).toBeVisible({
  timeout: 30_000,
});
await videoPage.locator(".result-section").scrollIntoViewIfNeeded();
await videoPage.waitForTimeout(1_500);
await videoPage
  .getByRole("button", { name: /Jump to evidence/ })
  .first()
  .click();
await videoPage.waitForTimeout(1_300);

await videoContext.close();
if (!video) throw new Error("Video recording was not available.");
await video.saveAs(path.join(demoDir, "groundquote-demo.webm"));
await rm(recordingDir, { recursive: true, force: true });

await browser.close();
process.stdout.write("Captured Groundquote screenshots and demo video.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
