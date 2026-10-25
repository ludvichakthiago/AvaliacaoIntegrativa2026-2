import type { Choice, Question, SurveyDefinition } from './engine';

function choice(id: string, text: string, labels: string[], next: string | null): Question {
  return { id, text, kind: 'choice', choices: labels.map(label => ({ value: label, label })), next };
}
const comment: Question = { id: 'comment', text: 'Quer deixar uma sugestão? Evite mencionar nomes, informações médicas ou outros dados pessoais.', kind: 'text', optional: true };

// A refusal skips detail questions. Shared follow-ups vary only in their destination,
// keeping partial attendance, absence and future intent as separate experiences.
function barriers(next: string): readonly Choice[] {
  return [
    { value: 'time', label: 'Horário incompatível', next: 'period' },
    { value: 'coverage', label: 'Falta de cobertura do posto', next: 'rotation' },
    { value: 'workload', label: 'Excesso de tarefas', next: 'workload' },
    { value: 'interest', label: 'Não tenho interesse no tema', next: 'topic' },
    { value: 'private', label: 'Motivo pessoal', next },
    { value: 'other', label: 'Outro motivo', next },
    { value: 'skip', label: 'Prefiro não responder', next },
  ];
}

function followUps(next: string): Question[] {
  return [
    choice('period', 'Em qual momento do seu turno seria mais viável participar?', ['No início do turno', 'No meio do turno', 'No fim do turno', 'Depende da escala', 'Não sei', 'Prefiro não responder'], next),
    choice('rotation', 'Um revezamento no posto ajudaria você a participar?', ['Sim', 'Talvez', 'Não', 'Não sei', 'Prefiro não responder'], next),
    choice('workload', 'O que ajudaria a conciliar as tarefas e a participação?', ['Reservar um horário na escala', 'Redistribuir as tarefas', 'Outra medida', 'Não sei', 'Prefiro não responder'], next),
    choice('topic', 'Qual tema teria mais interesse para você em uma próxima ação?', ['Saúde física', 'Bem-estar emocional', 'Alimentação', 'Ergonomia', 'Outro tema', 'Não tenho interesse no momento', 'Prefiro não responder'], next),
  ];
}

export const surveyTemplates: readonly SurveyDefinition[] = [
  {
    id: 'evento', title: 'Pesquisa pós-evento', start: 'attendance', questions: [
      { id: 'attendance', text: 'Você conseguiu participar do evento?', kind: 'choice', choices: [
        { value: 'yes', label: 'Sim, participei', next: 'useful' },
        { value: 'partly', label: 'Participei parcialmente', next: 'partial_useful' },
        { value: 'no', label: 'Não participei', next: 'reason' },
        { value: 'skip', label: 'Prefiro não responder', next: 'comment' },
      ] },
      { id: 'useful', text: 'O conteúdo do evento foi útil para você?', kind: 'choice', choices: [
        { value: 'very', label: 'Muito útil', next: 'improve' },
        { value: 'somewhat', label: 'Um pouco útil', next: 'experience_issue' },
        { value: 'not_useful', label: 'Não foi útil', next: 'experience_issue' },
        { value: 'unsure', label: 'Não consegui avaliar', next: 'future' },
        { value: 'skip', label: 'Prefiro não responder', next: 'future' },
      ] },
      choice('improve', 'Mesmo tendo sido útil, o que poderia melhorar em próximas ações?', ['Conteúdo', 'Duração', 'Horário', 'Organização', 'Nada no momento', 'Outra melhoria', 'Prefiro não responder'], 'future'),
      choice('experience_issue', 'O que faltou para o conteúdo ser mais útil para você?', ['Um tema mais relevante', 'Exemplos mais práticos', 'Explicações mais claras', 'Mais tempo para aprofundar', 'Outro ponto', 'Não sei', 'Prefiro não responder'], 'future'),
      { id: 'partial_useful', text: 'Pensando somente na parte que acompanhou, o conteúdo foi útil para você?', kind: 'choice', next: 'partial_reason', choices: [
        { value: 'very', label: 'Muito útil' }, { value: 'somewhat', label: 'Um pouco útil' },
        { value: 'not_useful', label: 'Não foi útil' }, { value: 'unsure', label: 'Não consegui avaliar' },
        { value: 'skip', label: 'Prefiro não responder', next: 'comment' },
      ] },
      { id: 'partial_reason', text: 'Por que você acompanhou apenas parte do evento?', kind: 'choice', choices: [
        { value: 'time', label: 'Horário incompatível', next: 'partial_period' },
        { value: 'coverage', label: 'Precisei retornar ao posto', next: 'partial_rotation' },
        { value: 'workload', label: 'Precisei retomar as tarefas', next: 'partial_workload' },
        { value: 'duration', label: 'O evento foi longo para o tempo disponível', next: 'partial_duration' },
        { value: 'interest', label: 'O conteúdo não despertou meu interesse', next: 'partial_topic' },
        { value: 'communication', label: 'Recebi o aviso depois do início', next: 'partial_notice' },
        { value: 'planned', label: 'Era o tempo previsto para minha participação', next: 'comment' },
        { value: 'private', label: 'Motivo pessoal', next: 'comment' },
        { value: 'other', label: 'Outro motivo', next: 'comment' },
        { value: 'skip', label: 'Prefiro não responder', next: 'comment' },
      ] },
      ...followUps('comment').map(question => ({ ...question, id: `partial_${question.id}` })),
      choice('partial_duration', 'Qual duração caberia melhor no tempo que você tem disponível?', ['Até 15 minutos', 'De 16 a 30 minutos', 'Mais de 30 minutos', 'Depende da escala', 'Não sei', 'Prefiro não responder'], 'comment'),
      choice('partial_notice', 'O que ajudaria o aviso a chegar antes do início do evento?', ['Mais antecedência', 'Lembrete no dia anterior', 'Aviso da liderança', 'Outra forma de aviso', 'Não sei', 'Prefiro não responder'], 'comment'),
      { id: 'reason', text: 'Qual foi o principal motivo de não participar?', kind: 'choice', choices: [
        ...barriers('future'), { value: 'communication', label: 'Não recebi o aviso a tempo', next: 'notice' },
      ] },
      ...followUps('future'),
      choice('notice', 'O que ajudaria o aviso a chegar a você a tempo?', ['Mais antecedência', 'Lembrete no dia anterior', 'Aviso da liderança', 'Outra forma de aviso', 'Não sei', 'Prefiro não responder'], 'future'),
      choice('future', 'Você tem interesse em participar de futuras ações de bem-estar?', ['Sim', 'Talvez', 'Não', 'Prefiro não responder'], 'comment'), comment,
    ],
  },
  {
    id: 'interesse', title: 'Intenção de participação', start: 'intent', questions: [
      { id: 'intent', text: 'Você pretende participar do próximo evento?', kind: 'choice', choices: [
        { value: 'yes', label: 'Sim', next: 'reminder' },
        { value: 'maybe', label: 'Ainda não sei', next: 'obstacle' },
        { value: 'no', label: 'Não', next: 'decline_reason' },
        { value: 'skip', label: 'Prefiro não responder', next: 'comment' },
      ] },
      { id: 'obstacle', text: 'O que está deixando sua participação em dúvida?', kind: 'choice', choices: [...barriers('comment'), { value: 'details', label: 'Faltam informações sobre o evento', next: 'details' }] },
      { id: 'decline_reason', text: 'Se quiser informar, qual é o principal motivo de não pretender participar?', kind: 'choice', choices: [...barriers('comment'), { value: 'details', label: 'Faltam informações sobre o evento', next: 'details' }] },
      ...followUps('comment'),
      choice('details', 'Quais informações ajudariam você a decidir?', ['Data e horário', 'Local', 'Tema e atividades', 'Como participar', 'Outro detalhe', 'Prefiro não responder'], 'comment'),
      choice('reminder', 'Gostaria de receber um lembrete deste evento? Esta escolha é apenas uma simulação.', ['Sim', 'Não', 'Prefiro não responder'], 'comment'), comment,
    ],
  },
  {
    id: 'comunicacao', title: 'Avaliação de comunicação', start: 'timely', questions: [
      { id: 'timely', text: 'Você recebeu a informação a tempo de se organizar?', kind: 'choice', choices: [
        { value: 'on_time', label: 'Sim, recebi a tempo', next: 'clear' },
        { value: 'late', label: 'Recebi, mas tarde demais', next: 'delivery' },
        { value: 'not_received', label: 'Não recebi a informação', next: 'delivery' },
        { value: 'unsure', label: 'Não me lembro', next: 'channel' },
        { value: 'skip', label: 'Prefiro não responder', next: 'channel' },
      ] },
      choice('delivery', 'O que ajudaria a informação a chegar a você a tempo?', ['Avisar com mais antecedência', 'Enviar um lembrete', 'Reforçar o aviso pela liderança', 'Outra medida', 'Não sei', 'Prefiro não responder'], 'channel'),
      { id: 'clear', text: 'A mensagem deixou claro o que aconteceria, quando e onde?', kind: 'choice', choices: [
        { value: 'yes', label: 'Sim', next: 'channel' },
        { value: 'partly', label: 'Parcialmente', next: 'clarity_help' },
        { value: 'no', label: 'Não', next: 'clarity_help' },
        { value: 'unsure', label: 'Não consegui avaliar', next: 'channel' },
        { value: 'skip', label: 'Prefiro não responder', next: 'channel' },
      ] },
      choice('clarity_help', 'Qual informação precisaria ficar mais clara?', ['O objetivo da ação', 'A data e o horário', 'O local', 'Como participar', 'Outro ponto', 'Prefiro não responder'], 'channel'),
      choice('channel', 'Por qual meio você prefere receber os próximos avisos?', ['Mensagem no WhatsApp', 'Aviso da liderança', 'Mural da unidade', 'Outro meio', 'Não tenho preferência', 'Prefiro não responder'], 'comment'), comment,
    ],
  },
];
