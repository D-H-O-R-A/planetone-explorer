import { Link } from 'react-router-dom';
import { 
  Github, 
  Twitter, 
  MessageSquare, 
  Instagram, 
  ExternalLink, 
  Leaf, 
  Cpu, 
  Compass, 
  Network, 
  ArrowUpRight 
} from 'lucide-react';
import { isTestnet, getChainId, getCoinName } from '@/lib/utils';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const testnet = isTestnet();
  const chainId = getChainId();
  const coinName = getCoinName();

  const socialLinks = [
    { id: 'telegram', url: 'https://t.me/', icon: MessageSquare, label: 'Telegram' },
    { id: 'twitter', url: 'https://x.com/', icon: Twitter, label: 'X (Twitter)' },
    { id: 'instagram', url: 'https://www.instagram.com/planetone_oficial', icon: Instagram, label: 'Instagram' },
    { id: 'github', url: 'https://github.com/', icon: Github, label: 'GitHub' }
  ];

  return (
    <footer className="relative w-full mt-12 md:mt-16 bg-gradient-to-b from-background/30 via-muted/30 to-muted/80 dark:from-background/10 dark:via-slate-950/40 dark:to-slate-950 border-t border-border/80 backdrop-blur-xl shadow-2xl overflow-hidden">
      {/* Absolute futuristic ambient glow effects */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 relative z-10">
        {/* Top Section: Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-border/40">
          
          {/* Brand & Mission (5 cols) */}
          <div className="md:col-span-12 lg:col-span-5 flex flex-col space-y-5">
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-300" />
                <img
                  src="/img/logo.jpg"
                  alt="Planet One Logo"
                  className="relative w-10 h-10 md:w-11 md:h-11 object-contain rounded-full border border-emerald-500/20 shadow-md"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold font-mono tracking-wider text-foreground dark:text-white uppercase">
                  Planet One
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Eco-friendly Blockchain
                </span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md">
              O ecossistema descentralizado de alta performance que redefine a infraestrutura de ativos verdes e créditos de carbono. Planet One combina eficiência Web3 com sustentabilidade ambiental com pegada de carbono zero.
            </p>

            {/* Social Icons row */}
            <div className="flex items-center gap-3 pt-2">
              {socialLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-background/50 hover:bg-emerald-500/10 border border-border/60 hover:border-emerald-500/30 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-300 shadow-sm hover:shadow-emerald-500/5 hover:-translate-y-0.5"
                    title={link.label}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Sections (7 cols divided) */}
          <div className="md:col-span-12 lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-8">
            
            {/* Quick Links Column */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
                <Compass className="h-4 w-4 text-emerald-500" />
                <span>Navegação</span>
              </div>
              <ul className="flex flex-col space-y-2.5 text-xs md:text-sm font-medium">
                <li>
                  <Link to="/blocks" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                    <span>Blocos Ledger</span>
                  </Link>
                </li>
                <li>
                  <Link to="/transactions" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                    <span>Transações</span>
                  </Link>
                </li>
                <li>
                  <Link to="/nodes" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                    <span>Configuração de Nós</span>
                  </Link>
                </li>
                <li>
                  <Link to="/ranking" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                    <span>Raking de Tokens</span>
                  </Link>
                </li>
                <li>
                  <Link to="/address-converter" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                    <span>Conversor de Endereço</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Ecosystem Column */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
                <Leaf className="h-4 w-4 text-emerald-500" />
                <span>Ecosistema</span>
              </div>
              <ul className="flex flex-col space-y-2.5 text-xs md:text-sm font-medium">
                <li>
                  <a href="https://planetone.io" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span>Website Oficial</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="https://wallet.planetone.io" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span>Planet One Wallet</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <Link to="/carbon-map" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                    <span>VERDE MAPS</span>
                  </Link>
                </li>
                {testnet && (
                  <li>
                    <Link to="/faucet" className="group flex items-center gap-1.5 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                      <span className="h-1 w-1 rounded-full bg-border group-hover:bg-emerald-500 transition-colors" />
                      <span>Faucet de Testnet</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Developers Column */}
            <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-2 text-foreground font-bold text-sm uppercase tracking-wider">
                <Cpu className="h-4 w-4 text-emerald-500" />
                <span>Desenvolvedores</span>
              </div>
              <ul className="flex flex-col space-y-2.5 text-xs md:text-sm font-medium">
                <li>
                  <a href="https://nodes.planetone.io/api-docs/index.html" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span>Node Swagger API</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
                <li>
                  <a href="https://matcher.planetone.io/api-docs/index.html" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-1 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 transition-all duration-200 transform hover:translate-x-1">
                    <span>Matcher Rest API</span>
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Section: Copyright, Credits & Network Badge */}
        <div className="mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Copyright Planet One */}
          <div className="flex flex-col items-center md:items-start space-y-1 text-center md:text-left">
            <p className="text-xs text-muted-foreground dark:text-gray-400 font-medium">
              &copy; {currentYear} <span className="text-foreground font-semibold">Planet One</span>. All rights reserved.
            </p>
            <p className="text-[10px] text-muted-foreground/80 leading-normal">
              A sustentabilidade se une à blockchain. Criando soluções para o amanhã de forma descentralizada.
            </p>
          </div>

          {/* Developed By Better2better */}
          <div className="flex items-center">
            <a
              href="https://better2better.net"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/10 hover:border-emerald-500/20 transition-all duration-300 shadow-sm hover:shadow-emerald-500/5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:-translate-y-0.5"
            >
              <span>Developed By</span>
              <span className="bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent group-hover:underline">
                Better2better
              </span>
              <ExternalLink className="h-3 w-3 text-emerald-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Network Specs badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border border-border/80 text-[10px] md:text-xs font-mono font-bold text-muted-foreground shadow-sm">
              <Network className="h-3 w-3 text-emerald-500" />
              <span>ChainID: <span className="text-primary">{chainId}</span></span>
              <span className="text-border">|</span>
              <span className="text-emerald-500 uppercase">{testnet ? 'Testnet' : 'Mainnet'}</span>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};

export default Footer;
