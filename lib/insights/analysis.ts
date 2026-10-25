export type Barrier = 'coverage' | 'time' | 'workload' | 'communication' | 'other';
export const barrierLabels: Record<Barrier, string> = {
  coverage: 'Falta de cobertura do posto', time: 'Horário incompatível',
  workload: 'Excesso de tarefas', communication: 'Aviso não recebido a tempo', other: 'Outros motivos',
};
export interface EventMetrics {
  invitations: number;
  responses: number;
  interested: number;
  attended: number;
  usefulnessResponses: number;
  useful: number;
  barriers: Record<Barrier, number>;
}
export interface InsightEvent {
  id: string;
  title: string;
  unit: string;
  date: string;
  source: 'example' | 'local-draft';
  status: 'Encerrado' | 'Agendado' | 'Rascunho local' | 'Preparado para envio manual';
  metrics: EventMetrics | null;
}
export interface Analysis {
  state: 'ready' | 'empty' | 'protected';
  totals: EventMetrics | null;
  included: InsightEvent[];
  protectedEvents: number;
  pendingEvents: number;
}
export interface Suggestion {
  id: string;
  title: string;
  evidence: string;
  action: string;
  measurement: string;
}
export const MIN_ANALYSIS_GROUP = 10;
export function percentage(count: number, total: number): number | null {
  return total > 0 ? Math.round(count / total * 1000) / 10 : null;
}

function displayPercentage(count: number, total: number): string {
  const value = percentage(count, total);
  return value === null ? '—' : `${value.toLocaleString('pt-BR')}%`;
}

function emptyMetrics(): EventMetrics {
  return { invitations: 0, responses: 0, interested: 0, attended: 0, usefulnessResponses: 0, useful: 0,
    barriers: { coverage: 0, time: 0, workload: 0, communication: 0, other: 0 } };
}

/** Only aggregate demonstration fixtures; this is not a production privacy boundary. */
export function analyzeEvents(events: readonly InsightEvent[], minimum = MIN_ANALYSIS_GROUP): Analysis {
  if (!Number.isInteger(minimum) || minimum < MIN_ANALYSIS_GROUP) throw new Error('Grupo mínimo inválido.');
  const included = events.filter(event => event.metrics !== null && event.metrics.responses >= minimum);
  const protectedEvents = events.filter(event => event.metrics !== null && event.metrics.responses > 0 && event.metrics.responses < minimum).length;
  const pendingEvents = events.length - included.length - protectedEvents;
  if (!included.length) return { state: protectedEvents ? 'protected' : 'empty', totals: null, included, protectedEvents, pendingEvents };
  const totals = emptyMetrics();
  for (const event of included) {
    const metrics = event.metrics!;
    totals.invitations += metrics.invitations;
    totals.responses += metrics.responses;
    totals.interested += metrics.interested;
    totals.attended += metrics.attended;
    totals.usefulnessResponses += metrics.usefulnessResponses;
    totals.useful += metrics.useful;
    for (const key of Object.keys(barrierLabels) as Barrier[]) totals.barriers[key] += metrics.barriers[key];
  }
  return { state: 'ready', totals, included, protectedEvents, pendingEvents };
}

/** Transparent local heuristics, never presented as output from an AI provider. */
export function suggestActions(analysis: Analysis): Suggestion[] {
  if (analysis.state !== 'ready' || !analysis.totals) return [];
  const metrics = analysis.totals;
  const suggestions: Suggestion[] = [];
  const barrierTotal = Object.values(metrics.barriers).reduce((sum, count) => sum + count, 0);
  const leading = (Object.keys(barrierLabels) as Barrier[]).filter(key => metrics.barriers[key] > 0)
    .sort((a, b) => metrics.barriers[b] - metrics.barriers[a]).slice(0, 2);
  const measures: Record<Barrier, [string, string]> = {
    coverage: ['Avaliar revezamento de postos', 'Discutir com as lideranças um piloto de revezamento que permita participar sem deixar o posto descoberto.'],
    time: ['Reavaliar os horários dos eventos', 'Consultar a disponibilidade por turno e testar outra janela durante a jornada, em acordo com a operação.'],
    workload: ['Planejar a liberação de tarefas', 'Avaliar a distribuição de tarefas com a liderança e reservar um período para participação.'],
    communication: ['Reforçar a antecedência dos avisos', 'Revisar os canais e testar avisos antecipados com lembretes, respeitando as preferências de comunicação.'],
    other: ['Aprofundar as barreiras ainda pouco claras', 'Revisar as alternativas da pesquisa e oferecer uma escuta voluntária, sem solicitar dados pessoais.'],
  };
  for (const key of leading) {
    const [title, action] = measures[key];
    suggestions.push({ id: key, title,
      evidence: `${metrics.barriers[key]} de ${barrierTotal} respostas sobre barreiras apontam “${barrierLabels[key]}” (${displayPercentage(metrics.barriers[key], barrierTotal)}).`,
      action, measurement: 'Comparar a proporção desta barreira em uma pesquisa posterior, mantendo perguntas e recortes comparáveis. A mudança isolada não comprova causa e efeito.' });
  }
  const rate = percentage(metrics.responses, metrics.invitations);
  if (rate !== null && rate < 60) suggestions.push({ id: 'response', title: 'Investigar a adesão à pesquisa',
    evidence: `${metrics.responses} respostas para ${metrics.invitations} convites (${displayPercentage(metrics.responses, metrics.invitations)}).`,
    action: 'Verificar a entrega dos convites, o prazo e a clareza do convite. Reforçar que responder é voluntário, sem cobrança individual.',
    measurement: 'Acompanhar a taxa de resposta nos próximos eventos sem confundir resposta à pesquisa com presença.' });
  const usefulness = percentage(metrics.useful, metrics.usefulnessResponses);
  if (usefulness !== null && usefulness < 80) suggestions.push({ id: 'usefulness', title: 'Revisar a utilidade do conteúdo',
    evidence: `${metrics.useful} de ${metrics.usefulnessResponses} avaliações classificaram o conteúdo como muito ou um pouco útil (${displayPercentage(metrics.useful, metrics.usefulnessResponses)}).`,
    action: 'Reavaliar o tema e os exemplos práticos com o RH, usando perguntas de aprofundamento adequadas à experiência dos participantes.',
    measurement: 'Comparar a utilidade percebida em ações posteriores com perguntas equivalentes.' });
  return suggestions;
}
