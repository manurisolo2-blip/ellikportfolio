import fs from "node:fs/promises";
import path from "node:path";
import { existsSync } from "node:fs";
import { chromium } from "playwright-core";
import sharp from "sharp";

const SITES = [
  { id: "mojo", url: "https://mojo-grille-demo.vercel.app/" },
  { id: "dopamine", url: "https://dopamine-three-omega.vercel.app/" },
  { id: "lungyai", url: "https://lungyai.vercel.app/" },
  { id: "rio3", url: "https://deportistasrio3.vercel.app/" },
];

const BROWSER_CANDIDATES = [
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
];

function findExecutablePath() {
  for (const candidate of BROWSER_CANDIDATES) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error(
    `No se encontró Chrome/Edge en rutas conocidas: ${BROWSER_CANDIDATES.join(", ")}`
  );
}

async function waitForPageReady(page) {
  await page
    .evaluate(async () => {
      if (document.fonts && document.fonts.ready) {
        await document.fonts.ready;
      }
      const imgs = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.addEventListener("load", resolve, { once: true });
            img.addEventListener("error", resolve, { once: true });
            setTimeout(resolve, 4000);
          });
        })
      );
    })
    .catch(() => {});

  // Esperar hasta 5s si existe algún loader/splash visible
  const deadline = Date.now() + 5000;
  while (Date.now() < deadline) {
    const hasActiveLoader = await page
      .evaluate(() => {
        const selectors = [
          '[role="status"]',
          '[class*="loader" i]',
          '[class*="preloader" i]',
          '[aria-busy="true"]',
        ];
        return selectors.some((sel) =>
          Array.from(document.querySelectorAll(sel)).some((el) => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return (
              style.display !== "none" &&
              style.visibility !== "hidden" &&
              parseFloat(style.opacity || "1") > 0.05 &&
              rect.width > 120 &&
              rect.height > 120
            );
          })
        );
      })
      .catch(() => false);

    if (!hasActiveLoader) break;
    await page.waitForTimeout(300);
  }

  // Espera extra solicitada de 2500ms para animaciones de entrada y pósters/videos
  await page.waitForTimeout(2500);
}

async function captureVariant(browser, site, variant, outputDir) {
  const isMobile = variant === "mobile";
  const context = await browser.newContext({
    viewport: isMobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile,
    hasTouch: isMobile,
  });

  const page = await context.newPage();

  try {
    try {
      await page.goto(site.url, { waitUntil: "networkidle", timeout: 45000 });
    } catch {
      await page.goto(site.url, { waitUntil: "load", timeout: 45000 });
    }

    await waitForPageReady(page);

    const pngBuffer = await page.screenshot({
      type: "png",
      fullPage: false,
    });

    const outPath = path.join(outputDir, `${site.id}-${variant}.webp`);
    if (isMobile) {
      await sharp(pngBuffer)
        .resize(780, 1688, { fit: "cover", position: "top" })
        .webp({ quality: 86 })
        .toFile(outPath);
    } else {
      await sharp(pngBuffer)
        .resize(1920, 1200, { fit: "cover", position: "top" })
        .webp({ quality: 86 })
        .toFile(outPath);
    }

    const stat = await fs.stat(outPath);
    const kb = (stat.size / 1024).toFixed(1);
    console.log(`[OK] ${site.id}-${variant}.webp -> ${kb} KB`);
  } finally {
    await context.close();
  }
}

async function main() {
  const outputDir = path.resolve(process.cwd(), "public", "previews");
  await fs.mkdir(outputDir, { recursive: true });

  const executablePath = findExecutablePath();
  console.log(`Using browser: ${executablePath}`);

  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ["--disable-gpu-sandbox", "--no-sandbox", "--hide-scrollbars"],
  });

  try {
    for (const site of SITES) {
      await captureVariant(browser, site, "desktop", outputDir);
      await captureVariant(browser, site, "mobile", outputDir);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Error capturando vistas previas:", err);
  process.exit(1);
});
