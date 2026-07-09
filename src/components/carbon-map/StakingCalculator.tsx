import React, { useState } from 'react';
import { Calculator, Trees, Leaf, TrendingUp, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/button';

export const StakingCalculator = () => {
  const [verdeAmount, setVerdeAmount] = useState<number>(10000);

  // Parity / Formulas:
  // 1 VERDE = 1 m²
  // 10.000 m² = 1 hectare
  // Average Annual Sequestration: 7,50 t CO₂e / ha / year = 0,75 kg CO₂e / m² / year
  // Total 10-year Staking return: 75,00 t CO₂e / ha = 7,50 kg CO₂e / m² total
  
  const m2Area = verdeAmount;
  const hectareArea = verdeAmount / 10000;
  
  // Sequestration calculations (converted to tonnes)
  const yearlyCO2Tonnes = (m2Area * 0.75) / 1000;
  const totalCO210YearsTonnes = (m2Area * 7.50) / 1000;

  // Real world equivalencies for premium user experience
  const passengerCarsYearly = Math.round(totalCO210YearsTonnes / 4.6); // Average car emits 4.6t CO2/year
  const seedlingsGrown = Math.round(totalCO210YearsTonnes * 16.5); // Average tree seedling sequesters ~16.5kg CO2 over 10 years

  const handleQuickSelect = (amount: number) => {
    setVerdeAmount(amount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value.replace(/\D/g, '')) || 0;
    setVerdeAmount(value);
  };

  return (
    <div className="bg-card text-card-foreground border border-border rounded-xl p-5 md:p-6 shadow-sm transition-all duration-300 mt-6">
      
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-border pb-4 mb-5">
        <span className="p-1.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center">
          <Calculator className="w-5 h-5" />
        </span>
        <div>
          <h2 className="text-base font-bold uppercase tracking-tight text-foreground">
            Simulador de Rendimento & Crédito de Carbono (CC)
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Calcule o volume de créditos de carbono gerados pelo seu staking de VERDE ao longo do contrato de 10 anos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Controls */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
              Quantidade de Tokens VERDE (m²)
            </label>
            <div className="relative">
              <input
                type="text"
                value={verdeAmount.toLocaleString('pt-BR')}
                onChange={handleInputChange}
                className="w-full bg-slate-50 dark:bg-slate-900/40 text-foreground border border-border focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none rounded-lg py-3 px-4 text-base font-bold transition-all"
                placeholder="Ex: 10.000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-500 tracking-wider">
                VERDE / m²
              </span>
            </div>
          </div>

          {/* Interactive Range Slider */}
          <div className="space-y-1.5">
            <input
              type="range"
              min="1"
              max="500000"
              step="100"
              value={verdeAmount}
              onChange={(e) => setVerdeAmount(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>1 m²</span>
              <span>100.000 m² (10 ha)</span>
              <span>500.000 m² (50 ha)</span>
            </div>
          </div>

          {/* Quick preset badges */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Prescrições Rápidas de Área
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: '100 m²', value: 100 },
                { label: '1.000 m²', value: 1000 },
                { label: '10.000 m² (1 Hectare)', value: 10000 },
                { label: '50.000 m² (5 Hectares)', value: 50000 },
                { label: '100.000 m² (10 Hectares)', value: 100000 },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleQuickSelect(preset.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                    verdeAmount === preset.value
                      ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-sm'
                      : 'border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theoretical rule note */}
          <div className="bg-slate-50 dark:bg-slate-900/40 border border-border rounded-xl p-4 text-[11px] leading-relaxed text-muted-foreground space-y-1.5">
            <p className="font-bold text-foreground flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
              <Leaf className="w-4 h-4 text-emerald-500" />
              Entenda o cálculo de paridade
            </p>
            <p>
              • <strong>1 Token VERDE</strong> equivale a exatamente <strong>1 m²</strong> de solo físico georreferenciado e florestado.
            </p>
            <p>
              • Cada metro quadrado de floresta preservada na gleba <strong>Rio Luna II</strong> sequestra em média <strong>0,75 kg CO₂e / ano</strong>.
            </p>
            <p>
              • Ao realizar o stake por <strong>10 anos</strong>, você recebe o resgate total de <strong>7,50 kg CO₂e por m²</strong> (equivalente a 75 toneladas de CO₂e por hectare inteiro).
            </p>
          </div>
        </div>

        {/* Right Side: Visual Metrics Dashboard */}
        <div className="lg:col-span-6 bg-slate-50 dark:bg-slate-900/40 rounded-xl p-4 md:p-5 border border-border space-y-5">
          
          <h3 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span>Retorno de Staking Projetado</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* m2 area card */}
            <div className="bg-card text-card-foreground p-3.5 border border-border rounded-lg space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Área Sob Custódia</span>
              <p className="text-base font-bold text-foreground">
                {m2Area.toLocaleString('pt-BR')} m²
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Equivale a {hectareArea.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} Hectares
              </p>
            </div>

            {/* Annual Return card */}
            <div className="bg-card text-card-foreground p-3.5 border border-border rounded-lg space-y-1 shadow-sm">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Sequestro de CO₂e Anual</span>
              <p className="text-base font-bold text-foreground">
                {yearlyCO2Tonnes.toLocaleString('pt-BR', { minimumFractionDigits: 3, maximumFractionDigits: 3 })} t CO₂e / ano
              </p>
              <p className="text-[10px] text-muted-foreground">
                Mapeado em m²: {(m2Area * 0.75).toLocaleString('pt-BR')} kg CO₂e
              </p>
            </div>

          </div>

          {/* Main 10 year total stake reward */}
          <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/25 rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                Retorno Total de Carbono (10 anos)
              </span>
              <p className="text-2xl md:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {totalCO210YearsTonnes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} t CO₂e
              </p>
              <p className="text-xs text-muted-foreground">
                Volume acumulado resgatável em Créditos de Carbono
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground font-semibold block uppercase">Equivalência por m²</span>
              <span className="text-sm font-bold text-foreground">
                {(m2Area * 7.50).toLocaleString('pt-BR')} kg CO₂e
              </span>
            </div>
          </div>

          {/* Social Impact / Real equivalency visual indicators */}
          <div className="space-y-3 pt-3 border-t border-border">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Impacto Ecológico Deste Rendimento
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border">
                <Trees className="w-8 h-8 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground">
                    +{seedlingsGrown.toLocaleString('pt-BR')} mudas
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    De árvores crescendo por 10 anos em ambiente protegido.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 bg-card p-3 rounded-lg border border-border">
                <svg className="w-8 h-8 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <div>
                  <p className="font-bold text-foreground">
                    {passengerCarsYearly.toLocaleString('pt-BR')} carros
                  </p>
                  <p className="text-[10px] text-muted-foreground leading-snug">
                    Fora das estradas pelo período médio de um ano inteiro.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
export default StakingCalculator;
