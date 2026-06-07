const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';


function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: '请求失败' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    login: (username: string, password: string) =>
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      }),
    getMe: () => request<any>('/auth/me'),
    logout: () => request<any>('/auth/logout', { method: 'POST' }),
  },

  dashboard: {
    getKPI: () => request<any>('/dashboard/kpi'),
    getProvinceData: () => request<any>('/dashboard/province-data'),
    getProvinceDetail: (code: string) => request<any>(`/dashboard/province/${code}`),
    getIndustryRanking: () => request<any>('/dashboard/industry-ranking'),
    getRegionRanking: () => request<any>('/dashboard/region-ranking'),
    getMonthlyTrend: () => request<any>('/dashboard/monthly-trend'),
    getIndustryCredit: () => request<any>('/dashboard/industry-credit'),
  },

  enterprises: {
    getList: (params?: Record<string, any>) => {
      const query = new URLSearchParams(params).toString();
      return request<any>(`/enterprises${query ? `?${query}` : ''}`);
    },
    getDetail: (id: string) => request<any>(`/enterprises/${id}`),
    getCreditHistory: (id: string) => request<any>(`/enterprises/${id}/credit-history`),
    getAlerts: (id: string) => request<any>(`/enterprises/${id}/alerts`),
    update: (id: string, data: any) =>
      request<any>(`/enterprises/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
  },

  alerts: {
    getList: (params?: Record<string, any>) => {
      const query = new URLSearchParams(params).toString();
      return request<any>(`/alerts${query ? `?${query}` : ''}`);
    },
    getDetail: (id: string) => request<any>(`/alerts/${id}`),
    handle: (id: string, data: any) =>
      request<any>(`/alerts/${id}/handle`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    escalate: (id: string) =>
      request<any>(`/alerts/${id}/escalate`, { method: 'POST' }),
    getStatistics: () => request<any>('/alerts/statistics'),
  },

  approvals: {
    getList: (params?: Record<string, any>) => {
      const query = new URLSearchParams(params).toString();
      return request<any>(`/approvals${query ? `?${query}` : ''}`);
    },
    getDetail: (id: string) => request<any>(`/approvals/${id}`),
    approve: (id: string, opinion: string) =>
      request<any>(`/approvals/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ opinion }),
      }),
    reject: (id: string, opinion: string) =>
      request<any>(`/approvals/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ opinion }),
      }),
    getStatistics: () => request<any>('/approvals/statistics'),
    getMine: () => request<any>('/approvals/mine'),
  },

  financial: {
    upload: (file: File, enterpriseId: string, enterpriseName: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('enterpriseId', enterpriseId);
      formData.append('enterpriseName', enterpriseName);
      return request<any>('/financial/upload', {
        method: 'POST',
        body: formData,
        headers: {},
      });
    },
    getList: () => request<any>('/financial'),
    getDetail: (id: string) => request<any>(`/financial/${id}`),
    delete: (id: string) =>
      request<any>(`/financial/${id}`, { method: 'DELETE' }),
  },

  reports: {
    getList: () => request<any>('/reports'),
    getDetail: (id: string) => request<any>(`/reports/${id}`),
    generate: () =>
      request<any>('/reports/generate', { method: 'POST' }),
    download: (id: string) => request<any>(`/reports/download/${id}`),
  },

  system: {
    getUsers: () => request<any>('/system/users'),
    createUser: (data: any) =>
      request<any>('/system/users', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateUser: (id: string, data: any) =>
      request<any>(`/system/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    deleteUser: (id: string) =>
      request<any>(`/system/users/${id}`, { method: 'DELETE' }),
    getDataSources: () => request<any>('/system/datasources'),
    syncDataSource: (id: string) =>
      request<any>(`/system/datasources/${id}/sync`, { method: 'POST' }),
  },
};
