export interface Choice { value: string; label: string; next?: string | null }
export interface Question {
  id: string;
  text: string;
  kind: 'choice' | 'text';
  optional?: boolean;
  choices?: readonly Choice[];
  next?: string | null;
}
export interface SurveyDefinition {
  id: string;
  title: string;
  start: string;
  questions: readonly Question[];
}

export function getQuestion(survey: SurveyDefinition, id: string): Question {
  const question = survey.questions.find(item => item.id === id);
  if (!question) throw new Error('Pergunta inexistente.');
  return question;
}

/** Pure decision engine: no browser state, timers, contacts or external channel. */
export function advance(survey: SurveyDefinition, questionId: string, answer: string): string | null {
  const question = getQuestion(survey, questionId);
  if (question.kind === 'text') {
    if ((!question.optional && !answer.trim()) || answer.length > 240) throw new Error('Resposta inválida.');
    return question.next ?? null;
  }
  const choice = question.choices?.find(item => item.value === answer);
  if (!choice) throw new Error('Alternativa inválida.');
  return choice.next === undefined ? question.next ?? null : choice.next;
}

/** Check every branch before a definition can be consumed by a renderer. */
export function validateSurvey(survey: SurveyDefinition): string[] {
  const errors: string[] = [];
  const ids = new Set(survey.questions.map(question => question.id));
  if (ids.size !== survey.questions.length) errors.push('IDs de perguntas duplicados.');
  if (!ids.has(survey.start)) errors.push('Pergunta inicial inexistente.');
  const edges = new Map<string, (string | null)[]>();
  for (const question of survey.questions) {
    if (!question.text.trim()) errors.push(`Pergunta vazia: ${question.id}.`);
    if (question.kind === 'choice' && !question.choices?.length) errors.push(`Alternativas ausentes: ${question.id}.`);
    if (question.choices && new Set(question.choices.map(choice => choice.value)).size !== question.choices.length) errors.push(`Alternativas duplicadas: ${question.id}.`);
    const targets = question.kind === 'text' ? [question.next ?? null]
      : (question.choices ?? []).map(choice => choice.next === undefined ? question.next ?? null : choice.next);
    edges.set(question.id, targets);
    for (const target of targets) if (target !== null && !ids.has(target)) errors.push(`Destino inexistente: ${target}.`);
  }
  const visited = new Set<string>();
  const active = new Set<string>();
  function visit(id: string) {
    if (active.has(id)) { errors.push(`Ciclo detectado: ${id}.`); return; }
    if (visited.has(id)) return;
    visited.add(id);
    active.add(id);
    for (const target of edges.get(id) ?? []) if (target !== null && ids.has(target)) visit(target);
    active.delete(id);
  }
  if (ids.has(survey.start)) visit(survey.start);
  for (const id of ids) if (!visited.has(id)) errors.push(`Pergunta inacessível: ${id}.`);
  return errors;
}
