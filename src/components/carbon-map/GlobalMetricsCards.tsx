import { useState, useEffect } from "react";
import { Compass, Coins, Trees, Sparkles } from "lucide-react";
import { fetchAssetDetails } from "@/services/api";

export const GlobalMetricsCards = () => {
  const [verdeSupply, setVerdeSupply] = useState<string>("Carregando...");

  useEffect(() => {
    const getSupply = async () => {
      try {
        const details = await fetchAssetDetails("AAyf6hiqW17aivtcdY34eFx2GobqnkdSx4Pj5U8S5nfk");
        if (details && details.quantity) {
          const supply = details.quantity / Math.pow(10, details.decimals || 4);
          setVerdeSupply(`${supply.toLocaleString('pt-BR')} VERDE`);
        } else {
          setVerdeSupply("0 VERDE");
        }
      } catch (err) {
        console.error("Error loading dynamic VERDE supply:", err);
        setVerdeSupply("Erro ao carregar");
      }
    };
    getSupply();
  }, []);

  const items = [
    { 
      title: "ÁREA PRESERVADA (MAPA 1)", 
      value: "115.368,87 ha", 
      sub: "1.153.688.786 m² • Gleba Rio Luna II (Beruri/AM)", 
      icon: Compass 
    },
    { 
      title: "SUPRIMENTO EMITIDO DE VERDE", 
      value: verdeSupply, 
      sub: "Proporção rígida: 1 VERDE = 1 m² de lastro físico", 
      icon: Coins 
    },
    { 
      title: "SEQUESTRO ANUAL MÉDIO",
      value: "7,50 t CO₂e / ha / ano", 
      sub: "Média florestal homologada • Total: 865.266 t/ano", 
      icon: Trees 
    },
    { 
      title: "RETORNO DE STAKE (10 ANOS)", 
      value: "75,00 t CO₂e / ha", 
      sub: "Equivale a 7,50 kg CO₂e / m² • Resgate gradativo", 
      icon: Sparkles 
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
      {items.map((item, index) => (
        <div key={index} className="bg-card text-card-foreground p-4 border border-border hover:border-emerald-500/25 dark:hover:border-emerald-400/25 rounded-xl relative overflow-hidden flex flex-col justify-between transition-all duration-300 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{item.title}</p>
            <item.icon className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <p className="text-sm sm:text-base font-bold text-foreground">{item.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};
export default GlobalMetricsCards;
