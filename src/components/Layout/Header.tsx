import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { Dropdown, Avatar, Badge, Input } from 'antd';
import type { MenuProps } from 'antd';

const { Search: AntSearch } = Input;

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout, alerts } = useAppStore();
  const [searchValue, setSearchValue] = useState('');

  const pendingAlerts = alerts.filter(a => a.status === 'pending' || a.status === 'processing').length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <User size={16} />,
      label: '个人中心',
    },
    {
      key: 'settings',
      icon: <Settings size={16} />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogOut size={16} />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <AntSearch
            placeholder="搜索企业名称、统一信用代码..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onSearch={(value) => {
              if (value) {
                navigate(`/enterprises?search=${encodeURIComponent(value)}`);
              }
            }}
            allowClear
            size="middle"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          className="relative p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          onClick={() => navigate('/alerts')}
        >
          <Badge count={pendingAlerts} size="small">
            <Bell size={20} className="text-neutral-500" />
          </Badge>
        </button>

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 px-3 py-1.5 rounded-lg transition-colors">
            <Avatar size={32} src={currentUser?.avatar}>
              {currentUser?.name?.charAt(0)}
            </Avatar>
            <div className="hidden md:block">
              <div className="text-sm font-medium text-neutral-700">{currentUser?.name}</div>
              <div className="text-xs text-neutral-400">
                {currentUser?.role === 'headquarters' && '总行管理员'}
                {currentUser?.role === 'provincial' && '省分行主管'}
                {currentUser?.role === 'municipal' && '市支行经理'}
                {currentUser?.role === 'analyst' && '风控分析师'}
              </div>
            </div>
            <ChevronDown size={16} className="text-neutral-400" />
          </div>
        </Dropdown>
      </div>
    </header>
  );
};

export default Header;
