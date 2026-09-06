import React, { useState } from 'react';
import { CalculationResult } from '../types';
import { Calculator, Euro, ChevronDown, ChevronUp, Info, HelpCircle } from 'lucide-react';

interface CompensationCalculatorProps {
  result: CalculationResult;
  dailyVdu?: number;
  monthlySalary?: number;
  onUpdateVdu: (vdu: number) => void;
  onUpdateSalary: (salary: number) => void;
}

export const CompensationCalculator: React.FC<CompensationCalculatorProps> = ({
  result,
  dailyVdu,
  monthlySalary,
  onUpdateVdu,
  onUpdateSalary,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [calcMethod, setCalcMethod] = useState<'daily' | 'salary'>('daily');

  // Input state for 3 months calculation
  const [m1, setM1] = useState<string>('');
  const [m2, setM2] = useState<string>('');
  const [m3, setM3] = useState<string>('');
  const [daysWorked, setDaysWorked] = useState<string>('63'); // ~21 d.d. * 3 mėn.

  const handleComputeFromMonths = () => {
    const totalSalary = (parseFloat(m1) || 0) + (parseFloat(m2) || 0) + (parseFloat(m3) || 0);
    const totalDays = parseFloat(daysWorked) || 1;
    if (totalSalary > 0 && totalDays > 0) {
      const vdu = Math.round((totalSalary / totalDays) * 100) / 100;
      onUpdateVdu(vdu);
    }
  };

  const comp = result.compensation;
  const balanceDays = Math.max(0, result.finalBalanceDays);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        id="toggle-compensation-btn"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-5 sm:p-6 flex items-center justify-between text-left hover:bg-slate-50/70 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-xs">
            <Euro className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-800">
                Kompensacijos už nepanaudotas atostogas skaičiuoklė
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                Atleidimo atveju
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Pagal LR DK 127 str. 6 d. kompensacija išmokama nutraukiant darbo sutartį pagal darbuotojo VDU
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {comp && (
            <div className="text-right hidden sm:block">
              <div className="text-xs text-slate-500">Priskaičiuota (Bruto):</div>
              <div className="text-base font-extrabold text-emerald-700">
                {comp.grossAmount.toLocaleString('lt-LT', { minimumFractionDigits: 2 })} €
              </div>
            </div>
          )}
          <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
            {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600" /> : <ChevronDown className="w-5 h-5 text-indigo-600" />}
          </div>
        </div>
      </button>

      {/* Accordion content */}
      {isOpen && (
        <div className="p-5 sm:p-6 border-t border-slate-100 space-y-5 animate-in fade-in duration-150">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
            <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
            <p>
              Kasmetines atostogas pakeisti pinigine kompensacija draudžiama, išskyrus atvejus, kai nutraukiama darbo sutartis.
              Kompensacijos dydis lygus darbuotojo 1 darbo dienos vidutiniam darbo užmokesčiui (VDU), padaugintam iš nepanaudotų atostogų darbo dienų skaičiaus.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input column */}
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Vidutinio darbo užmokesčio (VDU) nustatymas:
              </div>

              {/* Method tabs */}
              <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold border border-slate-200/80">
                <button
                  type="button"
                  id="vdu-mode-direct"
                  onClick={() => setCalcMethod('daily')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    calcMethod === 'daily'
                      ? 'bg-white text-indigo-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Žinomas 1 d.d. VDU (€)
                </button>
                <button
                  type="button"
                  id="vdu-mode-months"
                  onClick={() => setCalcMethod('salary')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    calcMethod === 'salary'
                      ? 'bg-white text-indigo-900 shadow-xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Iš 3 mėn. DU
                </button>
              </div>

              {calcMethod === 'daily' ? (
                <div>
                  <label
                    htmlFor="daily-vdu-input"
                    className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
                  >
                    1 darbo dienos VDU (Bruto):
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      id="daily-vdu-input"
                      step="0.01"
                      min="0"
                      value={dailyVdu ?? ''}
                      onChange={(e) => onUpdateVdu(parseFloat(e.target.value) || 0)}
                      placeholder="pvz., 85.00"
                      className="w-full pl-3 pr-8 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    />
                    <span className="absolute right-3 top-2.5 text-sm font-bold text-slate-400">€</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Pedagogų VDU pateikiamas buhalteriniame atsiskaitymo lapelyje.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label htmlFor="m1-salary" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        1-as mėn. (€)
                      </label>
                      <input
                        type="number"
                        id="m1-salary"
                        placeholder="1800"
                        value={m1}
                        onChange={(e) => setM1(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="m2-salary" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        2-as mėn. (€)
                      </label>
                      <input
                        type="number"
                        id="m2-salary"
                        placeholder="1800"
                        value={m2}
                        onChange={(e) => setM2(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div>
                      <label htmlFor="m3-salary" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        3-as mėn. (€)
                      </label>
                      <input
                        type="number"
                        id="m3-salary"
                        placeholder="1800"
                        value={m3}
                        onChange={(e) => setM3(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-1/2">
                      <label htmlFor="days-worked-3m" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                        Dirbta d.d. per 3 mėn.:
                      </label>
                      <input
                        type="number"
                        id="days-worked-3m"
                        value={daysWorked}
                        onChange={(e) => setDaysWorked(e.target.value)}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                    <div className="w-1/2 pt-4">
                      <button
                        type="button"
                        id="calculate-vdu-btn"
                        onClick={handleComputeFromMonths}
                        className="w-full py-2 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer shadow-xs"
                      >
                        Apskaičiuoti VDU
                      </button>
                    </div>
                  </div>

                  {dailyVdu && dailyVdu > 0 && (
                    <div className="text-xs text-emerald-800 font-bold bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                      Gautas VDU: <strong>{dailyVdu.toFixed(2)} € / d.d.</strong>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Output results card */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                  Apskaičiuota kompensacija ({balanceDays.toFixed(2)} d.d.):
                </div>

                {comp ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                      <span className="text-slate-600 font-medium">
                        Priskaičiuota suma (Bruto):
                      </span>
                      <span className="text-base font-extrabold text-slate-900">
                        {comp.grossAmount.toLocaleString('lt-LT', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Gyventojų pajamų mokestis (GPM ~20%):</span>
                      <span className="font-semibold text-slate-700">
                        -{comp.estimatedGpm.toLocaleString('lt-LT', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Sodra (darbuotojo pensijų ir soc. dr. ~19.5%):</span>
                      <span className="font-semibold text-slate-700">
                        -{comp.estimatedSodra.toLocaleString('lt-LT', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">
                        Išmokama suma į rankas (Neto):
                      </span>
                      <span className="text-lg font-black text-emerald-700">
                        ~{comp.netAmount.toLocaleString('lt-LT', { minimumFractionDigits: 2 })} €
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 italic py-4">
                    Įveskite 1 d.d. VDU tarifą aukščiau, kad pamatytumėte preliminarią kompensacijos sumą.
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-400">
                * Tikslų mokesčių dydį (įskaitant papildomą pensijų kaupimą bei taikomą NPD) nustato buhalterija pagal galiojančius teisės aktus.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
