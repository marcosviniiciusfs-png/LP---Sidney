# LP de rinoplastia — Dr. Sidney Colares

Landing page de rinoplastia estática e responsiva, criada para o Dr. Sidney Colares, com identidade própria em preto, off-white e dourado. A estrutura persuasiva da página de referência foi preservada sem copiar sua marca, seus textos ou seus ativos.

## O que está implementado

- Hero em vídeo com autoridade, CTA e controle acessível de pausa.
- Carrossel contínuo com seis casos e alternativa manual no mobile.
- Depoimento em vídeo, bloco de experiência, biografia, credenciais e tecnologia.
- Logo oficial do Dr. Sidney aplicada no cabeçalho, formulário, apresentação profissional e rodapé.
- CTA final com formulário acessível em quatro etapas e atalho para WhatsApp.
- Registro do lead em Cloudflare D1 antes do encaminhamento ao WhatsApp.
- Pixel da Meta carregado imediatamente em todas as visitas e API de Conversões no envio do formulário. O evento `Lead` usa o mesmo `event_id` no navegador e no servidor para deduplicação.
- Captura de `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` e `utm_term`.
- Eventos no `dataLayer`, sem nome, telefone ou cidade: `view_landing_page`, `click_schedule_cta`, `open_lead_form`, `form_step_complete`, `generate_lead`, `lead_handoff_whatsapp`, `click_whatsapp`, eventos de vídeo e carrossel.
- Política de privacidade em formato de minuta.
- Layout sem overflow validado em 360, 390, 768, 1024 e 1440 px.

## Executar localmente

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

Acesse `http://127.0.0.1:4173`.

Para executar a suíte automatizada:

```bash
npm test
```

## Publicação no Cloudflare Pages

O deploy direto utiliza somente `index.html`, `privacidade.html`, `styles.css`, `app.js`, `config.js`, `_headers` e a pasta `assets`. O cabeçalho `X-Robots-Tag: noindex, nofollow` permanece ativo enquanto houver pendências profissionais, jurídicas e de autorização de imagem.

- Projeto: `dr-sidney-colares`
- Produção: <https://dr-sidney-colares.pages.dev/>
- Branch de produção: `main`
- Método: Direct Upload pelo Wrangler

## Configuração

Edite `config.js`:

```js
window.LP_CONFIG = {
  whatsappNumber: "5594991360408",
  gtmId: "",
  metaPixelId: "2258593511572731",
};
```

Depois da validação, o formulário abre a conversa no WhatsApp imediatamente e, em paralelo, envia o lead para a função `/api/leads` com uma requisição persistente. A função grava os dados no Cloudflare D1 e os encaminha à planilha, sem fazer o visitante esperar por essas integrações.

O banco usa o binding `LEADS_DB`, configurado em `wrangler.jsonc`. O esquema fica em `migrations/0001_create_leads.sql`.

A credencial da API de Conversões é armazenada no Cloudflare Pages como o segredo `META_CAPI_ACCESS_TOKEN`; ela nunca deve ser incluída no repositório. A função envia telefone, nome e cidade normalizados com SHA-256, além de IP, user agent, `_fbp` e `_fbc` quando disponíveis. O resultado do envio fica registrado em `meta_capi_status` sem bloquear o atendimento ou a abertura do WhatsApp.

O envio em tempo real para a planilha usa o segredo `LEAD_DESTINATION_WEBHOOK_URL`. Depois de gravar o lead no D1, a função envia uma cópia ao webhook e registra o resultado em `sheet_sync_status`. Falhas na planilha não apagam o lead nem interrompem o encaminhamento ao WhatsApp.

## Arquivos principais

- `index.html`: conteúdo semântico, seções, formulário e metadados.
- `styles.css`: design system, animações e responsividade.
- `app.js`: interações, validação, UTMs, WhatsApp e tracking.
- `config.js`: número de WhatsApp e container GTM.
- `functions/api/leads.js`: validação e gravação de leads no D1.
- `migrations/`: estrutura versionada do banco de leads.
- `privacidade.html`: minuta de política de privacidade.
- `PENDENCIAS_PUBLICACAO.md`: decisões e materiais que ainda exigem validação.
- `tests/smoke.spec.js`: testes funcionais e responsivos.

## Status

A página está pronta como protótipo funcional e base de produção. A publicação definitiva depende dos itens documentados em `PENDENCIAS_PUBLICACAO.md`, especialmente originais das mídias, autorizações dos pacientes, confirmação dos registros profissionais, dados de privacidade e destino dos leads.
