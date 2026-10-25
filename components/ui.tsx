import type { ReactNode } from 'react';

export function Panel({ title, children }: { title: string; children: ReactNode }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>;
}

export function Notice({ children }: { children: ReactNode }) {
  return <p className="notice">{children}</p>;
}

export function PageHeading({ title, description }: { title: string; description: string }) {
  return <div className="heading"><div><span className="eyebrow">CENTRAL DE ENGAJAMENTO</span><h1>{title}</h1><p>{description}</p></div></div>;
}
