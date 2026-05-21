// Estrutura mínima para conformidade LGPD
export default function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold mb-8">Política de Privacidade</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">1. Coleta de Dados</h2>
        <p className="text-slate-600">
          Coletamos apenas dados anonimizados de navegação (páginas visitadas, 
          tempo de sessão) via Google Analytics 4, exclusivamente com seu consentimento.
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">2. Finalidade</h2>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Melhorar a experiência de navegação no site</li>
          <li>Entender quais conteúdos são mais relevantes</li>
          <li>Otimizar performance e corrigir erros técnicos</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">3. Seus Direitos (Art. 18 LGPD)</h2>
        <p className="text-slate-600 mb-3">
          Você pode, a qualquer momento:
        </p>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          <li>Confirmar a existência de tratamento de dados</li>
          <li>Solicitar a exclusão dos dados coletados</li>
          <li>Revogar seu consentimento (via banner de cookies)</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-3">4. Contato do Encarregado (DPO)</h2>
        <p className="text-slate-600">
          Para exercer seus direitos, entre em contato: 
          <a href="mailto:privacidade@pgbasolutions.com.br" className="text-cyan-500 hover:underline">
            {' '}privacidade@pgbasolutions.com.br
          </a>
        </p>
      </section>
    </div>
  );
}