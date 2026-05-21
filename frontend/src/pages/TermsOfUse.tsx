// src/pages/TermsOfUse.tsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';
import { PGBALogo } from '../components/pgba/PGBALogo';
import { ThemeToggle } from '../components/pgba/ThemeToggle';
import { Shield, Mail, ChevronLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
} as const;

export default function TermsOfUse() {
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
              <span className="text-xs font-bold uppercase tracking-wider">Contrato de Uso</span>
            </div>
            <h1 className={`text-3xl md:text-4xl font-bold ${dc('text-white', 'text-slate-900')}`}>
              Termos de Uso
            </h1>
            <p className={`text-lg ${dc('text-slate-400', 'text-slate-600')}`}>
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>

          {/* Seções */}
          <article className={`space-y-8 p-6 md:p-8 rounded-2xl border ${
            dc('bg-slate-900/30 border-slate-800/50', 'bg-white border-slate-200')
          }`}>
            
            {/* 1. Aceitação dos Termos */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>1. Aceitação dos Termos</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Ao acessar e utilizar o site <code className={`px-1.5 py-0.5 rounded text-xs ${dc('bg-slate-800', 'bg-slate-100')}`}>pgbasolutions.com.br</code> 
                ("Site") e/ou contratar serviços da <strong>PGBA Solutions Technologies</strong> 
                ("Empresa", "nós" ou "nosso"), você declara que:
              </p>
              <ul className={`mt-4 list-disc list-inside space-y-1 ml-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li>Leu, compreendeu e concorda integralmente com estes Termos de Uso</li>
                <li>Possui capacidade legal para celebrar contratos (maior de 18 anos ou representado legalmente)</li>
                <li>Utilizará nossos serviços apenas para fins lícitos e em conformidade com a legislação brasileira</li>
              </ul>
              <p className={`mt-4 text-sm italic ${dc('text-slate-400', 'text-slate-500')}`}>
                Caso não concorde com qualquer disposição destes Termos, solicite a interrupção 
                do uso do Site e/ou serviços imediatamente.
              </p>
            </section>

            {/* 2. Descrição dos Serviços */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>2. Descrição dos Serviços</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                A PGBA Solutions Technologies oferece soluções tecnológicas sob medida, incluindo:
              </p>
              <ul className={`mt-4 space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>BI & Arquitetura de Dados:</strong> Pipelines ETL, dashboards executivos, modelagem de dados</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Automação de Processos (RPA):</strong> Scripts Python, workflows inteligentes, integrações via API</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Software & IA Sob Medida:</strong> Desenvolvimento fullstack, SaaS internos, integração de modelos de IA</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>IoT & Sistemas Kiosk:</strong> Vending machines inteligentes, painéis de monitoramento, sensores industriais</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Produtos Próprios:</strong> Minha Amora (gestão de estoque para consultoras) e soluções embarcadas</span>
                </li>
              </ul>
              <p className={`mt-4 text-sm ${dc('text-slate-400', 'text-slate-500')}`}>
                Detalhes específicos de escopo, prazos e valores serão definidos em proposta 
                comercial ou contrato de prestação de serviços separado.
              </p>
            </section>

            {/* 3. Obrigações do Usuário */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>3. Suas Obrigações</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Ao utilizar nossos serviços, você se compromete a:
              </p>
              <ul className={`mt-4 space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Fornecer informações verdadeiras, completas e atualizadas</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Não utilizar o Site para atividades ilícitas, fraudulentas ou que violem direitos de terceiros</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Não tentar acessar, interferir ou danificar sistemas, redes ou dados da PGBA ou de terceiros</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Não reproduzir, distribuir ou explorar comercialmente conteúdo do Site sem autorização prévia por escrito</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-emerald-500">✓</span>
                  <span>Comunicar imediatamente qualquer uso não autorizado de sua conta ou violação de segurança</span>
                </li>
              </ul>
            </section>

            {/* 4. Propriedade Intelectual */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>4. Propriedade Intelectual</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Todo o conteúdo deste Site — incluindo textos, gráficos, logotipos, ícones, 
                imagens, software, código-fonte e compilações — é de propriedade da 
                PGBA Solutions Technologies ou de seus licenciadores e está protegido 
                pelas leis de direitos autorais, marcas registradas e propriedade 
                intelectual do Brasil e tratados internacionais.
              </p>
              <p className={`mt-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>É permitido:</strong> Acessar e utilizar o Site para fins pessoais 
                e não comerciais, desde que mantidos todos os avisos de direitos autorais.
              </p>
              <p className={`mt-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>É proibido:</strong> Reproduzir, modificar, distribuir, vender, 
                alugar ou explorar comercialmente qualquer conteúdo sem autorização 
                expressa por escrito da PGBA.
              </p>
            </section>

            {/* 5. Limitação de Responsabilidade */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>5. Limitação de Responsabilidade</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                A PGBA Solutions Technologies fornece o Site e os serviços "no estado em 
                que se encontram" e "conforme disponíveis", sem garantias de qualquer 
                natureza, expressas ou implícitas.
              </p>
              <p className={`mt-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>Não nos responsabilizamos por:</strong>
              </p>
              <ul className={`mt-2 list-disc list-inside space-y-1 ml-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li>Interrupções temporárias do Site por manutenção, atualizações ou causas de força maior</li>
                <li>Danos indiretos, incidentais, especiais ou consequenciais decorrentes do uso ou impossibilidade de uso dos serviços</li>
                <li>Conteúdo de sites de terceiros acessados por links em nosso Site</li>
                <li>Decisões empresariais tomadas com base em relatórios ou análises fornecidas, que constituem suporte à decisão e não garantias de resultado</li>
              </ul>
              <p className={`mt-4 text-sm italic ${dc('text-slate-400', 'text-slate-500')}`}>
                Nossa responsabilidade total, em qualquer hipótese, limitar-se-á ao valor 
                efetivamente pago pelo serviço específico que deu origem à reclamação.
              </p>
            </section>

            {/* 6. Disponibilidade e SLA */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>6. Disponibilidade e Nível de Serviço (SLA)</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Para serviços contratados, os níveis de disponibilidade, tempos de 
                resposta e métricas de desempenho serão definidos em contrato específico 
                ou proposta comercial, conforme a natureza do projeto.
              </p>
              <p className={`mt-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                Para o Site institucional, buscamos manter disponibilidade superior a 
                99%, porém não garantimos acesso ininterrupto ou livre de erros.
              </p>
            </section>

            {/* 7. Pagamentos e Reembolsos */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>7. Pagamentos e Reembolsos</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Valores, formas de pagamento, parcelamento e condições comerciais serão 
                estabelecidos em proposta ou contrato específico para cada projeto.
              </p>
              <p className={`mt-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>Política de reembolso:</strong> Será definida caso a caso, 
                considerando o estágio de execução do serviço, custos já incorridos 
                e acordo mútuo entre as partes, sempre em conformidade com o 
                Código de Defesa do Consumidor (quando aplicável).
              </p>
            </section>

            {/* 8. Rescisão */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>8. Rescisão</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>Pela PGBA:</strong> Podemos suspender ou encerrar seu acesso ao 
                Site ou serviços, sem aviso prévio, se você violar estes Termos ou 
                praticar atos que causem dano à Empresa ou a terceiros.
              </p>
              <p className={`mt-3 ${dc('text-slate-300', 'text-slate-600')}`}>
                <strong>Pelo Usuário:</strong> Você pode solicitar o encerramento de 
                serviços contratados a qualquer momento, mediante comunicação por 
                escrito. Em casos de serviços em andamento, poderão ser aplicadas 
                multas ou cobranças proporcionais conforme contrato.
              </p>
              <p className={`mt-3 ${dc('text-slate-300', 'text-slate-600')}`}>
                Após a rescisão, suas obrigações de confidencialidade e proteção de 
                propriedade intelectual permanecem válidas.
              </p>
            </section>

            {/* 9. Lei Aplicável e Foro */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>9. Lei Aplicável e Foro</h2>
              <p className={`leading-relaxed ${dc('text-slate-300', 'text-slate-600')}`}>
                Estes Termos são regidos pelas leis da República Federativa do Brasil.
              </p>
              <p className={`mt-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                Para dirimir quaisquer controvérsias decorrentes destes Termos, as partes 
                elegem o foro da Comarca de <strong>Salvador/BA</strong>, com renúncia 
                expressa a qualquer outro, por mais privilegiado que seja.
              </p>
              <p className={`mt-3 text-sm italic ${dc('text-slate-400', 'text-slate-500')}`}>
                Caso você seja consumidor nos termos do Código de Defesa do Consumidor, 
                prevalece o foro de seu domicílio para ações judiciais.
              </p>
            </section>

            {/* 10. Disposições Gerais */}
            <section>
              <h2 className={`text-xl font-bold mb-3 ${dc('text-white', 'text-slate-900')}`}>10. Disposições Gerais</h2>
              <ul className={`space-y-2 ${dc('text-slate-300', 'text-slate-600')}`}>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Alterações:</strong> Podemos atualizar estes Termos a qualquer momento. A versão vigente será sempre publicada neste Site.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Divisibilidade:</strong> Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais permanecerão em pleno vigor.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Não renúncia:</strong> A tolerância da PGBA em relação ao descumprimento de qualquer obrigação não constitui renúncia ao direito de exigir seu cumprimento futuro.</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-500">•</span>
                  <span><strong>Contrato integral:</strong> Estes Termos, juntamente com a Política de Privacidade e eventuais contratos específicos, constituem o acordo integral entre as partes.</span>
                </li>
              </ul>
            </section>

            {/* 11. Contato */}
              <section className={`p-6 rounded-2xl border ${dc('bg-slate-800/30 border-slate-700/50', 'bg-slate-50 border-slate-200')}`}>
                <h2 className={`text-xl font-bold mb-4 ${dc('text-white', 'text-slate-900')}`}>11. Dúvidas e Contato</h2>
                <p className={`mb-4 ${dc('text-slate-300', 'text-slate-600')}`}>
                  Para questões sobre estes Termos de Uso, privacidade ou suporte técnico:
                </p>
                <a href="mailto:suporte@pgbasolutions.com.br" className={`flex items-center gap-3 p-4 rounded-xl border transition-colors ${dc('hover:bg-slate-800/50 border-slate-700/50', 'hover:bg-slate-100 border-slate-200')}`}>
                  <Mail className="w-5 h-5 text-cyan-500" />
                  <div>
                    <span className="text-sm font-medium block">suporte@pgbasolutions.com.br</span>
                    <span className={`text-xs ${dc('text-slate-400', 'text-slate-500')}`}>Resposta em até 2 dias úteis</span>
                  </div>
                </a>
              </section>

          </article>

          {/* Rodapé da Página */}
          <div className={`text-center text-sm pt-8 border-t ${dc('border-slate-800/50 text-slate-500', 'border-slate-200 text-slate-400')}`}>
            <p>© {new Date().getFullYear()} PGBA Solutions Technologies. Todos os direitos reservados.</p>
            <p className="mt-2">
              <a href="/privacidade" className="text-cyan-500 hover:underline">Política de Privacidade</a>
              {' • '}
              <a href="/" className="text-cyan-500 hover:underline">Voltar ao Site</a>
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}