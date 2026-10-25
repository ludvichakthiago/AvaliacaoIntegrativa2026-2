'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Notice, Panel } from '@/components/ui';
import { advance, getQuestion, validateSurvey, type SurveyDefinition } from '@/lib/surveys/engine';
import { surveyTemplates } from '@/lib/surveys/templates';

interface Message { text: string; mine?: boolean }

export function SurveyDemo({ surveyId, onSurveyChange, simulator, onTest }: {
  surveyId: string; onSurveyChange: (id: string) => void; simulator: boolean; onTest: () => void;
}) {
  const survey = surveyTemplates.find(item => item.id === surveyId) ?? surveyTemplates[0];
  if (!survey) return <p role="alert">Nenhum modelo disponível.</p>;
  return <>
    <div className="field"><label htmlFor="survey-template">Modelo demonstrativo</label><select id="survey-template" value={survey.id} onChange={event => onSurveyChange(event.target.value)}>{surveyTemplates.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
    {simulator ? <Simulator key={survey.id} survey={survey} /> : <div className="form-panel"><Panel title="Modelo de pesquisa"><p>Os modelos são definições tipadas, compartilhadas entre o catálogo e o simulador.</p><Notice>Modelos de demonstração. O editor e a persistência de pesquisas serão implementados na Fase 3.</Notice><button className="btn" onClick={onTest}>Testar este modelo</button></Panel><Panel title={survey.title}>{survey.questions.map((question, index) => <div className="question-item" key={question.id}><b>{index + 1}. {question.text}</b><p>{question.kind === 'choice' ? `${question.choices?.length ?? 0} alternativas` : 'Texto curto'}{question.optional ? ' · opcional' : ''}</p>{question.choices?.map(item => <small key={item.value}>{item.label} → {item.next === undefined ? question.next ?? 'Fim' : item.next ?? 'Fim'}</small>)}</div>)}</Panel></div>}
  </>;
}

function Simulator({ survey }: { survey: SurveyDefinition }) {
  const validation = validateSurvey(survey);
  const [current, setCurrent] = useState<string | null>(survey.start);
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [text, setText] = useState('');
  const [answered, setAnswered] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const chat = useRef<HTMLDivElement>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  useEffect(() => { if (chat.current) chat.current.scrollTop = chat.current.scrollHeight; }, [messages, current, typing]);
  if (validation.length) return <p role="alert">Este modelo tem um fluxo inválido. A simulação foi bloqueada.</p>;
  const question = current === null ? null : getQuestion(survey, current);

  function answer(value: string, label: string) {
    if (current === null || busy.current) return;
    try {
      const next = advance(survey, current, value);
      busy.current = true; setTyping(true); setError('');
      setMessages(items => [...items, { text: getQuestion(survey, current).text }, { text: label, mine: true }]);
      setText(''); setAnswered(count => count + 1);
      timer.current = setTimeout(() => { setCurrent(next); setTyping(false); busy.current = false; }, 370);
    } catch { setError('Não foi possível avançar. Confira sua resposta e tente novamente.'); }
  }
  function restart() {
    if (timer.current) clearTimeout(timer.current);
    busy.current = false; setTyping(false); setMessages([]); setCurrent(survey.start); setText(''); setAnswered(0); setError('');
  }
  function send(event: FormEvent<HTMLFormElement>) { event.preventDefault(); answer(text.trim(), text.trim() || 'Pular'); }

  return <div className="split-demo"><div><Panel title="Teste o caminho da conversa"><p className="smalltext">Selecione respostas para percorrer o modelo. As decisões usam o motor puro de pesquisas, que poderá ser reutilizado pela integração oficial.</p><Notice>Sua participação é voluntária. Nesta simulação, as respostas ficam somente em memória e não são enviadas ou armazenadas.</Notice><p className="smalltext">Na operação real, gestores deverão receber somente resultados agrupados, sujeitos aos controles de privacidade.</p><p role="status">{answered} pergunta(s) respondida(s){current === null ? ' · concluído' : ''}</p><button className="btn secondary" onClick={restart}>Reiniciar conversa</button></Panel></div>
    <div className="phone-wrap"><section className="phone" aria-label="Simulador de conversa"><div className="phone-head"><b>ConectaBem</b><small>Simulação · nenhuma integração ativa</small></div><div className="chat" ref={chat} role="log" aria-live="polite" aria-relevant="additions text">
      <div className="bubble">Olá! Vamos testar a pesquisa: {survey.title}.</div>
      {messages.map((message, index) => <div className={`bubble${message.mine ? ' mine' : ''}`} key={index}>{message.text}</div>)}
      {typing ? <div className="bubble">Digitando…</div> : question ? <><div className="bubble">{question.text}</div>{question.kind === 'choice' && <div className="choices">{question.choices?.map(item => <button className="choice" key={item.value} onClick={() => answer(item.value, item.label)}>{item.label}</button>)}</div>}</> : <div className="bubble">Obrigado por participar! Pesquisa de demonstração concluída. Nenhuma resposta foi salva.</div>}
    </div><form className="chat-foot" onSubmit={send}><label className="sr-only" htmlFor="chat-answer">Resposta curta</label><input id="chat-answer" value={text} onChange={event => setText(event.target.value)} disabled={question?.kind !== 'text' || typing} maxLength={240} placeholder={question?.kind === 'text' ? 'Sugestão opcional…' : 'Escolha uma opção acima'} /><button type="submit" disabled={question?.kind !== 'text' || typing}>Enviar</button>{question?.optional && !typing && <button type="button" onClick={() => answer('', 'Pular')}>Pular</button>}</form></section></div>
    {error && <p className="error-message" role="alert">{error}</p>}
  </div>;
}
