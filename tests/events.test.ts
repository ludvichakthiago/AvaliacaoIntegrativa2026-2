import test from 'node:test';
import assert from 'node:assert/strict';
import { eventDateForInput, eventUnits, invitationMessage, parseDemoEvents, validateEvent } from '../lib/demo/events';

const draft = { title: 'Evento de teste', unit: 'Loja Centro', date: '2026-11-05T14:00', description: '' };

test('existing drafts survive serialization including original localized dates', () => {
  const legacy = { ...draft, date: '05/11/2026, 14:00' };
  assert.deepEqual(parseDemoEvents(JSON.stringify([draft, legacy])), [draft, legacy]);
  assert.deepEqual(parseDemoEvents(null), []);
  const longLegacy = { ...legacy, description: 'a'.repeat(3000) };
  assert.deepEqual(parseDemoEvents(JSON.stringify([longLegacy])), [longLegacy]);
});

test('invalid or corrupt storage is rejected rather than silently discarded', () => {
  for (const raw of ['{', '{}', 'null', '[null]', '[{"title":123}]']) assert.throws(() => parseDemoEvents(raw));
});

test('event validation rejects blank title, invalid date, unknown unit and long description', () => {
  assert.equal(validateEvent(draft), null);
  for (const invalid of [{ ...draft, title: ' ' }, { ...draft, date: 'invalid' }, { ...draft, date: '2026-02-30T14:00' }, { ...draft, unit: 'Outra' }, { ...draft, description: 'a'.repeat(2001) }]) assert.ok(validateEvent(invalid));
});

test('multiple selected stores and ready status survive a page reload', () => {
  const event = { ...draft, id: 'test-event', unit: 'Todas as lojas', units: ['Loja Centro', 'Loja Sul'], status: 'ready' as const };
  const restored = parseDemoEvents(JSON.stringify([event]))[0]!;
  assert.deepEqual(eventUnits(restored), ['Loja Centro', 'Loja Sul']);
  assert.equal(restored.status, 'ready');
  assert.equal(validateEvent(restored), null);
});

test('invalid, empty or duplicate selected stores and unknown statuses are rejected', () => {
  for (const extra of [{ units: [] }, { units: ['Outra'] }, { units: ['Loja Centro', 'Loja Centro'] }, { status: 'sent' }]) {
    assert.throws(() => parseDemoEvents(JSON.stringify([{ ...draft, ...extra }])));
  }
});

test('legacy single-store and all-store drafts remain available for preparation', () => {
  assert.deepEqual(eventUnits(draft), ['Loja Centro']);
  assert.deepEqual(eventUnits({ ...draft, unit: 'Todas as lojas' }), ['Loja Centro', 'Loja Norte', 'Loja Sul']);
  assert.equal(eventDateForInput('05/11/2026, 14:00'), '2026-11-05T14:00');
  assert.equal(eventDateForInput(draft.date), draft.date);
  assert.equal(eventDateForInput('invalid'), '');
});

test('manual invitations include current event details and only selected stores', () => {
  const event = { ...draft, units: ['Loja Centro', 'Loja Sul'], description: 'Local: sala de reuniões.\nCombine a escala com a liderança.' };
  const general = invitationMessage(event);
  assert.match(general, /05\/11\/2026 às 14:00/);
  assert.match(general, /Loja Centro, Loja Sul/);
  assert.match(general, /sala de reuniões/);
  assert.ok(!general.includes('Loja Norte'));
  const specific = invitationMessage(event, 'Loja Sul');
  assert.match(specific, /Olá, equipe da Loja Sul!/);
  assert.ok(!specific.includes('Loja Centro'));
  assert.ok(!specific.includes('undefined'));
});
