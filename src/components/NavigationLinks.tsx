import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ChevronDown, 
  Box, 
  ArrowRightLeft, 
  FileCode, 
  Trees, 
  Coins, 
  Network, 
  RefreshCw, 
  Droplet,
  Sparkles,
  Database,
  Trophy,
  Cpu
} from 'lucide-react';
import { isTestnet } from '@/lib/utils';

export const NavigationLinks = () => {
  const location = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const timeoutRef = React.useRef<any>(null);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const currentIsTestnet = isTestnet();

  const categories = {
    blockchain: {
      label: "Blockchain",
      icon: Database,
      items: [
        {
          label: "Blocos Recentes",
          sub: "Consulte os últimos blocos minerados",
          path: "/blocks",
          icon: Box
        },
        {
          label: "Transações",
          sub: "Monitore transferências em tempo real",
          path: "/transactions",
          icon: ArrowRightLeft
        },
        {
          label: "Contratos Ride",
          sub: "Visualize dApps e scripts ativos",
          path: "/contracts",
          icon: FileCode
        },
        {
          label: "Ranking de Endereços",
          sub: "Consulte as maiores contas e distribuição de PLO",
          path: "/ranking",
          icon: Trophy
        }
      ]
    },
    ecosystem: {
      label: "Ecossistema",
      icon: Sparkles,
      items: [
        {
          label: "VERDE MAPS",
          sub: "Mapa 3D interativo & Staking real",
          path: "/carbon-map",
          icon: Trees
        },
        {
          label: "Token VERDE",
          sub: "Dados de fornecimento e lastro físico",
          path: "/tokenplanet/VERDE",
          icon: Coins
        }
      ]
    },
    network: {
      label: "Rede & Nós",
      icon: Network,
      items: [
        {
          label: "Status da Rede",
          sub: "Status de nós, peers e distribuição",
          path: "/nodes",
          icon: Network
        },
        {
          label: "Nós Validadores",
          sub: "Métricas de produção de blocos dos validadores",
          path: "/validators",
          icon: Cpu
        }
      ]
    },
    tools: {
      label: "Ferramentas",
      icon: RefreshCw,
      items: [
        {
          label: "Address Converter",
          sub: "Conversor de endereços PLO e EVM",
          path: "/address-converter",
          icon: RefreshCw
        },
        {
          label: "Matcher API",
          sub: "Documentação oficial da API do Matcher",
          path: "https://matcher.planetone.io/api-docs/index.html",
          icon: RefreshCw,
          isExternal: true
        },
        ...(currentIsTestnet ? [{
          label: "Testnet Faucet",
          sub: "Solicite fundos gratuitos de teste",
          path: "/faucet",
          icon: Droplet
        }] : [])
      ]
    }
  };

  return (
    <div className="flex items-center gap-1.5 md:gap-2">
      
      {/* Home Button */}
      <Link 
        to="/" 
        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
          isActive('/') 
            ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/10' 
            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        Dashboard
      </Link>

      {/* Dropdowns */}
      {Object.entries(categories).map(([key, cat]) => {
        const isOpen = activeDropdown === key;
        const CatIcon = cat.icon;
        
        // Check if any sub-item is active
        const isCatActive = cat.items.some(item => !item.isExternal && isActive(item.path));

        return (
          <div 
            key={key} 
            className="relative"
            onMouseEnter={() => handleMouseEnter(key)}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className={`flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all outline-none ${
                isCatActive
                  ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <CatIcon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu Panel with Continuous Hover Wrap */}
            {isOpen && (
              <div className="absolute top-full left-0 pt-2 w-72 z-[100] animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="bg-card text-card-foreground border border-border rounded-xl shadow-lg p-2 space-y-0.5">
                  {cat.items.map((item, idx) => {
                    const ItemIcon = item.icon;
                    const itemActive = !item.isExternal && isActive(item.path);

                    if (item.isExternal) {
                      return (
                        <a
                          key={idx}
                          href={item.path}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-start gap-3 p-2.5 rounded-lg transition-all hover:bg-muted text-foreground"
                        >
                          <span className="p-1.5 rounded-md bg-slate-500/10 text-muted-foreground">
                            <ItemIcon className="w-4 h-4" />
                          </span>
                          <div>
                            <p className="text-xs font-bold flex items-center gap-1">
                              {item.label}
                              <span className="text-[9px] px-1 py-0.5 rounded bg-muted-foreground/10 text-muted-foreground font-normal">Docs</span>
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{item.sub}</p>
                          </div>
                        </a>
                      );
                    }

                    return (
                      <Link
                        key={idx}
                        to={item.path}
                        className={`flex items-start gap-3 p-2.5 rounded-lg transition-all ${
                          itemActive
                            ? 'bg-emerald-500/10 text-emerald-500 font-semibold'
                            : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <span className={`p-1.5 rounded-md ${
                          itemActive ? 'bg-emerald-500/20 text-emerald-500' : 'bg-slate-500/10 text-muted-foreground'
                        }`}>
                          <ItemIcon className="w-4 h-4" />
                        </span>
                        <div>
                          <p className="text-xs font-bold">{item.label}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">{item.sub}</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
};

export default NavigationLinks;