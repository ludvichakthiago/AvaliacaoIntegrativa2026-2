import { Notice, Panel } from '@/components/ui';

export function DashboardDemo({ onNavigate }: { onNavigate: (page: 'eventos' | 'simulador' | 'insights') => void }) {
  return <>
    <Notice>Todos os indicadores abaixo são exemplos fictícios. Ainda não há conexão com dados de empresas.</Notice>
    <div className="stats">{[
      ['Colaboradores', '1.248', 'Exemplo de rede'], ['Eventos realizados', '18', 'Exemplo em 90 dias'],
      ['Taxa de resposta', '72%', 'Exemplo de respostas à pesquisa'], ['Ações de melhoria', '12', 'Exemplo de acompanhamento'],
    ].map(([label, value, caption]) => <div className="stat" key={label}><span>{label}</span><strong>{value}</strong><small>{caption}</small></div>)}</div>
    <div className="dashboard-grid">
      <Panel title="Da escuta à melhoria"><p className="smalltext">Planeje uma ação, teste a pesquisa e entenda como a conversa pode se adaptar a cada resposta.</p><div className="event-list">
        <div className="event"><div><b>Palestra: Saúde e Bem-estar</b><small>Loja Centro · exemplo de evento encerrado</small></div><span className="chip">Encerrado</span></div>
        <div className="event"><div><b>Semana do Movimento</b><small>Todas as lojas · exemplo de planejamento</small></div><span className="chip amber">Agendado</span></div>
      </div><div className="actions"><button className="btn" onClick={() => onNavigate('eventos')}>Criar evento</button><button className="btn secondary" onClick={() => onNavigate('simulador')}>Testar pesquisa</button></div></Panel>
      <Panel title="Insights para orientar suas próximas ações"><p className="smalltext">Compare os resultados demonstrativos por evento ou veja um panorama consolidado. Explore barreiras e sugestões para avaliação do RH em uma área dedicada.</p><p className="insight">Os filtros atualizam indicadores, gráficos e sugestões. Rascunhos sem respostas ficam identificados como sem resultados.</p><button className="btn" onClick={() => onNavigate('insights')}>Explorar insights</button></Panel>
    </div>
  </>;
}
