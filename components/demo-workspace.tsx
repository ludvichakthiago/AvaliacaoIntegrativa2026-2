'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { EventsDemo } from '@/features/events/events-demo';
import { SurveyDemo } from '@/features/surveys/survey-demo';
import { CommunicationsDemo } from '@/features/communications/communications-demo';
import { DashboardDemo } from '@/features/dashboard/dashboard-demo';
import { InsightsDemo } from '@/features/insights/insights-demo';
import { PageHeading } from './ui';
import { ThemeToggle } from './theme-toggle';

const navigation = [
  ['dashboard', 'Visão geral', '▦'], ['eventos', 'Eventos e ações', '▤'],
  ['insights', 'Insights', '✧'],
  ['pesquisas', 'Pesquisas', '☷'], ['simulador', 'Simulador de conversa', '◉'],
  ['comunicados', 'Comunicados', '✉'],
] as const;
type Page = typeof navigation[number][0];

export function DemoWorkspace() {
  const [page, setPage] = useState<Page>('dashboard');
  const [surveyId, setSurveyId] = useState('evento');
  const mainRef = useRef<HTMLElement>(null);
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    mainRef.current?.focus({ preventScroll: true });
  }, [page]);
  const title = navigation.find(item => item[0] === page)?.[1] ?? 'Visão geral';
  return <div className="app">
    <a className="skip-link" href="#main-content">Ir para o conteúdo</a>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark" aria-hidden="true">✳</span><div><strong>conecta<span>bem</span></strong><small>Central de gestão</small></div></div>
      <div><p className="nav-label">MENU PRINCIPAL</p><nav className="nav" aria-label="Navegação principal">
        {navigation.map(([id, label, icon]) => <button key={id} type="button" className={page === id ? 'active' : ''} aria-current={page === id ? 'page' : undefined} onClick={() => setPage(id)}><span aria-hidden="true">{icon}</span>{label}</button>)}
      </nav></div>
      <div className="sidebar-bottom"><b>Um ambiente melhor começa com a escuta.</b><p>Transforme participação em decisões que fazem diferença.</p><Link href="/privacidade">Aviso de privacidade</Link><a href={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/demo.html`}>Consultar protótipo original</a></div>
    </aside>
    <div className="main">
      <header className="topbar"><span className="breadcrumb">Workspace / <b>{title}</b></span><div className="topbar-actions"><span className="demo-pill">Demonstração · sem integração ativa</span><ThemeToggle /></div></header>
      <main className="content" id="main-content" ref={mainRef} tabIndex={-1}>
        <div className="environment-notice">Ambiente sem autenticação ou banco de dados. Use apenas informações fictícias. Respostas do simulador não são armazenadas.</div>
        <PageHeading title={title} description="Engajamento, eventos e escuta dos colaboradores." />
        {page === 'dashboard' && <DashboardDemo onNavigate={setPage} />}
        {page === 'insights' && <InsightsDemo />}
        <div hidden={page !== 'eventos'}><EventsDemo /></div>
        <div hidden={page !== 'pesquisas' && page !== 'simulador'}><SurveyDemo surveyId={surveyId} onSurveyChange={setSurveyId} simulator={page === 'simulador'} onTest={() => setPage('simulador')} /></div>
        <div hidden={page !== 'comunicados'}><CommunicationsDemo /></div>
      </main>
    </div>
  </div>;
}
