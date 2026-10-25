# ConectaBem — fundação do MVP

Next.js com App Router e TypeScript estrito. **Fase 1 implementada**: as cinco
telas demonstrativas agora usam componentes React, sem iframe na página inicial.
Autenticação, banco, cadastros reais e WhatsApp continuam pendentes.

## Executar

Requer Node.js 22+ e npm. Recomenda-se Node LTS suportado.

```bash
npm ci
npm run dev
```

Abra [localhost:3000](http://localhost:3000).

Para hospedar a versão estática, siga [a publicação no GitHub Pages](docs/GITHUB-PAGES.md).
O workflow de deploy já está preparado; o GitHub deve usar **Settings → Pages → GitHub Actions**.

Para validar e executar o build local:

```bash
npm run check
npm run start
```

`check` executa TypeScript, testes Node e build Next. Testes compilam para
`.test-build/`, sem baixar dependências adicionais. Os comandos também podem ser
executados individualmente: `npm run typecheck`, `npm test`, `npm run build`.

## O que funciona nesta fase

- Navegação React entre dashboard, eventos, pesquisas, simulador e comunicados.
- Eventos e rascunhos **somente no navegador**, preservando a chave `cb_events`
  e datas do protótipo; seleção de várias lojas, edição e preparação de convites
  para envio manual. Erros de leitura/escrita não são apresentados como sucesso.
- Três modelos tipados; o modelo escolhido determina a conversa testada.
- Motor puro para escolhas condicionais, validação de caminhos, reinício e
  comentários opcionais. As respostas do simulador não são persistidas.
- Prévia de comunicados com cópia do texto atual, sem envio ou salvamento.
- Aba Insights com seleção de evento, panorama consolidado, indicadores e
  sugestões demonstrativas por regras; IA externa ainda não configurada.
- Layout responsivo, labels, foco, avisos explícitos e tratamento de erros.
- Temas claro e escuro pelo botão no cabeçalho, também disponível no aviso de
  privacidade. A preferência fica salva neste navegador; na primeira visita é
  usada a preferência do dispositivo. O protótipo histórico não foi alterado.
- [Minuta de privacidade](http://localhost:3000/privacidade), sujeita à revisão jurídica.

Indicadores e unidades são fictícios, identificados na interface. Não há login,
RLS, agregação de respostas reais, retenção automática ou autorização entre
empresas. **Não usar dados reais de colaboradores.** LocalStorage preserva
apenas a demonstração existente e não substitui persistência de produto.

O [protótipo original](http://localhost:3000/demo.html) foi preservado integralmente
para comparação; mantém suas limitações. Nenhuma integração externa foi ativada.
As variáveis em `.env.example` são preparação documental para fases futuras.

## Organização e plano

- `app/`: rotas, estilos e limites de erro/carregamento.
- `components/`: estrutura e elementos reutilizáveis.
- `features/`: interface por domínio.
- `lib/demo/`: validação dos rascunhos locais.
- `lib/surveys/`: modelos e regras sem dependência da interface.
- `lib/insights/`: agregação de exemplos e sugestões com evidências.
- `tests/`: testes de regras e compatibilidade com rascunhos antigos.

Consulte [auditoria, arquitetura e fases](docs/AUDITORIA-E-PLANO.md) e
[validação da Fase 1](docs/VALIDACAO-FASE-1.md).
Os três modelos passaram por uma [revisão semântica dos questionários](docs/REVISAO-DOS-QUESTIONARIOS.md),
com caminhos coerentes por resposta e limite de cinco perguntas por conversa.
Veja também o [escopo e a validação da aba Insights](docs/INSIGHTS.md).
Para operar sem a API do WhatsApp, veja [eventos e envio manual](docs/ENVIO-MANUAL.md).

Próxima etapa: Supabase Auth, migrações, RLS e CRUD real. Implementar e testar
isolamento de empresas antes de disponibilizar qualquer cadastro de contatos.
