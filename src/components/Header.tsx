import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { isTestnet, getChainId } from '@/lib/utils';
import SearchForm from './SearchForm';
import WalletSection from './WalletSection';
import NavigationLinks from './NavigationLinks';
import SocialLinks from './SocialLinks';
import { NodeSettingsDialog } from './NodeSettingsDialog';
import { useTheme } from '@/components/ThemeProvider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { 
  Sun, 
  Moon, 
  Menu, 
  ChevronRight, 
  ChevronDown,
  Database,
  Box,
  ArrowRightLeft,
  FileCode,
  Sparkles,
  Trees,
  Coins,
  Network,
  RefreshCw,
  Droplet,
  Trophy,
  Cpu
} from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<string | null>(null);
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Close menu on navigation change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const currentIsTestnet = isTestnet();
  const chainId = getChainId();

  const toggleMobileSection = (section: string) => {
    setActiveMobileSection(activeMobileSection === section ? null : section);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const mobileCategories = [
    {
      id: 'blockchain',
      label: "Blockchain",
      icon: Database,
      items: [
        { label: "Blocos Recentes", path: "/blocks", icon: Box },
        { label: "Transações", path: "/transactions", icon: ArrowRightLeft },
        { label: "Contratos Ride", path: "/contracts", icon: FileCode },
        { label: "Ranking de Endereços", path: "/ranking", icon: Trophy }
      ]
    },
    {
      id: 'ecosystem',
      label: "Ecossistema",
      icon: Sparkles,
      items: [
        { label: "VERDE MAPS", path: "/carbon-map", icon: Trees },
        { label: "Token VERDE", path: "/tokenplanet/VERDE", icon: Coins }
      ]
    },
    {
      id: 'network',
      label: "Rede & Nós",
      icon: Network,
      items: [
        { label: "Status da Rede", path: "/nodes", icon: Network },
        { label: "Nós Validadores", path: "/validators", icon: Cpu }
      ]
    },
    {
      id: 'tools',
      label: "Ferramentas",
      icon: RefreshCw,
      items: [
        { label: "Address Converter", path: "/address-converter", icon: RefreshCw },
        { label: "Matcher API (Docs)", path: "https://matcher.planetone.io/api-docs/index.html", icon: RefreshCw, isExternal: true },
        ...(currentIsTestnet ? [{ label: "Testnet Faucet", path: "/faucet", icon: Droplet }] : [])
      ]
    }
  ];

  return (
    <header className="w-full bg-background border-b border-border sticky top-0 z-[200] shadow-sm">
      <div className="container mx-auto px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo and Chain Info - Left */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative">
                <img 
                  src="/img/logo.jpg" 
                  alt="Planet One Logo" 
                  className="w-9 h-9 object-contain rounded-full transition-transform duration-300 group-hover:rotate-[10deg] filter drop-shadow-[0_0_8px_rgba(16,185,129,0.3)]"
                />
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-glow-sm"></div>
              </div>
              <div className="flex-shrink-0">
                <p className="text-[9px] text-muted-foreground font-mono tracking-widest leading-none">
                  CHAIN ID: {chainId}
                  {currentIsTestnet && <span className="text-orange-500 ml-1 font-semibold">(Testnet)</span>}
                </p>
                <h1 className="text-sm font-extrabold tracking-wider text-foreground leading-tight uppercase mt-0.5 font-mono">
                  Planet One <span className="text-emerald-500">Explorer</span>
                </h1>
              </div>
            </Link>
          </div>
          
          {/* Search Bar - Center (Desktop only) */}
          <div className="flex-1 max-w-lg mx-6 hidden md:block">
            <SearchForm />
          </div>
          
          {/* Actions - Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* RPC Settings Dialog (Desktop only) */}
            <div className="hidden lg:block">
              <NodeSettingsDialog />
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 hover:text-emerald-500 transition-all duration-200 flex items-center justify-center"
              title={`Alternar para modo ${theme === 'dark' ? 'claro' : 'escuro'}`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-500 animate-pulse" />
              ) : (
                <Moon className="w-4 h-4 text-emerald-600" />
              )}
            </button>

            {/* Wallet Section (Desktop only) */}
            <div className="hidden md:block">
              <WalletSection />
            </div>

            {/* Mobile Menu Toggle Button */}
            <button 
              onClick={() => setIsMenuOpen(true)}
              className="md:hidden p-2 rounded-lg bg-muted border border-border text-foreground hover:bg-muted/80 active:scale-95 transition-all duration-200 flex items-center justify-center"
              aria-label="Open Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Desktop Lower Sub-Navbar (Links and Socials) */}
        <div className="hidden md:flex items-center justify-between mt-3 pt-2.5 border-t border-border/40">
          <div className="flex-1">
            <NavigationLinks />
          </div>
          <div className="flex-shrink-0 border-l border-border/40 pl-3">
            <SocialLinks />
          </div>
        </div>

      </div>

      {/* Mobile Drawer using Radix-UI Native Sheet */}
      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent 
          side="right" 
          className="w-[85vw] sm:max-w-md bg-background border-l border-border p-5 overflow-y-auto flex flex-col justify-between z-[999] h-full"
        >
          <div className="space-y-5">
            <SheetHeader className="pb-2 border-b border-border">
              <SheetTitle className="text-left text-sm font-extrabold tracking-wider text-foreground leading-tight uppercase font-mono">
                Planet One <span className="text-emerald-500">Menu</span>
              </SheetTitle>
            </SheetHeader>

            {/* Search Form inside drawer */}
            <div className="w-full pt-1">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 pl-1">Busca Rápida</p>
              <SearchForm />
            </div>

            {/* Accordion Categories */}
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-2 pl-1">Navegação da Blockchain</p>
              
              {mobileCategories.map((cat) => {
                const isSectionActive = activeMobileSection === cat.id;
                const CatIcon = cat.icon;

                return (
                  <div key={cat.id} className="border border-border/60 rounded-xl overflow-hidden bg-card">
                    <button
                      onClick={() => toggleMobileSection(cat.id)}
                      className="w-full flex items-center justify-between p-3 text-sm font-semibold text-foreground hover:bg-muted/50 transition-all"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-muted text-emerald-500">
                          <CatIcon className="w-4 h-4" />
                        </span>
                        <span>{cat.label}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-muted-foreground ${isSectionActive ? 'rotate-180 text-emerald-500' : ''}`} />
                    </button>

                    {isSectionActive && (
                      <div className="bg-muted/30 border-t border-border/30 p-1.5 space-y-1">
                        {cat.items.map((item, idx) => {
                          const ItemIcon = item.icon;
                          const isItemActive = !item.isExternal && isActive(item.path);

                          if (item.isExternal) {
                            return (
                              <a
                                key={idx}
                                href={item.path}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold transition-all text-foreground/90 hover:bg-muted/80"
                              >
                                <span className="p-1 rounded-md bg-slate-500/10">
                                  <ItemIcon className="w-3.5 h-3.5" />
                                </span>
                                <span className="flex items-center gap-1">
                                  {item.label}
                                  <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                </span>
                              </a>
                            );
                          }

                          return (
                            <Link
                              key={idx}
                              to={item.path}
                              onClick={() => setIsMenuOpen(false)}
                              className={`flex items-center gap-2.5 p-2 rounded-lg text-xs font-semibold transition-all ${
                                isItemActive
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : 'text-foreground/90 hover:bg-muted/80'
                              }`}
                            >
                              <span className={`p-1 rounded-md ${isItemActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/10'}`}>
                                <ItemIcon className="w-3.5 h-3.5" />
                              </span>
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Settings & RPC block */}
            <div className="border border-border/60 rounded-xl p-3 bg-card space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Configuração de Rede</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/80">Configurações de RPC & Nós</span>
                <NodeSettingsDialog />
              </div>
            </div>

            {/* Wallet Section Block */}
            <div className="border border-border/60 rounded-xl p-3 bg-card space-y-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Conectar Carteira</p>
              <WalletSection />
            </div>
          </div>

          {/* Social Links inside drawer bottom */}
          <div className="pt-6 border-t border-border/40 flex flex-col items-center gap-3 mt-6">
            <SocialLinks />
            <p className="text-[9px] text-muted-foreground">© 2026 Planet One. Todos os direitos reservados.</p>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default Header;
