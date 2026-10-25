import test from 'node:test';
import assert from 'node:assert/strict';
import { advance, getQuestion, validateSurvey, type SurveyDefinition } from '../lib/surveys/engine';
import { surveyTemplates } from '../lib/surveys/templates';

const event = surveyTemplates.find(survey => survey.id === 'evento')!;
const communication = surveyTemplates.find(survey => survey.id === 'comunicacao')!;
const intent = surveyTemplates.find(survey => survey.id === 'interesse')!;

interface PathStep { question: string; answer: string }
function allPaths(survey: SurveyDefinition): PathStep[][] {
  const paths: PathStep[][] = [];
  function walk(id: string | null, path: PathStep[]) {
    assert.ok(path.length <= 5, 'Each conversation must have at most five questions.');
    if (id === null) { paths.push(path); return; }
    assert.ok(!path.some(step => step.question === id), 'A question cannot repeat within a conversation.');
    const question = getQuestion(survey, id);
    const answers = question.kind === 'text' ? [''] : question.choices!.map(choice => choice.value);
    for (const answer of answers) walk(advance(survey, id, answer), [...path, { question: id, answer }]);
  }
  walk(survey.start, []);
  return paths;
}

test('all templates have reachable, acyclic and complete flows', () => {
  for (const survey of surveyTemplates) assert.deepEqual(validateSurvey(survey), []);
});

test('attendance distinguishes effective participation from future intent', () => {
  assert.equal(advance(event, 'attendance', 'yes'), 'useful');
  assert.equal(advance(event, 'attendance', 'partly'), 'partial_useful');
  assert.equal(advance(event, 'attendance', 'no'), 'reason');
});

test('each barrier routes to its relevant follow-up', () => {
  for (const [answer, next] of Object.entries({ time: 'period', coverage: 'rotation', workload: 'workload', communication: 'notice', interest: 'topic', private: 'future', other: 'future', skip: 'future' })) {
    assert.equal(advance(event, 'reason', answer), next);
  }
  for (const question of ['obstacle', 'decline_reason']) {
    for (const [answer, next] of Object.entries({ time: 'period', coverage: 'rotation', workload: 'workload', interest: 'topic', details: 'details', private: 'comment', other: 'comment', skip: 'comment' })) {
      assert.equal(advance(intent, question, answer), next);
    }
  }
});

test('all possible paths terminate and remain short', () => {
  for (const survey of surveyTemplates) {
    const paths = allPaths(survey);
    assert.ok(paths.length > 0);
    for (const path of paths) assert.equal(path.at(-1)?.question, 'comment');
  }
});

test('late or missing messages never lead to questions about clarity', () => {
  for (const path of allPaths(communication)) {
    const receipt = path[0]!.answer;
    const questions = path.map(step => step.question);
    assert.equal(questions.includes('clear'), receipt === 'on_time');
    assert.equal(questions.includes('delivery'), receipt === 'late' || receipt === 'not_received');
    if (receipt !== 'on_time') assert.ok(!questions.includes('clarity_help'));
  }
});

test('clarification is requested only when a received message was unclear', () => {
  for (const path of allPaths(communication)) {
    const answer = path.find(step => step.question === 'clear')?.answer;
    assert.equal(path.some(step => step.question === 'clarity_help'), answer === 'partly' || answer === 'no');
  }
});

test('declining, uncertainty or refusal to answer never trigger an event reminder', () => {
  for (const path of allPaths(intent)) {
    const answer = path[0]!.answer;
    const questions = path.map(step => step.question);
    assert.equal(questions.includes('reminder'), answer === 'yes');
    assert.equal(questions.includes('decline_reason'), answer === 'no');
    assert.equal(questions.includes('obstacle'), answer === 'maybe');
  }
});

test('personal reasons, other reasons and skipped obstacles do not solicit detail', () => {
  for (const survey of [event, intent]) {
    for (const path of allPaths(survey)) {
      const index = path.findIndex(step => ['reason', 'partial_reason', 'obstacle', 'decline_reason'].includes(step.question)
        && ['private', 'other', 'skip'].includes(step.answer));
      if (index >= 0) assert.ok(path.slice(index + 1).every(step => ['future', 'comment'].includes(step.question)));
    }
  }
});

test('partial attendance cannot be treated as complete attendance or absence', () => {
  for (const path of allPaths(event)) {
    const answer = path[0]!.answer;
    const questions = path.map(step => step.question);
    assert.equal(questions.includes('partial_useful'), answer === 'partly');
    assert.equal(questions.includes('useful'), answer === 'yes');
    assert.equal(questions.includes('reason'), answer === 'no');
    if (answer === 'partly') {
      assert.ok(!questions.includes('future'));
      const barrier = path.find(step => step.question === 'partial_reason');
      const expected: Record<string, string> = { time: 'partial_period', coverage: 'partial_rotation', workload: 'partial_workload', duration: 'partial_duration', interest: 'partial_topic', communication: 'partial_notice' };
      if (barrier && expected[barrier.answer]) assert.ok(questions.includes(expected[barrier.answer]!));
    }
  }
});

test('unhelpful content never offers an everything-was-great answer in the follow-up', () => {
  assert.equal(advance(event, 'useful', 'very'), 'improve');
  assert.equal(advance(event, 'useful', 'somewhat'), 'experience_issue');
  assert.equal(advance(event, 'useful', 'not_useful'), 'experience_issue');
  for (const path of allPaths(event)) {
    const usefulness = path.find(step => step.question === 'useful')?.answer;
    if (usefulness === 'not_useful' || usefulness === 'somewhat') assert.ok(!path.some(step => step.question === 'improve'));
    if (usefulness === 'unsure' || usefulness === 'skip') assert.ok(!path.some(step => ['improve', 'experience_issue'].includes(step.question)));
  }
});

test('all choices offer a refusal and every alternative has a distinct visible label', () => {
  for (const survey of surveyTemplates) for (const question of survey.questions) {
    if (question.kind === 'text') continue;
    const labels = question.choices!.map(choice => choice.label);
    assert.ok(labels.includes('Prefiro não responder'), `${survey.id}/${question.id} needs a refusal option.`);
    assert.equal(new Set(labels).size, labels.length);
  }
});

test('optional comment can be skipped and oversized text is rejected', () => {
  assert.equal(advance(event, 'comment', ''), null);
  assert.throws(() => advance(event, 'comment', 'a'.repeat(241)));
});

test('unknown question or choice cannot advance', () => {
  assert.throws(() => advance(event, 'missing', 'yes'));
  assert.throws(() => advance(event, 'attendance', 'invented'));
});

test('explicit finish overrides a default next question', () => {
  const survey: SurveyDefinition = { id: 'x', title: 'x', start: 'a', questions: [
    { id: 'a', kind: 'choice', text: 'A', next: 'b', choices: [{ value: 'stop', label: 'Stop', next: null }, { value: 'go', label: 'Go' }] },
    { id: 'b', kind: 'text', text: 'B' },
  ] };
  assert.equal(advance(survey, 'a', 'stop'), null);
  assert.equal(advance(survey, 'a', 'go'), 'b');
  assert.throws(() => advance(survey, 'b', '  '));
});

test('validator rejects broken targets, cycles, duplicate ids and unreachable questions', () => {
  const survey: SurveyDefinition = { id: 'x', title: 'x', start: 'a', questions: [
    { id: 'a', kind: 'choice', text: 'A', choices: [{ value: 'loop', label: 'Loop', next: 'a' }, { value: 'bad', label: 'Bad', next: 'missing' }] },
    { id: 'b', kind: 'text', text: 'B' }, { id: 'b', kind: 'text', text: 'B' },
  ] };
  const errors = validateSurvey(survey).join(' ');
  for (const pattern of [/Ciclo/, /Destino inexistente/, /duplicados/, /inacessível/]) assert.match(errors, pattern);
});

test('validator rejects missing start and empty alternatives', () => {
  assert.ok(validateSurvey({ id: 'x', title: 'x', start: 'missing', questions: [] }).length);
  assert.ok(validateSurvey({ id: 'x', title: 'x', start: 'a', questions: [{ id: 'a', kind: 'choice', text: '' }] }).length >= 2);
});
