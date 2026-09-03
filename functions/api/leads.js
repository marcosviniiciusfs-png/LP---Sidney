const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const clean = (value, maxLength) => String(value ?? "").trim().slice(0, maxLength);

export const onRequestPost = async ({ request, env }) => {
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ ok: false, error: "invalid_content_type" }, 415);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "invalid_json" }, 400);
  }

  // Campo invisível para bloquear envios automatizados simples.
  if (clean(body.website, 200)) return json({ ok: true }, 201);

  const lead = {
    id: crypto.randomUUID(),
    name: clean(body.name, 120),
    phone: clean(body.phone, 30),
    email: clean(body.email, 254).toLowerCase(),
    interest: clean(body.interest, 160),
    privacyConsent: body.privacy_consent === true,
    utmSource: clean(body.utm_source, 200),
    utmMedium: clean(body.utm_medium, 200),
    utmCampaign: clean(body.utm_campaign, 200),
    utmContent: clean(body.utm_content, 200),
    utmTerm: clean(body.utm_term, 200),
    sourceUrl: clean(body.source_url, 500),
  };

  const phoneDigits = lead.phone.replace(/\D/g, "");
  const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email);

  if (lead.name.length < 2 || phoneDigits.length < 10 || !emailIsValid || !lead.interest || !lead.privacyConsent) {
    return json({ ok: false, error: "invalid_lead" }, 422);
  }

  try {
    await env.LEADS_DB.prepare(
      `INSERT INTO leads (
        id, name, phone, email, interest, privacy_consent,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, source_url
      ) VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        lead.id,
        lead.name,
        lead.phone,
        lead.email,
        lead.interest,
        lead.utmSource || null,
        lead.utmMedium || null,
        lead.utmCampaign || null,
        lead.utmContent || null,
        lead.utmTerm || null,
        lead.sourceUrl || null,
      )
      .run();

    return json({ ok: true, leadId: lead.id }, 201);
  } catch (error) {
    console.error("lead_insert_failed", error);
    return json({ ok: false, error: "storage_failed" }, 500);
  }
};

export const onRequestGet = async () => json({ ok: false, error: "method_not_allowed" }, 405);
