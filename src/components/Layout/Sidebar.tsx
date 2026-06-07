import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  AlertTriangle,
  FileBarChart,
  ClipboardCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  {
    key: 'dashboard',
    label: '核心看板',
    icon: LayoutDashboard,
    path: '/dashboard',
  },
  {
    key: 'enterprises',
    label: '企业档案',
    icon: Building2,
    path: '/enterprises',
  },
  {
    key: 'alerts',
    label: '预警中心',
    icon: AlertTriangle,
    path: '/alerts',
    badge: 12,
  },
  {
    key: 'financial',
    label: '财报分析',
    icon: FileBarChart,
    path: '/financial',
  },
  {
    key: 'approval',
    label: '审批工作台',
    icon: ClipboardCheck,
    path: '/approval',
    badge: 3,
  },
  {
    key: 'reports',
    label: '报告中心',
    icon: FileText,
    path: '/reports',
  },
  {
    key: 'system',
    label: '系统管理',
    icon: Settings,
    path: '/system/users',
  },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-white border-r border-neutral-200 shadow-sidebar transition-all duration-300 z-30',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-neutral-200 px-4">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-sm">信</span>
            </div>
            <span className="font-semibold text-neutral-700">信用风控平台</span>
          </div>
        )}
        {collapsed && (
          <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-sm">信</span>
          </div>
        )}
      </div>

      <nav className="py-4">
        {menuItems.map((item) => (
          <NavLink
            key={item.key}
            to={item.path}
            className={cn(
              'flex items-center gap-3 px-4 py-3 mx-2 my-1 rounded-lg transition-all duration-200 relative group',
              isActive(item.path)
                ? 'bg-primary-50 text-primary-600 font-medium'
                : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700'
            )}
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="bg-danger-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </>
            )}
            {collapsed && item.badge && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
};

export default Sidebar;
