'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Notice, Panel } from '@/components/ui';
import { CopyMessage } from '@/components/copy-message';
import { STORE_UNITS, EVENT_STORAGE_KEY, eventDateForInput, eventUnits, invitationMessage, parseDemoEvents, validateEvent, type DemoEvent } from '@/lib/demo/events';

export function EventsDemo() {
  const [events, setEvents] = useState<DemoEvent[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [units, setUnits] = useState<string[]>([]);
  const [editing, setEditing] = useState<{ index: number; original: DemoEvent } | null>(null);
  const [prepared, setPrepared] = useState<DemoEvent | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const deliveryRef = useRef<HTMLElement>(null);
  useEffect(() => {
    try { setEvents(parseDemoEvents(localStorage.getItem(EVENT_STORAGE_KEY))); setReady(true); }
    catch { setError('Não foi possível ler os eventos locais. O conteúdo existente foi preservado. Verifique o armazenamento do navegador.'); }
  }, []);
  useEffect(() => { if (prepared) deliveryRef.current?.focus(); }, [prepared]);

  function reset() {
    setEditing(null); setTitle(''); setDate(''); setDescription(''); setUnits([]);
  }
  function edit(event: DemoEvent, index: number) {
    setPrepared(null);
    setEditing({ index, original: event }); setTitle(event.title); setDate(eventDateForInput(event.date));
    setDescription(event.description); setUnits(eventUnits(event)); setError(''); setStatus('');
    titleRef.current?.focus();
  }
  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setStatus('');
    if (!ready) { setError('O armazenamento local está indisponível. Nenhum evento foi salvo.'); return; }
    if (!units.length) { setError('Selecione pelo menos uma loja para o evento.'); return; }
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const prepare = submitter instanceof HTMLButtonElement && submitter.value === 'prepare';
    const record: DemoEvent = {
      title: title.trim(), date, description: description.trim(), units,
      unit: units.length === 1 ? units[0]! : 'Todas as lojas',
      id: editing?.original.id ?? crypto.randomUUID(), status: prepare ? 'ready' : 'draft',
    };
    const validation = validateEvent(record);
    if (validation) { setError(validation); return; }
    try {
      const stored = parseDemoEvents(localStorage.getItem(EVENT_STORAGE_KEY));
      if (editing) {
        const index = editing.original.id ? stored.findIndex(item => item.id === editing.original.id) : editing.index;
        if (index < 0 || JSON.stringify(stored[index]) !== JSON.stringify(editing.original)) {
          setError('Este evento mudou em outra aba. Recarregue a página antes de editar para não sobrescrever alterações.'); return;
        }
        stored[index] = record;
      } else stored.unshift(record);
      localStorage.setItem(EVENT_STORAGE_KEY, JSON.stringify(stored)); setEvents(stored); reset();
      setPrepared(prepare ? record : null);
      setStatus(prepare ? 'Evento salvo neste navegador e preparado para envio manual. Nenhuma mensagem foi enviada.' : 'Rascunho salvo neste navegador. Use Continuar preparação para criar o convite.');
    } catch { setError('Não foi possível salvar. Verifique o espaço e as permissões de armazenamento.'); }
  }
  return <>
    <Notice>Fluxo manual: crie o evento, selecione as lojas, prepare e copie o convite. Depois cole e envie pelo seu WhatsApp. Os eventos ficam somente neste navegador, sem banco de dados ou disparos automáticos. As lojas disponíveis ainda são exemplos.</Notice>
    <div className="form-panel"><Panel title="Eventos salvos neste navegador">
      {!ready && !error && <p role="status">Carregando eventos…</p>}
      {ready && events.length === 0 && <div className="empty">Nenhum evento local. Preencha os dados ao lado para começar.</div>}
      <div className="event-list">{events.map((event, index) => <article className="event local-event" key={event.id ?? `${event.title}-${index}`}><div><b>{event.title}</b><small>{eventUnits(event).join(', ')} · {event.date.replace('T', ' ')}</small>{event.description && <p className="smalltext">{event.description}</p>}<span className={`chip ${event.status === 'ready' ? '' : 'gray'}`}>{event.status === 'ready' ? 'Preparado para envio manual' : 'Rascunho local'}</span><div className="actions"><button type="button" className="btn secondary" onClick={() => edit(event, index)}>{event.status === 'ready' ? 'Editar evento' : 'Continuar preparação'}</button>{event.status === 'ready' && <button type="button" className="btn" onClick={() => setPrepared({ ...event })}>Ver convite para copiar</button>}</div></div></article>)}</div>
      <button type="button" className="btn secondary" onClick={() => { reset(); setPrepared(null); titleRef.current?.focus(); }}>Novo evento</button>
    </Panel><Panel title={editing ? 'Continuar evento' : 'Criar evento'}><form onSubmit={save}>
      <div className="field"><label htmlFor="event-title">Nome do evento</label><input ref={titleRef} id="event-title" name="title" required maxLength={100} value={title} onChange={event => setTitle(event.target.value)} placeholder="Ex.: Semana da Saúde" /></div>
      <fieldset className="event-stores"><legend>Lojas participantes</legend><p className="smalltext">Selecione uma ou mais lojas de exemplo.</p><label><input type="checkbox" checked={units.length === STORE_UNITS.length} onChange={event => setUnits(event.target.checked ? [...STORE_UNITS] : [])} /> Todas as lojas</label>{STORE_UNITS.map(unit => <label key={unit}><input type="checkbox" checked={units.includes(unit)} onChange={event => setUnits(current => event.target.checked ? [...current, unit] : current.filter(item => item !== unit))} /> {unit}</label>)}</fieldset>
      <div className="field"><label htmlFor="event-date">Data e horário local do evento</label><input id="event-date" name="date" type="datetime-local" required value={date} onInput={event => setDate(event.currentTarget.value)} onChange={event => setDate(event.target.value)} /></div>
      <div className="field"><label htmlFor="event-description">Descrição e orientações para as lojas</label><textarea id="event-description" name="description" maxLength={2000} value={description} onChange={event => setDescription(event.target.value)} placeholder="Inclua o local e as orientações para participar." /></div>
      <div className="actions"><button className="btn" value="prepare" disabled={!ready}>Salvar evento e preparar envio</button><button className="btn secondary" value="draft" disabled={!ready}>Salvar apenas rascunho</button>{editing && <button type="button" className="btn secondary" onClick={reset}>Cancelar edição</button>}</div>
      {error && <p role="alert" className="error-message">{error}</p>}
      <p role="status" className="success-message">{status}</p>
    </form></Panel></div>
    {prepared && <section ref={deliveryRef} tabIndex={-1} className="manual-delivery" aria-label="Preparar envio manual"><Panel title={`Envio manual: ${prepared.title}`}>
      <ol className="smalltext"><li>Confira a data, o conteúdo e as lojas participantes.</li><li>Copie o convite geral ou o convite específico de cada loja.</li><li>Abra seu WhatsApp, escolha o contato ou grupo correto, cole a mensagem e faça o envio.</li></ol>
      <Notice>Preparado não significa enviado. A plataforma não envia, não confirma entrega e não registra recebimento pelo WhatsApp.</Notice>
      <h3>Convite geral</h3><div className="message-preview"><div className="bubble">{invitationMessage(prepared)}</div></div><CopyMessage text={invitationMessage(prepared)} label="Copiar convite geral" />
      <h3>Convites por loja selecionada</h3><div className="insights-suggestion-grid">{eventUnits(prepared).map(unit => <article className="panel" key={unit}><h4>{unit}</h4><p className="smalltext">Copie a versão endereçada à equipe desta loja.</p><details><summary>Ver mensagem desta loja</summary><div className="bubble">{invitationMessage(prepared, unit)}</div></details><CopyMessage text={invitationMessage(prepared, unit)} label={`Copiar convite · ${unit}`} /></article>)}</div>
    </Panel></section>}
  </>;
}

