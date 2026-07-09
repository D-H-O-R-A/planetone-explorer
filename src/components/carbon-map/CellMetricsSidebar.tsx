import { Info, Trees, Coins } from "lucide-react";

interface GridCell {
  x: number;
  z: number;
  height: number;
  carbonOffsetYearly: number; // kg CO2/year
  carbonOffset10Years: number; // kg CO2/10 years
  soilMoisture: number;
  biomass: number;
  serial: string;
  species: string;
  utmE: number;
  utmN: number;
  isInsidePolygon: boolean;
}

interface CellMetricsSidebarProps {
  selectedCell: GridCell | null;
}

export const CellMetricsSidebar = ({ selectedCell }: CellMetricsSidebarProps) => {
  return (
    <div className="bg-card text-card-foreground p-4 md:p-5 h-full flex flex-col justify-between border border-border rounded-xl shadow-sm text-xs">
      <div>
        <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-foreground">
            <Info className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span>Dados do Lote em Foco</span>
          </h3>
        </div>

        {selectedCell && selectedCell.isInsidePolygon ? (
          <div className="space-y-4">
            {/* Custody Serial */}
            <div className="bg-slate-50 dark:bg-slate-900/40 p-3 rounded-lg border border-border space-y-1">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Serial Único de Custódia</p>
              <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">{selectedCell.serial}</p>
            </div>

            {/* Geolocation specs - permanently showing both m2 and hectare units */}
            <div className="space-y-2">
              <div className="flex justify-between py-1 border-b border-border text-[11px]">
                <span className="text-muted-foreground">UTM Leste (X)</span>
                <span className="font-semibold text-foreground">{selectedCell.utmE}.00 m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border text-[11px]">
                <span className="text-muted-foreground">UTM Norte (Y)</span>
                <span className="font-semibold text-foreground">{selectedCell.utmN}.00 m</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border text-[11px]">
                <span className="text-muted-foreground">Lote Referência</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-right">1 m² / 1 ha</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border text-[11px]">
                <span className="text-muted-foreground">Biomassa Estimada</span>
                <span className="font-semibold text-foreground">
                  {(selectedCell.biomass * 0.01).toFixed(2)} t/ha ({selectedCell.biomass} g/m²)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-border text-[11px]">
                <span className="text-muted-foreground">Espécie Dominante</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[155px]" title={selectedCell.species}>
                  {selectedCell.species}
                </span>
              </div>
            </div>

            {/* Scientific calculations showing both m2 and hectare metrics permanently side-by-side */}
            <div className="space-y-3 pt-3 border-t border-border text-[11px]">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sequestro Anual</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-right text-xs">
                    {((selectedCell.carbonOffsetYearly) * 10).toFixed(2)} t CO₂e / ha / ano
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-right">
                  Mapeado em m²: {selectedCell.carbonOffsetYearly.toFixed(3)} kg CO₂e / m² / ano
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full"
                    style={{ width: `${(selectedCell.carbonOffsetYearly / 1.0) * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Retorno Stake (10 Anos)</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-right text-xs">
                    {((selectedCell.carbonOffset10Years) * 10).toFixed(2)} t CO₂e / ha
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground text-right">
                  Mapeado em m²: {selectedCell.carbonOffset10Years.toFixed(2)} kg CO₂e / m²
                </p>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded overflow-hidden">
                  <div 
                    className="bg-emerald-400 h-full"
                    style={{ width: `${(selectedCell.carbonOffset10Years / 10.0) * 100}%` }}
                  />
                </div>
              </div>

              {/* Staking mechanics explanation */}
              <div className="bg-slate-50 dark:bg-slate-900/40 border border-border rounded-lg p-2.5 text-[10px] leading-relaxed text-muted-foreground space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1 uppercase text-[9px] tracking-wider">
                  <Coins className="w-3.5 h-3.5 text-emerald-500" />
                  Lastro Físico e Rendimento
                </p>
                <p>
                  • 1 VERDE representa permanentemente o lastro físico de exatamente 1,00 m² de solo.
                </p>
                <p>
                  • O staking ativo resgata o equivalente a 7,50 kg CO₂e por token ao longo de 10 anos (paridade: 75,00 t CO₂e por hectare).
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <Trees className="w-8 h-8 text-muted-foreground" />
            <p className="text-[10px] text-muted-foreground">Selecione qualquer ponto da reserva florestal 3D para ver as especificações cartográficas e lastro.</p>
          </div>
        )}
      </div>

      {/* Baseline metrics */}
      <div className="border-t border-border pt-3 mt-4 text-[10px] text-muted-foreground space-y-1">
        <div className="flex justify-between">
          <span>MATRÍCULA INCRA:</span>
          <span className="text-foreground font-semibold">Matrícula 598</span>
        </div>
        <div className="flex justify-between">
          <span>POLÍGONO ORIGEM:</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Rio Luna II (Beruri / AM)</span>
        </div>
      </div>
    </div>
  );
};
export default CellMetricsSidebar;
