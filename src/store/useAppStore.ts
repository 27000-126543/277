import { create } from 'zustand';
import type { User, Enterprise, Alert, ApprovalProcess, WeeklyReport, ProvinceCreditData, KPIData, IndustryRankingItem, RegionRankingItem, FinancialAnalysis } from '@/types';
import { api } from '@/utils/api';

interface LoadingStates {
  global: boolean;
  enterprises: boolean;
  alerts: boolean;
  approvals: boolean;
  reports: boolean;
  dashboard: boolean;
  provinceData: boolean;
}

interface AppState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: LoadingStates;
  enterprises: Enterprise[];
  alerts: Alert[];
  approvalProcesses: ApprovalProcess[];
  weeklyReports: WeeklyReport[];
  provinceData: ProvinceCreditData[];
  selectedProvince: string | null;
  kpiData: KPIData[];
  industryRanking: IndustryRankingItem[];
  regionRanking: RegionRankingItem[];
  monthlyTrend: any[];
  industryCredit: any[];
  financialAnalysis: FinancialAnalysis[];
  error: string | null;

  setLoading: (key: keyof LoadingStates, value: boolean) => void;
  setError: (error: string | null) => void;
  init: () => Promise<void>;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
  getKPIData: () => KPIData[];
  getIndustryRanking: () => IndustryRankingItem[];
  getRegionRanking: () => RegionRankingItem[];
  getMonthlyTrendData: () => any[];
  getIndustryCreditData: () => any[];
  getFinancialAnalysis: () => FinancialAnalysis[];
  handleAlert: (alertId: string, handler: string, status: Alert['status'], resolution?: string) => Promise<boolean>;
  approveStep: (processId: string, step: number, handler: string, opinion: string) => Promise<boolean>;
  rejectStep: (processId: string, step: number, handler: string, opinion: string) => Promise<boolean>;
  fetchEnterprises: (params?: Record<string, any>) => Promise<void>;
  fetchAlerts: (params?: Record<string, any>) => Promise<void>;
  fetchApprovals: (params?: Record<string, any>) => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchProvinceData: () => Promise<void>;
  fetchDashboardData: () => Promise<void>;
  fetchEnterpriseDetail: (id: string) => Promise<Enterprise | null>;
  uploadFinancialReport: (file: File, enterpriseId: string, enterpriseName: string) => Promise<FinancialAnalysis | null>;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  isAuthenticated: false,
  loading: {
    global: false,
    enterprises: false,
    alerts: false,
    approvals: false,
    reports: false,
    dashboard: false,
    provinceData: false,
  },
  enterprises: [],
  alerts: [],
  approvalProcesses: [],
  weeklyReports: [],
  provinceData: [],
  selectedProvince: null,
  kpiData: [],
  industryRanking: [],
  regionRanking: [],
  monthlyTrend: [],
  industryCredit: [],
  financialAnalysis: [],
  error: null,

  setLoading: (key, value) => {
    set(state => ({ loading: { ...state.loading, [key]: value } }));
  },

  setError: (error) => {
    set({ error });
  },

  init: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        set({ loading: { ...get().loading, global: true } });
        const response = await api.auth.getMe();
        set({ 
          currentUser: response.user, 
          isAuthenticated: true, 
          error: null,
          loading: { ...get().loading, global: false }
        });
      } catch (error: any) {
        console.error('Failed to get user info:', error);
        localStorage.removeItem('token');
        set({ 
          currentUser: null, 
          isAuthenticated: false, 
          error: error.message || '认证失败',
          loading: { ...get().loading, global: false }
        });
      }
    }
  },

  login: async (username, password) => {
    try {
      set({ loading: { ...get().loading, global: true }, error: null });
      const response = await api.auth.login(username, password);
      if (response.token && response.user) {
        localStorage.setItem('token', response.token);
        set({ 
          currentUser: response.user, 
          isAuthenticated: true,
          loading: { ...get().loading, global: false }
        });
        return true;
      }
      set({ 
        error: '登录失败，用户名或密码错误',
        loading: { ...get().loading, global: false }
      });
      return false;
    } catch (error: any) {
      console.error('Login failed:', error);
      set({ 
        error: error.message || '登录失败，请检查网络连接',
        loading: { ...get().loading, global: false }
      });
      return false;
    }
  },

  logout: async () => {
    try {
      set({ loading: { ...get().loading, global: true } });
      await api.auth.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      localStorage.removeItem('token');
      set({ 
        currentUser: null, 
        isAuthenticated: false, 
        loading: { ...get().loading, global: false },
        enterprises: [],
        alerts: [],
        approvalProcesses: [],
        weeklyReports: [],
        provinceData: [],
        kpiData: [],
        industryRanking: [],
        regionRanking: [],
        monthlyTrend: [],
        industryCredit: [],
      });
    }
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
    const currentUser = get().currentUser;
    if (!currentUser) return [];
    return get().approvalProcesses.filter(p => {
      if (p.status !== 'pending') return false;
      const currentStepRole = ['', 'municipal', 'provincial', 'headquarters'][p.currentStep];
      return currentStepRole === currentUser.role;
    });
  },

  getKPIData: () => get().kpiData,
  getIndustryRanking: () => get().industryRanking,
  getRegionRanking: () => get().regionRanking,
  getMonthlyTrendData: () => get().monthlyTrend,
  getIndustryCreditData: () => get().industryCredit,
  getFinancialAnalysis: () => get().financialAnalysis,

  handleAlert: async (alertId, handler, status, resolution) => {
    try {
      set({ loading: { ...get().loading, alerts: true }, error: null });
      await api.alerts.handle(alertId, { handler, status, resolution });
      set(state => ({
        alerts: state.alerts.map(a =>
          a.id === alertId
            ? { ...a, status, handler, resolution, resolutionTime: new Date().toISOString() }
            : a
        ),
        loading: { ...state.loading, alerts: false },
      }));
      return true;
    } catch (error: any) {
      console.error('Handle alert failed:', error);
      set({ 
        error: error.message || '预警处置失败',
        loading: { ...get().loading, alerts: false }
      });
      return false;
    }
  },

  approveStep: async (processId, step, handler, opinion) => {
    try {
      set({ loading: { ...get().loading, approvals: true }, error: null });
      await api.approvals.approve(processId, opinion);
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
        loading: { ...state.loading, approvals: false },
      }));
      return true;
    } catch (error: any) {
      console.error('Approve step failed:', error);
      set({ 
        error: error.message || '审批失败',
        loading: { ...get().loading, approvals: false }
      });
      return false;
    }
  },

  rejectStep: async (processId, step, handler, opinion) => {
    try {
      set({ loading: { ...get().loading, approvals: true }, error: null });
      await api.approvals.reject(processId, opinion);
      set(state => ({
        approvalProcesses: state.approvalProcesses.map(p => {
          if (p.id !== processId) return p;
          const newSteps = p.steps.map(s =>
            s.step === step
              ? { ...s, status: 'rejected' as const, handler, opinion, handleTime: new Date().toISOString() }
              : s
          );
          return {
            ...p,
            steps: newSteps,
            status: 'rejected',
          };
        }),
        loading: { ...state.loading, approvals: false },
      }));
      return true;
    } catch (error: any) {
      console.error('Reject step failed:', error);
      set({ 
        error: error.message || '审批失败',
        loading: { ...get().loading, approvals: false }
      });
      return false;
    }
  },

  fetchEnterprises: async (params) => {
    try {
      set({ loading: { ...get().loading, enterprises: true }, error: null });
      const response = await api.enterprises.getList(params);
      set({ 
        enterprises: response.data || [], 
        loading: { ...get().loading, enterprises: false }
      });
    } catch (error: any) {
      console.error('Fetch enterprises failed:', error);
      set({ 
        error: error.message || '获取企业列表失败',
        enterprises: [],
        loading: { ...get().loading, enterprises: false }
      });
    }
  },

  fetchAlerts: async (params) => {
    try {
      set({ loading: { ...get().loading, alerts: true }, error: null });
      const response = await api.alerts.getList(params);
      set({ 
        alerts: response.data || [], 
        loading: { ...get().loading, alerts: false }
      });
    } catch (error: any) {
      console.error('Fetch alerts failed:', error);
      set({ 
        error: error.message || '获取预警列表失败',
        alerts: [],
        loading: { ...get().loading, alerts: false }
      });
    }
  },

  fetchApprovals: async (params) => {
    try {
      set({ loading: { ...get().loading, approvals: true }, error: null });
      const response = await api.approvals.getList(params);
      set({ 
        approvalProcesses: response.data || [], 
        loading: { ...get().loading, approvals: false }
      });
    } catch (error: any) {
      console.error('Fetch approvals failed:', error);
      set({ 
        error: error.message || '获取审批列表失败',
        approvalProcesses: [],
        loading: { ...get().loading, approvals: false }
      });
    }
  },

  fetchReports: async () => {
    try {
      set({ loading: { ...get().loading, reports: true }, error: null });
      const response = await api.reports.getList();
      set({ 
        weeklyReports: response.data || [], 
        loading: { ...get().loading, reports: false }
      });
    } catch (error: any) {
      console.error('Fetch reports failed:', error);
      set({ 
        error: error.message || '获取报告列表失败',
        weeklyReports: [],
        loading: { ...get().loading, reports: false }
      });
    }
  },

  fetchProvinceData: async () => {
    try {
      set({ loading: { ...get().loading, provinceData: true }, error: null });
      const response = await api.dashboard.getProvinceData();
      set({ 
        provinceData: response.data || [], 
        loading: { ...get().loading, provinceData: false }
      });
    } catch (error: any) {
      console.error('Fetch province data failed:', error);
      set({ 
        error: error.message || '获取省份数据失败',
        provinceData: [],
        loading: { ...get().loading, provinceData: false }
      });
    }
  },

  fetchDashboardData: async () => {
    try {
      set({ loading: { ...get().loading, dashboard: true }, error: null });
      const [kpi, industryRank, regionRank, monthly, industryCredit] = await Promise.all([
        api.dashboard.getKPI(),
        api.dashboard.getIndustryRanking(),
        api.dashboard.getRegionRanking(),
        api.dashboard.getMonthlyTrend(),
        api.dashboard.getIndustryCredit(),
      ]);
      set({
        kpiData: kpi.data || [],
        industryRanking: industryRank.data || [],
        regionRanking: regionRank.data || [],
        monthlyTrend: monthly.data || [],
        industryCredit: industryCredit.data || [],
        loading: { ...get().loading, dashboard: false },
      });
    } catch (error: any) {
      console.error('Fetch dashboard data failed:', error);
      set({ 
        error: error.message || '获取看板数据失败',
        kpiData: [],
        industryRanking: [],
        regionRanking: [],
        monthlyTrend: [],
        industryCredit: [],
        loading: { ...get().loading, dashboard: false },
      });
    }
  },

  fetchEnterpriseDetail: async (id) => {
    try {
      set({ loading: { ...get().loading, enterprises: true }, error: null });
      const response = await api.enterprises.getDetail(id);
      const data = response.data;
      set(state => ({
        enterprises: state.enterprises.some(e => e.id === id)
          ? state.enterprises.map(e => e.id === id ? data : e)
          : [...state.enterprises, data],
        loading: { ...state.loading, enterprises: false },
      }));
      return data;
    } catch (error: any) {
      console.error('Fetch enterprise detail failed:', error);
      set({ 
        error: error.message || '获取企业详情失败',
        loading: { ...get().loading, enterprises: false }
      });
      return null;
    }
  },

  uploadFinancialReport: async (file, enterpriseId, enterpriseName) => {
    try {
      set({ loading: { ...get().loading, global: true }, error: null });
      const result = await api.financial.upload(file, enterpriseId, enterpriseName);
      if (result) {
        set(state => ({
          financialAnalysis: [result, ...state.financialAnalysis],
          loading: { ...state.loading, global: false },
        }));
      }
      return result;
    } catch (error: any) {
      console.error('Upload financial report failed:', error);
      set({ 
        error: error.message || '财报上传分析失败',
        loading: { ...get().loading, global: false }
      });
      return null;
    }
  },
}));
