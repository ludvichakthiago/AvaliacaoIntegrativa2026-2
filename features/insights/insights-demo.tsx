'use client';

import { useEffect, useState } from 'react';
import { Notice, Panel } from '@/components/ui';
import { EVENT_STORAGE_KEY, eventUnits, parseDemoEvents } from '@/lib/demo/events';
import { analyzeEvents, barrierLabels, MIN_ANALYSIS_GROUP, percentage, suggestActions, type Barrier, type InsightEvent } from '@/lib/insights/analysis';
import { insightExamples } from '@/lib/insights/demo-data';

function percent(count: number, total: number): string {
  const result = percentage(count, total);
  return result === null ? '—' : `${result.toLocaleString('pt-BR')}%`;
}

export function InsightsDemo() {
  const [selectedId, setSelectedId] = useState('all');
  const [drafts, setDrafts] = useState<InsightEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    try {
      setDrafts(parseDemoEvents(localStorage.getItem(EVENT_STORAGE_KEY)).map((draft, index) => ({
        id: `draft-${index}`, title: draft.title, unit: eventUnits(draft).join(', '), date: draft.date.replace('T', ' '),
        source: 'local-draft', status: draft.status === 'ready' ? 'Preparado para envio manual' : 'Rascunho local', metrics: null,
      })));
    } catch { setError('Não foi possível carregar os rascunhos locais. Os exemplos continuam disponíveis.'); }
    finally { setLoading(false); }
  }, []);
  const events = [...insightExamples, ...drafts];
  const selected = events.find(event => event.id === selectedId);
  const analysis = analyzeEvents(selectedId === 'all' ? events : selected ? [selected] : []);
  const metrics = analysis.totals;
  const suggestions = suggestActions(analysis);
  const barrierTotal = metrics ? Object.values(metrics.barriers).reduce((sum, value) => sum + value, 0) : 0;
  return <>
    <Notice>Ambiente demonstrativo: os resultados dos eventos de exemplo são fictícios. Seus eventos locais aparecem no filtro, mas não possuem respostas ou indicadores. A IA externa não está conectada.</Notice>
    <section className="insights-filter" aria-label="Filtro dos insights">
      <div className="field"><label htmlFor="insight-event">Qual evento você quer analisar?</label><select id="insight-event" value={selectedId} onChange={event => setSelectedId(event.target.value)}>
        <option value="all">Visão geral de todos os eventos</option>
        <optgroup label="Eventos de exemplo · dados fictícios">{insightExamples.map(event => <option key={event.id} value={event.id}>{event.title}</option>)}</optgroup>
        {drafts.length > 0 && <optgroup label="Seus eventos locais · sem resultados">{drafts.map(event => <option key={event.id} value={event.id}>{event.title} · {event.date}</option>)}</optgroup>}
      </select></div>
      <p className="smalltext" role="status">{loading ? 'Carregando eventos locais…' : selected ? `${selected.unit} · ${selected.date} · ${selected.status}` : `${analysis.included.length} eventos de exemplo com resultados exibíveis · ${analysis.pendingEvents} sem resultados · ${analysis.protectedEvents} com resultados protegidos`}</p>
    </section>
    {error && <p className="error-message" role="alert">{error}</p>}
    <div className="insights-scope"><span className="eyebrow">{selected ? 'ANÁLISE DO EVENTO' : 'VISÃO CONSOLIDADA'}</span><h2>{selected?.title ?? 'Todos os eventos'}</h2><p className="smalltext">{selectedId === 'all' ? 'As contagens somam registros por evento; uma mesma pessoa pode participar de mais de um. Não representam colaboradores únicos.' : 'Os indicadores consideram somente o evento selecionado.'}</p></div>
    {metrics ? <>
      <div className="stats" aria-label="Indicadores do recorte">
        <div className="stat"><span>Convites enviados</span><strong>{metrics.invitations}</strong><small>Contagem por evento</small></div>
        <div className="stat"><span>Respostas recebidas</span><strong>{metrics.responses}</strong><small>Respostas à pesquisa</small></div>
        <div className="stat"><span>Taxa de resposta</span><strong>{percent(metrics.responses, metrics.invitations)}</strong><small>{metrics.responses} respostas / {metrics.invitations} convites</small></div>
        <div className="stat"><span>Participação efetiva relatada</span><strong>{percent(metrics.attended, metrics.responses)}</strong><small>{metrics.attended} entre {metrics.responses} respondentes</small></div>
      </div>
      {analysis.protectedEvents > 0 && <Notice>Eventos com menos de {MIN_ANALYSIS_GROUP} respostas foram excluídos de todos os totais, gráficos e sugestões deste recorte. Os resultados protegidos não entram na visão consolidada.</Notice>}
      <div className="dashboard-grid">
        <Panel title="O que dificultou a participação?">
          <p className="smalltext">Distribuição entre {barrierTotal} respostas de não participantes que informaram uma barreira principal.</p>
          {barrierTotal > 0 ? <div className="bars">{(Object.keys(barrierLabels) as Barrier[]).filter(key => metrics.barriers[key] > 0).sort((a, b) => metrics.barriers[b] - metrics.barriers[a]).map(key => <div key={key}><div className="barline"><span>{barrierLabels[key]}</span><b>{percent(metrics.barriers[key], barrierTotal)}</b></div><div className="track"><div className="fill" style={{ width: `${percentage(metrics.barriers[key], barrierTotal) ?? 0}%` }} /></div><small className="smalltext">{metrics.barriers[key]} respostas</small></div>)}</div> : <div className="empty">Não há barreiras informadas neste recorte.</div>}
        </Panel>
        <Panel title="Interesse, presença e percepção">
          <dl className="insights-facts"><div><dt>Intenções positivas registradas</dt><dd>{metrics.interested}</dd></div><div><dt>Participações efetivas relatadas na pesquisa</dt><dd>{metrics.attended}</dd></div><div><dt>Conteúdo considerado muito ou um pouco útil</dt><dd>{percent(metrics.useful, metrics.usefulnessResponses)}</dd></div></dl>
          <p className="smalltext">Utilidade: {metrics.useful} avaliações positivas em {metrics.usefulnessResponses} avaliações recebidas.</p>
          <p className="insight">Interesse não confirma presença. A participação é autodeclarada por quem respondeu; não é uma medição de presença de todos os convidados.</p>
        </Panel>
      </div>
      <section className="insights-suggestions" aria-labelledby="suggestions-title">
        <div className="insights-section-head"><div><span className="eyebrow">DA ESCUTA À AÇÃO</span><h2 id="suggestions-title">Sugestões para avaliação do RH</h2></div><span className="chip gray">Regras demonstrativas · sem IA</span></div>
        <p className="smalltext">Sugestões calculadas a partir dos indicadores exibidos. São hipóteses para revisão humana, sem afirmar causas ou garantir resultados.</p>
        {suggestions.length ? <div className="insights-suggestion-grid">{suggestions.map(suggestion => <article className="panel" key={suggestion.id}><h3>{suggestion.title}</h3><p className="insights-evidence">{suggestion.evidence}</p><p className="smalltext">{suggestion.action}</p><details><summary>Como acompanhar o resultado</summary><p className="smalltext">{suggestion.measurement}</p></details></article>)}</div> : <div className="empty">Os indicadores não acionaram uma sugestão específica. O RH pode avaliar o contexto antes de definir medidas.</div>}
      </section>
      <Panel title="Eventos considerados na análise"><ul className="insights-event-list">{analysis.included.map(event => <li key={event.id}><b>{event.title}</b><span>{event.unit} · {event.date} · exemplo fictício</span></li>)}</ul></Panel>
    </> : <Panel title={analysis.state === 'protected' ? 'Resultados protegidos' : 'Ainda não há resultados'}><div className="empty">{analysis.state === 'protected' ? `Este evento não atingiu o grupo mínimo de ${MIN_ANALYSIS_GROUP} respostas. Indicadores e sugestões não são exibidos.` : selected?.source === 'local-draft' ? 'Este evento está salvo somente neste navegador. Não há registro de envios ou respostas coletadas para gerar indicadores.' : 'Este evento ainda não tem respostas de pesquisa disponíveis para análise.'}</div></Panel>}
    <section className="panel insights-ai" aria-labelledby="ai-title"><div><span className="eyebrow">APOIO À INTERPRETAÇÃO</span><h2 id="ai-title">Análise com IA</h2><p className="smalltext" id="ai-status">Integração não configurada. A análise por IA depende de autenticação, controles de privacidade e configuração segura do provedor no servidor. As sugestões demonstrativas, quando disponíveis, são produzidas por regras locais.</p><p className="smalltext">A IA poderá ajudar a resumir tendências e sugerir pontos de investigação usando somente indicadores agregados autorizados. Toda sugestão deverá passar pela revisão do RH.</p></div><button className="btn secondary" disabled aria-describedby="ai-status">Analisar com IA · indisponível</button></section>
    <p className="smalltext">Este painel usa apenas dados fictícios e uma supressão demonstrativa de grupos pequenos. Os controles de privacidade, autorização e agregação precisam ser implementados no servidor antes de analisar dados reais.</p>
  </>;
}
