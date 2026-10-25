'use client';

import { useState } from 'react';
import { Notice, Panel } from '@/components/ui';
import { CopyMessage } from '@/components/copy-message';

const initialMessage = 'Olá!\n\nA Semana da Saúde está chegando! Teremos atividades de bem-estar para toda a equipe.\n\nEm breve enviaremos os horários e detalhes.\n\nEquipe ConectaBem';
export function CommunicationsDemo() {
  const [title, setTitle] = useState('Semana da Saúde');
  const [body, setBody] = useState(initialMessage);
  const preview = [title.trim(), body.trim()].filter(Boolean).join('\n\n');
  return <div className="form-panel"><Panel title="Compor comunicado">
    <div className="field"><label htmlFor="message-title">Assunto</label><input id="message-title" name="title" maxLength={80} value={title} onChange={event => setTitle(event.target.value)} /></div>
    <div className="field"><label htmlFor="message-body">Mensagem</label><textarea id="message-body" name="body" maxLength={2000} value={body} onChange={event => setBody(event.target.value)} rows={9} /></div>
    <p className="smalltext">A prévia acompanha suas alterações automaticamente. Copie a mensagem e cole no WhatsApp da loja ou do grupo escolhido.</p>
    <CopyMessage text={preview} />
  </Panel><Panel title="Prévia da mensagem para copiar"><div className="message-preview"><div className="bubble">{preview || 'Escreva a mensagem para visualizar a prévia.'}</div></div><Notice>O envio é manual pelo WhatsApp. Copiar não envia a mensagem. Este comunicado não é salvo ao atualizar a página.</Notice></Panel></div>;
}
