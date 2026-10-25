import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ConectaBem | Central de gestão',
  description: 'Engajamento, eventos e escuta dos colaboradores.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('cb_theme')}catch(e){}if(t!=='dark'&&t!=='light'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t})()` }} /></head><body style={{ margin: 0 }}>{children}</body></html>;
}
