import React, { useState } from 'react';
import { YearPeriodBreakdown } from '../types';
import { Table, Calendar, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface YearBreakdownTableProps {
  breakdown: YearPeriodBreakdown[];
}

export const YearBreakdownTable: React.FC<YearBreakdownTableProps> = ({ breakdown }) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-xs">
            <Table className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Detali kaupimo suvestinė pagal darbo metus
            </h2>
            <p className="text-xs text-slate-500">
              Apskaita atliekama už kiekvienus darbo metus atskirai pagal LR DK 127 str.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowFormulaDetails(!showFormulaDetails)}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1 self-start sm:self-auto cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Kaip skaičiuojama formulė?</span>
          {showFormulaDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Formula explanation helper */}
      {showFormulaDetails && (
        <div className="bg-indigo-50/50 p-4 border-b border-indigo-100 text-xs text-slate-700 space-y-1.5 animate-in fade-in duration-150">
          <div className="font-bold text-indigo-900">
            LR Darbo kodekso ir BĮ „Skaitlis“ skaičiavimo formulė:
          </div>
          <p className="leading-relaxed">
            Sukauptos atostogų dienos už periodą ={' '}
            <code className="bg-white px-1.5 py-0.5 rounded font-mono text-indigo-800 border border-indigo-200">
              (Faktinės kalendorinės dienos - Neįskaitomos dienos) / (Dienų skaičius metuose 365/366) × Metinė norma
            </code>
          </p>
          <p className="text-slate-500">
            Darbo metai prasideda nuo priėmimo į darbą datos. Pasibaigus darbo metams, pradedami kiti darbo metai.
            Jei skaičiavimo data nesutampa su darbo metų pabaiga, einamasis periodas skaičiuojamas proporcingai.
          </p>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-3.5">Darbo metai</th>
              <th className="py-3 px-3">Kalend. d.</th>
              <th className="py-3 px-3">Neįskaitoma</th>
              <th className="py-3 px-3">Metų norma</th>
              <th className="py-3 px-3 text-right">Sukaupta</th>
              <th className="py-3 px-3 text-right">Panaudota</th>
              <th className="py-3 px-3 text-right">Periodo likutis</th>
              <th className="py-3 px-3.5 text-right font-black text-indigo-950">
                Kaupiamasis likutis
              </th>
              <th className="py-3 px-3">3 m. terminas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {breakdown.map((row) => (
              <tr
                key={row.periodIndex}
                className={`transition-colors ${
                  row.isCurrentPeriod ? 'bg-indigo-50/40 font-medium' : 'hover:bg-slate-50'
                }`}
              >
                {/* Period label */}
                <td className="py-3 px-3.5 whitespace-nowrap">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{row.periodIndex}-ieji m.:</span>
                    <span className="text-slate-600 font-normal">{row.label}</span>
                    {row.isCurrentPeriod && (
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded">
                        Einamasis
                      </span>
                    )}
                  </div>
                </td>

                {/* Calendar days */}
                <td className="py-3 px-3 text-slate-600">
                  {row.calendarDaysInPeriod} k.d.
                </td>

                {/* Non accrual */}
                <td className="py-3 px-3">
                  {row.nonAccrualDays > 0 ? (
                    <span className="text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded">
                      -{row.nonAccrualDays} k.d.
                    </span>
                  ) : (
                    <span className="text-slate-400">0</span>
                  )}
                </td>

                {/* Annual entitlement */}
                <td className="py-3 px-3 text-slate-700">
                  {row.annualEntitlement} d.d.
                </td>

                {/* Accrued in period */}
                <td className="py-3 px-3 text-right font-bold text-slate-800">
                  +{row.accruedDays.toFixed(2)}
                </td>

                {/* Used in period */}
                <td className="py-3 px-3 text-right text-amber-800 font-semibold">
                  -{row.usedDays.toFixed(2)}
                </td>

                {/* Period balance */}
                <td className="py-3 px-3 text-right">
                  <span
                    className={`font-semibold px-1.5 py-0.5 rounded ${
                      row.balanceForPeriod >= 0
                        ? 'text-emerald-800 bg-emerald-50'
                        : 'text-rose-700 bg-rose-50'
                    }`}
                  >
                    {row.balanceForPeriod > 0 ? '+' : ''}
                    {row.balanceForPeriod.toFixed(2)}
                  </span>
                </td>

                {/* Cumulative balance */}
                <td className="py-3 px-3.5 text-right font-black text-indigo-900 text-sm">
                  {row.cumulativeBalance.toFixed(2)} d.d.
                </td>

                {/* Expiration date */}
                <td className="py-3 px-3 whitespace-nowrap">
                  {row.hasExpired ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      <AlertCircle className="w-3 h-3 text-rose-500" />
                      Terminas suėjo ({row.expirationDate})
                    </span>
                  ) : row.isExpiringSoon ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Iki {row.expirationDate}
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">
                      Galioja iki {row.expirationDate}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
