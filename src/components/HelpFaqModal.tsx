import React from 'react';
import { X, BookOpen, Scale, Award, AlertTriangle, School, Check } from 'lucide-react';

interface HelpFaqModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpFaqModal: React.FC<HelpFaqModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:hidden">
      <div className="relative bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Atostogų apskaitos taisyklės ir teisės aktai
              </h2>
              <p className="text-xs text-slate-500">
                LR Darbo kodekso ir švietimo įstaigų apskaitos reglamentas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* Section 1: Pedagogical holidays */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-indigo-900">
              <School className="w-4 h-4 text-indigo-600" />
              <span>1. Pedagoginių darbuotojų atostogų trukmė (40 d.d.)</span>
            </div>
            <p>
              Pagal <strong>LR Vyriausybės nutarimą Nr. 496</strong> „Dėl Lietuvos Respublikos darbo kodekso įgyvendinimo“,
              bendrojo ugdymo mokyklų (tokių kaip Vilniaus Antakalnio progimnazija) mokytojams, pagalbos mokiniui specialistams 
              (logopedams, specialiesiems pedagogams, socialiniams pedagogams, psichologams) bei vadovams suteikiamos 
              <strong> 40 darbo dienų</strong> (dirbant 5 d.d. per savaitę) arba <strong>48 darbo dienų</strong> (dirbant 6 d.d.) kasmetinės pailgintos atostogos (8 savaitės).
            </p>
            <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-100 text-indigo-950">
              <strong>Pirmaisiais darbo metais:</strong> Mokyklų pedagogams kasmetinės atostogos suteikiamos mokinių 
              vasaros atostogų metu, nepaisant to, kada darbuotojas pradėjo dirbti mokykloje (LR DK 128 str. 6 d.).
            </div>
          </div>

          {/* Section 2: Non-pedagogical staff */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
              <BookOpen className="w-4 h-4 text-slate-600" />
              <span>2. Kiti darbuotojai ir lengvatinės grupės</span>
            </div>
            <p>
              Pagal LR DK 126 str. 2 d., kitiems darbuotojams (administracijai, bibliotekininkams, buhalteriams, aptarnaujančiam personalui) 
              suteikiamos ne trumpesnės kaip <strong>20 darbo dienų</strong> kasmetinės atostogos (dirbant 5 d.d. per savaitę).
            </p>
            <p>
              Pagal LR DK 138 str. 1 d., darbuotojams, <strong>vieniems auginantiems vaiką iki 14 metų</strong> arba neįgalų vaiką iki 18 metų, 
              bei neįgaliems darbuotojams suteikiamos <strong>25 darbo dienų</strong> kasmetinės atostogos.
            </p>
          </div>

          {/* Section 3: Tenure bonus */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-amber-900">
              <Award className="w-4 h-4 text-amber-600" />
              <span>3. Papildomos atostogos už stažą įstaigoje (DK 138 str. 2 d.)</span>
            </div>
            <p>
              Darbuotojams, turintiems didesnį kaip <strong>10 metų nepertraukiamąjį darbo stažą toje pačioje darbovietėje</strong> 
              (Vilniaus Antakalnio progimnazijoje), suteikiamos <strong>3 darbo dienos</strong> papildomų atostogų, 
              o už kiekvienų paskesnių 5 metų stažą – po <strong>1 darbo dieną</strong> (pvz., 15 m. – 4 d.d., 20 m. – 5 d.d.).
            </p>
          </div>

          {/* Section 4: 3-year rule */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-rose-900">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>4. 3 metų atostogų panaudojimo taisyklė (DK 127 str. 5 d.)</span>
            </div>
            <p>
              Teisė pasinaudoti visomis ar dalimi kasmetinių atostogų prarandama praėjus 
              <strong> 3 metams nuo kalendorinių metų, kuriais buvo įgyta teisė į visos trukmės atostogas, pabaigos</strong>, 
              išskyrus atvejus, kai darbuotojas faktiškai negalėjo jomis pasinaudoti (pvz. dėl ligos, VPA). 
              Mūsų skaičiuoklė automatiškai pažymi atostogų dienas, kurioms kyla anuliavimo rizika.
            </p>
          </div>

          {/* Section 5: Accounting principles */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>5. Atostogų kaupimo ir apskaitos principai</span>
            </div>
            <p>
              Kaupimas vykdomas proporcingai kalendorinėms dienoms per darbo metus, atmetus DK 127 str. numatytus 
              neįskaitomus laikotarpius (VPA, nemokamas atostogas virš normos).
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
          >
            Supratau, uždaryti
          </button>
        </div>
      </div>
    </div>
  );
};
