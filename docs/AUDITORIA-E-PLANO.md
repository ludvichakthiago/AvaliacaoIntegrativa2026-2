# ConectaBem — auditoria e execução por fases

## Escopo e inspeção inicial — 25/10/2026

Inspecionados todos os arquivos-fonte e configurações encontrados: `app/page.tsx`,
`app/layout.tsx`, `public/demo.html`, `package.json`, `package-lock.json`,
`tsconfig.json`, `next.config.ts`, `next-env.d.ts`, `.gitignore` e `README.md`.
`node_modules` e `.next` são dependências/artefatos gerados; suas árvores completas
não são código próprio. `conectabem/public` é uma pasta vazia. Não foi encontrado
`AGENTS.md` no projeto ou nos diretórios ancestrais inspecionados.

### O que existia

| Área | Funcionamento no código original | Limitação |
|---|---|---|
| Next/App Router | Página raiz incorpora HTML por iframe | React não controla o produto |
| Navegação | Alterna cinco seções no DOM | Sem rotas de módulos ou autorização |
| Dashboard | Cartões e barras estáticos | Números, eventos e insight fictícios |
| Eventos | Cria rascunho em `cb_events` no localStorage | Sem banco; JSON corrompido quebra inicialização; sem tratamento de escrita |
| Pesquisas | Catálogo com três listas de perguntas | Seleção não muda a conversa |
| Simulador | Fluxo condicional pós-evento | Decisões fixas em callbacks e seleção por fragmentos de texto |
| Comunicados | Atualiza texto de prévia | Sem persistência/envio; quebras de linha literais |
| Segurança | Escapa HTML em listas | Sem login, RBAC, RLS, backend, retenção ou auditoria |

Não há Supabase, Zod, Tailwind, Recharts, Motion ou SDK da Meta instalados.
Não havia testes ou serviço de mensageria no código original.
O protótipo usa fonte externa do Google; a interface React utiliza fontes locais
do sistema nesta fase para não depender de rede durante build ou navegação.

## Compatibilidade e decisões da fundação

Ambiente observado: Node **26.5.1**, npm **12.0.2**, Next **15.5.28**,
React/React DOM **19.3.1**, TypeScript **5.9.3**. Os pacotes instalados e o lockfile
foram consultados. Next instalado aceita React `^19.0.0` e Node `>=20`;
mantivemos as versões existentes para isolar a migração. O projeto exige Node 22+
para os comandos de qualidade e recomenda uma versão LTS suportada.

Documentação primária consultada: [Next — instalação](https://nextjs.org/docs/app/getting-started/installation).
A página atual trata da versão mais recente; para a compatibilidade desta base,
os requisitos determinantes são `engines` e `peerDependencies` do Next instalado.
Nenhuma dependência nova foi necessária nesta fase. As próximas instalações
deverão consultar requisitos das versões exatas antes de modificar o lockfile.

CSS foi extraído/adaptado do protótipo; a grande revisão estética permanece na
Fase 6. Não se adicionaram bibliotecas só para preparar telas demonstrativas.
`public/demo.html` permanece intacto como referência de regressão, com as
limitações originais; não é uma alternativa apta a produção.

## Fases e critérios de aceite

| Fase | Entrega | Dependências e validação exigida |
|---|---|---|
| 1 — Fundação | React tipado, módulos, motor de fluxo puro, demos explícitas, testes e documentação | Typecheck, testes, build e inspeção no navegador |
| 2 — Administração | Supabase Auth, organizações, unidades, setores, colaboradores, eventos, comunicados, importação e CRUD real | Projeto Supabase, migrações versionadas, `@supabase/ssr`, `@supabase/supabase-js`, Zod; testes de servidor, perfis e isolamento entre dois tenants |
| 3 — Pesquisas | Editor, tipos, ordenação, condições, versões publicadas e persistência | Banco da Fase 2; motor compartilhado; testes dos caminhos, versões e limites de canal |
| 4 — Privacidade | Respostas separadas, agregação, grupos mínimos, retenção, direitos e auditoria | SQL/RLS e tarefas agendadas; testes de inferência, filtros cruzados e exclusão; revisão jurídica |
| 5 — Comunicação | Adaptador Meta, webhook autenticado, sessões, fila, deduplicação, entrega, relatórios e Plano de Ação | Credenciais e permissões Meta; regras oficiais verificadas na implementação; testes de assinatura, replay, idempotência, opt-out e falhas |
| 6 — Visual | Identidade, imagens licenciadas, fontes, gráficos, acessibilidade e microinterações | Funcionalidades estabilizadas; avaliar Tailwind, componentes acessíveis, Recharts e Motion; testes desktop/mobile e movimento reduzido |

Segurança não será adiada para a Fase 4: RLS e autorização são obrigatórias em
cada tabela/ação introduzida na Fase 2. A Fase 4 amplia os controles de privacidade.
Não implantar ou usar com colaboradores antes de passar os testes dessas fases.

## Arquitetura de destino

- `app/`: rotas, layouts e limites de erro/carregamento; adaptadores HTTP de servidor.
- `components/`: estrutura da aplicação e componentes visuais reutilizáveis.
- `features/`: telas por domínio; hoje dashboard, eventos, comunicados e pesquisas.
- `lib/surveys/`: definição serializável e motor puro, independente de React/canal.
- `lib/demo/`: armazenamento explicitamente exclusivo da demonstração.
- Futuro `lib/server/`: sessão autenticada, validação Zod e serviços; marcar módulos
  privilegiados como server-only. Nunca importar credenciais no cliente.
- Futuro `integrations/whatsapp/`: adaptação de capacidades da API, validação de
  assinatura, fila e processamento sem registrar telefone + resposta em logs.
- Futuras migrações Supabase: alterações reproduzíveis e testes SQL/RLS.

Não criar pastas com serviços fictícios que retornam sucesso. O contrato atual
do motor poderá evoluir para editor e canal real, incluindo versionamento e
validação de entrada não confiável no servidor. Os tipos atuais cobrem apenas
escolha única e texto curto, suficientes para preservar os fluxos do protótipo.

### Modelo multiempresa a implementar

`organizations` → `memberships` (usuário/perfil), `units` → `departments`,
`contacts`, `events`, `announcements`, `campaigns`, `survey_versions` e
`improvement_actions`. Todas as entidades organizacionais precisam de tenant
validado na sessão e RLS baseada em membership, nunca apenas em um ID enviado
pelo navegador. Relações compostas devem impedir referências entre tenants.

Contatos, respostas e controle de participação devem ter permissões distintas.
Gestores não terão acesso a respostas individuais, nem por API/exportação.
O banco deve produzir agregados protegidos; ocultar cartões no cliente não basta.
Uma contagem mínima isolada não resolve inferência por diferenças entre filtros.
Planejar supressão complementar e revisão dos recortes permitidos.

Respostas não devem conter FK de contato ou ID de sessão de mensagem. Sessões
transitórias precisam de acesso restrito e expiração, porque ainda podem permitir
associações. Retenção de 30 dias é proposta configurável para participação, não
prazo universal nem rotina já implementada. Logs, filas, retries e backups também
entram na avaliação de reidentificação.

## Configuração futura e decisões abertas

`.env.example` lista somente placeholders, sem integrações ativas. Preencher o
arquivo **não habilita** Supabase, Meta ou retenção. Antes da Fase 2: criar ou
selecionar o projeto Supabase, definir hosts/redirecionamentos Auth e os perfis
iniciais. Recomendação: owner/admin/analyst, com analyst limitado a agregados.

Antes da Meta: definir conta empresarial, número, aplicativo, segredos de
assinatura, token, URL HTTPS de webhook e modelos aprovados necessários.
Nunca colocar service role, token Meta ou app secret em variáveis `NEXT_PUBLIC_`.
API e agendador devem falhar de modo explícito quando não configurados.

Antes de produção: responsável/controlador, canal de privacidade, bases legais,
prazos de retenção por categoria, grupo mínimo e políticas de comentários e
exportação precisam de decisão e revisão jurídica. IA permanece sem integração;
não enviar comentários a terceiros até avaliação e autorização adequadas.

## Status

Fase 1 implementada. Evidências e limites em `VALIDACAO-FASE-1.md`.
Fases 2–6 planejadas, ainda não implementadas. Este incremento não entrega o
MVP comercial completo e não alega anonimização ou conformidade jurídica.
