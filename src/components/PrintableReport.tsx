import React from 'react';
import { EmployeeData, CalculationResult } from '../types';

interface PrintableReportProps {
  data: EmployeeData;
  result: CalculationResult;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ data, result }) => {
  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="hidden print:block font-serif text-black p-8 bg-white max-w-4xl mx-auto leading-normal">
      {/* Official Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider">
          Vilniaus Antakalnio progimnazija
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          Biudžetinė įstaiga, Antakalnio g. 29/33, LT-10312 Vilnius | Tel. +370 5 234 1234 | El. p. rastine@antakalnio.lt
        </p>
        <p className="text-[11px] text-slate-500 italic">
          Buhalterinę apskaitą tvarko: Vilniaus m. savivaldybės BĮ „Skaitlis“
        </p>
      </div>

      {/* Document Title */}
      <div className="text-center my-6">
        <h2 className="text-base font-bold uppercase tracking-wide">
          Kasmetinių atostogų likučio pažyma
        </h2>
        <p className="text-xs text-slate-700 mt-1">
          {todayStr} Nr. AT-{Math.floor(1000 + Math.random() * 9000)}
        </p>
      </div>

      {/* Employee Metadata Table */}
      <div className="mb-6">
        <table className="w-full text-xs border border-slate-400">
          <tbody>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100 w-1/3">Darbuotojo vardas, pavardė:</td>
              <td className="p-2 font-semibold text-sm">{data.fullName || 'Nenurodyta'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100">Pareigos progimnazijoje:</td>
              <td className="p-2">{data.position || 'Nenurodyta'}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100">Priėmimo į darbą data:</td>
              <td className="p-2">{data.employmentStartDate}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100">Skaičiavimo data:</td>
              <td className="p-2">{data.calculationDate}</td>
            </tr>
            <tr className="border-b border-slate-300">
              <td className="p-2 font-bold bg-slate-100">Nustatyta metinė atostogų norma:</td>
              <td className="p-2">
                <strong>{result.annualNormDays} d.d.</strong> ({result.baseAnnualDays} d.d. bazinė
                {result.tenureBonusDays > 0 ? ` + ${result.tenureBonusDays} d.d. už ilgalaikį stažą pagal DK 138 str.` : ''})
              </td>
            </tr>
            <tr>
              <td className="p-2 font-bold bg-slate-100">Darbo savaitės trukmė:</td>
              <td className="p-2">{data.workWeek} darbo dienos</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Breakdown by periods */}
      <div className="mb-6">
        <h3 className="text-xs font-bold uppercase tracking-wider mb-2">
          1. Atostogų kaupimo ir panaudojimo suvestinė pagal darbo metus
        </h3>
        <table className="w-full text-xs border border-slate-400 text-left">
          <thead className="bg-slate-100 font-bold border-b border-slate-400">
            <tr>
              <th className="p-1.5 border-r border-slate-300">Periodas (Darbo metai)</th>
              <th className="p-1.5 border-r border-slate-300 text-center">Aktyvios d.</th>
              <th className="p-1.5 border-r border-slate-300 text-right">Sukaupta</th>
              <th className="p-1.5 border-r border-slate-300 text-right">Panaudota</th>
              <th className="p-1.5 border-r border-slate-300 text-right">Periodo likutis</th>
              <th className="p-1.5 text-right">Kaupiamasis likutis</th>
            </tr>
          </thead>
          <tbody>
            {result.breakdown.map((row) => (
              <tr key={row.periodIndex} className="border-b border-slate-300">
                <td className="p-1.5 border-r border-slate-300 font-semibold">
                  {row.periodIndex} m.: {row.label}
                </td>
                <td className="p-1.5 border-r border-slate-300 text-center">
                  {row.accrualCalendarDays} k.d.
                </td>
                <td className="p-1.5 border-r border-slate-300 text-right">
                  +{row.accruedDays.toFixed(2)} d.d.
                </td>
                <td className="p-1.5 border-r border-slate-300 text-right">
                  -{row.usedDays.toFixed(2)} d.d.
                </td>
                <td className="p-1.5 border-r border-slate-300 text-right">
                  {row.balanceForPeriod.toFixed(2)} d.d.
                </td>
                <td className="p-1.5 text-right font-bold">
                  {row.cumulativeBalance.toFixed(2)} d.d.
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-bold bg-slate-100 border-t border-slate-400">
            <tr>
              <td className="p-2 border-r border-slate-300">Iš viso:</td>
              <td className="p-2 border-r border-slate-300 text-center">{result.activeCalendarDays} k.d.</td>
              <td className="p-2 border-r border-slate-300 text-right">+{result.totalAccruedDays.toFixed(2)} d.d.</td>
              <td className="p-2 border-r border-slate-300 text-right">-{result.totalUsedDays.toFixed(2)} d.d.</td>
              <td colSpan={2} className="p-2 text-right text-sm">
                Likutis: <strong>{result.finalBalanceDays.toFixed(2)} d.d.</strong>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Summary Box */}
      <div className="p-4 border-2 border-slate-800 rounded mb-8 bg-slate-50 flex items-center justify-between">
        <div>
          <span className="text-xs uppercase font-bold text-slate-700 block">
            Nepanaudotų kasmetinių atostogų likutis {data.calculationDate} dienai:
          </span>
          <span className="text-2xl font-extrabold text-slate-900">
            {result.finalBalanceDays.toFixed(2)} darbo dienų
          </span>
          <span className="text-xs text-slate-600 block mt-0.5">
            (atitinka maždaug {(result.finalBalanceDays / (data.workWeek === 5 ? 5 : 6)).toFixed(1)} kalendorinių savaičių)
          </span>
        </div>

        {result.compensation && (
          <div className="text-right border-l-2 border-slate-300 pl-4">
            <span className="text-xs text-slate-600 block">Kompensacija nutraukiant sutartį (Bruto):</span>
            <span className="text-lg font-bold text-slate-900">
              {result.compensation.grossAmount.toFixed(2)} €
            </span>
          </div>
        )}
      </div>

      {/* Signatures */}
      <div className="mt-12 pt-6 border-t border-slate-400 grid grid-cols-2 gap-12 text-xs">
        <div>
          <p className="font-semibold mb-6">Pažymą parengė / patikrino:</p>
          <div className="border-b border-black w-3/4 mb-1"></div>
          <p className="text-[11px] text-slate-500">(parašas, vardas, pavardė, pareigos)</p>
        </div>

        <div>
          <p className="font-semibold mb-6">Su apskaičiuotu atostogų likučiu susipažinau:</p>
          <div className="border-b border-black w-3/4 mb-1"></div>
          <p className="text-[11px] text-slate-500">{data.fullName || 'Darbuotojas'} (parašas, data)</p>
        </div>
      </div>
    </div>
  );
};
