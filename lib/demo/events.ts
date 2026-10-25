/** Browser-only prototype data. Never use this repository for production contacts. */
export interface DemoEvent {
  title: string;
  unit: string;
  date: string;
  description: string;
  id?: string;
  units?: string[];
  status?: 'draft' | 'ready';
}

export const EVENT_STORAGE_KEY = 'cb_events';
export const DEMO_UNITS = ['Todas as lojas', 'Loja Centro', 'Loja Norte', 'Loja Sul'] as const;
export const STORE_UNITS = ['Loja Centro', 'Loja Norte', 'Loja Sul'] as const;

export function eventUnits(event: DemoEvent): string[] {
  return event.units ?? (event.unit === 'Todas as lojas' ? [...STORE_UNITS] : [event.unit]);
}

export function eventDateForInput(date: string): string {
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(date)) return date;
  const legacy = /^(\d{2})\/(\d{2})\/(\d{4}),?\s+(\d{2}):(\d{2})$/.exec(date);
  return legacy ? `${legacy[3]}-${legacy[2]}-${legacy[1]}T${legacy[4]}:${legacy[5]}` : '';
}

export function invitationMessage(event: DemoEvent, unit?: string): string {
  const date = eventDateForInput(event.date);
  const display = date ? `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)} às ${date.slice(11)}` : event.date;
  return [unit ? `Olá, equipe da ${unit}!` : 'Olá, equipe!', `*${event.title.trim()}*`, `Data e horário: ${display}`, `Lojas: ${unit ?? eventUnits(event).join(', ')}`, event.description.trim(), 'A participação é voluntária. Confira com a liderança como se organizar para participar.', 'Equipe ConectaBem'].filter(Boolean).join('\n\n');
}

export function isDemoEvent(value: unknown): value is DemoEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as Record<string, unknown>;
  return typeof event.title === 'string' && event.title.trim().length > 0
    && typeof event.unit === 'string'
    && typeof event.date === 'string' && event.date.length > 0
    && typeof event.description === 'string'
    && (event.id === undefined || typeof event.id === 'string')
    && (event.status === undefined || event.status === 'draft' || event.status === 'ready')
    && (event.units === undefined || (Array.isArray(event.units) && event.units.length > 0 && event.units.every(unit => typeof unit === 'string' && STORE_UNITS.some(store => store === unit)) && new Set(event.units).size === event.units.length));
}

export function parseDemoEvents(raw: string | null): DemoEvent[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (!Array.isArray(data) || !data.every(isDemoEvent)) {
    throw new Error('Formato de rascunhos inválido.');
  }
  return data;
}

export function validateEvent(event: DemoEvent): string | null {
  if (!isDemoEvent(event) || event.title.length > 100 || event.description.length > 2000) return 'Informe um nome de até 100 caracteres e uma descrição de até 2.000 caracteres.';
  if (!DEMO_UNITS.some(unit => unit === event.unit)) return 'Selecione uma unidade válida.';
  if (!eventUnits(event).length || eventUnits(event).some(unit => !STORE_UNITS.some(store => store === unit))) return 'Selecione pelo menos uma loja válida.';
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(event.date) || Number.isNaN(Date.parse(event.date))) {
    return 'Informe uma data e horário válidos.';
  }
  // Validate calendar fields independently of the machine's timezone (e.g. reject February 30).
  const calendar = new Date(`${event.date}Z`);
  if (Number.isNaN(calendar.getTime()) || calendar.toISOString().slice(0, 16) !== event.date) return 'Informe uma data e horário válidos.';
  return null;
}
