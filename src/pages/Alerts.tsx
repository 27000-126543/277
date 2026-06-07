import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Select, Button, Tabs, Modal, Form, Input, message, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { AlertTriangle, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Alert } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

const Alerts: React.FC = () => {
  const navigate = useNavigate();
  const { alerts, handleAlert, currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    level: '',
    status: '',
    province: '',
  });
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [form] = Form.useForm();

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === 'pending' && a.status !== 'pending' && a.status !== 'processing') return false;
    if (activeTab === 'resolved' && a.status !== 'resolved') return false;
    if (activeTab === 'escalated' && a.status !== 'escalated') return false;
    if (filters.level && a.level !== filters.level) return false;
    if (filters.status && a.status !== filters.status) return false;
    return true;
  });

  const handleHandleAlert = (values: { resolution: string; status: Alert['status'] }) => {
    if (selectedAlert) {
      handleAlert(selectedAlert.id, currentUser?.name || '', values.status, values.resolution);
      message.success('处置成功！');
      setHandleModalVisible(false);
      form.resetFields();
      setSelectedAlert(null);
    }
  };

  const columns: ColumnsType<Alert> = [
    {
      title: '预警等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => (
        <Tag color={level === 'level2' ? 'error' : 'warning'} icon={<AlertTriangle size={12} />}>
          {level === 'level2' ? '二级预警' : '一级预警'}
        </Tag>
      ),
    },
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      width: 200,
      render: (text, record) => (
        <span
          className="text-primary-600 hover:underline cursor-pointer"
          onClick={() => navigate(`/enterprises/${record.enterpriseId}`)}
        >
          {text}
        </span>
      ),
    },
    {
      title: '触发原因',
      dataIndex: 'triggerReason',
      key: 'triggerReason',
      ellipsis: true,
    },
    {
      title: '当前值',
      key: 'currentValue',
      width: 120,
      render: (_, record) => (
        <span className="font-mono text-danger-500 font-semibold">
          {record.triggerDetail.currentValue}
          {record.triggerDetail.metricName.includes('率') || record.triggerDetail.metricName.includes('比') ? '%' : ''}
        </span>
      ),
    },
    {
      title: '阈值',
      key: 'threshold',
      width: 100,
      render: (_, record) => (
        <span className="font-mono">
          {record.triggerDetail.threshold}
          {record.triggerDetail.metricName.includes('率') || record.triggerDetail.metricName.includes('比') ? '%' : ''}
        </span>
      ),
    },
    {
      title: '所属地区',
      dataIndex: 'province',
      key: 'province',
      width: 100,
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 100,
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      width: 170,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string; icon: React.ReactNode }> = {
          pending: { color: 'warning', text: '待处理', icon: <Clock size={12} /> },
          processing: { color: 'processing', text: '处理中', icon: <Clock size={12} /> },
          resolved: { color: 'success', text: '已解除', icon: <CheckCircle size={12} /> },
          escalated: { color: 'error', text: '已升级', icon: <XCircle size={12} /> },
        };
        const info = statusMap[status];
        return <Tag color={info.color} icon={info.icon}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 160,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<Eye size={12} />} onClick={() => navigate(`/alerts/${record.id}`)}>
            详情
          </Button>
          {(record.status === 'pending' || record.status === 'processing') && (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedAlert(record);
                setHandleModalVisible(true);
              }}
            >
              处置
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: `全部预警 (${alerts.length})` },
    { key: 'pending', label: `待处理 (${alerts.filter(a => a.status === 'pending' || a.status === 'processing').length})` },
    { key: 'resolved', label: `已解除 (${alerts.filter(a => a.status === 'resolved').length})` },
    { key: 'escalated', label: `已升级 (${alerts.filter(a => a.status === 'escalated').length})` },
  ];

  const level1Count = alerts.filter(a => a.level === 'level1').length;
  const level2Count = alerts.filter(a => a.level === 'level2').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-700">预警中心</h1>
          <p className="text-neutral-400 mt-1">实时监控企业信用风险变化</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-card" bordered={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">预警总数</p>
              <p className="text-3xl font-bold font-mono text-neutral-700 mt-1">{alerts.length}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <AlertTriangle className="text-primary-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="shadow-card" bordered={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">一级预警</p>
              <p className="text-3xl font-bold font-mono text-warning-500 mt-1">{level1Count}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-warning-50 flex items-center justify-center">
              <AlertTriangle className="text-warning-500" size={24} />
            </div>
          </div>
        </Card>
        <Card className="shadow-card" bordered={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-neutral-500 text-sm">二级预警</p>
              <p className="text-3xl font-bold font-mono text-danger-500 mt-1">{level2Count}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-danger-50 flex items-center justify-center">
              <AlertTriangle className="text-danger-500" size={24} />
            </div>
          </div>
        </Card>
      </div>

      <Card className="shadow-card" bordered={false}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

        <div className="flex flex-wrap gap-4 items-end mb-4">
          <div>
            <label className="block text-sm text-neutral-500 mb-2">预警等级</label>
            <Select
              placeholder="全部等级"
              value={filters.level || undefined}
              onChange={(v) => setFilters({ ...filters, level: v || '' })}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="level1">一级预警</Option>
              <Option value="level2">二级预警</Option>
            </Select>
          </div>
          <div>
            <label className="block text-sm text-neutral-500 mb-2">处置状态</label>
            <Select
              placeholder="全部状态"
              value={filters.status || undefined}
              onChange={(v) => setFilters({ ...filters, status: v || '' })}
              style={{ width: 140 }}
              allowClear
            >
              <Option value="pending">待处理</Option>
              <Option value="processing">处理中</Option>
              <Option value="resolved">已解除</Option>
              <Option value="escalated">已升级</Option>
            </Select>
          </div>
          <Button type="default" onClick={() => setFilters({ level: '', status: '', province: '' })}>
            重置
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={filteredAlerts}
          rowKey="id"
          scroll={{ x: 1200 }}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条预警`,
          }}
        />
      </Card>

      <Modal
        title="预警处置"
        open={handleModalVisible}
        onCancel={() => {
          setHandleModalVisible(false);
          setSelectedAlert(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        {selectedAlert && (
          <div className="space-y-4">
            <div className="p-4 bg-neutral-50 rounded-lg space-y-2">
              <div className="flex items-center gap-2">
                <Tag color={selectedAlert.level === 'level2' ? 'error' : 'warning'}>
                  {selectedAlert.level === 'level2' ? '二级预警' : '一级预警'}
                </Tag>
                <span className="font-medium">{selectedAlert.enterpriseName}</span>
              </div>
              <p className="text-sm text-neutral-600">{selectedAlert.triggerReason}</p>
            </div>

            <Form form={form} layout="vertical" onFinish={handleHandleAlert}>
              <Form.Item
                name="status"
                label="处置方式"
                rules={[{ required: true, message: '请选择处置方式' }]}
              >
                <Select placeholder="请选择">
                  <Option value="processing">标记为处理中</Option>
                  <Option value="resolved">解除预警</Option>
                  <Option value="escalated">升级至审批流程</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="resolution"
                label="处置意见"
                rules={[{ required: true, message: '请填写处置意见' }]}
              >
                <TextArea rows={4} placeholder="请详细描述处置情况和意见..." />
              </Form.Item>

              <Form.Item className="mb-0">
                <div className="flex justify-end gap-2">
                  <Button onClick={() => {
                    setHandleModalVisible(false);
                    setSelectedAlert(null);
                  }}>
                    取消
                  </Button>
                  <Button type="primary" htmlType="submit">
                    确认处置
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Alerts;
