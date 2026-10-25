import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

export default function PrivacyPage() {
  return <main className="legal"><div className="legal-toolbar"><Link href="/">← Voltar à central</Link><ThemeToggle /></div><h1>Aviso de privacidade</h1>
    <p className="notice">Minuta inicial sujeita à revisão jurídica. Este ambiente é uma demonstração e não está pronto para receber dados reais de colaboradores.</p>
    <h2>Como funciona a demonstração</h2><p>Os indicadores são fictícios. Eventos e rascunhos ficam no armazenamento local deste navegador até serem removidos nas configurações do navegador. Não há rotina automática de retenção desses registros. Os convites podem ser copiados para envio manual pelo próprio usuário, fora da plataforma. As respostas no simulador ficam somente em memória e são descartadas ao reiniciar, trocar de modelo ou sair da simulação.</p>
    <h2>Finalidades e dados previstos</h2><p>A operação futura utilizará dados mínimos de contato para comunicações autorizadas, separados do conteúdo das pesquisas. As pesquisas serão voluntárias. Evite inserir nomes, informações médicas ou outros dados pessoais nos comentários e testes.</p>
    <h2>Apresentação de resultados</h2><p>A operação futura deverá apresentar aos gestores apenas resultados agrupados, com tamanho mínimo de grupo, restrições de filtros e avaliação de identificação indireta. Esses controles ainda não estão implementados. A remoção de telefone ou nome, por si só, não comprova anonimização.</p>
    <h2>Retenção e direitos</h2><p>O plano prevê controle de participação separado, com retenção inicial proposta de 30 dias após o encerramento da campanha, configurável e sujeita à revisão. Prazos para contatos e respostas, bases legais, responsabilidades e mecanismos de atendimento aos direitos dos titulares ainda precisam ser definidos. Respostas sem vínculo de identidade poderão ter limitações técnicas de localização.</p>
    <h2>Mensagens e contato</h2><p>Não há envio de WhatsApp neste ambiente. Antes de operar, será necessário disponibilizar cancelamento de mensagens, identificar o controlador e publicar o canal de contato do responsável pela privacidade. O canal ainda não foi informado e esta minuta não deve ser usada como aviso definitivo de produção.</p>
    <h2>Limites do produto</h2><p>A ConectaBem apoia engajamento e oportunidades de melhoria. Não substitui avaliações técnicas de riscos ocupacionais, o PGR ou obrigações relacionadas à NR-01.</p>
  </main>;
}
