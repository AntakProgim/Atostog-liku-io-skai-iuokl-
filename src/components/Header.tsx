import React from 'react';
import { School, Printer, RotateCcw, HelpCircle, Sparkles, BookOpen } from 'lucide-react';
import { PRESETS } from '../data/presets';
import { EmployeeData } from '../types';

interface HeaderProps {
  onSelectPreset: (data: EmployeeData) => void;
  onReset: () => void;
  onPrint: () => void;
  onOpenHelp: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onReset,
  onPrint,
  onOpenHelp,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Institution Title in Bento aesthetic */}
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 shrink-0">
              <School className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                  VILNIAUS ANTAKALNIO PROGIMNAZIJA
                </h1>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-slate-500 font-medium uppercase text-[11px] tracking-widest">
                  Atostogų likučio skaičiuoklė • 2026
                </p>
                <span className="hidden sm:inline-block text-slate-300">•</span>
                <span className="hidden sm:inline-block text-[11px] font-semibold text-indigo-600">
                  LR Darbo kodekso reglamentas
                </span>
              </div>
            </div>
          </div>

          {/* Action Bar & System Status Badge */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Status badge */}
            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              SISTEMA AKTYVI
            </span>

            {/* Quick Presets Dropdown */}
            <div className="relative group">
              <button
                type="button"
                id="presets-button"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pavyzdžiai</span>
              </button>
              <div className="hidden group-hover:block hover:block absolute right-0 mt-1 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  Užpildyti pavyzdiniais duomenimis:
                </div>
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    id={`preset-${p.id}`}
                    type="button"
                    onClick={() => onSelectPreset(p.data)}
                    className="w-full text-left px-3.5 py-2 text-xs hover:bg-indigo-50 transition-colors flex flex-col gap-0.5 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{p.title}</span>
                      <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">
                        {p.roleBadge}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500">{p.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Print / Export button */}
            <button
              type="button"
              id="print-summary-button"
              onClick={onPrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Spausdinti arba išsaugoti PDF suvestinę"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Spausdinti pažymą</span>
            </button>

            {/* Help / FAQ button */}
            <button
              type="button"
              id="help-faq-button"
              onClick={onOpenHelp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Taisyklės</span>
            </button>

            {/* Reset button */}
            <button
              type="button"
              id="reset-form-button"
              onClick={onReset}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              title="Išvalyti / atstatyti formą"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
