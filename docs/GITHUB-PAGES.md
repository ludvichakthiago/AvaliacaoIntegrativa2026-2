# Publicar a ConectaBem no GitHub Pages

## No repositório do GitHub

1. Abra **Settings → Pages**.
2. Em **Build and deployment → Source**, escolha **GitHub Actions**.
3. Envie para a branch `main` os arquivos atualizados desta pasta, incluindo
   `.github/workflows/pages.yml`, `scripts/build-pages.mjs`, `next.config.ts`,
   `package.json` e a correção do link em `components/demo-workspace.tsx`.
4. Em **Actions**, acompanhe **Publicar no GitHub Pages**. Também é possível
   acioná-lo por **Run workflow** depois de o arquivo estar no GitHub.
5. Quando terminar, abra o endereço apresentado pelo job de publicação ou por
   **Settings → Pages**.

O workflow usa `npm ci`, valida os tipos e testes, gera a pasta `out` e publica
o artefato. Não é necessário criar um index manual, nem enviar `node_modules`,
`.next`, arquivos `.env` ou a própria pasta `out` para a branch principal.

O caminho do site é obtido por `actions/configure-pages`. Isso permite servir
os arquivos sob `/NOME-DO-REPOSITORIO/` e também tratar sites de usuário ou domínio
próprio conforme a configuração de Pages. Links internos do Next e o link do
protótipo respeitam esse caminho. Renomear o repositório exige gerar/publicar o
build novamente.

O remoto local observado na preparação foi
`https://github.com/ludvichakthiago/AvaliacaoIntegrativa2026-2.git`.
Se esse for o repositório desejado e não houver domínio próprio, o endereço
esperado após a publicação é
`https://ludvichakthiago.github.io/AvaliacaoIntegrativa2026-2/`.
O endereço real e o sucesso do deploy precisam ser confirmados no GitHub.
Nenhum push ou deploy foi executado pelo assistente nesta preparação.

A exportação foi validada localmente com o prefixo
`/AvaliacaoIntegrativa2026-2`: index, privacidade, protótipo histórico e 24
referências locais de assets/links conferidas. O workflow remoto ainda precisa
ser enviado e executado no GitHub.

## Gerar os arquivos estáticos localmente

No PowerShell, para reproduzir o build de um site de projeto:

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/NOME-DO-REPOSITORIO'
npm run build:pages
Remove-Item Env:NEXT_PUBLIC_BASE_PATH
```

O index gerado será `out/index.html`, junto com CSS, JavaScript, assets e a página
`out/privacidade/index.html`. É preciso hospedar **todo** o conteúdo de `out`.
Abrir apenas o index com duplo clique ou copiar só o HTML não reproduz a aplicação.

O desenvolvimento continua com `npm run dev`. O build comum (`npm run build`)
continua usando o modo de servidor e pode ser executado com `npm run start`.
`next start` não serve um build feito com `build:pages`: para retornar ao servidor
local, execute novamente `npm run build`.

## Limites desta publicação

GitHub Pages hospeda HTML/CSS/JavaScript estáticos, sem servidor Next.js em runtime.
O estado atual funciona porque usa dados demonstrativos e armazenamento do
navegador. Eventos não se tornam compartilhados entre usuários ou dispositivos.
O armazenamento de `localhost` não é transferido para o domínio `github.io`.

Autenticação, banco, webhooks e IA no servidor precisarão de serviços externos
ou outra hospedagem. Nunca colocar credenciais privilegiadas nos arquivos
publicados. Não há mudança de permissão de repositório nem publicação automática
feita localmente nesta etapa: o workflow executará quando for enviado e habilitado.

Referências: [Next — static exports](https://nextjs.org/docs/app/guides/static-exports),
[GitHub — workflows de Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
