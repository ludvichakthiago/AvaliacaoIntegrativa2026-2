# Validação da Fase 1 — 25/10/2026

> Registro da entrega inicial. A revisão posterior dos questionários elevou a
> suíte para 19 testes e reduziu todos os caminhos para no máximo cinco perguntas.
> Consulte [a revisão dos questionários](REVISAO-DOS-QUESTIONARIOS.md) para o estado atual.

## Verificações automatizadas locais

`npm run check` executado com Node 26.5.1 e npm 12.0.2:

- `npm run typecheck`: aprovado, TypeScript estrito e acesso indexado verificado.
- `npm test`: **12 testes aprovados**, nenhum ignorado.
- `npm run build`: build de produção do Next 15.5.28 aprovado.

Rotas geradas: `/`, `/privacidade` e página de não encontrado.
Raiz: aproximadamente 113 kB de JavaScript no primeiro carregamento, conforme
saída do Next; isso não representa medição de desempenho em dispositivos reais.

### Regras cobertas

1. Compatibilidade da serialização dos rascunhos, inclusive datas antigas e
   descrições que excedem os novos limites de criação.
2. Rejeição de JSON corrompido, valores nulos e objetos sem os campos esperados.
3. Validação de título, unidade, descrição e datas, inclusive data impossível.
4. Validade das definições de todos os modelos.
5. Caminhos diferentes para presença, participação parcial e ausência.
6. Encaminhamento específico de cada barreira.
7. Término de todos os caminhos e limite atual de seis perguntas por caminho.
8. Comentário opcional e limite de texto.
9. Rejeição de pergunta/alternativa inexistente.
10. Encerramento explícito de ramo, mesmo com próximo destino padrão.
11. Rejeição de ciclos, destinos ausentes, IDs duplicados e nós inacessíveis.
12. Rejeição de início ausente, pergunta vazia e alternativas ausentes.

O objetivo de 3–5 perguntas por caminho será refinado na fase de editor. O ramo
mais longo mantém seis perguntas para preservar o comportamento demonstrativo.

## Verificação manual no navegador

Executada contra o servidor de produção local (`npm run start`) no navegador
integrado, usando somente informações fictícias:

| Cenário | Resultado |
|---|---|
| Navegação entre as cinco áreas | Conteúdo e título atualizam |
| Navegação por Enter no menu | Troca de seção e foco no conteúdo; rolagem retorna ao topo |
| Criar evento fictício | Rascunho listado e confirmação explícita de armazenamento local |
| Atualizar a página e reabrir eventos | Rascunho permanece no navegador |
| Pós-evento: Não → falta de cobertura | Exibe pergunta específica sobre revezamento |
| Avançar e pular comentário | Conclui sem exigir dado opcional |
| Reiniciar e trocar modelo | Novo início e perguntas do modelo escolhido |
| Prévia de comunicado | Assunto e corpo atualizam, com quebras de linha reais |
| Aviso de privacidade | Rota abre, limitações e revisão jurídica visíveis |
| Layout em viewport de 390 × 844 | Colunas empilhadas; pequeno overflow do simulador encontrado e corrigido |
| Dashboard em viewport de 1440 × 1000 | Sidebar e grade desktop exibidas; largura útil e conteúdo de 1425 px, sem overflow |
| Medição do simulador após correção | Área útil e conteúdo: 375 px, sem overflow da página; diferença para 390 px decorre da barra de rolagem |
| Console observado | Nenhum erro ou aviso capturado nos fluxos inspecionados |

Captura do build validado: [painel desktop](screenshots/fase-1-desktop.png).

O registro fictício usado no teste foi mantido no armazenamento do navegador de
teste, explicitamente identificado como validação. O armazenamento não foi limpo
automaticamente para evitar apagar rascunhos preexistentes.

## Limites da validação

- As interações acima são inspeções manuais assistidas, não uma suíte E2E instalada.
- Falhas de armazenamento têm tratamento implementado e parsing testado; erro de
  quota/permissão no navegador não foi forçado durante a inspeção.
- Componentes de erro e loading foram compilados; seus estados não foram induzidos
  no navegador. Não houve auditoria completa com leitor de tela ou dispositivos físicos.
- O workflow de CI foi preparado; não foi executado remotamente no GitHub.
- Não foi testada instalação limpa em Node 22 nesta máquina: o ambiente disponível
  usa Node 26.5.1. O workflow está configurado para Node 22.
- Não existem ainda login, CRUD de servidor, RLS ou dados reais. Testes de
  autorização, isolamento entre empresas, agregação privada, duplicidade de
  respostas reais, retenção e webhook pertencem às próximas fases e não foram
  apresentados como aprovados.
- A referência `/demo.html` mantém o código original e suas limitações de segurança
  e demonstração. Não é uma rota de produção para coletar informações reais.

## Resultado

Fundação técnica demonstrativa validada. Próximo incremento: autenticação,
migrações Supabase e CRUD protegido, com teste de duas empresas e perfis distintos
antes de admitir contatos reais. Nenhuma integração externa foi ativada e nenhuma
conclusão de conformidade jurídica foi produzida.
