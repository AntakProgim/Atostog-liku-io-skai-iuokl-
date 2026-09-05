export type PositionType = 
  | 'pedagogical' // 40 d.d. (mokytojai, auklėtojai, spec. pedagogai ir kt.)
  | 'non_pedagogical' // 20 d.d. (aptarnaujantis, administracinis personalas)
  | 'reduced_capacity_or_solo_parent' // 25 d.d. (auginantys vieni vaiką iki 14 m., neįgalūs)
  | 'custom'; // Individuali norma

export type WorkWeekDays = 5 | 6;

export interface NonAccrualPeriod {
  id: string;
  startDate: string;
  endDate: string;
  reason: 'vpa' | 'nemokamos' | 'neatvykimas' | 'kita';
  description?: string;
  calendarDays: number;
}

export interface VacationPeriod {
  id: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  calendarDays: number;
  comment?: string;
}

export interface EmployeeData {
  fullName: string;
  position: string;
  positionType: PositionType;
  workWeek: WorkWeekDays;
  employmentStartDate: string;
  calculationDate: string;
  
  // Tenure in Antakalnio progimnazija
  tenureYearsInSchool: number;
  addTenureDays: boolean; // DK 138 str. 2 d. (+3 d.d. už 10 m., +1 d.d. už kas 5 m.)
  customTenureBonusDays: number;

  // Custom base vacation if custom type
  customAnnualDays: number;

  // Calculation mode: 'from_start' (from employment date) or 'from_balance' (from a known prior balance date)
  calcMode: 'from_start' | 'from_balance';
  startingBalanceDate?: string;
  startingBalanceDays?: number;

  // Periods
  nonAccrualPeriods: NonAccrualPeriod[];
  vacationPeriods: VacationPeriod[];
  manualUsedDays?: number;
  useManualUsedDays: boolean;

  // Compensation details
  dailyVdu?: number; // 1 d.d. VDU
  monthlySalary?: number; // arba 3 mėn. atlyginimas
}

export interface YearPeriodBreakdown {
  periodIndex: number;
  label: string; // pvz., 2023-09-01 – 2024-08-31
  startDate: string;
  endDate: string;
  calendarDaysInPeriod: number;
  nonAccrualDays: number;
  accrualCalendarDays: number;
  daysInYear: number;
  annualEntitlement: number;
  accruedDays: number;
  usedDays: number;
  balanceForPeriod: number;
  cumulativeBalance: number;
  isCurrentPeriod: boolean;
  expirationDate?: string; // 3-year rule
  isExpiringSoon?: boolean;
  hasExpired?: boolean;
}

export interface CalculationResult {
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
  expiringDaysWarning?: {
    daysAtRisk: number;
    expireDate: string;
  };
  compensation?: {
    grossAmount: number;
    estimatedGpm: number;
    estimatedSodra: number;
    netAmount: number;
    vduUsed: number;
  };
}
