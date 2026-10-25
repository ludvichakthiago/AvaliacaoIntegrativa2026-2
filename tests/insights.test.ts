import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeEvents, percentage, suggestActions, type InsightEvent } from '../lib/insights/analysis';
import { insightExamples } from '../lib/insights/demo-data';

const health = insightExamples.find(event => event.id === 'example-health')!;
const ergonomics = insightExamples.find(event => event.id === 'example-ergonomics')!;
const small = insightExamples.find(event => event.id === 'example-small-group')!;

test('demonstration metrics are internally consistent and never mix outcomes', () => {
  for (const event of insightExamples) {
    const metrics = event.metrics;
    if (!metrics) continue;
    for (const value of [...Object.values(metrics).filter((value): value is number => typeof value === 'number'), ...Object.values(metrics.barriers)]) {
      assert.ok(Number.isInteger(value) && value >= 0);
    }
    assert.ok(metrics.responses <= metrics.invitations);
    assert.ok(metrics.interested <= metrics.invitations);
    assert.ok(metrics.attended <= metrics.responses);
    assert.ok(metrics.useful <= metrics.usefulnessResponses && metrics.usefulnessResponses <= metrics.attended);
    assert.equal(Object.values(metrics.barriers).reduce((sum, count) => sum + count, 0), metrics.responses - metrics.attended);
  }
});

test('overview totals include only events eligible for display', () => {
  const analysis = analyzeEvents(insightExamples);
  assert.equal(analysis.state, 'ready');
  assert.deepEqual(analysis.included.map(event => event.id), [health.id, ergonomics.id]);
  assert.equal(analysis.protectedEvents, 1);
  assert.equal(analysis.pendingEvents, 1);
  assert.equal(analysis.totals!.invitations, 200);
  assert.equal(analysis.totals!.responses, 120);
  assert.equal(analysis.totals!.attended, 81);
});

test('selecting a single event changes metrics and evidence used for suggestions', () => {
  const a = analyzeEvents([health]);
  const b = analyzeEvents([ergonomics]);
  assert.equal(a.totals!.responses, 80);
  assert.equal(b.totals!.responses, 40);
  assert.equal(suggestActions(a)[0]!.id, 'coverage');
  assert.equal(suggestActions(b)[0]!.id, 'time');
  assert.match(suggestActions(a)[0]!.evidence, /12 de 24/);
  assert.match(suggestActions(b)[0]!.evidence, /10 de 15/);
});

test('response rates are weighted by invitation count, never averaged from event percentages', () => {
  const totals = analyzeEvents([health, ergonomics]).totals!;
  assert.equal(percentage(totals.responses, totals.invitations), 60);
  assert.notEqual(percentage(totals.responses, totals.invitations), (percentage(80, 120)! + percentage(40, 80)!) / 2);
});

test('interest, reported participation and survey responses remain distinct', () => {
  const totals = analyzeEvents([health]).totals!;
  assert.equal(totals.interested, 90);
  assert.equal(totals.attended, 56);
  assert.equal(totals.responses, 80);
  assert.equal(percentage(totals.attended, totals.responses), 70);
});

test('a small group has no visible totals or suggested actions', () => {
  const analysis = analyzeEvents([small]);
  assert.equal(analysis.state, 'protected');
  assert.equal(analysis.totals, null);
  assert.deepEqual(analysis.included, []);
  assert.deepEqual(suggestActions(analysis), []);
});

test('suppressed groups cannot be recovered by subtracting the displayed overview and an event', () => {
  const alone = analyzeEvents([health]).totals!;
  const together = analyzeEvents([health, small]).totals!;
  assert.deepEqual(together, alone);
});

test('drafts, scheduled events and an empty dataset never receive invented insights', () => {
  const draft: InsightEvent = { ...health, id: 'local', source: 'local-draft', status: 'Rascunho local', metrics: null };
  for (const events of [[], [draft], [insightExamples.find(event => event.id === 'example-movement')!]]) {
    const analysis = analyzeEvents(events);
    assert.equal(analysis.state, 'empty');
    assert.equal(analysis.totals, null);
    assert.deepEqual(suggestActions(analysis), []);
  }
});

test('minimum group size can be raised but cannot be disabled', () => {
  assert.equal(analyzeEvents([ergonomics], 41).state, 'protected');
  assert.equal(analyzeEvents([ergonomics], 40).state, 'ready');
  for (const size of [0, -1, 9, 10.5, NaN]) assert.throws(() => analyzeEvents([health], size));
});

test('zero denominators do not yield misleading zero percent or infinite values', () => {
  assert.equal(percentage(0, 0), null);
  const event: InsightEvent = { ...health, metrics: { ...health.metrics!, invitations: 0, usefulnessResponses: 0, useful: 0,
    barriers: { coverage: 0, time: 0, workload: 0, communication: 0, other: 0 } } };
  assert.deepEqual(suggestActions(analyzeEvents([event])), []);
});

test('suggestions about response and content are supported by the displayed event evidence', () => {
  const suggestions = suggestActions(analyzeEvents([ergonomics]));
  assert.match(suggestions.find(item => item.id === 'response')!.evidence, /40 respostas para 80 convites \(50%\)/);
  assert.match(suggestions.find(item => item.id === 'usefulness')!.evidence, /19 de 25/);
  assert.ok(!suggestActions(analyzeEvents([health])).some(item => ['response', 'usefulness'].includes(item.id)));
});

test('analysis never mutates event fixtures when filters change', () => {
  const before = JSON.stringify(insightExamples);
  analyzeEvents(insightExamples);
  analyzeEvents([health]);
  suggestActions(analyzeEvents([ergonomics]));
  assert.equal(JSON.stringify(insightExamples), before);
});
