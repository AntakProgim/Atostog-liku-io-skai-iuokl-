import React, { useState } from 'react';
import { EmployeeData, PositionType, WorkWeekDays, NonAccrualPeriod } from '../types';
import { getBaseAnnualEntitlement, calculateTenureBonusDays } from '../utils/calculator';
import { getCalendarDaysInclusive } from '../utils/holidays';
import {
  User,
  Briefcase,
  Calendar,
  Award,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';

interface CalculatorFormProps {
  data: EmployeeData;
  onChange: (data: EmployeeData) => void;
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({ data, onChange }) => {
  const [showNonAccrualSection, setShowNonAccrualSection] = useState(
    data.nonAccrualPeriods && data.nonAccrualPeriods.length > 0
  );

  // New non-accrual period state
  const [naStart, setNaStart] = useState('');
  const [naEnd, setNaEnd] = useState('');
  const [naReason, setNaReason] = useState<NonAccrualPeriod['reason']>('vpa');
  const [naDesc, setNaDesc] = useState('');

  const baseDays = getBaseAnnualEntitlement(
    data.positionType,
    data.workWeek,
    data.customAnnualDays
  );

  const tenureDays = data.addTenureDays
    ? calculateTenureBonusDays(data.tenureYearsInSchool || 0)
    : (data.customTenureBonusDays || 0);

  const totalAnnualNorm = baseDays + tenureDays;

  const handleUpdate = (patch: Partial<EmployeeData>) => {
    onChange({ ...data, ...patch });
  };

  const handleAddNonAccrual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!naStart || !naEnd || new Date(naStart) > new Date(naEnd)) return;

    const days = getCalendarDaysInclusive(naStart, naEnd);
    const newNa: NonAccrualPeriod = {
      id: 'na_' + Date.now(),
      startDate: naStart,
      endDate: naEnd,
      reason: naReason,
      description: naDesc.trim() || undefined,
      calendarDays: days,
    };

    handleUpdate({
      nonAccrualPeriods: [...(data.nonAccrualPeriods || []), newNa],
    });

    setNaStart('');
    setNaEnd('');
    setNaDesc('');
  };

  const handleRemoveNonAccrual = (id: string) => {
    handleUpdate({
      nonAccrualPeriods: (data.nonAccrualPeriods || []).filter((p) => p.id !== id),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs divide-y divide-slate-100">
      {/* 1. Darbuotojo ir pareigybės nustatymai */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-xs">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Duomenų įvedimas ir pareigybė
            </h2>
            <p className="text-xs text-slate-500">
              Antakalnio progimnazijos darbuotojo rekvizitai ir nustatytos normos
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="employee-fullname"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
            >
              Darbuotojo Vardas, Pavardė
            </label>
            <input
              type="text"
              id="employee-fullname"
              value={data.fullName}
              onChange={(e) => handleUpdate({ fullName: e.target.value })}
              placeholder="pvz., Rasa Kazlauskaitė"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all"
            />
          </div>

          <div>
            <label
              htmlFor="employee-position"
              className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
            >
              Pareigos progimnazijoje
            </label>
            <input
              type="text"
              id="employee-position"
              value={data.position}
              onChange={(e) => handleUpdate({ position: e.target.value })}
              placeholder="pvz., Lietuvių kalbos mokytoja metodininkė"
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all"
            />
          </div>
        </div>

        {/* Pareigybės kategorija (Normos parinkimas) */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Darbuotojo tipas ir metinė norma:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {/* Pedagoginis */}
            <button
              type="button"
              id="pos-type-pedagogical"
              onClick={() => handleUpdate({ positionType: 'pedagogical' })}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                data.positionType === 'pedagogical'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">Mokytojas / Pedagogas</span>
                <span className="text-[11px] font-extrabold bg-indigo-600 text-white px-1.5 py-0.5 rounded">
                  40 d.d.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                LRV nutarimas Nr. 496: 40 d.d. (8 sav.) mokytojams, pagalbos spec.
              </p>
            </button>

            {/* Nepedagoginis */}
            <button
              type="button"
              id="pos-type-non-pedagogical"
              onClick={() => handleUpdate({ positionType: 'non_pedagogical' })}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                data.positionType === 'non_pedagogical'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">Kitas personalas</span>
                <span className="text-[11px] font-extrabold bg-slate-700 text-white px-1.5 py-0.5 rounded">
                  20 d.d.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                DK 126 str.: administracija, biblioteka, aptarnaujantis personalas
              </p>
            </button>

            {/* Vaiką auginantis / neįgalumas */}
            <button
              type="button"
              id="pos-type-reduced"
              onClick={() => handleUpdate({ positionType: 'reduced_capacity_or_solo_parent' })}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                data.positionType === 'reduced_capacity_or_solo_parent'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">Pailgintos (DK 138 str.)</span>
                <span className="text-[11px] font-extrabold bg-amber-600 text-white px-1.5 py-0.5 rounded">
                  25 d.d.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Vieniems auginantiems vaiką iki 14 m. / neįgaliems darbuotojams
              </p>
            </button>

            {/* Individuali */}
            <button
              type="button"
              id="pos-type-custom"
              onClick={() => handleUpdate({ positionType: 'custom' })}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                data.positionType === 'custom'
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 ring-2 ring-indigo-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-xs">Individuali norma</span>
                <span className="text-[11px] font-extrabold bg-slate-500 text-white px-1.5 py-0.5 rounded">
                  {data.customAnnualDays || 20} d.d.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-snug">
                Pagal kolektyvinę ar individualią darbo sutartį
              </p>
            </button>
          </div>

          {/* Custom annual days input if custom selected */}
          {data.positionType === 'custom' && (
            <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3">
              <label htmlFor="custom-annual-days" className="text-xs font-semibold text-slate-700">
                Nurodykite metinę normą:
              </label>
              <input
                type="number"
                id="custom-annual-days"
                min="1"
                max="60"
                value={data.customAnnualDays || 20}
                onChange={(e) => handleUpdate({ customAnnualDays: parseInt(e.target.value, 10) || 20 })}
                className="w-24 px-2.5 py-1 text-sm bg-white border border-slate-300 rounded-md font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
              <span className="text-xs text-slate-500">darbo dienų per darbo metus</span>
            </div>
          )}
        </div>

        {/* Darbo savaitė ir stažas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Darbo savaitės trukmė
            </label>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="workWeek"
                  checked={data.workWeek === 5}
                  onChange={() => handleUpdate({ workWeek: 5 })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>5 d.d. per savaitę (standartas)</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="workWeek"
                  checked={data.workWeek === 6}
                  onChange={() => handleUpdate({ workWeek: 6 })}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span>6 d.d.</span>
              </label>
            </div>
          </div>

          {/* Stažas Antakalnio progimnazijoje (DK 138 str. 2 d.) */}
          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200">
            <div className="flex items-start justify-between gap-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  id="add-tenure-days-checkbox"
                  checked={data.addTenureDays}
                  onChange={(e) => handleUpdate({ addTenureDays: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                />
                <span>Ilgalaikis stažas įstaigoje (DK 138 str. 2 d.)</span>
              </label>
              {tenureDays > 0 && (
                <span className="text-xs font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded">
                  +{tenureDays} d.d. priedas
                </span>
              )}
            </div>

            {data.addTenureDays && (
              <div className="mt-2.5 flex items-center gap-3">
                <label htmlFor="tenure-years-input" className="text-xs text-slate-600 font-medium">
                  Nepertraukiamas stažas Antakalnio progimnazijoje:
                </label>
                <input
                  type="number"
                  id="tenure-years-input"
                  min="0"
                  max="60"
                  value={data.tenureYearsInSchool || 0}
                  onChange={(e) => handleUpdate({ tenureYearsInSchool: parseInt(e.target.value, 10) || 0 })}
                  className="w-20 px-2.5 py-1 text-sm bg-white border border-slate-300 rounded-md font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <span className="text-xs text-slate-600">metų</span>
              </div>
            )}
            <p className="text-[11px] text-slate-500 mt-1.5">
              Nuo 10 m. – +3 d.d., kas paskesni 5 m. – po +1 d.d. toje pačioje darbovietėje.
            </p>
          </div>
        </div>

        {/* Normos suvestinė juosta */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-700">
          <span className="font-semibold text-slate-600">Bendra metinė atostogų norma:</span>
          <div className="flex items-center gap-2 font-bold text-indigo-700">
            <span>{baseDays} d.d. (bazinė)</span>
            {tenureDays > 0 && <span>+ {tenureDays} d.d. (stažas)</span>}
            <span className="text-slate-300">=</span>
            <span className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg shadow-xs">
              {totalAnnualNorm} darbo dienų / m.
            </span>
          </div>
        </div>
      </div>

      {/* 2. Laikotarpiai ir datos */}
      <div className="p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-xs">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Apskaitos laikotarpis ir būdas
              </h2>
              <p className="text-xs text-slate-500">
                Nustatykite pradžios ir skaičiavimo datas
              </p>
            </div>
          </div>

          {/* Režimo parinkiklis */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold border border-slate-200/80">
            <button
              type="button"
              id="calc-mode-start"
              onClick={() => handleUpdate({ calcMode: 'from_start' })}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                data.calcMode === 'from_start'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nuo įsidarbinimo
            </button>
            <button
              type="button"
              id="calc-mode-balance"
              onClick={() => handleUpdate({ calcMode: 'from_balance' })}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                data.calcMode === 'from_balance'
                  ? 'bg-white text-indigo-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Nuo žinomo likučio
            </button>
          </div>
        </div>

        {data.calcMode === 'from_balance' ? (
          /* From balance mode */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-indigo-50/40 p-4 rounded-xl border border-indigo-200/80">
            <div>
              <label
                htmlFor="starting-balance-date"
                className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
              >
                Pradinio likučio data
              </label>
              <input
                type="date"
                id="starting-balance-date"
                value={data.startingBalanceDate || data.employmentStartDate}
                onChange={(e) => handleUpdate({ startingBalanceDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="starting-balance-days"
                className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
              >
                Pradinis likutis (d.d.)
              </label>
              <input
                type="number"
                step="0.01"
                id="starting-balance-days"
                value={data.startingBalanceDays ?? 0}
                onChange={(e) => handleUpdate({ startingBalanceDays: parseFloat(e.target.value) || 0 })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>

            <div>
              <label
                htmlFor="calc-date-balance"
                className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5"
              >
                Skaičiuoti iki datos
              </label>
              <input
                type="date"
                id="calc-date-balance"
                value={data.calculationDate}
                onChange={(e) => handleUpdate({ calculationDate: e.target.value })}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
              />
            </div>
          </div>
        ) : (
          /* From start mode */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="employment-start-date"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Priėmimo į darbą data
              </label>
              <input
                type="date"
                id="employment-start-date"
                value={data.employmentStartDate}
                onChange={(e) => handleUpdate({ employmentStartDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Pagal DK 127 str. darbo metai skaičiuojami nuo šios dienos.
              </p>
            </div>

            <div>
              <label
                htmlFor="calculation-date"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5"
              >
                Skaičiuoti iki datos
              </label>
              <input
                type="date"
                id="calculation-date"
                value={data.calculationDate}
                onChange={(e) => handleUpdate({ calculationDate: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-900 font-medium focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-hidden transition-all"
                required
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Šiandien arba planuojama ataskaitinio laikotarpio pabaiga.
              </p>
            </div>
          </div>
        )}

        {/* 3. Neįskaitomi laikotarpiai (VPA, ND ir kt.) */}
        <div className="pt-2">
          <button
            type="button"
            id="toggle-non-accrual-btn"
            onClick={() => setShowNonAccrualSection(!showNonAccrualSection)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {showNonAccrualSection ? <ChevronUp className="w-4 h-4 text-indigo-600" /> : <ChevronDown className="w-4 h-4 text-indigo-600" />}
            <span>
              Neįskaitomi laikotarpiai (VPA, nemokamos atostogos virš normos)
            </span>
            {data.nonAccrualPeriods && data.nonAccrualPeriods.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-amber-100 text-amber-800 rounded font-bold">
                {data.nonAccrualPeriods.length}
              </span>
            )}
          </button>

          {showNonAccrualSection && (
            <div className="mt-3 bg-amber-50/40 rounded-xl p-4 border border-amber-200/80 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  Pagal LR DK 127 str. į darbo metus, už kuriuos suteikiamos atostogos, <strong>neįskaitomi</strong>: 
                  vaiko priežiūros atostogų (VPA) laikas iki vaikui sueis 3 metai, nemokamos atostogos viršijančios nustatytas ribas, 
                  bei pravaikštos. Šiomis dienomis atostogos nesikaupia.
                </p>
              </div>

              {/* Form to add non-accrual */}
              <form onSubmit={handleAddNonAccrual} className="bg-white rounded-xl p-3 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  <div>
                    <label htmlFor="na-start" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Nuo
                    </label>
                    <input
                      type="date"
                      id="na-start"
                      value={naStart}
                      onChange={(e) => setNaStart(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="na-end" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Iki
                    </label>
                    <input
                      type="date"
                      id="na-end"
                      value={naEnd}
                      onChange={(e) => setNaEnd(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="na-reason" className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                      Priežastis
                    </label>
                    <select
                      id="na-reason"
                      value={naReason}
                      onChange={(e) => setNaReason(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    >
                      <option value="vpa">Vaiko priežiūros atostogos (VPA)</option>
                      <option value="nemokamos">Nemokamos atostogos virš normos</option>
                      <option value="neatvykimas">Pravaikštos / neatvykimas</option>
                      <option value="kita">Kita neįskaitoma priežastis</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      id="add-na-btn"
                      disabled={!naStart || !naEnd}
                      className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pridėti</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* List of non-accrual periods */}
              {data.nonAccrualPeriods && data.nonAccrualPeriods.length > 0 && (
                <div className="divide-y divide-amber-200/60 border border-amber-200/80 rounded-xl bg-white overflow-hidden text-xs">
                  {data.nonAccrualPeriods.map((item) => (
                    <div key={item.id} className="p-2.5 flex items-center justify-between gap-2">
                      <div>
                        <span className="font-bold text-slate-800">
                          {item.startDate} – {item.endDate}
                        </span>
                        <span className="ml-2 text-slate-500">
                          ({item.calendarDays} kalend. d.)
                        </span>
                        <span className="ml-2 px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded">
                          {item.reason === 'vpa'
                            ? 'Vaiko priežiūros atostogos'
                            : item.reason === 'nemokamos'
                            ? 'Nemokamos atostogos'
                            : item.reason}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveNonAccrual(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                        title="Pašalinti"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
