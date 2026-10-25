'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="legal"><h1>Não foi possível carregar esta página.</h1><p role="alert">Tente novamente. Seus rascunhos locais não foram removidos.</p><button className="btn" onClick={reset}>Tentar novamente</button></main>;
}
