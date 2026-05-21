// src/pages/PrivacyPolicy.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { PGBALogo } from '../components/pgba/PGBALogo';
import { ThemeToggle } from '../components/pgba/ThemeToggle';
import { Shield, Mail, Phone, MapPin, ExternalLink, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const;

export default function PrivacyPolicy() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';
  const toggleTheme = () => setTheme(isDark ? 'light' : 'dark');

  const dc = (dark: string, light: string) => (isDark ? dark : light);

  return (
    <div className={`min-h-screen font-outfit transition-colors duration-500 ${
      dc('bg-slate-950 text-slate-50', 'bg-slate-50 text-slate-900')
    }`}>
      {/* Header Minimalista */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-xl ${
        dc('border-slate-800/50 bg-slate-950/80', 'border-slate-200/50 bg-white/80')
      }`}>
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-medium hover:text-cyan-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
            Voltar ao site
          </a>
          <div className="flex items-center gap-4">
            <ThemeToggle isDarkMode={isDark} onToggle={toggleTheme} />
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="space-y-8"
        >
          {/* Header da Página */}
          <div className="text-center space-y-4">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${
              dc('bg-slate-900/50 border-slate-800 text-cyan-400', 'bg-slate-100 border-slate-200 text-cyan-600')
            }`}>
              <Shield className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">LGPD • Lei 13.709/2018</span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold ${dc('text-white', 'text-slate-900')}`}>
              Política de Privacidade
            </h1>
            <p className={`text-lg ${dc('text-slate-400', 'text-slate-600')}`}>
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Seções */}
          <article className={`space-y-8 p-6 md:p-8 rounded-2xl border ${
            dc('bg-slate-900/30 border-slate-800/50', 'bg-white border-slate-200')
          }`}>
            
            {/* 1. Introdução */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>1. Introdução</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                A <strong>PGBA Solutions Technologies</strong> ("nós", "nosso" ou "empresa"), 
                inscrita no CNPJ sob o nº XX.XXX.XXX/XXXX-XX, com sede em Salvador/BA, 
                respeita sua privacidade e está comprometida com a proteção de seus 
                dados pessoais, em conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD)</strong> 
                (Lei nº 13.709/2018) e demais normas aplicáveis.
              </p>
              <p className={`mt-4 leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Esta Política descreve como coletamos, usamos, armazenamos e protegemos 
                suas informações quando você acessa nosso site <code className={`px-1.5 py-0.5 rounded text-xs ${dc('bg-slate-800', 'bg-slate-100')}`}>pgbasolutions.com.br</code> 
                ou utiliza nossos serviços.
              </p>
            </section>

            {/* 2. Controlador de Dados */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>2. Controlador dos Dados</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Nos termos da LGPD, a PGBA Solutions Technologies atua como 
                <strong> Controladora</strong> dos dados pessoais coletados por meio 
                deste site e de nossos serviços.
              </p>
              <div className={`mt-4 p-4 rounded-xl border ${dc('bg-slate-800/30 border-slate-700/50', 'bg-slate-50 border-slate-200')}`}>
                <p className={`text-sm ${dc('text-slate-300', 'text-slate-600')}`}>
                  <strong>Encarregado pelo Tratamento de Dados (DPO):</strong><br />
                  <a href="mailto:suporte@pgbasolutions.com.br" className="text-cyan-500 hover:underline">
                    suporte@pgbasolutions.com.br
                  </a>
                </p>
              </div>
            </section>

            {/* 3. Dados Coletados */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>3. Quais Dados Coletamos</h2>
              
              <h3 className={`font-semibold mb-2 ${dc('text-white', 'text-slate-800')}`}>3.1. Dados fornecidos por você:</h3>
              <ul className={`list-disc list-inside space-y-1 ml-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li>Nome e sobrenome</li>
                <li>Endereço de e-mail corporativo ou pessoal</li>
                <li>Telefone para contato</li>
                <li>Empresa e cargo (quando aplicável)</li>
                <li>Mensagens e solicitações enviadas por formulários</li>
              </ul>

              <h3 className={`font-semibold mt-6 mb-2 ${dc('text-white', 'text-slate-800')}`}>3.2. Dados coletados automaticamente:</h3>
              <ul className={`list-disc list-inside space-y-1 ml-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li>Endereço IP (anonimizado)</li>
                <li>Tipo de navegador e dispositivo</li>
                <li>Páginas visitadas e tempo de navegação</li>
                <li>Origem do acesso (referenciador)</li>
                <li>Cookies e tecnologias similares (com seu consentimento)</li>
              </ul>

              <p className={`mt-4 text-sm italic ${dc('text-slate-400', 'text-slate-500')}`}>
                ⚠️ <strong>Não coletamos</strong> dados sensíveis (origem racial, opinião política, 
                saúde, vida sexual, biometria) nem dados de crianças sem consentimento dos pais.
              </p>
            </section>

            {/* 4. Finalidades do Tratamento */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>4. Para que Usamos seus Dados</h2>
              <ul className={`space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Responder a suas solicitações de contato, orçamento ou suporte</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Melhorar a experiência de navegação e performance do site</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Enviar comunicações relevantes sobre nossos serviços (apenas com consentimento)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Cumprir obrigações legais e regulatórias</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Prevenir fraudes e garantir a segurança de nossos sistemas</span>
                </li>
              </ul>
            </section>

            {/* 5. Base Legal (LGPD Art. 7) */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>5. Base Legal para o Tratamento</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Tratamos seus dados pessoais com base nas seguintes hipóteses legais 
                previstas no <strong>Art. 7º da LGPD</strong>:
              </p>
              <ul className={`mt-4 space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Consentimento:</strong> Para cookies de analytics e envio de comunicações de marketing</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Execução de contrato:</strong> Para prestar serviços solicitados por você</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Legítimo interesse:</strong> Para segurança, prevenção de fraudes e melhoria de serviços</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span><strong>Cumprimento de obrigação legal:</strong> Para atender requisitos regulatórios</span>
                </li>
              </ul>
            </section>

            {/* 6. Compartilhamento de Dados */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>6. Com quem Compartilhamos seus Dados</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>Não vendemos, alugamos ou comercializamos</strong> seus dados pessoais. 
                Podemos compartilhá-los apenas nas seguintes situações:
              </p>
              <ul className={`mt-4 space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Prestadores de serviços:</strong> Hospedagem (Vercel), analytics (Google), e-mail (provedor corporativo), sempre com contratos de confidencialidade</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Autoridades públicas:</strong> Quando exigido por lei, ordem judicial ou requisição de órgão competente</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Reorganização societária:</strong> Em caso de fusão, aquisição ou venda de ativos, com garantia de continuidade das proteções da LGPD</span>
                </li>
              </ul>
            </section>

            {/* 7. Transferência Internacional */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>7. Transferência Internacional de Dados</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Alguns de nossos prestadores de serviço (ex: Google Analytics, Vercel) 
                podem processar dados em servidores localizados fora do Brasil. 
                Nestes casos, garantimos que:
              </p>
              <ul className={`mt-4 list-disc list-inside space-y-1 ml-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li>O país de destino possui legislação adequada de proteção de dados, OU</li>
                <li>Foram adotadas cláusulas contratuais padrão aprovadas pela ANPD, OU</li>
                <li>O tratamento é necessário para execução de contrato ou exercício regular de direitos</li>
              </ul>
            </section>

            {/* 8. Retenção de Dados */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>8. Por quanto tempo Guardamos seus Dados</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Mantemos seus dados pessoais apenas pelo tempo necessário para:
              </p>
              <ul className={`mt-4 space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Cumprir a finalidade para a qual foram coletados</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Atender a obrigações legais ou regulatórias</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span>Exercer o direito de defesa em processos judiciais ou administrativos</span>
                </li>
              </ul>
              <p className={`mt-4 text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                Após esses prazos, os dados são anonimizados ou eliminados de forma segura.
              </p>
            </section>

            {/* 9. Seus Direitos (Art. 18 LGPD) */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>9. Seus Direitos como Titular</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Nos termos do <strong>Art. 18 da LGPD</strong>, você tem direito a:
              </p>
              <ul className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-3`}>
                {[
                  'Confirmação da existência de tratamento',
                  'Acesso aos dados armazenados',
                  'Correção de dados incompletos ou desatualizados',
                  'Anonimização, bloqueio ou eliminação de dados desnecessários',
                  'Portabilidade dos dados a outro fornecedor',
                  'Eliminação dos dados tratados com consentimento',
                  'Informação sobre entidades com quem compartilhamos dados',
                  'Informação sobre a possibilidade de não consentir e consequências',
                  'Revogação do consentimento a qualquer momento',
                ].map((right, i) => (
                  <li key={i} className={`flex items-start gap-2 p-3 rounded-lg ${dc('bg-slate-800/30', 'bg-slate-50')}`}>
                    <span className="text-emerald-500 mt-0.5">✓</span>
                    <span className={`text-sm ${dc('text-slate-300', 'text-slate-600')}`}>{right}</span>
                  </li>
                ))}
              </ul>
              <p className={`mt-4 text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                Para exercer seus direitos, entre em contato com nosso Encarregado (DPO): 
                  <a href="mailto:suporte@pgbasolutions.com.br" className="text-cyan-500 hover:underline">
                    suporte@pgbasolutions.com.br
                  </a>
              </p>
            </section>

            {/* 10. Cookies e Tecnologias Similares */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>10. Cookies e Tecnologias de Rastreamento</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Utilizamos cookies para melhorar sua experiência. Você pode gerenciar 
                suas preferências a qualquer momento através do banner de consentimento 
                em nosso site.
              </p>
              <div className={`mt-4 overflow-x-auto`}>
                <table className={`w-full text-sm border-collapse ${dc('text-slate-300', 'text-slate-600')}`}>
                  <thead>
                    <tr className={dc('border-b border-slate-700', 'border-b border-slate-200')}>
                      <th className="text-left py-2 px-3 font-semibold">Tipo</th>
                      <th className="text-left py-2 px-3 font-semibold">Finalidade</th>
                      <th className="text-left py-2 px-3 font-semibold">Duração</th>
                      <th className="text-left py-2 px-3 font-semibold">Consentimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className={dc('border-b border-slate-800/50', 'border-b border-slate-100')}>
                      <td className="py-2 px-3">Estritamente Necessários</td>
                      <td className="py-2 px-3">Funcionamento básico do site</td>
                      <td className="py-2 px-3">Sessão</td>
                      <td className="py-2 px-3 text-emerald-500 font-medium">Não necessário</td>
                    </tr>
                    <tr className={dc('border-b border-slate-800/50', 'border-b border-slate-100')}>
                      <td className="py-2 px-3">Analytics (GA4)</td>
                      <td className="py-2 px-3">Medir tráfego e melhorar conteúdo</td>
                      <td className="py-2 px-3">Até 24 meses</td>
                      <td className="py-2 px-3 text-cyan-500 font-medium">Necessário</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-3">Preferências</td>
                      <td className="py-2 px-3">Lembrar configurações do usuário</td>
                      <td className="py-2 px-3">Até 12 meses</td>
                      <td className="py-2 px-3 text-cyan-500 font-medium">Necessário</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* 11. Segurança */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>11. Medidas de Segurança</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Adotamos medidas técnicas e organizacionais apropriadas para proteger 
                seus dados contra acesso não autorizado, perda, alteração ou divulgação, 
                incluindo:
              </p>
              <ul className={`mt-4 list-disc list-inside space-y-1 ml-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li>Criptografia de dados em trânsito (HTTPS/TLS)</li>
                <li>Controle de acesso baseado em função (RBAC)</li>
                <li>Monitoramento contínuo de segurança</li>
                <li>Treinamento de equipe em proteção de dados</li>
                <li>Políticas internas de confidencialidade</li>
              </ul>
            </section>

            {/* 12. Alterações nesta Política */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>12. Alterações nesta Política</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Podemos atualizar esta Política periodicamente para refletir mudanças 
                em nossos serviços ou na legislação. A versão mais recente estará 
                sempre disponível em <code className={`px-1.5 py-0.5 rounded text-xs ${dc('bg-slate-800', 'bg-slate-100')}`}>pgbasolutions.com.br/privacidade</code>, 
                com a data de última atualização no topo desta página.
              </p>
              <p className={`mt-3 text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                Alterações materiais serão comunicadas por e-mail ou aviso destacado 
                em nosso site com antecedência razoável.
              </p>
            </section>

            {/* 13. Contato */}
            <section className={`p-6 rounded-2xl border ${dc('bg-slate-800/30 border-slate-700/50', 'bg-slate-50 border-slate-200')}`}>
              <h2 className={`text-xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>13. Fale Conosco</h2>
              <p className={`mb-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                Para exercer seus direitos, tirar dúvidas sobre esta Política ou 
                reportar incidentes de segurança, entre em contato com nosso 
                Encarregado pelo Tratamento de Dados (DPO):
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    
                <a href="mailto:suporte@pgbasolutions.com.br" className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${dc('hover:bg-slate-800/50 border-slate-700/50', 'hover:bg-slate-100 border-slate-200')}`}>
                  <Mail className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm font-medium">suporte@pgbasolutions.com.br</span>
                </a>
                <div className={`flex items-center gap-3 p-4 rounded-xl border ${dc('border-slate-700/50', 'border-slate-200')}`}>
                  <MapPin className="w-5 h-5 text-cyan-500" />
                  <span className="text-sm">Salvador, Bahia — Brasil</span>
                </div>
              </div>
            </section>

          </article>

          {/* Rodapé da Página */}
          <div className={`text-center text-sm pt-8 border-t ${dc('border-slate-800/50 text-slate-500', 'border-slate-200 text-slate-400')}`}>
            <p>© {new Date().getFullYear()} PGBA Solutions Technologies. Todos os direitos reservados.</p>
            <p className="mt-2">
              <a href="/termos" className="text-cyan-500 hover:underline">Termos de Uso</a>
              {' • '}
              <a href="/" className="text-cyan-500 hover:underline">Voltar ao Site</a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}