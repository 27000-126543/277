import type {
  User,
  Enterprise,
  Alert,
  ApprovalProcess,
  FinancialAnalysis,
  WeeklyReport,
  ProvinceCreditData,
} from '../types';

class Database {
  private static instance: Database;
  public users: User[] = [];
  public enterprises: Enterprise[] = [];
  public alerts: Alert[] = [];
  public approvalProcesses: ApprovalProcess[] = [];
  public financialAnalyses: FinancialAnalysis[] = [];
  public weeklyReports: WeeklyReport[] = [];
  public provinceData: ProvinceCreditData[] = [];

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public reset() {
    this.users = [];
    this.enterprises = [];
    this.alerts = [];
    this.approvalProcesses = [];
    this.financialAnalyses = [];
    this.weeklyReports = [];
    this.provinceData = [];
  }
}

export const db = Database.getInstance();
