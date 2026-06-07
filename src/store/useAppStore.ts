import { create } from 'zustand';
import type { User, Enterprise, Alert, ApprovalProcess, WeeklyReport, ProvinceCreditData } from '@/types';
import {
  mockUsers,
  mockEnterprises,
  mockAlerts,
  mockApprovalProcesses,
  mockWeeklyReports,
  mockProvinceData,
  mockKPIData,
  mockIndustryRanking,
  mockRegionRanking,
  monthlyTrendData,
  industryCreditData,
  mockFinancialAnalysis,
} from '@/mock/data';

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  enterprises: Enterprise[];
  alerts: Alert[];
  approvalProcesses: ApprovalProcess[];
  weeklyReports: WeeklyReport[];
  provinceData: ProvinceCreditData[];
  selectedProvince: string | null;

  login: (username: string, password: string) => boolean;
  logout: () => void;
  setSelectedProvince: (code: string | null) => void;
  getEnterpriseById: (id: string) => Enterprise | undefined;
  getAlertById: (id: string) => Alert | undefined;
  getApprovalById: (id: string) => ApprovalProcess | undefined;
  getProvinceByCode: (code: string) => ProvinceCreditData | undefined;
  getFilteredEnterprises: (filters: {
    province?: string;
    industry?: string;
    scale?: string;
    creditLevel?: string;
    alertStatus?: string;
  }) => Enterprise[];
  getFilteredAlerts: (filters: {
    level?: string;
    status?: string;
    province?: string;
    industry?: string;
  }) => Alert[];
  getMyApprovals: (userId: string) => ApprovalProcess[];
  getKPIData: () => typeof mockKPIData;
  getIndustryRanking: () => typeof mockIndustryRanking;
  getRegionRanking: () => typeof mockRegionRanking;
  getMonthlyTrendData: () => typeof monthlyTrendData;
  getIndustryCreditData: () => typeof industryCreditData;
  getFinancialAnalysis: () => typeof mockFinancialAnalysis;
  handleAlert: (alertId: string, handler: string, status: Alert['status'], resolution?: string) => void;
  approveStep: (processId: string, step: number, handler: string, opinion: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  enterprises: mockEnterprises,
  alerts: mockAlerts,
  approvalProcesses: mockApprovalProcesses,
  weeklyReports: mockWeeklyReports,
  provinceData: mockProvinceData,
  selectedProvince: null,

  login: (username, password) => {
    const user = mockUsers.find(u => u.username === username);
    if (user && password === '123456') {
      set({ currentUser: user, isAuthenticated: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ currentUser: null, isAuthenticated: false });
  },

  setSelectedProvince: (code) => {
    set({ selectedProvince: code });
  },

  getEnterpriseById: (id) => {
    return get().enterprises.find(e => e.id === id);
  },

  getAlertById: (id) => {
    return get().alerts.find(a => a.id === id);
  },

  getApprovalById: (id) => {
    return get().approvalProcesses.find(a => a.id === id);
  },

  getProvinceByCode: (code) => {
    return get().provinceData.find(p => p.provinceCode === code);
  },

  getFilteredEnterprises: (filters) => {
    let result = [...get().enterprises];
    if (filters.province) {
      result = result.filter(e => e.provinceCode === filters.province);
    }
    if (filters.industry) {
      result = result.filter(e => e.industry === filters.industry);
    }
    if (filters.scale) {
      result = result.filter(e => e.scale === filters.scale);
    }
    if (filters.creditLevel) {
      result = result.filter(e => e.creditLevel === filters.creditLevel);
    }
    if (filters.alertStatus) {
      result = result.filter(e => e.alertStatus === filters.alertStatus);
    }
    return result;
  },

  getFilteredAlerts: (filters) => {
    let result = [...get().alerts];
    if (filters.level) {
      result = result.filter(a => a.level === filters.level);
    }
    if (filters.status) {
      result = result.filter(a => a.status === filters.status);
    }
    if (filters.province) {
      result = result.filter(a => a.province === filters.province);
    }
    if (filters.industry) {
      result = result.filter(a => a.industry === filters.industry);
    }
    return result;
  },

  getMyApprovals: (userId) => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) return [];
    return get().approvalProcesses;
  },

  getKPIData: () => mockKPIData,
  getIndustryRanking: () => mockIndustryRanking,
  getRegionRanking: () => mockRegionRanking,
  getMonthlyTrendData: () => monthlyTrendData,
  getIndustryCreditData: () => industryCreditData,
  getFinancialAnalysis: () => mockFinancialAnalysis,

  handleAlert: (alertId, handler, status, resolution) => {
    set(state => ({
      alerts: state.alerts.map(a =>
        a.id === alertId
          ? { ...a, status, handler, resolution, resolutionTime: new Date().toISOString() }
          : a
      ),
    }));
  },

  approveStep: (processId, step, handler, opinion) => {
    set(state => ({
      approvalProcesses: state.approvalProcesses.map(p => {
        if (p.id !== processId) return p;
        const newSteps = p.steps.map(s =>
          s.step === step
            ? { ...s, status: 'approved' as const, handler, opinion, handleTime: new Date().toISOString() }
            : s
        );
        const nextStep = step + 1;
        const isComplete = nextStep > 3;
        return {
          ...p,
          steps: newSteps,
          currentStep: isComplete ? 3 : (nextStep as 1 | 2 | 3),
          status: isComplete ? 'approved' : 'pending',
        };
      }),
    }));
  },
}));
