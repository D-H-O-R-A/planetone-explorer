import { Coins, Compass, Clock, Wallet, ExternalLink, ShieldCheck } from "lucide-react";

export const EcosystemFaq = () => {
  const steps = [
    {
      num: "01",
      title: "O Que é o VERDE?",
      desc: (
        <span>
          O token <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">VERDE</strong> representa digitalmente a posse ecológica e conservação florestal ativa na blockchain Planet One. Cada token assegura a manutenção física do solo.
        </span>
      ),
      icon: Coins,
    },
    {
      num: "02",
      title: "De Onde Vem o Lastro?",
      desc: (
        <span>
          Cada token é rigidamente respaldado por <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">1 m² de terra real</strong> georreferenciada e demarcada na gleba <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">Rio Luna II</strong> (Beruri, Amazonas - Matrícula Nº 598). O suprimento do token é estritamente limitado à área registrada em cartório.
        </span>
      ),
      icon: Compass,
    },
    {
      num: "03",
      title: "Staking de 10 Anos",
      desc: (
        <span>
          Mantendo seus tokens em staking em{" "}
          <a
            href="https://wallet.planetone.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-0.5"
          >
            wallet.planetone.io <ExternalLink className="w-3 h-3 inline" />
          </a>{" "}
          para preservação ativa, a biomassa gera créditos de carbono de alta qualidade ao longo de um ciclo de <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">10 anos</strong>.
        </span>
      ),
      icon: Clock,
    },
    {
      num: "04",
      title: "Saque & Acompanhamento",
      desc: (
        <span>
          Os créditos gerados são disponibilizados de forma <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">gradativa</strong>. Você pode resgatar seus créditos continuamente e acompanhar tudo diretamente na{" "}
          <a
            href="https://wallet.planetone.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold inline-flex items-center gap-0.5"
          >
            wallet.planetone.io <ExternalLink className="w-3 h-3 inline" />
          </a>.
        </span>
      ),
      icon: Wallet,
    },
  ];

  return (
    <div className="bg-card text-card-foreground p-6 md:p-8 border border-border rounded-xl space-y-6 mt-6 shadow-sm relative overflow-hidden">
      <div className="border-b border-border pb-4">
        <h2 className="text-sm md:text-base font-bold uppercase tracking-wider flex items-center gap-2 text-foreground">
          <ShieldCheck className="w-5 h-5 text-emerald-500 animate-pulse" />
          <span>Ecossistema do Token VERDE & Staking</span>
        </h2>
        <p className="text-[11px] md:text-xs text-muted-foreground mt-1">
          Como a tecnologia blockchain e a preservação florestal se unem para criar o ativo de preservação e créditos de carbono da Planet One.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div 
              key={idx} 
              className="space-y-3 flex flex-col justify-between h-full bg-slate-50 dark:bg-slate-900/40 p-5 rounded-lg border border-border hover:border-emerald-500/20 dark:hover:border-emerald-400/20 transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-muted-foreground/50">
                    {step.num}
                  </span>
                  <div className="p-1.5 bg-background border border-border rounded-md">
                    <Icon className="w-4 h-4 text-emerald-500" />
                  </div>
                </div>
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wide">
                  {step.title}
                </h3>
                <p className="text-[11px] text-muted-foreground leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export default EcosystemFaq;
