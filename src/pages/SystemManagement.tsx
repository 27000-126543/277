import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Switch,
  Space,
  Tabs,
  Badge,
  Descriptions,
  Row,
  Col,
  Statistic,
  Progress,
} from 'antd';
import {
  UserOutlined,
  DatabaseOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store/useAppStore';
import type { ColumnsType } from 'antd/es/table';
import type { User } from '@/types';

const { Option } = Select;

const dataSources = [
  { id: '1', name: '工商信息API', provider: '国家企业信用信息公示系统', type: 'api', status: 'active', syncFrequency: '实时', lastSync: '2024-12-01 14:30', dataCount: 2568000, successRate: 99.8 },
  { id: '2', name: '司法诉讼数据', provider: '中国裁判文书网', type: 'api', status: 'active', syncFrequency: '每小时', lastSync: '2024-12-01 14:00', dataCount: 1256000, successRate: 98.5 },
  { id: '3', name: '税务信息接口', provider: '国家税务总局', type: 'api', status: 'active', syncFrequency: '每日', lastSync: '2024-12-01 08:00', dataCount: 892000, successRate: 99.2 },
  { id: '4', name: '银行流水数据', provider: '银保监会接口', type: 'api', status: 'warning', syncFrequency: '实时', lastSync: '2024-12-01 10:15', dataCount: 5680000, successRate: 95.3 },
  { id: '5', name: '征信数据', provider: '人民银行征信中心', type: 'api', status: 'active', syncFrequency: '每日', lastSync: '2024-12-01 06:00', dataCount: 3256000, successRate: 99.9 },
  { id: '6', name: '行政处罚信息', provider: '信用中国', type: 'api', status: 'active', syncFrequency: '每小时', lastSync: '2024-12-01 13:30', dataCount: 456000, successRate: 97.8 },
  { id: '7', name: '知识产权数据', provider: '国家知识产权局', type: 'api', status: 'inactive', syncFrequency: '每周', lastSync: '2024-11-25 00:00', dataCount: 789000, successRate: 96.5 },
  { id: '8', name: '进出口数据', provider: '海关总署', type: 'api', status: 'active', syncFrequency: '每日', lastSync: '2024-12-01 07:30', dataCount: 234000, successRate: 98.2 },
  { id: '9', name: '土地房产信息', provider: '自然资源部', type: 'api', status: 'warning', syncFrequency: '每日', lastSync: '2024-12-01 05:00', dataCount: 1568000, successRate: 94.7 },
  { id: '10', name: '招投标数据', provider: '全国公共资源交易平台', type: 'api', status: 'active', syncFrequency: '每小时', lastSync: '2024-12-01 14:20', dataCount: 678000, successRate: 98.9 },
];

const SystemManagement: React.FC = () => {
  const { currentUser } = useAppStore();
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const mockUsers: User[] = [
    { id: '1', username: 'admin', name: '张管理', role: 'headquarters', permissions: ['all'], region: '全国', regionCode: '000000' },
    { id: '2', username: 'provincial_guangdong', name: '李省行', role: 'provincial', permissions: ['view', 'approve'], region: '广东省', regionCode: '440000' },
    { id: '3', username: 'provincial_jiangsu', name: '王江苏', role: 'provincial', permissions: ['view', 'approve'], region: '江苏省', regionCode: '320000' },
    { id: '4', username: 'municipal_guangzhou', name: '赵广州', role: 'municipal', permissions: ['view'], region: '广州市', regionCode: '440100' },
    { id: '5', username: 'municipal_shenzhen', name: '钱深圳', role: 'municipal', permissions: ['view'], region: '深圳市', regionCode: '440300' },
    { id: '6', username: 'analyst_wang', name: '孙分析', role: 'analyst', permissions: ['view', 'report'], region: '全国', regionCode: '000000' },
    { id: '7', username: 'municipal_nanjing', name: '周南京', role: 'municipal', permissions: ['view'], region: '南京市', regionCode: '320100' },
    { id: '8', username: 'provincial_zhejiang', name: '吴浙江', role: 'provincial', permissions: ['view', 'approve'], region: '浙江省', regionCode: '330000' },
  ];

  const userColumns: ColumnsType<User> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text) => (
        <span className="flex items-center gap-2">
          <UserOutlined className="text-neutral-400" />
          <span className="font-medium">{text}</span>
        </span>
      ),
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => {
        const roleMap: Record<string, { text: string; color: string }> = {
          headquarters: { text: '总行', color: 'purple' },
          provincial: { text: '省分行', color: 'blue' },
          municipal: { text: '市支行', color: 'cyan' },
          analyst: { text: '分析师', color: 'green' },
        };
        const r = roleMap[role] || roleMap.analyst;
        return <Tag color={r.color}>{r.text}</Tag>;
      },
    },
    {
      title: '管辖区域',
      dataIndex: 'region',
      key: 'region',
      width: 120,
    },
    {
      title: '权限',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms) => (
        <Space size={[4, 4]} wrap>
          {perms.map((p: string, i: number) => {
            const permMap: Record<string, string> = { all: '全部', view: '查看', approve: '审批', report: '报告' };
            return <Tag key={i}>{permMap[p] || p}</Tag>;
          })}
        </Space>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      render: () => <Badge status="success" text="正常" />,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              form.setFieldsValue(record);
              setUserModalVisible(true);
            }}
          >
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const dataSourceColumns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <span className="flex items-center gap-2">
          <DatabaseOutlined className="text-primary-500" />
          <span className="font-medium">{text}</span>
        </span>
      ),
    },
    {
      title: '数据提供方',
      dataIndex: 'provider',
      key: 'provider',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type: string) => <Tag color="blue">{type.toUpperCase()}</Tag>,
    },
    {
      title: '同步频率',
      dataIndex: 'syncFrequency',
      key: 'syncFrequency',
      width: 80,
    },
    {
      title: '上次同步',
      dataIndex: 'lastSync',
      key: 'lastSync',
      width: 160,
    },
    {
      title: '成功率',
      dataIndex: 'successRate',
      key: 'successRate',
      width: 120,
      render: (rate: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={rate}
            size="small"
            width={60}
            strokeColor={rate >= 98 ? '#00B42A' : rate >= 95 ? '#FF7D00' : '#F53F3F'}
          />
          <span className="font-mono text-sm">{rate}%</span>
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusMap: Record<string, { text: string; icon: React.ReactNode; color: string }> = {
          active: { text: '运行中', icon: <CheckCircleOutlined />, color: 'text-success-500' },
          warning: { text: '异常', icon: <WarningOutlined />, color: 'text-warning-500' },
          inactive: { text: '已停用', icon: <StopOutlined />, color: 'text-neutral-400' },
        };
        const s = statusMap[status] || statusMap.active;
        return (
          <span className={`flex items-center gap-1 ${s.color}`}>
            {s.icon}
            <span>{s.text}</span>
          </span>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<ReloadOutlined />}
            disabled={record.status === 'inactive'}
          >
            同步
          </Button>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
          >
            配置
          </Button>
        </Space>
      ),
    },
  ];

  const handleAddUser = () => {
    setEditingUser(null);
    form.resetFields();
    setUserModalVisible(true);
  };

  const handleUserSubmit = async () => {
    try {
      await form.validateFields();
      setUserModalVisible(false);
      setEditingUser(null);
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const activeDataSources = dataSources.filter(d => d.status === 'active').length;
  const warningDataSources = dataSources.filter(d => d.status === 'warning').length;
  const totalDataCount = dataSources.reduce((sum, d) => sum + d.dataCount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-700">系统管理</h1>
        <p className="text-neutral-400 mt-1">用户管理与数据源配置</p>
      </div>

      <Tabs
        items={[
          {
            key: 'users',
            label: (
              <span>
                <UserOutlined />
                用户管理
              </span>
            ),
            children: (
              <div className="space-y-6">
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="用户总数" value={mockUsers.length} prefix={<UserOutlined />} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="总行用户" value={mockUsers.filter(u => u.role === 'headquarters').length} valueStyle={{ color: '#722ED1' }} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="省分行用户" value={mockUsers.filter(u => u.role === 'provincial').length} valueStyle={{ color: '#165DFF' }} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="市支行用户" value={mockUsers.filter(u => u.role === 'municipal').length} valueStyle={{ color: '#0FC6C2' }} />
                    </Card>
                  </Col>
                </Row>

                <Card
                  className="shadow-card"
                  bordered={false}
                  title={<span className="font-semibold">用户列表</span>}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
                      新增用户
                    </Button>
                  }
                >
                  <Table
                    columns={userColumns}
                    dataSource={mockUsers}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                  />
                </Card>
              </div>
            ),
          },
          {
            key: 'datasources',
            label: (
              <span>
                <DatabaseOutlined />
                数据源管理
              </span>
            ),
            children: (
              <div className="space-y-6">
                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="数据源总数" value={dataSources.length} prefix={<DatabaseOutlined />} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="运行正常" value={activeDataSources} valueStyle={{ color: '#00B42A' }} prefix={<CheckCircleOutlined />} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="异常警告" value={warningDataSources} valueStyle={{ color: '#FF7D00' }} prefix={<WarningOutlined />} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small" className="shadow-card" bordered={false}>
                      <Statistic title="数据总量" value={totalDataCount} suffix="条" precision={0} valueStyle={{ color: '#165DFF' }} />
                    </Card>
                  </Col>
                </Row>

                <Card
                  className="shadow-card"
                  bordered={false}
                  title={<span className="font-semibold">数据源列表</span>}
                  extra={
                    <Button type="primary" icon={<PlusOutlined />}>
                      新增数据源
                    </Button>
                  }
                >
                  <Table
                    columns={dataSourceColumns}
                    dataSource={dataSources}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: true }}
                  />
                </Card>
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={userModalVisible}
        onCancel={() => {
          setUserModalVisible(false);
          setEditingUser(null);
        }}
        onOk={handleUserSubmit}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="name"
                label="姓名"
                rules={[{ required: true, message: '请输入姓名' }]}
              >
                <Input placeholder="请输入姓名" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="role"
                label="角色"
                rules={[{ required: true, message: '请选择角色' }]}
              >
                <Select placeholder="请选择角色">
                  <Option value="headquarters">总行</Option>
                  <Option value="provincial">省分行</Option>
                  <Option value="municipal">市支行</Option>
                  <Option value="analyst">分析师</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="region"
                label="管辖区域"
                rules={[{ required: true, message: '请选择管辖区域' }]}
              >
                <Select placeholder="请选择管辖区域">
                  <Option value="全国">全国</Option>
                  <Option value="广东省">广东省</Option>
                  <Option value="江苏省">江苏省</Option>
                  <Option value="浙江省">浙江省</Option>
                  <Option value="广州市">广州市</Option>
                  <Option value="深圳市">深圳市</Option>
                  <Option value="南京市">南京市</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            name="permissions"
            label="权限"
            rules={[{ required: true, message: '请选择权限' }]}
          >
            <Select mode="multiple" placeholder="请选择权限">
              <Option value="view">查看</Option>
              <Option value="approve">审批</Option>
              <Option value="report">报告</Option>
              <Option value="all">全部</Option>
            </Select>
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="初始密码"
              rules={[{ required: true, message: '请输入初始密码' }]}
            >
              <Input.Password placeholder="请输入初始密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default SystemManagement;
