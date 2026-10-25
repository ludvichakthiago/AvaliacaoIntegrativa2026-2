'use client';

import { useEffect, useRef, useState } from 'react';

export function CopyMessage({ text, label = 'Copiar mensagem' }: { text: string; label?: string }) {
  const [status, setStatus] = useState('');
  const [failed, setFailed] = useState(false);
  const [copying, setCopying] = useState(false);
  const manual = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { setStatus(''); setFailed(false); }, [text]);
  useEffect(() => { if (failed) { manual.current?.focus(); manual.current?.select(); } }, [failed]);
  async function copy() {
    setCopying(true); setStatus(''); setFailed(false);
    try {
      await navigator.clipboard.writeText(text);
      setStatus('Mensagem copiada. Cole no WhatsApp e confira os destinatários antes de enviar.');
    } catch { setFailed(true); }
    finally { setCopying(false); }
  }
  return <div className="copy-message"><button type="button" className="btn" disabled={copying || !text.trim()} onClick={copy}>{copying ? 'Copiando…' : label}</button>
    <p className="success-message" role="status">{status}</p>
    {failed && <div><p className="error-message" role="alert">O navegador não permitiu a cópia automática. Selecione o texto abaixo e use Ctrl+C ou a opção Copiar do dispositivo.</p><label className="smalltext">Texto para copiar manualmente<textarea ref={manual} readOnly value={text} rows={7} className="manual-copy" /></label><button type="button" className="btn secondary" onClick={() => { manual.current?.focus(); manual.current?.select(); }}>Selecionar texto</button></div>}
  </div>;
}
