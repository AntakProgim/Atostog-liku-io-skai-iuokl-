import {
  EmployeeData,
  CalculationResult,
  YearPeriodBreakdown,
  PositionType,
} from '../types';
import { getCalendarDaysInclusive, isLeapYear } from './holidays';

/**
 * Apskaičiuoja bazinę metinę atostogų normą darbo dienomis pagal pareigybę ir darbo savaitę
 */
export function getBaseAnnualEntitlement(
  positionType: PositionType,
  workWeek: 5 | 6,
  customAnnualDays?: number
): number {
  if (positionType === 'custom') {
    return customAnnualDays && customAnnualDays > 0 ? customAnnualDays : 20;
  }
  if (positionType === 'pedagogical') {
    return workWeek === 5 ? 40 : 48; // 8 savaitės pagal LRV nutarimą Nr. 496
  }
  if (positionType === 'reduced_capacity_or_solo_parent') {
    return workWeek === 5 ? 25 : 30; // DK 138 str. 1 d.
  }
  // non_pedagogical
  return workWeek === 5 ? 20 : 24; // DK 126 str. 2 d.
}

/**
 * Apskaičiuoja papildomas atostogų dienas už stažą toje pačioje darbovietėje (DK 138 str. 2 d.)
 * Didesnis kaip 10 m. stažas – 3 d.d., kas paskesni 5 m. – po 1 d.d.
 */
export function calculateTenureBonusDays(years: number): number {
  if (years < 10) return 0;
  const extraFiveYearBlocks = Math.floor((years - 10) / 5);
  return 3 + extraFiveYearBlocks;
}

/**
 * Prideda vienerius metus prie datos minus viena diena (pvz. 2023-09-01 -> 2024-08-31)
 */
function getNextPeriodEnd(startDateStr: string): string {
  const [year, month, day] = startDateStr.split('-').map(Number);
  // Periodas baigiasi po 1 metų minus 1 diena
  const nextYearStart = new Date(Date.UTC(year + 1, month - 1, day));
  const periodEnd = new Date(nextYearStart.getTime() - 24 * 60 * 60 * 1000);
  
  const yyyy = periodEnd.getUTCFullYear();
  const mm = String(periodEnd.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(periodEnd.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Prideda 1 dieną prie datos (pvz. 2024-08-31 -> 2024-09-01)
 */
function addOneDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(year, month - 1, day + 1));
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Apskaičiuoja kiek konkretaus periodo dienų kerta neįskaitomus laikotarpius
 */
function calculateOverlappingNonAccrualDays(
  periodStart: string,
  periodEnd: string,
  nonAccruals: EmployeeData['nonAccrualPeriods']
): number {
  if (!nonAccruals || nonAccruals.length === 0) return 0;

  const pStart = new Date(periodStart + 'T00:00:00Z').getTime();
  const pEnd = new Date(periodEnd + 'T00:00:00Z').getTime();

  let overlapDays = 0;

  for (const item of nonAccruals) {
    const naStart = new Date(item.startDate + 'T00:00:00Z').getTime();
    const naEnd = new Date(item.endDate + 'T00:00:00Z').getTime();

    // Rasti sankirtos intervalą
    const overlapStart = Math.max(pStart, naStart);
    const overlapEnd = Math.min(pEnd, naEnd);

    if (overlapStart <= overlapEnd) {
      const days = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
      overlapDays += days;
    }
  }

  return overlapDays;
}

/**
 * Apskaičiuoja panaudotas darbo dienas, patenkančias į nurodytą periodą
 */
function calculatePeriodUsedDays(
  periodStart: string,
  periodEnd: string,
  vacations: EmployeeData['vacationPeriods']
): number {
  if (!vacations || vacations.length === 0) return 0;
  const pStart = new Date(periodStart + 'T00:00:00Z').getTime();
  const pEnd = new Date(periodEnd + 'T00:00:00Z').getTime();

  let used = 0;
  for (const vac of vacations) {
    const vStart = new Date(vac.startDate + 'T00:00:00Z').getTime();
    const vEnd = new Date(vac.endDate + 'T00:00:00Z').getTime();

    // Jei atostogos pilnai telpa į periodą
    if (vStart >= pStart && vEnd <= pEnd) {
      used += vac.workingDays;
    } else if (vStart <= pEnd && vEnd >= pStart) {
      // Dalis atostogų kerta periodo ribą – paskirstome proporcingai kalendorinėms dienoms
      const overlapStart = Math.max(pStart, vStart);
      const overlapEnd = Math.min(pEnd, vEnd);
      const overlapDays = Math.floor((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1;
      const totalVacCalDays = Math.max(1, vac.calendarDays);
      const fraction = overlapDays / totalVacCalDays;
      used += Math.round(vac.workingDays * fraction * 100) / 100;
    }
  }
  return used;
}

/**
 * Apskaičiuoja atostogų galiojimo pabaigos datą pagal 3 metų taisyklę (LR DK 127 str. 5 d.)
 * Teisė prarandama praėjus 3 metams nuo kalendorinių metų, kuriais buvo įgyta teisė į atostogas, pabaigos
 */
function calculateExpirationDate(periodEndDateStr: string): string {
  const [year] = periodEndDateStr.split('-').map(Number);
  // Teisė įgyta nurodytais metais, 3 metai nuo tų metų pabaigos (pvz., teisė įgyta 2022 m. -> baigiasi 2025-12-31)
  const expirationYear = year + 3;
  return `${expirationYear}-12-31`;
}

/**
 * Pagrindinė atostogų likučio skaičiavimo funkcija
 */
export function calculateVacationBalance(data: EmployeeData): CalculationResult {
  const baseAnnualDays = getBaseAnnualEntitlement(
    data.positionType,
    data.workWeek,
    data.customAnnualDays
  );

  let tenureBonusDays = 0;
  if (data.addTenureDays) {
    tenureBonusDays = calculateTenureBonusDays(data.tenureYearsInSchool || 0);
  }
  if (data.customTenureBonusDays && data.customTenureBonusDays > 0) {
    tenureBonusDays = data.customTenureBonusDays;
  }

  const annualNormDays = baseAnnualDays + tenureBonusDays;

  // Total used days from list
  const totalUsedFromList = (data.vacationPeriods || []).reduce(
    (sum, item) => sum + (item.workingDays || 0),
    0
  );
  const totalUsedDays = data.useManualUsedDays && typeof data.manualUsedDays === 'number'
    ? data.manualUsedDays
    : totalUsedFromList;

  // Check calculation mode
  if (data.calcMode === 'from_balance') {
    const startDate = data.startingBalanceDate || data.employmentStartDate;
    const endDate = data.calculationDate;
    const startingBalance = data.startingBalanceDays || 0;

    const totalCalendarDaysEmployed = getCalendarDaysInclusive(startDate, endDate);
    const totalNonAccrualDays = calculateOverlappingNonAccrualDays(
      startDate,
      endDate,
      data.nonAccrualPeriods
    );
    const activeCalendarDays = Math.max(0, totalCalendarDaysEmployed - totalNonAccrualDays);

    // Days in year baseline
    const startYear = parseInt(startDate.slice(0, 4), 10);
    const daysInYear = isLeapYear(startYear) ? 366 : 365;

    // Period accrual: activeCalendarDays / daysInYear * annualNormDays
    const periodAccrued = (activeCalendarDays / daysInYear) * annualNormDays;
    const totalAccruedDays = startingBalance + periodAccrued;
    const finalBalanceDays = totalAccruedDays - totalUsedDays;

    const singleBreakdown: YearPeriodBreakdown = {
      periodIndex: 1,
      label: `${startDate} – ${endDate}`,
      startDate,
      endDate,
      calendarDaysInPeriod: totalCalendarDaysEmployed,
      nonAccrualDays: totalNonAccrualDays,
      accrualCalendarDays: activeCalendarDays,
      daysInYear,
      annualEntitlement: annualNormDays,
      accruedDays: Math.round(periodAccrued * 100) / 100,
      usedDays: Math.round(totalUsedDays * 100) / 100,
      balanceForPeriod: Math.round((periodAccrued - totalUsedDays) * 100) / 100,
      cumulativeBalance: Math.round(finalBalanceDays * 100) / 100,
      isCurrentPeriod: true,
      expirationDate: calculateExpirationDate(endDate),
    };

    return buildResultObject({
      totalAccruedDays: Math.round(totalAccruedDays * 100) / 100,
      totalUsedDays: Math.round(totalUsedDays * 100) / 100,
      startingBalance: Math.round(startingBalance * 100) / 100,
      finalBalanceDays: Math.round(finalBalanceDays * 100) / 100,
      annualNormDays,
      baseAnnualDays,
      tenureBonusDays,
      totalCalendarDaysEmployed,
      totalNonAccrualDays,
      activeCalendarDays,
      breakdown: [singleBreakdown],
      dailyVdu: data.dailyVdu,
      monthlySalary: data.monthlySalary,
      workWeek: data.workWeek,
      calculationDate: data.calculationDate,
    });
  }

  // CALC MODE: from_start (from employment start date)
  const breakdown: YearPeriodBreakdown[] = [];
  let currentPeriodStart = data.employmentStartDate;
  const calcDate = data.calculationDate;
  let periodIndex = 1;
  let cumulativeAccrued = 0;
  let cumulativeUsed = 0;
  let totalCalDays = 0;
  let totalNonAccrual = 0;

  // We loop year by year until reaching calcDate
  while (true) {
    const naturalPeriodEnd = getNextPeriodEnd(currentPeriodStart);
    const isLastPartialPeriod = naturalPeriodEnd >= calcDate;
    const effectivePeriodEnd = isLastPartialPeriod ? calcDate : naturalPeriodEnd;

    const calendarDays = getCalendarDaysInclusive(currentPeriodStart, effectivePeriodEnd);
    totalCalDays += calendarDays;

    const nonAccrualDays = calculateOverlappingNonAccrualDays(
      currentPeriodStart,
      effectivePeriodEnd,
      data.nonAccrualPeriods
    );
    totalNonAccrual += nonAccrualDays;

    const accrualDays = Math.max(0, calendarDays - nonAccrualDays);

    // Days in full year for denominator
    const pYear = parseInt(currentPeriodStart.slice(0, 4), 10);
    const daysInYear = isLeapYear(pYear) ? 366 : 365;

    // Period accrued days: (accrualDays / daysInYear) * annualNormDays
    const periodAccrued = (accrualDays / daysInYear) * annualNormDays;

    // Period used days
    let periodUsed = 0;
    if (data.useManualUsedDays) {
      // If manual used days specified, distribute evenly or put in older periods
      // We will handle manual distribution below
      periodUsed = 0;
    } else {
      periodUsed = calculatePeriodUsedDays(
        currentPeriodStart,
        effectivePeriodEnd,
        data.vacationPeriods
      );
    }

    const expDate = calculateExpirationDate(effectivePeriodEnd);
    const expTime = new Date(expDate + 'T23:59:59Z').getTime();
    const currTime = new Date(calcDate + 'T00:00:00Z').getTime();
    const hasExpired = expTime < currTime && !isLastPartialPeriod;
    // Expiring within 12 months?
    const isExpiringSoon = !hasExpired && (expTime - currTime <= 365 * 24 * 60 * 60 * 1000);

    breakdown.push({
      periodIndex,
      label: `${currentPeriodStart} – ${effectivePeriodEnd}`,
      startDate: currentPeriodStart,
      endDate: effectivePeriodEnd,
      calendarDaysInPeriod: calendarDays,
      nonAccrualDays,
      accrualCalendarDays: accrualDays,
      daysInYear,
      annualEntitlement: annualNormDays,
      accruedDays: Math.round(periodAccrued * 100) / 100,
      usedDays: Math.round(periodUsed * 100) / 100,
      balanceForPeriod: Math.round((periodAccrued - periodUsed) * 100) / 100,
      cumulativeBalance: 0, // Calculated below
      isCurrentPeriod: isLastPartialPeriod,
      expirationDate: expDate,
      hasExpired,
      isExpiringSoon,
    });

    if (isLastPartialPeriod) {
      break;
    }

    currentPeriodStart = addOneDay(naturalPeriodEnd);
    periodIndex++;
  }

  // If manual used days is specified, allocate it from the earliest periods first (FIFO standard in accounting)
  if (data.useManualUsedDays && typeof data.manualUsedDays === 'number') {
    let remainingUsed = data.manualUsedDays;
    for (const b of breakdown) {
      const take = Math.min(remainingUsed, b.accruedDays);
      b.usedDays = Math.round(take * 100) / 100;
      b.balanceForPeriod = Math.round((b.accruedDays - b.usedDays) * 100) / 100;
      remainingUsed = Math.max(0, remainingUsed - take);
    }
    // If used days exceeded accrued days, put overflow into the last period
    if (remainingUsed > 0 && breakdown.length > 0) {
      const last = breakdown[breakdown.length - 1];
      last.usedDays = Math.round((last.usedDays + remainingUsed) * 100) / 100;
      last.balanceForPeriod = Math.round((last.accruedDays - last.usedDays) * 100) / 100;
    }
  }

  // Calculate cumulative balance and total accrued
  let runBal = 0;
  cumulativeAccrued = 0;
  cumulativeUsed = 0;

  for (const b of breakdown) {
    cumulativeAccrued += b.accruedDays;
    cumulativeUsed += b.usedDays;
    runBal += b.balanceForPeriod;
    b.cumulativeBalance = Math.round(runBal * 100) / 100;
  }

  const finalBalanceDays = Math.round(runBal * 100) / 100;

  // Check 3-year expiration risk: are there positive balances from expired or soon expiring periods?
  let daysAtRisk = 0;
  let expireDate = '';
  for (const b of breakdown) {
    if ((b.isExpiringSoon || b.hasExpired) && b.balanceForPeriod > 0) {
      daysAtRisk += b.balanceForPeriod;
      if (!expireDate || b.expirationDate! < expireDate) {
        expireDate = b.expirationDate || '';
      }
    }
  }

  return buildResultObject({
    totalAccruedDays: Math.round(cumulativeAccrued * 100) / 100,
    totalUsedDays: Math.round(totalUsedDays * 100) / 100,
    startingBalance: 0,
    finalBalanceDays,
    annualNormDays,
    baseAnnualDays,
    tenureBonusDays,
    totalCalendarDaysEmployed: totalCalDays,
    totalNonAccrualDays: totalNonAccrual,
    activeCalendarDays: Math.max(0, totalCalDays - totalNonAccrual),
    breakdown,
    expiringDaysWarning: daysAtRisk > 0 ? { daysAtRisk: Math.round(daysAtRisk * 100) / 100, expireDate } : undefined,
    dailyVdu: data.dailyVdu,
    monthlySalary: data.monthlySalary,
    workWeek: data.workWeek,
    calculationDate: data.calculationDate,
  });
}

/**
 * Pagalbinis rezultato objekto ir kompensacijos suformavimas
 */
function buildResultObject(params: {
  totalAccruedDays: number;
  totalUsedDays: number;
  startingBalance: number;
  finalBalanceDays: number;
  annualNormDays: number;
  baseAnnualDays: number;
  tenureBonusDays: number;
  totalCalendarDaysEmployed: number;
  totalNonAccrualDays: number;
  activeCalendarDays: number;
  breakdown: YearPeriodBreakdown[];
  expiringDaysWarning?: { daysAtRisk: number; expireDate: string };
  dailyVdu?: number;
  monthlySalary?: number;
  workWeek: 5 | 6;
  calculationDate: string;
}): CalculationResult {
  let compensation;
  
  // Calculate daily VDU if monthlySalary provided or dailyVdu provided
  let effectiveVdu = params.dailyVdu;
  if ((!effectiveVdu || effectiveVdu <= 0) && params.monthlySalary && params.monthlySalary > 0) {
    // Vidutiniškai 21 d.d. per mėnesį (5 d.d. savaitei) arba 25 d.d. (6 d.d. savaitei)
    const avgWorkingDaysPerMonth = params.workWeek === 5 ? 20.9 : 25.1;
    effectiveVdu = params.monthlySalary / avgWorkingDaysPerMonth;
  }

  if (effectiveVdu && effectiveVdu > 0 && params.finalBalanceDays > 0) {
    const grossAmount = Math.round(params.finalBalanceDays * effectiveVdu * 100) / 100;
    // Standartiniai mokesčiai Lietuvoje:
    // GPM 20% (iki VDU ribų)
    // Sodra (pensijų ir soc. draudimas) 19.5%
    const estimatedGpm = Math.round(grossAmount * 0.20 * 100) / 100;
    const estimatedSodra = Math.round(grossAmount * 0.195 * 100) / 100;
    const netAmount = Math.round((grossAmount - estimatedGpm - estimatedSodra) * 100) / 100;

    compensation = {
      grossAmount,
      estimatedGpm,
      estimatedSodra,
      netAmount,
      vduUsed: Math.round(effectiveVdu * 100) / 100,
    };
  }

  return {
    totalAccruedDays: params.totalAccruedDays,
    totalUsedDays: params.totalUsedDays,
    startingBalance: params.startingBalance,
    finalBalanceDays: params.finalBalanceDays,
    annualNormDays: params.annualNormDays,
    baseAnnualDays: params.baseAnnualDays,
    tenureBonusDays: params.tenureBonusDays,
    totalCalendarDaysEmployed: params.totalCalendarDaysEmployed,
    totalNonAccrualDays: params.totalNonAccrualDays,
    activeCalendarDays: params.activeCalendarDays,
    breakdown: params.breakdown,
    expiringDaysWarning: params.expiringDaysWarning,
    compensation,
  };
}
