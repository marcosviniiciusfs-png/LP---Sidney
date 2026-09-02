# Blueprint de replicação — landing page Dr. Jaziel Ribeiro

Fonte analisada: https://jazielribeiro.com.br/contato/

Data da análise: 28/08/2026

## 1. Visão geral

Landing page de captação para rinoplastia, construída em WordPress + Elementor. A página usa o template canvas (sem cabeçalho e sem menu), fundo preto em toda a extensão, conteúdo centralizado e CTAs verdes. A conversão principal acontece em um formulário aberto em popup; a conversão secundária leva ao WhatsApp.

Fluxo persuasivo:

1. Promessa + autoridade + CTA.
2. Prova visual (antes/depois).
3. Prova social em vídeo.
4. Número de procedimentos/sonhos realizados + novo CTA.
5. Biografia e credenciais + CTA de WhatsApp.
6. Rodapé mínimo.

## 2. Estrutura completa da página

### Seção 1 — Hero

- Altura: 819 px no desktop; 603 px no mobile.
- Background: vídeo MP4 em autoplay, muted, loop e playsinline.
- Overlay preto: 68% desktop; 77% mobile.
- Conteúdo alinhado ao centro e próximo da base da seção.
- Logo horizontal branco.
- Headline: “Rinoplastia com a mais alta tecnologia, segurança e naturalidade.”
- Subheadline: “Assinada por Dr. Jaziel Ribeiro.”
- Quatro bullets de autoridade:
  - Otorrinolaringologista há mais de 15 anos.
  - Palestrante do Congresso Brasileiro de Otorrinolaringologia.
  - Mais de 1.000 rinoplastias realizadas.
  - Fundador da clínica Marbelle.
- CTA: “AGENDAR CONSULTA”, abre popup.

Tipografia principal da headline: Poppins 300, 47 px desktop / 27 px mobile. Subheadline: Montserrat italic, 16 px / 14 px. Bullets: Poppins 300, 17 px / 14 px.

### Seção 2 — Casos

- Fundo preto.
- Título centralizado: “Alguns dos nossos casos!”
- Fonte customizada Behind The Nineties, 41 px desktop / 25 px mobile.
- Espaçamento superior: 130 px desktop / 50 px mobile.
- Carrossel contínuo com seis imagens de antes/depois.
- Desktop: três slides visíveis.
- Gap: 15 px.
- Autoplay: intervalo de 500 ms; transição de 3.000 ms; loop infinito.
- Sem setas e sem paginação.
- Pausa em hover/interação.
- Imagens com border-radius de 4 px.

Há uma seção “Conheça nossa clínica” no HTML, mas ela está explicitamente oculta em desktop, tablet e mobile. Não deve entrar na réplica visível.

### Seção 3 — Depoimento em vídeo

- Grid de duas colunas no desktop, largura máxima aproximada de 1.114 px.
- Padding vertical: 100 px desktop; 40 px mobile.
- Texto à esquerda: “Não sei como Dr. Jaziel conseguiu ler minha mente e entender exatamente o que eu queria.”
- Fonte Behind The Nineties, 38 px desktop / 25 px mobile, line-height 41 px.
- Vídeo vertical hospedado, autoplay, playsinline e controles nativos.
- Mobile: vídeo primeiro e texto depois (ordem reversa).

### Seção 4 — Métrica e CTA

- Duas colunas no desktop; empilhada no tablet/mobile.
- Imagem vertical decorativa/pessoal à esquerda.
- Counter à direita: prefixo “+”, animação de 0 até 1.000 em 2 segundos.
- Label: “SONHOS REALIZADOS”.
- Número: Montserrat 109 px desktop / 60 px mobile.
- Label: Montserrat uppercase 30 px / 16 px.
- CTA central abaixo: “MARCAR CONSULTA”, abre o mesmo popup.
- Padding vertical da seção: 100 px desktop / 40 px mobile.

Observação: na captura automatizada, o contador aparece inicialmente como “+0”; a implementação precisa disparar a animação ao entrar no viewport e manter `1000` como fallback sem JavaScript.

### Seção 5 — Sobre o médico

- Duas colunas: biografia/credenciais e imagem vertical.
- Ordem invertida no tablet e mobile, deixando o conteúdo textual antes da imagem.
- Título: “PRAZER, JAZIEL RIBEIRO”, uppercase, 52,5 px desktop / 40 px mobile.
- Texto branco, 16 px desktop / 14 px mobile.
- Conteúdo inicial apresenta graduação, especialização, fellowship e cursos de 2008 a 2015.
- Accordion “LEIA MAIS +”, fechado por padrão e com duração de 400 ms.
- Accordion contém cursos/eventos de 2016 a 2021.
- CTA secundário: “FALAR NO WHATSAPP”.
- Destino original: WhatsApp `+55 81 98105-6565` com mensagem pré-preenchida.

### Rodapé

- Fundo preto.
- Grande respiro superior: 200 px desktop / 100 px mobile.
- Texto centralizado em branco, 13 px: “© Jaziel Ribeiro | Todos os direitos reservados”.
- Sem navegação, endereço, política de privacidade ou registro profissional visível.

## 3. Popup/formulário

O CTA principal não navega: abre um modal Elementor (ID original 1264) contendo logo e formulário em quatro etapas.

Campos:

1. Nome — texto obrigatório; placeholder “Digite seu nome”.
2. WhatsApp — texto obrigatório; placeholder “DDD + Número”.
3. Seu melhor email — obrigatório; no original está como `type=text`, mas na réplica deve ser `type=email`.
4. Pergunta: “O valor da consulta é R$ 600,00 | Você tem interesse em agendar a sua?”
   - “Sim, por favor.”
   - “Não, obrigado.”

Botões das etapas: “Próximo” e “Voltar”. Botão final: “ENVIAR”.

Campos ocultos capturados da URL:

- `utm_source`
- `utm_medium`
- `utm_campaign` (o campo sem nome claro no original deve ser normalizado)
- `utm_content`
- `utm_term`

Regra pós-envio original: se a resposta for “Sim, por favor.”, redireciona para `/obrigado/`. A alternativa “Não” não possui redirecionamento explícito no código público.

## 4. Design system observado

- Fundo global: `#000000`.
- Texto principal: `#FFFFFF`.
- Texto de apoio azulado: `#C8E6FF`.
- CTA: gradiente `#06CF00` → `#049700`, direção aproximada de 126°.
- Borda do CTA: `#B6FFB4`, 1 px.
- Border-radius do CTA: 9 px.
- CTA tem glow verde, ícone circular com seta à direita e escala para 1.1 no hover.
- Fontes: Poppins, Montserrat, DM Sans, Gotu e Behind The Nineties. As dominantes visuais são Poppins/Montserrat e Behind The Nineties.
- Breakpoints do original: desktop acima de 1024 px, tablet entre 768 e 1024 px, mobile abaixo de 768 px.
- Containers principais: 1.080–1.200 px.
- Animações de entrada: fadeInUp, fadeInLeft, fadeInRight e fadeInDown.

## 5. Assets identificados

- Logo: `/wp-content/uploads/2026/04/ddd.png`
- Vídeo de hero: `/wp-content/uploads/2026/04/VIDEO-JOBEL-.mp4`
- Casos: `DEP-2_compressed.webp`, `DEP-3_compressed.webp`, `DEP-5_compressed.webp`, `DEP-1.webp`, `DEP-2.webp`, `DEP-3-ponto.png`
- Retratos/elementos verticais: `/wp-content/uploads/2025/07/Elemento-02.webp` e `Elemento-03.webp`
- Fonte customizada: `/wp-content/uploads/2025/07/Behind-The-Nineties-Rg.woff2` (há também woff, ttf, svg e eot)
- Vídeo de depoimento: MP4 hospedado no diretório `/wp-content/uploads/2026/04/`

Os arquivos pertencem ao site de referência. Para publicar uma réplica, é necessário confirmar direito de uso ou substituir por materiais fornecidos pelo cliente.

## 6. Tracking e integrações

O original contém:

- Google Tag Manager (há mais de um container inserido).
- Google Analytics 4.
- Google Ads.
- Meta Pixel.
- TikTok Pixel.
- Captura de UTMs no formulário.
- Link direto para WhatsApp.

Na réplica, usar um único GTM como ponto de entrada e configurar GA4/Ads/Meta/TikTok por ele. Eventos mínimos recomendados:

- `view_landing_page`
- `click_schedule_cta` com posição do CTA
- `open_lead_form`
- `form_step_complete`
- `generate_lead`
- `click_whatsapp`
- `video_start`, `video_25`, `video_complete`
- `carousel_interaction`

Não copiar IDs de pixels/contas do site de referência.

## 7. Problemas do original a evitar

- Espaços verticais excessivos deixam grandes áreas pretas, sobretudo no mobile.
- O estado inicial do contador pode ficar visível como `+0` em captura ou com JavaScript lento.
- Email configurado como texto, sem validação nativa.
- Vários GTMs/tags repetidos aumentam risco de eventos duplicados.
- Redirecionamento pós-formulário cobre apenas a resposta positiva.
- Ausência de política de privacidade/consentimento junto ao formulário.
- Autoplay do vídeo com controles pode gerar experiência inconsistente entre navegadores.
- Assets lazy-loaded podem criar vazios enquanto a página carrega.
- Heading principal está implementado como H2; a réplica deve ter apenas um H1 semanticamente correto.
- O original não expõe title/description focados em SEO nem texto alternativo útil nas imagens.

## 8. Arquitetura sugerida para a réplica

Componentes:

- `HeroVideo`
- `AuthorityList`
- `PrimaryCTA`
- `CasesCarousel`
- `VideoTestimonial`
- `ResultsCounter`
- `DoctorBio`
- `CredentialsAccordion`
- `LeadFormModal`
- `UtmCapture`
- `AnalyticsEvents`
- `Footer`

Ordem de implementação:

1. Estrutura semântica e tokens visuais.
2. Hero responsivo e fallback de vídeo/imagem.
3. Carrossel e mídia.
4. Counter com IntersectionObserver.
5. Biografia e accordion acessível.
6. Modal multi-step com validação, UTMs e integração de envio.
7. Analytics, consentimento e página de obrigado.
8. Testes em 360, 390, 768, 1024 e 1440 px.

Critérios de aceite:

- Fidelidade visual nos cinco breakpoints.
- Nenhum layout shift relevante por mídia.
- Todos os CTAs rastreados.
- Formulário navegável por teclado, com foco preso no modal e mensagens de erro claras.
- UTMs preservadas no lead.
- Vídeos com poster e fallback.
- Lighthouse mobile sem erros críticos de acessibilidade ou performance.

## 9. Pendências necessárias antes da implementação final

- Nome, especialidade, textos e credenciais do profissional da nova página.
- Logo, fotos, casos e vídeos autorizados.
- Número de WhatsApp e mensagem inicial.
- Valor da consulta e regra para respostas “Sim/Não”.
- Destino dos leads (CRM, webhook, email ou API).
- IDs próprios de GTM/pixels.
- Política de privacidade e base legal/consentimento.
- Confirmação se a intenção é réplica fiel ou mesma estrutura com identidade de Sidney.
