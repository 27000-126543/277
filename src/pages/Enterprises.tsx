import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, Card, Select, Input, Tag, Space, Button } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Filter, Download, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Enterprise } from '@/types';
import { cn } from '@/lib/utils';

const { Option } = Select;
const { Search } = Input;

const Enterprises: React.FC = () => {
  const navigate = useNavigate();
  const { enterprises, getFilteredEnterprises } = useAppStore();
  const [searchText, setSearchText] = useState('');
  const [filters, setFilters] = useState({
    province: '',
    industry: '',
    scale: '',
    creditLevel: '',
    alertStatus: '',
  });

  const creditLevelColors: Record<string, string> = {
    AAA: 'bg-success-500',
    AA: 'bg-success-500',
    A: 'bg-primary-500',
    BBB: 'bg-primary-400',
    BB: 'bg-warning-500',
    B: 'bg-warning-500',
    CCC: 'bg-danger-400',
    CC: 'bg-danger-500',
    C: 'bg-danger-600',
  };

  const alertStatusMap: Record<string, { color: string; text: string }> = {
    normal: { color: 'success', text: '正常' },
    level1: { color: 'warning', text: '一级预警' },
    level2: { color: 'error', text: '二级预警' },
    resolved: { color: 'default', text: '已解除' },
  };

  const scaleMap: Record<string, string> = {
    large: '大型',
    medium: '中型',
    small: '小型',
    micro: '微型',
  };

  const filteredData = enterprises.filter(e => {
    if (searchText && !e.name.includes(searchText) && !e.unifiedCreditCode.includes(searchText)) {
      return false;
    }
    if (filters.province && e.provinceCode !== filters.province) return false;
    if (filters.industry && e.industry !== filters.industry) return false;
    if (filters.scale && e.scale !== filters.scale) return false;
    if (filters.creditLevel && e.creditLevel !== filters.creditLevel) return false;
    if (filters.alertStatus && e.alertStatus !== filters.alertStatus) return false;
    return true;
  });

  const columns: ColumnsType<Enterprise> = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
      render: (text, record) => (
        <div
          className="text-primary-600 hover:underline cursor-pointer font-medium"
          onClick={() => navigate(`/enterprises/${record.id}`)}
        >
          {text}
        </div>
      ),
    },
    {
      title: '统一信用代码',
      dataIndex: 'unifiedCreditCode',
      key: 'unifiedCreditCode',
      width: 180,
      className: 'font-mono text-sm',
    },
    {
      title: '所属地区',
      key: 'region',
      width: 120,
      render: (_, record) => (
        <span>{record.province} {record.city}</span>
      ),
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
    },
    {
      title: '企业规模',
      dataIndex: 'scale',
      key: 'scale',
      width: 80,
      render: (scale) => scaleMap[scale] || scale,
    },
    {
      title: '信用分',
      dataIndex: 'creditScore',
      key: 'creditScore',
      width: 100,
      render: (score) => (
        <span className="font-mono font-semibold text-neutral-700">{score}</span>
      ),
      sorter: (a, b) => a.creditScore - b.creditScore,
    },
    {
      title: '信用等级',
      dataIndex: 'creditLevel',
      key: 'creditLevel',
      width: 100,
      render: (level) => (
        <Tag color={creditLevelColors[level]?.replace('bg-', '')} className="border-0">
          <span className="text-white font-medium">{level}</span>
        </Tag>
      ),
    },
    {
      title: '违约概率',
      dataIndex: 'defaultProbability',
      key: 'defaultProbability',
      width: 100,
      render: (val) => <span className="font-mono">{val.toFixed(2)}%</span>,
      sorter: (a, b) => a.defaultProbability - b.defaultProbability,
    },
    {
      title: '资产负债率',
      dataIndex: 'assetLiabilityRatio',
      key: 'assetLiabilityRatio',
      width: 110,
      render: (val) => (
        <span
          className={cn(
            'font-mono',
            val > 75 ? 'text-danger-500 font-semibold' : 'text-neutral-600'
          )}
        >
          {val.toFixed(1)}%
        </span>
      ),
      sorter: (a, b) => a.assetLiabilityRatio - b.assetLiabilityRatio,
    },
    {
      title: '状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      width: 100,
      render: (status) => {
        const info = alertStatusMap[status];
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<Eye size={14} />}
          onClick={() => navigate(`/enterprises/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-700">企业档案</h1>
          <p className="text-neutral-400 mt-1">共 {filteredData.length} 家企业</p>
        </div>
        <div className="flex items-center gap-3">
          <Button icon={<Download size={16} />}>导出数据</Button>
        </div>
      </div>

      <Card className="shadow-card" bordered={false}>
        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="block text-sm text-neutral-500 mb-2">企业名称/代码</label>
            <Search
              placeholder="搜索企业名称或信用代码"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              allowClear
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">所属地区</label>
            <Select
              placeholder="全部地区"
              value={filters.province || undefined}
              onChange={(v) => setFilters({ ...filters, province: v || '' })}
              style={{ width: 140 }}
              allowClear
            >
              {useAppStore.getState().provinceData.map(p => (
                <Option key={p.provinceCode} value={p.provinceCode}>{p.provinceName}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">行业</label>
            <Select
              placeholder="全部行业"
              value={filters.industry || undefined}
              onChange={(v) => setFilters({ ...filters, industry: v || '' })}
              style={{ width: 140 }}
              allowClear
            >
              {['制造业', '房地产', '金融业', '批发零售', '信息技术', '建筑业', '交通运输'].map(i => (
                <Option key={i} value={i}>{i}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">企业规模</label>
            <Select
              placeholder="全部规模"
              value={filters.scale || undefined}
              onChange={(v) => setFilters({ ...filters, scale: v || '' })}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="large">大型</Option>
              <Option value="medium">中型</Option>
              <Option value="small">小型</Option>
              <Option value="micro">微型</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">信用等级</label>
            <Select
              placeholder="全部等级"
              value={filters.creditLevel || undefined}
              onChange={(v) => setFilters({ ...filters, creditLevel: v || '' })}
              style={{ width: 120 }}
              allowClear
            >
              {['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C'].map(l => (
                <Option key={l} value={l}>{l}</Option>
              ))}
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">预警状态</label>
            <Select
              placeholder="全部状态"
              value={filters.alertStatus || undefined}
              onChange={(v) => setFilters({ ...filters, alertStatus: v || '' })}
              style={{ width: 120 }}
              allowClear
            >
              <Option value="normal">正常</Option>
              <Option value="level1">一级预警</Option>
              <Option value="level2">二级预警</Option>
              <Option value="resolved">已解除</Option>
            </Select>
          </div>
          <Button type="default" onClick={() => {
            setFilters({ province: '', industry: '', scale: '', creditLevel: '', alertStatus: '' });
            setSearchText('');
          }}>
            重置
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条记录`,
          }}
        />
      </Card>
    </div>
  );
};

export default Enterprises;
