export type UserRole = 'headquarters' | 'provincial' | 'municipal' | 'analyst';

export type CreditLevel = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C';

export type EnterpriseScale = 'large' | 'medium' | 'small' | 'micro';

export type AlertLevel = 'level1' | 'level2';

export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'escalated';

export type AlertTriggerType = 'score_drop' | 'debt_ratio_exceed' | 'other';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export type ApprovalType = 'credit_adjust' | 'post_loan';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  region?: string;
  regionCode?: string;
  permissions: string[];
  avatar?: string;
}

export interface CreditScoreHistory {
  date: string;
  score: number;
}

export interface Enterprise {
  id: string;
  name: string;
  unifiedCreditCode: string;
  legalPerson: string;
  registeredCapital: number;
  establishmentDate: string;
  province: string;
  provinceCode: string;
  city: string;
  cityCode: string;
  industry: string;
  industryCode: string;
  scale: EnterpriseScale;
  creditScore: number;
  creditLevel: CreditLevel;
  defaultProbability: number;
  debtSolvencyIndex: number;
  assetLiabilityRatio: number;
  alertStatus: 'normal' | 'level1' | 'level2' | 'resolved';
  creditScoreHistory: CreditScoreHistory[];
  updateTime: string;
  shareholders?: Shareholder[];
  executives?: Executive[];
  riskTags?: string[];
}

export interface Shareholder {
  name: string;
  shareRatio: number;
  subscribedAmount: number;
}

export interface Executive {
  name: string;
  position: string;
}

export interface Alert {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  level: AlertLevel;
  triggerType: AlertTriggerType;
  triggerReason: string;
  triggerDetail: {
    metricName: string;
    currentValue: number;
    threshold: number;
    changeRate?: number;
  };
  triggerTime: string;
  status: AlertStatus;
  handler?: string;
  resolution?: string;
  resolutionTime?: string;
  approvalProcessId?: string;
  province?: string;
  industry?: string;
}

export interface ApprovalStep {
  step: 1 | 2 | 3;
  role: string;
  handler: string;
  status: ApprovalStatus;
  opinion?: string;
  handleTime?: string;
}

export interface ApprovalProcess {
  id: string;
  alertId: string;
  enterpriseName: string;
  type: ApprovalType;
  currentStep: 1 | 2 | 3;
  status: ApprovalStatus;
  steps: ApprovalStep[];
  proposedAdjustment?: {
    originalCreditLine: number;
    proposedCreditLine: number;
    reason: string;
  };
  createTime: string;
  applicant: string;
}

export interface FinancialRatio {
  name: string;
  value: number;
  industryAverage: number;
  deviationRate: number;
  isAbnormal: boolean;
}

export interface AbnormalItem {
  ratioName: string;
  value: number;
  industryAverage: number;
  deviationRate: number;
  analysis: string;
  dueDiligenceSuggestion: string;
}

export interface FinancialAnalysis {
  id: string;
  enterpriseId: string;
  enterpriseName: string;
  reportPeriod: string;
  uploadTime: string;
  keyRatios: FinancialRatio[];
  abnormalItems: AbnormalItem[];
  overallAssessment: string;
}

export interface WeeklyReport {
  id: string;
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  keyMetrics: {
    overallDefaultRate: number;
    defaultRateYoY: number;
    defaultRateMoM: number;
    industryConcentration: { industry: string; ratio: number }[];
    creditUtilizationRate: number;
  };
  trendComparison: {
    metric: string;
    currentWeek: number;
    lastWeek: number;
    change: number;
    unit: string;
  }[];
  riskStrategyRecommendations: string[];
  keyMonitoringList: {
    enterpriseName: string;
    industry: string;
    region: string;
    riskReason: string;
  }[];
}

export interface CityCreditData {
  cityCode: string;
  cityName: string;
  avgCreditScore: number;
  defaultRate: number;
  enterpriseCount: number;
}

export interface ProvinceCreditData {
  provinceCode: string;
  provinceName: string;
  avgCreditScore: number;
  defaultRate: number;
  alertCount: number;
  enterpriseCount: number;
  cities: CityCreditData[];
}

export interface KPIData {
  title: string;
  value: number | string;
  unit?: string;
  change?: number;
  changeType?: 'increase' | 'decrease';
  trendData?: number[];
}

export interface IndustryRankingItem {
  rank: number;
  industry: string;
  defaultRate: number;
  enterpriseCount: number;
  change: number;
}

export interface RegionRankingItem {
  rank: number;
  region: string;
  provinceCode: string;
  defaultRate: number;
  alertCount: number;
}
