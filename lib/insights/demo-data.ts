import type { InsightEvent } from './analysis';

/** Entirely fictional aggregate fixtures, isolated from local event drafts and simulator answers. */
export const insightExamples: readonly InsightEvent[] = [
  { id: 'example-health', title: 'Palestra: Saúde e Bem-estar', unit: 'Loja Centro', date: '22 out 2026', source: 'example', status: 'Encerrado',
    metrics: { invitations: 120, responses: 80, interested: 90, attended: 56, usefulnessResponses: 56, useful: 50,
      barriers: { coverage: 12, time: 8, workload: 4, communication: 0, other: 0 } } },
  { id: 'example-ergonomics', title: 'Pausa e ergonomia', unit: 'Loja Norte', date: '15 out 2026', source: 'example', status: 'Encerrado',
    metrics: { invitations: 80, responses: 40, interested: 50, attended: 25, usefulnessResponses: 25, useful: 19,
      barriers: { coverage: 3, time: 10, workload: 2, communication: 0, other: 0 } } },
  { id: 'example-small-group', title: 'Roda de conversa', unit: 'Unidade de exemplo', date: '10 out 2026', source: 'example', status: 'Encerrado',
    metrics: { invitations: 12, responses: 6, interested: 8, attended: 4, usefulnessResponses: 4, useful: 3,
      barriers: { coverage: 0, time: 1, workload: 0, communication: 1, other: 0 } } },
  { id: 'example-movement', title: 'Semana do Movimento', unit: 'Todas as lojas', date: '29 out 2026', source: 'example', status: 'Agendado', metrics: null },
];
