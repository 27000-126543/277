export type UserRole = 'headquarters' | 'provincial' | 'municipal' | 'analyst';
export type CreditLevel = 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC' | 'CC' | 'C';
export type EnterpriseScale = 'large' | 'medium' | 'small' | 'micro';
export type AlertLevel = 'level1' | 'level2';
export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'escalated';
export type AlertTriggerType = 'score_drop' | 'debt_ratio_exceed' | 'other';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ApprovalType = 'credit_adjust' | 'post_loan';
export type DataSourceType = 'business' | 'judicial' | 'tax' | 'bank' | 'credit' | 'other';

export interface User {
  id: string;
  username: string;
  name: string;
  password: string;
  role: UserRole;
  region?: string;
  regionCode?: string;
  permissions: string[];
  avatar?: string;
  createdAt: string;
}

export interface CreditScoreHistory {
  date: string;
  score: number;
}

export interface DataSourceRecord {
  sourceType: DataSourceType;
  sourceName: string;
  rawData: any;
  fetchedAt: string;
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
  dataSources: DataSourceRecord[];
  updateTime: string;
  shareholders?: Shareholder[];
  executives?: Executive[];
  riskTags?: string[];
  financialData?: FinancialData;
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

export interface FinancialData {
  totalAssets: number;
  totalLiabilities: number;
  currentAssets: number;
  currentLiabilities: number;
  netProfit: number;
  shareholdersEquity: number;
  operatingRevenue: number;
  accountsReceivable: number;
  inventory: number;
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
  provinceCode?: string;
  cityCode?: string;
  industry?: string;
  firstTriggerTime?: string;
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
  rawFile?: string;
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
  createdAt: string;
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

export interface CityCreditData {
  cityCode: string;
  cityName: string;
  avgCreditScore: number;
  defaultRate: number;
  enterpriseCount: number;
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
