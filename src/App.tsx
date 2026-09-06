import React, { useState, useMemo } from 'react';
import { EmployeeData } from './types';
import { calculateVacationBalance } from './utils/calculator';
import { PRESETS } from './data/presets';
import { Header } from './components/Header';
import { CalculatorForm } from './components/CalculatorForm';
import { VacationPeriodsList } from './components/VacationPeriodsList';
import { ResultsSummary } from './components/ResultsSummary';
import { YearBreakdownTable } from './components/YearBreakdownTable';
import { CompensationCalculator } from './components/CompensationCalculator';
import { PrintableReport } from './components/PrintableReport';
import { HelpFaqModal } from './components/HelpFaqModal';
import { School, CheckCircle2, FileText, ArrowRight, Sparkles } from 'lucide-react';

const DEFAULT_EMPLOYEE: EmployeeData = {
  fullName: 'Jūratė Vaitkevičienė',
  position: 'Pradinių klasių mokytoja metodininkė',
  positionType: 'pedagogical',
  workWeek: 5,
  employmentStartDate: '2023-09-01',
  calculationDate: '2026-09-04',
  tenureYearsInSchool: 3,
  addTenureDays: false,
  customTenureBonusDays: 0,
  customAnnualDays: 40,
  calcMode: 'from_start',
  nonAccrualPeriods: [],
  useManualUsedDays: false,
  vacationPeriods: [
    {
      id: 'v_init_1',
      startDate: '2024-07-01',
      endDate: '2024-08-14',
      workingDays: 31,
      calendarDays: 45,
      comment: 'Vasaros atostogos 2024 m.',
    },
    {
      id: 'v_init_2',
      startDate: '2024-10-28',
      endDate: '2024-11-03',
      workingDays: 4,
      calendarDays: 7,
      comment: 'Rudens mokinių atostogų metu',
    },
    {
      id: 'v_init_3',
      startDate: '2025-07-01',
      endDate: '2025-08-14',
      workingDays: 31,
      calendarDays: 45,
      comment: 'Vasaros atostogos 2025 m.',
    },
  ],
  dailyVdu: 85.5,
  monthlySalary: 1850,
};

export default function App() {
  const [data, setData] = useState<EmployeeData>(DEFAULT_EMPLOYEE);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Memoized vacation balance calculation
  const result = useMemo(() => {
    return calculateVacationBalance(data);
  }, [data]);

  const handleSelectPreset = (presetData: EmployeeData) => {
    setData(presetData);
  };

  const handleReset = () => {
    setData({
      fullName: '',
      position: '',
      positionType: 'pedagogical',
      workWeek: 5,
      employmentStartDate: '2025-09-01',
      calculationDate: '2026-09-04',
      tenureYearsInSchool: 0,
      addTenureDays: false,
      customTenureBonusDays: 0,
      customAnnualDays: 40,
      calcMode: 'from_start',
      nonAccrualPeriods: [],
      useManualUsedDays: false,
      manualUsedDays: 0,
      vacationPeriods: [],
      dailyVdu: 0,
      monthlySalary: 0,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header bar */}
      <Header
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        onPrint={handlePrint}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 print:hidden">
        {/* Antakalnio progimnazija Bento Welcome & Quick Presets */}
        <div className="bg-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-xs border border-slate-800 relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div className="space-y-1.5 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full text-xs font-semibold text-indigo-300">
                <School className="w-3.5 h-3.5" />
                <span>Vilniaus Antakalnio progimnazijos personalo apskaitai</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Kasmetinių atostogų likučio skaičiuoklė
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Skaičiuojama pagal LR Darbo kodekso 126–138 str., LRV nutarimą Nr. 496 (pedagogams 40 d.d.) 
                ir švietimo įstaigų apskaitos reikalavimus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                id="quick-preset-pedagogas"
                onClick={() => handleSelectPreset(PRESETS[0].data)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mokytojo pavyzdys (40 d.d.)</span>
              </button>
              <button
                type="button"
                id="quick-preset-stazas"
                onClick={() => handleSelectPreset(PRESETS[1].data)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors cursor-pointer inline-flex items-center gap-2 shadow-xs"
              >
                <span>Stažas 10+ m. (+3 d.d.)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Results Overview (KPIs and Alerts) */}
        <ResultsSummary result={result} workWeek={data.workWeek} />

        {/* Main Work Area: Inputs and Vacation Periods */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left / Top Form: Employee & Config (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <CalculatorForm data={data} onChange={setData} />
          </div>

          {/* Right / Bottom Form: Vacation Periods (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            <VacationPeriodsList
              periods={data.vacationPeriods}
              onChangePeriods={(newPeriods) => setData({ ...data, vacationPeriods: newPeriods })}
              useManualUsedDays={data.useManualUsedDays}
              manualUsedDays={data.manualUsedDays}
              onToggleManualMode={(useManual) => setData({ ...data, useManualUsedDays: useManual })}
              onChangeManualDays={(val) => setData({ ...data, manualUsedDays: val })}
              workWeek={data.workWeek}
              employmentStartDate={data.employmentStartDate}
              calculationDate={data.calculationDate}
            />
          </div>
        </div>

        {/* Detailed Chronological Ledger Table */}
        <YearBreakdownTable breakdown={result.breakdown} />

        {/* Termination Compensation Calculator */}
        <CompensationCalculator
          result={result}
          dailyVdu={data.dailyVdu}
          monthlySalary={data.monthlySalary}
          onUpdateVdu={(vdu) => setData({ ...data, dailyVdu: vdu })}
          onUpdateSalary={(salary) => setData({ ...data, monthlySalary: salary })}
        />
      </main>

      {/* Printable Report (shown only during window.print()) */}
      <PrintableReport data={data} result={result} />

      {/* Help / Regulations FAQ Modal */}
      <HelpFaqModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              A
            </div>
            <span>
              Vilniaus Antakalnio progimnazija | Antakalnio g. 29/33, LT-10312 Vilnius | El. p.{' '}
              <a href="mailto:rastine@antakalnio.lt" className="text-indigo-600 hover:underline">
                rastine@antakalnio.lt
              </a>
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Metodinis pagrindas: LR Darbo kodeksas</span>
            <span>•</span>
            <span>LRV nutarimas Nr. 496</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => setIsHelpOpen(true)}
              className="text-indigo-600 hover:underline cursor-pointer font-medium"
            >
              Teisinis reglamentavimas
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
