import React, { useState } from 'react';
import { VacationPeriod, WorkWeekDays } from '../types';
import { calculateWorkingDays } from '../utils/holidays';
import { Calendar, Plus, Trash2, Info, CalendarDays, Sparkles } from 'lucide-react';

interface VacationPeriodsListProps {
  periods: VacationPeriod[];
  onChangePeriods: (periods: VacationPeriod[]) => void;
  useManualUsedDays: boolean;
  manualUsedDays?: number;
  onToggleManualMode: (useManual: boolean) => void;
  onChangeManualDays: (days: number) => void;
  workWeek: WorkWeekDays;
  employmentStartDate: string;
  calculationDate: string;
}

export const VacationPeriodsList: React.FC<VacationPeriodsListProps> = ({
  periods,
  onChangePeriods,
  useManualUsedDays,
  manualUsedDays,
  onToggleManualMode,
  onChangeManualDays,
  workWeek,
  employmentStartDate,
  calculationDate,
}) => {
  const [newStart, setNewStart] = useState<string>('');
  const [newEnd, setNewEnd] = useState<string>('');
  const [newComment, setNewComment] = useState<string>('');

  // Preview of working days for current inputs
  const preview = newStart && newEnd
    ? calculateWorkingDays(newStart, newEnd, workWeek)
    : null;

  const handleAddPeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStart || !newEnd) return;
    if (new Date(newStart) > new Date(newEnd)) return;

    const calc = calculateWorkingDays(newStart, newEnd, workWeek);
    const newPeriod: VacationPeriod = {
      id: 'vac_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      startDate: newStart,
      endDate: newEnd,
      workingDays: calc.workingDays,
      calendarDays: calc.calendarDays,
      comment: newComment.trim() || undefined,
    };

    onChangePeriods([...periods, newPeriod]);
    setNewStart('');
    setNewEnd('');
    setNewComment('');
  };

  const handleRemovePeriod = (id: string) => {
    onChangePeriods(periods.filter((p) => p.id !== id));
  };

  const totalUsedFromList = periods.reduce((sum, p) => sum + p.workingDays, 0);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header bar */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shadow-xs">
            <CalendarDays className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Panaudotos atostogos
            </h2>
            <p className="text-xs text-slate-500">
              Įveskite suteiktų atostogų laikotarpius arba bendrą dienų sumą
            </p>
          </div>
        </div>

        {/* Toggle mode: by periods vs total days */}
        <div className="inline-flex rounded-xl bg-slate-100 p-1 self-start sm:self-auto text-xs font-semibold border border-slate-200/80">
          <button
            type="button"
            id="mode-periods-toggle"
            onClick={() => onToggleManualMode(false)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              !useManualUsedDays
                ? 'bg-white text-indigo-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pagal laikotarpius
          </button>
          <button
            type="button"
            id="mode-manual-toggle"
            onClick={() => onToggleManualMode(true)}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              useManualUsedDays
                ? 'bg-white text-indigo-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bendra suma
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {useManualUsedDays ? (
          /* Manual Quick Days Input */
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
            <div className="max-w-md">
              <label
                htmlFor="manual-used-days-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
              >
                Iš viso panaudota kasmetinių atostogų (darbo dienomis):
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  id="manual-used-days-input"
                  min="0"
                  step="0.5"
                  value={manualUsedDays ?? 0}
                  onChange={(e) => onChangeManualDays(parseFloat(e.target.value) || 0)}
                  className="w-36 px-3 py-2.5 text-base font-bold bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-hidden"
                />
                <span className="text-sm font-bold text-slate-700">darbo dienų (d.d.)</span>
              </div>
              <p className="text-xs text-slate-500 mt-2 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                Patogu, jei turite tikslią tabelio ar algalapio suvestinę.
              </p>
            </div>
          </div>
        ) : (
          /* By Periods Input & List */
          <div className="space-y-4">
            {/* Add period form */}
            <form
              onSubmit={handleAddPeriod}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
            >
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Pridėti atostogų laikotarpį:
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label
                    htmlFor="vacation-start-date"
                    className="block text-xs font-bold text-slate-600 mb-1"
                  >
                    Atostogų pradžia
                  </label>
                  <input
                    type="date"
                    id="vacation-start-date"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    min={employmentStartDate || undefined}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="vacation-end-date"
                    className="block text-xs font-bold text-slate-600 mb-1"
                  >
                    Atostogų pabaiga
                  </label>
                  <input
                    type="date"
                    id="vacation-end-date"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    min={newStart || employmentStartDate || undefined}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="vacation-comment-input"
                    className="block text-xs font-bold text-slate-600 mb-1"
                  >
                    Pastaba / Paskirtis (nebūtina)
                  </label>
                  <input
                    type="text"
                    id="vacation-comment-input"
                    placeholder="pvz., Vasaros atostogos"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-hidden"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="submit"
                    id="add-vacation-period-btn"
                    disabled={!newStart || !newEnd || new Date(newStart) > new Date(newEnd)}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors shadow-xs cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pridėti laikotarpį</span>
                  </button>
                </div>
              </div>

              {/* Live preview badge when dates are chosen */}
              {preview && preview.workingDays >= 0 && (
                <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
                  <span className="font-semibold text-slate-700">
                    Apskaičiuota:
                  </span>
                  <span className="font-bold text-indigo-800 bg-indigo-100 px-2 py-0.5 rounded">
                    {preview.workingDays} d.d.
                  </span>
                  <span className="text-slate-500">
                    ({preview.calendarDays} kalend. d., {preview.weekendDays} sav. d.)
                  </span>

                  {preview.holidayDays > 0 && (
                    <span className="inline-flex items-center gap-1 text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded font-medium">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {preview.holidayDays} valst. šventė (neįskaičiuojama į atostogas: {preview.holidaysList.map(h => h.name).join(', ')})
                    </span>
                  )}
                </div>
              )}
            </form>

            {/* List of registered vacation periods */}
            {periods.length === 0 ? (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs bg-slate-50/50">
                Panaudotų atostogų laikotarpių dar neįvesta. Pasinaudokite aukščiau esančia forma arba pasirinkite greitąjį įvedimą.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Laikotarpis (Nuo – Iki)</th>
                      <th className="py-2.5 px-3">Darbo dienos (d.d.)</th>
                      <th className="py-2.5 px-3">Kalendorinės d.</th>
                      <th className="py-2.5 px-3">Pastaba / Paskirtis</th>
                      <th className="py-2.5 px-3 text-right">Veiksmai</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {periods.map((p, idx) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">
                          {p.startDate} – {p.endDate}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-indigo-700">
                          {p.workingDays} d.d.
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {p.calendarDays} k.d.
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {p.comment || '—'}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            type="button"
                            id={`remove-period-${idx}`}
                            onClick={() => handleRemovePeriod(p.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                            title="Pašalinti laikotarpį"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold text-slate-800 border-t border-slate-200">
                    <tr>
                      <td className="py-2.5 px-3">Iš viso panaudota:</td>
                      <td className="py-2.5 px-3 text-indigo-800 font-extrabold">
                        {totalUsedFromList} d.d.
                      </td>
                      <td colSpan={3} className="py-2.5 px-3 text-right text-slate-500 font-normal">
                        Laikotarpių skaičius: {periods.length}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
