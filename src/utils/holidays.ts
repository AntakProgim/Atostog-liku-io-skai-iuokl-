// Lietuvos Respublikos švenčių dienos ir darbo dienų skaičiavimas

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
}

/**
 * Apskaičiuoja Velykų sekmadienio datą pagal Meeus/Jones/Butcher algoritmą
 */
export function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = kovas, 4 = balandis
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(Date.UTC(year, month - 1, day));
}

/**
 * Grąžina visas LR oficialias švenčių dienas nurodytiems metams
 */
export function getLithuanianHolidays(year: number): Holiday[] {
  const format = (m: number, d: number) => {
    const mm = String(m).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const easterSunday = getEasterSunday(year);
  // Easter Monday is 1 day after Easter Sunday
  const easterMonday = new Date(easterSunday.getTime() + 24 * 60 * 60 * 1000);
  const easterMondayStr = `${easterMonday.getUTCFullYear()}-${String(easterMonday.getUTCMonth() + 1).padStart(2, '0')}-${String(easterMonday.getUTCDate()).padStart(2, '0')}`;
  const easterSundayStr = `${easterSunday.getUTCFullYear()}-${String(easterSunday.getUTCMonth() + 1).padStart(2, '0')}-${String(easterSunday.getUTCDate()).padStart(2, '0')}`;

  return [
    { date: format(1, 1), name: 'Naujieji metai' },
    { date: format(2, 16), name: 'Lietuvos valstybės atkūrimo diena' },
    { date: format(3, 11), name: 'Lietuvos nepriklausomybės atkūrimo diena' },
    { date: easterSundayStr, name: 'Šv. Velykos (pirmoji diena)' },
    { date: easterMondayStr, name: 'Šv. Velykų antroji diena' },
    { date: format(5, 1), name: 'Tarptautinė darbo diena' },
    { date: format(6, 24), name: 'Rasos ir Joninių diena' },
    { date: format(7, 6), name: 'Valstybės (Mindaugo karūnavimo) ir Tautiškos giesmės diena' },
    { date: format(8, 15), name: 'Žolinė (Švč. Mergelės Marijos ėmimo į dangų diena)' },
    { date: format(11, 1), name: 'Visų Šventųjų diena' },
    { date: format(11, 2), name: 'Mirusiųjų atminimo (Vėlinių) diena' },
    { date: format(12, 24), name: 'Kūčių diena' },
    { date: format(12, 25), name: 'Šv. Kalėdų pirmoji diena' },
    { date: format(12, 26), name: 'Šv. Kalėdų antroji diena' },
  ];
}

/**
 * Patikrina, ar konkreti diena yra LR šventinė diena
 */
export function isHoliday(dateStr: string): { isHoliday: boolean; holidayName?: string } {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return { isHoliday: false };
  const year = parseInt(parts[0], 10);
  const holidays = getLithuanianHolidays(year);
  const match = holidays.find(h => h.date === dateStr);
  if (match) {
    return { isHoliday: true, holidayName: match.name };
  }
  return { isHoliday: false };
}

/**
 * Apskaičiuoja darbo dienas tarp dviejų datų (įskaitant pradžios ir pabaigos dienas),
 * atmetant savaitgalius ir LR švenčių dienas.
 */
export function calculateWorkingDays(
  startDateStr: string,
  endDateStr: string,
  workWeek: 5 | 6 = 5
): {
  workingDays: number;
  calendarDays: number;
  weekendDays: number;
  holidayDays: number;
  holidaysList: { date: string; name: string }[];
} {
  if (!startDateStr || !endDateStr) {
    return { workingDays: 0, calendarDays: 0, weekendDays: 0, holidayDays: 0, holidaysList: [] };
  }

  const start = new Date(startDateStr + 'T00:00:00Z');
  const end = new Date(endDateStr + 'T00:00:00Z');

  if (start.getTime() > end.getTime()) {
    return { workingDays: 0, calendarDays: 0, weekendDays: 0, holidayDays: 0, holidaysList: [] };
  }

  let workingDays = 0;
  let calendarDays = 0;
  let weekendDays = 0;
  let holidayDays = 0;
  const holidaysList: { date: string; name: string }[] = [];

  const curr = new Date(start.getTime());
  while (curr.getTime() <= end.getTime()) {
    calendarDays++;
    const dayOfWeek = curr.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const yyyy = curr.getUTCFullYear();
    const mm = String(curr.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(curr.getUTCDate()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const isWeekend = workWeek === 5 ? (dayOfWeek === 0 || dayOfWeek === 6) : (dayOfWeek === 0);
    const holidayCheck = isHoliday(dateStr);

    if (isWeekend) {
      weekendDays++;
    } else if (holidayCheck.isHoliday) {
      holidayDays++;
      holidaysList.push({ date: dateStr, name: holidayCheck.holidayName || 'Valstybinė šventė' });
    } else {
      workingDays++;
    }

    // Next day
    curr.setUTCDate(curr.getUTCDate() + 1);
  }

  return {
    workingDays,
    calendarDays,
    weekendDays,
    holidayDays,
    holidaysList,
  };
}

/**
 * Apskaičiuoja kalendorinių dienų skaičių tarp dviejų datų (imtinai)
 */
export function getCalendarDaysInclusive(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 0;
  const s = new Date(startStr + 'T00:00:00Z');
  const e = new Date(endStr + 'T00:00:00Z');
  if (s.getTime() > e.getTime()) return 0;
  const diffTime = Math.abs(e.getTime() - s.getTime());
  return Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Patikrina, ar metai yra keliamieji
 */
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}
