const json = (body, status = 200) =>
  Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const clean = (value, maxLength) => String(value ?? "").trim().slice(0, maxLength);

const normalize = (value) => clean(value, 254).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const sha256 = async (value) => {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const normalizePhone = (value) => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;
};

const sendMetaLead = async ({ env, request, lead, eventId, fbp, fbc }) => {
  if (!env.META_CAPI_ACCESS_TOKEN || !env.META_PIXEL_ID) throw new Error("meta_capi_not_configured");

  const nameParts = normalize(lead.name).split(/\s+/).filter(Boolean);
  const firstName = nameParts.shift() || "";
  const lastName = nameParts.join(" ");
  const userData = {
    ph: [await sha256(normalizePhone(lead.phone))],
    fn: [await sha256(firstName)],
    ct: [await sha256(normalize(lead.city))],
    client_ip_address: request.headers.get("CF-Connecting-IP") || undefined,
    client_user_agent: request.headers.get("User-Agent") || undefined,
    fbp: clean(fbp, 255) || undefined,
    fbc: clean(fbc, 255) || undefined,
  };
  if (lastName) userData.ln = [await sha256(lastName)];

  const graphVersion = /^v\d+\.\d+$/.test(env.META_GRAPH_API_VERSION || "") ? env.META_GRAPH_API_VERSION : "v25.0";
  const response = await fetch(`https://graph.facebook.com/${graphVersion}/${env.META_PIXEL_ID}/events`, {
    method: "POST",
    headers: { Authorization: `Bearer ${env.META_CAPI_ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [{
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        event_source_url: lead.sourceUrl || request.headers.get("Referer") || undefined,
        action_source: "website",
        user_data: userData,
        custom_data: { content_name: "Avaliação de rinoplastia", content_category: "Rinoplastia" },
      }],
    }),
  });
  if (!response.ok) throw new Error(`meta_capi_http_${response.status}`);
};

const finishMetaDelivery = async (args) => {
  let status = "sent";
  try {
    await sendMetaLead(args);
  } catch (error) {
    status = "failed";
    console.error("meta_capi_delivery_failed", error instanceof Error ? error.message : "unknown_error");
  }
  try {
    await args.env.LEADS_DB.prepare("UPDATE leads SET meta_capi_status = ? WHERE id = ?").bind(status, args.lead.id).run();
  } catch {
    console.error("meta_capi_status_update_failed");
  }
};

const sendLeadToSpreadsheet = async ({ env, lead }) => {
  if (!env.LEAD_DESTINATION_WEBHOOK_URL) return;
  let status = "sent";
  try {
    const response = await fetch(env.LEAD_DESTINATION_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        created_at: lead.receivedAt,
        name: lead.name,
        phone: lead.phone,
        city: lead.city,
        interest: lead.interest,
        utm_source: lead.utmSource,
        lead_id: lead.id,
      }),
    });
    if (!response.ok) throw new Error(`lead_webhook_http_${response.status}`);
  } catch (error) {
    status = "failed";
    console.error("lead_webhook_delivery_failed", error instanceof Error ? error.message : "unknown_error");
  }
  try {
    await env.LEADS_DB.prepare("UPDATE leads SET sheet_sync_status = ? WHERE id = ?").bind(status, lead.id).run();
  } catch {
    console.error("sheet_sync_status_update_failed");
  }
};

export const onRequestPost = async ({ request, env, waitUntil }) => {
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
    city: clean(body.city, 120),
    interest: clean(body.interest, 160),
    privacyConsent: body.privacy_consent === true,
    utmSource: clean(body.utm_source, 200),
    utmMedium: clean(body.utm_medium, 200),
    utmCampaign: clean(body.utm_campaign, 200),
    utmContent: clean(body.utm_content, 200),
    utmTerm: clean(body.utm_term, 200),
    sourceUrl: clean(body.source_url, 500),
    metaConsent: body.meta_consent === true,
    receivedAt: new Date().toISOString(),
  };
  const eventId = `lead_${lead.id}`;

  const phoneDigits = lead.phone.replace(/\D/g, "");
  if (lead.name.length < 2 || phoneDigits.length < 10 || lead.city.length < 2 || !lead.interest || !lead.privacyConsent) {
    return json({ ok: false, error: "invalid_lead" }, 422);
  }

  try {
    await env.LEADS_DB.prepare(
      `INSERT INTO leads (
        id, name, phone, email, city, interest, privacy_consent,
        utm_source, utm_medium, utm_campaign, utm_content, utm_term, source_url,
        meta_event_id, meta_consent, meta_capi_status, sheet_sync_status
      ) VALUES (?, ?, ?, '', ?, ?, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        lead.id,
        lead.name,
        lead.phone,
        lead.city,
        lead.interest,
        lead.utmSource || null,
        lead.utmMedium || null,
        lead.utmCampaign || null,
        lead.utmContent || null,
        lead.utmTerm || null,
        lead.sourceUrl || null,
        eventId,
        lead.metaConsent ? 1 : 0,
        lead.metaConsent ? "pending" : "skipped",
        env.LEAD_DESTINATION_WEBHOOK_URL ? "pending" : "not_configured",
      )
      .run();

    if (lead.metaConsent) {
      waitUntil(finishMetaDelivery({ env, request, lead, eventId, fbp: body.fbp, fbc: body.fbc }));
    }
    if (env.LEAD_DESTINATION_WEBHOOK_URL) {
      waitUntil(sendLeadToSpreadsheet({ env, lead }));
    }

    return json({ ok: true, leadId: lead.id, eventId }, 201);
  } catch (error) {
    console.error("lead_insert_failed", error);
    return json({ ok: false, error: "storage_failed" }, 500);
  }
};

export const onRequestGet = async () => json({ ok: false, error: "method_not_allowed" }, 405);
