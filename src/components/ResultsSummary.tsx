import React from 'react';
import { CalculationResult, WorkWeekDays } from '../types';
import {
  Clock,
  CalendarCheck,
  CalendarX,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ResultsSummaryProps {
  result: CalculationResult;
  workWeek: WorkWeekDays;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({ result, workWeek }) => {
  const isNegative = result.finalBalanceDays < 0;

  // Convert working days to equivalent full weeks
  const weeksEquivalent = (result.finalBalanceDays / (workWeek === 5 ? 5 : 6)).toFixed(1);

  return (
    <div className="space-y-4">
      {/* Bento Grid Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Bento Box: Priklauso per metus */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-center transition-all hover:border-slate-300">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Priklauso per metus
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-slate-800">
              {result.annualNormDays.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">d.d.</span>
          </div>
          <span className="text-slate-400 text-xs mt-1.5 italic">
            {result.baseAnnualDays} bazinė {result.tenureBonusDays > 0 ? `+ ${result.tenureBonusDays} stažas` : 'darbo dienų'}
          </span>
        </div>

        {/* 2. Bento Box: Išnaudota (Orange highlight border) */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-center border-l-4 border-l-orange-400 transition-all hover:border-slate-300">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Išnaudota atostogų
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-orange-500">
              {result.totalUsedDays.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-orange-400">d.d.</span>
          </div>
          <span className="text-slate-400 text-xs mt-1.5 italic">
            nuo apskaitos pradžios
          </span>
        </div>

        {/* 3. Bento Box: Iš viso sukaupta */}
        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-5 flex flex-col justify-center transition-all hover:border-slate-300">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
            Iš viso sukaupta
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-4xl font-black text-slate-800">
              {result.totalAccruedDays.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-slate-400">d.d.</span>
          </div>
          <span className="text-slate-400 text-xs mt-1.5 italic">
            už {result.activeCalendarDays} k.d. stažą
          </span>
        </div>

        {/* 4. Bento Box: Hero Dabartinis likutis (Signature Deep Indigo / Blue) */}
        <div
          className={`rounded-2xl p-5 flex flex-col justify-center shadow-md transition-all ${
            isNegative
              ? 'bg-rose-700 text-white shadow-rose-100'
              : 'bg-indigo-600 text-white shadow-indigo-100'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
              Dabartinis likutis
            </span>
            <Clock className="w-4 h-4 text-indigo-200/80" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black tracking-tight">
              {result.finalBalanceDays.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-indigo-200">d.d.</span>
          </div>

          <span className="text-indigo-200 text-xs mt-1.5 italic flex items-center justify-between">
            <span>~{weeksEquivalent} pilnų savaičių</span>
            {result.breakdown.length > 0 && (
              <span className="opacity-90">
                iki {result.breakdown[result.breakdown.length - 1].endDate}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Expiration Risk Warning (DK 127 str. 5 d. - 3 years rule) */}
      {result.expiringDaysWarning && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300/80 text-amber-900 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-sm block mb-0.5">
              Dėmesio: Rizika prarasti sukauptas atostogas pagal LR DK 127 str. 5 d.
            </span>
            Pagal Darbo kodeksą teisė pasinaudoti atostogomis prarandama praėjus 3 metams nuo kalendorinių metų,
            kuriais buvo įgyta teisė į atostogas, pabaigos. Šiuo metu yra <strong>{result.expiringDaysWarning.daysAtRisk} d.d.</strong>, 
            kurių terminas baigiasi arba sueina iki <strong>{result.expiringDaysWarning.expireDate}</strong>.
            Rekomenduojama suderinti atostogų grafiką su progimnazijos vadovybe.
          </div>
        </div>
      )}

      {/* Negative Balance Warning (Avansas) */}
      {isNegative && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-300 text-red-900 flex items-start gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-sm block mb-0.5">
              Neigiamas atostogų likutis (Atostogų avansas)
            </span>
            Darbuotojas yra panaudojęs {Math.abs(result.finalBalanceDays).toFixed(2)} d.d. daugiau, nei faktiškai sukaupė iki skaičiavimo datos.
            Nutraukiant darbo sutartį, už neišdirbtas atostogų dienas pagal DK gali būti atliekamos išskaitos iš darbo užmokesčio.
          </div>
        </div>
      )}
    </div>
  );
};
