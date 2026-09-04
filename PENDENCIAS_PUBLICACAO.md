# Pendências para publicação

Este arquivo separa o que já funciona tecnicamente do que ainda depende de confirmação do Dr. Sidney, da equipe e dos responsáveis jurídico/privacidade.

## 1. Identidade e dados profissionais — bloqueante

- Confirmar por certidão os registros exibidos: `CRO-MG 64394`, `CRO-PA 4271` e `CRO-TO 4432`. O número do Pará aparece de forma divergente em fontes públicas; a versão atual usa `4271`, presente no perfil profissional e nas publicações oficiais.
- Confirmar a forma aprovada de apresentação da especialidade. A versão atual usa “cirurgião-dentista e traumatologista bucomaxilofacial”, sem apresentá-lo como médico, cirurgião plástico ou otorrinolaringologista.
- Confirmar o WhatsApp principal `+55 94 99136-0408`.
- A logo oficial em PNG foi fornecida e aplicada. Solicitar também o arquivo vetorial original para futuras ampliações e fornecer um retrato aprovado do profissional; enquanto não houver retrato, o bloco “Sobre” exibe a marca oficial.

Consultas públicas recomendadas: [busca de profissionais do CFO](https://busca-profissionais.cfo.org.br/) e [consulta de inscritos do CRO-PA](https://cro-pa.implanta.net.br/ServicosOnline/Publico/ConsultaInscritos).

## 2. Casos, depoimentos e autorização de imagem — bloqueante

- Solicitar os seis comparativos originais, sem captura de tela, textos da interface ou compressão do Instagram.
- Confirmar que cada paciente assinou autorização/TCLE específico para publicação e que cada caso foi realizado pelo profissional identificado.
- Validar a exibição de nome e número de inscrição junto a todas as peças clínicas.
- Revisar se os vídeos mostram etapas de procedimento. A Resolução CFO 196/2019 permite imagens de diagnóstico e resultado final sob condições, mas veda a publicação de imagens ou vídeos do transcurso do procedimento fora do contexto científico previsto na norma.
- Manter linguagem sem promessa ou garantia de resultado; cada caso é individual.

Referências oficiais: [Resolução CFO 196/2019](https://website.cfo.org.br/resolucao-cfo-196-2019/) e [orientação do CFO para publicações em redes sociais](https://website.cfo.org.br/redes-sociais-na-odontologia-fique-atento-as-normas-eticas-e-acerte-na-publicacao-dos-conteudos/).

## 3. Mapa das mídias usadas no protótipo

| Bloco | Arquivo atual | Situação antes de publicar |
|---|---|---|
| Hero | `assets/media/hero.mp4` — reel `DZxsygcJ2vw` | Conteúdo do perfil oficial; solicitar original, editar para 8–12 s e remover música/textos. O poster atual foi extraído do arquivo comprimido e deve ser substituído junto com o vídeo. Revisar cenas de procedimento conforme CFO. |
| Resultados | `case-01.jpg` a `case-06.jpg` | Conteúdos do perfil oficial; trocar pelos arquivos originais e conferir TCLE de todos os pacientes. |
| Depoimento | `testimonial-alt.mp4` — reel `DIes9UYzdmt` | Alternativa oficial usada porque o link principal do blueprint (`DKkqlLqJqKZ`) pertence a outro profissional e a outro procedimento. Solicitar original e autorização. |
| Experiência | `case-video-alt.mp4` — reel `DYnUXw-JxbD` | Alternativa oficial usada porque `DbolLh6JUIj` não pôde ser validado. Solicitar original e revisar conteúdo clínico. |
| Retrato | Logo oficial como solução temporária | O link `DbrNFcgAOsF` não pertence ao perfil oficial informado. Fornecer fotografia original aprovada. |
| Tecnologia | Reuso de `hero.mp4` | O reel `DWZDOWjjVLV` não ficou disponível para validação. Fornecer o vídeo original específico de tecnologia. |

Nenhum ativo do site do Dr. Jaziel foi incorporado à implementação.

## 4. Conversão e integrações — bloqueante para operação completa

- O lead já é salvo no Cloudflare D1 antes da abertura do WhatsApp. Definir se também deve ser sincronizado com CRM, webhook ou outra ferramenta de atendimento.
- Se houver integração, documentar endpoint, autenticação, tratamento de falhas, retenção e responsáveis.
- Confirmar mensagem inicial, horário de atendimento e SLA da equipe.
- Configurar um único container GTM em `config.js`; o valor está vazio por segurança.
- Configurar GA4/Google Ads/Meta/TikTok somente com IDs próprios e após implementar gestão válida de consentimento para tecnologias não essenciais.
- Preservar a regra de não enviar dados pessoais ao `dataLayer`.

## 5. Privacidade e publicação técnica — bloqueante

- Revisar juridicamente `privacidade.html` e preencher nome/razão social do controlador, CNPJ/CPF quando cabível, endereço, canal do titular e encarregado.
- Definir base legal, prazo de retenção, operadores e procedimento de atendimento aos direitos do titular.
- Adicionar banner/plataforma de consentimento antes de ativar tags publicitárias ou cookies não essenciais.
- Substituir fontes do Google por arquivos locais se a política de privacidade adotada assim exigir.
- Definir domínio final e então adicionar `canonical`, `og:url`, `og:image`, sitemap, robots e imagens sociais.
- Substituir os posters derivados dos arquivos comprimidos, otimizar os originais e validar desempenho no ambiente de hospedagem.
- Fazer revisão final de conteúdo, CRO/CFO, acessibilidade e dispositivos reais antes de remover o caráter de protótipo.
