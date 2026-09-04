const { test, expect } = require("@playwright/test");

test("renders the complete landing page without horizontal overflow", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("meta_ads_consent_v1", "rejected"));
  await page.goto("/?utm_source=ig&utm_medium=social&utm_content=qa");
  await expect(page).toHaveTitle(/Sidney Colares/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Rinoplastia");
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
  await page.route("https://connect.facebook.net/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  let storedLead;
  await page.route("**/api/leads", async (route) => {
    storedLead = route.request().postDataJSON();
    await route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ ok: true, leadId: "test-lead", eventId: "lead_test-lead" }) });
  });
  await page.addInitScript(() => {
    localStorage.setItem("meta_ads_consent_v1", "accepted");
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
  await page.getByLabel("Quero agendar uma avaliação de rinoplastia").check();
  await page.locator("[name='privacy_consent']").check();
  const submit = page.getByRole("button", { name: "Continuar no WhatsApp" });
  await expect(submit).toBeVisible();
  await submit.click();
  await expect.poll(() => storedLead?.name).toBe("Paciente Teste");
  expect(storedLead).toMatchObject({
    phone: "(94) 99136-0408",
    email: "paciente@example.com",
    interest: "Quero agendar uma avaliação de rinoplastia",
    privacy_consent: true,
    utm_source: "ig",
    utm_campaign: "smoke",
    meta_consent: true,
  });
  await expect.poll(() => page.evaluate(() => window.__openedWhatsAppUrl || "")).toContain("https://wa.me/5594991360408");
  await expect.poll(() => page.evaluate(() => window.dataLayer.some((item) => item.event === "generate_lead"))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.fbq?.queue?.some((args) => args[0] === "track" && args[1] === "Lead"))).toBe(true);
  await expect.poll(() => page.evaluate(() => window.fbq?.queue?.some((args) => args[1] === "Lead" && args[3]?.eventID === "lead_test-lead"))).toBe(true);

  await page.getByRole("button", { name: "Fechar formulário" }).click();
  await expect(dialog).toBeHidden();
  await expect(cta).toBeFocused();
});

test("does not open WhatsApp when lead storage fails", async ({ page }) => {
  await page.route("**/api/leads", (route) => route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ ok: false }) }));
  await page.addInitScript(() => {
    localStorage.setItem("meta_ads_consent_v1", "rejected");
    window.open = (url) => {
      window.__openedWhatsAppUrl = url;
      return {};
    };
  });
  await page.goto("/");
  await page.locator(".js-open-form").first().click();
  await page.locator("#lead-name").fill("Paciente Teste");
  await page.locator(".form-next").click();
  await page.locator("#lead-phone").fill("94991360408");
  await page.locator(".form-next").click();
  await page.locator("#lead-email").fill("paciente@example.com");
  await page.locator(".form-next").click();
  await page.getByLabel("Quero tirar dúvidas sobre rinoplastia").check();
  await page.locator("[name='privacy_consent']").check();
  await page.locator(".form-submit").click();

  await expect(page.locator(".form-status")).toContainText("Tente novamente");
  await expect.poll(() => page.evaluate(() => window.__openedWhatsAppUrl || "")).toBe("");
});

test("loads Meta Pixel only after advertising consent", async ({ page }) => {
  await page.route("https://connect.facebook.net/**", (route) => route.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  await page.goto("/");

  const banner = page.locator("#cookie-consent");
  await expect(banner).toBeVisible();
  await expect(page.locator('script[src*="connect.facebook.net"]')).toHaveCount(0);

  await page.getByRole("button", { name: "Aceitar" }).click();

  await expect(banner).toBeHidden();
  await expect(page.locator('script[src="https://connect.facebook.net/en_US/fbevents.js"]')).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => localStorage.getItem("meta_ads_consent_v1"))).toBe("accepted");
  await expect.poll(() =>
    page.evaluate(() => window.fbq?.queue?.some((args) => args[0] === "init" && args[1] === "2258593511572731")),
  ).toBe(true);
  await expect.poll(() => page.evaluate(() => window.fbq?.queue?.some((args) => args[0] === "track" && args[1] === "PageView"))).toBe(true);
});

test("supports carousel pause, hero pause and credentials accordion", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("meta_ads_consent_v1", "rejected"));
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
