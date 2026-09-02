const { test, expect } = require("@playwright/test");

test("renders the complete landing page without horizontal overflow", async ({ page }) => {
  await page.goto("/?utm_source=ig&utm_medium=social&utm_content=qa");
  await expect(page).toHaveTitle(/Sidney Colares/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Planejamento");
  await expect(page.locator("main section")).toHaveCount(7);

  for (const width of [360, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    }));
    expect(dimensions.scrollWidth, `overflow at ${width}px`).toBeLessThanOrEqual(dimensions.clientWidth + 1);

    const caseImage = await page.locator(".case img").first().boundingBox();
    expect(Math.abs(caseImage.width - caseImage.height), `case image is not square at ${width}px`).toBeLessThanOrEqual(1);
  }
});

test("opens, validates and advances the accessible lead form", async ({ page }) => {
  await page.addInitScript(() => {
    window.open = (url) => {
      window.__openedWhatsAppUrl = url;
      return {};
    };
  });
  await page.goto("/?utm_source=ig&utm_medium=social&utm_campaign=smoke");
  const cta = page.locator(".js-open-form").first();
  await cta.click();

  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(page.locator("[data-progress='1']")).toHaveAttribute("aria-current", "step");

  await page.locator(".form-next").click();
  await expect(page.locator("#name-error")).toContainText("Informe seu nome");

  await page.locator("#lead-name").fill("Paciente Teste");
  await page.locator(".form-next").click();
  await page.locator("#lead-phone").fill("94991360408");
  await page.locator(".form-next").click();
  await page.locator("#lead-email").fill("paciente@example.com");
  await page.locator(".form-next").click();

  await expect(page.locator("[name='utm_source']")).toHaveValue("ig");
  await expect(page.locator("[name='utm_campaign']")).toHaveValue("smoke");
  await page.getByLabel("Sim, quero agendar uma avaliação").check();
  await page.locator("[name='privacy_consent']").check();
  const submit = page.getByRole("button", { name: "Continuar no WhatsApp" });
  await expect(submit).toBeVisible();
  await submit.click();
  await expect.poll(() => page.evaluate(() => window.__openedWhatsAppUrl || "")).toContain("https://wa.me/5594991360408");
  await expect.poll(() => page.evaluate(() => window.dataLayer.some((item) => item.event === "generate_lead"))).toBe(true);

  await page.getByRole("button", { name: "Fechar formulário" }).click();
  await expect(dialog).toBeHidden();
  await expect(cta).toBeFocused();
});

test("supports carousel pause, hero pause and credentials accordion", async ({ page }) => {
  await page.goto("/");
  const heroPause = page.locator('[data-media-toggle="hero"]');
  await heroPause.click();
  await expect(heroPause).toHaveAttribute("aria-pressed", "true");

  const carouselPause = page.locator(".carousel-controls__pause");
  if (await carouselPause.isVisible()) {
    await carouselPause.click();
    await expect(carouselPause).toHaveAttribute("aria-pressed", "true");
  }

  const details = page.locator(".credentials");
  await details.locator("summary").click();
  await expect(details).toHaveAttribute("open", "");
});
