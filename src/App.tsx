import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ConfigProvider, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import MainLayout from "@/components/Layout/MainLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import ProvinceDashboard from "@/pages/ProvinceDashboard";
import Enterprises from "@/pages/Enterprises";
import EnterpriseDetail from "@/pages/EnterpriseDetail";
import Alerts from "@/pages/Alerts";
import FinancialAnalysis from "@/pages/FinancialAnalysis";
import ApprovalWorkbench from "@/pages/ApprovalWorkbench";
import ReportCenter from "@/pages/ReportCenter";
import SystemManagement from "@/pages/SystemManagement";
import { useAppStore } from "@/store/useAppStore";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAppStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const { init, loading } = useAppStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading.global) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spin size="large" tip="系统加载中..." />
      </div>
    );
  }
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: '#165DFF',
          borderRadius: 6,
          fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
      }}
    >
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dashboard/province/:provinceCode" element={<ProvinceDashboard />} />
            <Route path="enterprises" element={<Enterprises />} />
            <Route path="enterprises/:id" element={<EnterpriseDetail />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="financial-analysis" element={<FinancialAnalysis />} />
            <Route path="approvals" element={<ApprovalWorkbench />} />
            <Route path="reports" element={<ReportCenter />} />
            <Route path="system" element={<SystemManagement />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}
