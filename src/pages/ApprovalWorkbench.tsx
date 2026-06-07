import React, { useState } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Steps,
  Space,
  Descriptions,
  Badge,
  Tabs,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useAppStore } from '@/store/useAppStore';
import type { ColumnsType } from 'antd/es/table';
import type { ApprovalProcess, ApprovalStep } from '@/types';

const { TextArea } = Input;

const ApprovalWorkbench: React.FC = () => {
  const { approvalProcesses, currentUser, approveStep } = useAppStore();
  const [selectedProcess, setSelectedProcess] = useState<ApprovalProcess | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [form] = Form.useForm();

  const pendingCount = approvalProcesses.filter(p => p.status === 'pending').length;
  const approvedCount = approvalProcesses.filter(p => p.status === 'approved').length;
  const rejectedCount = approvalProcesses.filter(p => p.status === 'rejected').length;

  const getStepStatus = (step: ApprovalStep, currentStep: number) => {
    if (step.step < currentStep) return 'finish';
    if (step.step === currentStep) return 'process';
    return 'wait';
  };

  const handleAction = (process: ApprovalProcess, type: 'approve' | 'reject') => {
    setSelectedProcess(process);
    setActionType(type);
    setModalVisible(true);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (selectedProcess && currentUser) {
        approveStep(
          selectedProcess.id,
          selectedProcess.currentStep,
          currentUser.name,
          values.opinion || ''
        );
        setModalVisible(false);
        setSelectedProcess(null);
      }
    } catch (err) {
      console.error('Validation failed:', err);
    }
  };

  const columns: ColumnsType<ApprovalProcess> = [
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      render: (text) => <span className="font-medium text-neutral-700">{text}</span>,
    },
    {
      title: '审批类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type) => {
        const typeMap: Record<string, { text: string; color: string }> = {
          credit_adjust: { text: '授信调整', color: 'blue' },
          post_loan: { text: '贷后处理', color: 'orange' },
        };
        const t = typeMap[type] || typeMap.credit_adjust;
        return <Tag color={t.color}>{t.text}</Tag>;
      },
    },
    {
      title: '当前节点',
      key: 'currentStep',
      width: 120,
      render: (_, record) => {
        const stepNames = ['', '信贷员确认', '支行行长复核', '总行审批'];
        return <span>{stepNames[record.currentStep]}</span>;
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap: Record<string, { text: string; status: any }> = {
          pending: { text: '审批中', status: 'processing' },
          approved: { text: '已通过', status: 'success' },
          rejected: { text: '已拒绝', status: 'error' },
        };
        const s = statusMap[status] || statusMap.pending;
        return <Badge status={s.status} text={s.text} />;
      },
    },
    {
      title: '申请人',
      dataIndex: 'applicant',
      key: 'applicant',
      width: 100,
    },
    {
      title: '申请时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 180,
      render: (time) => new Date(time).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => {
        const isPending = record.status === 'pending';
        return (
          <Space>
            <Button
              type="link"
              size="small"
              icon={<FileTextOutlined />}
              onClick={() => setSelectedProcess(record)}
            >
              详情
            </Button>
            {isPending && (
              <>
                <Button
                  type="link"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  onClick={() => handleAction(record, 'approve')}
                  style={{ color: '#00B42A' }}
                >
                  通过
                </Button>
                <Button
                  type="link"
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={() => handleAction(record, 'reject')}
                  style={{ color: '#F53F3F' }}
                >
                  拒绝
                </Button>
              </>
            )}
          </Space>
        );
      },
    },
  ];

  const renderProcessDetail = () => {
    if (!selectedProcess) return null;

    return (
      <div className="space-y-6">
        <Descriptions title="审批基本信息" bordered column={2} size="small">
          <Descriptions.Item label="企业名称">{selectedProcess.enterpriseName}</Descriptions.Item>
          <Descriptions.Item label="审批类型">
            {selectedProcess.type === 'credit_adjust' ? '授信调整' : '贷后处理'}
          </Descriptions.Item>
          <Descriptions.Item label="申请人">{selectedProcess.applicant}</Descriptions.Item>
          <Descriptions.Item label="申请时间">
            {new Date(selectedProcess.createTime).toLocaleString('zh-CN')}
          </Descriptions.Item>
          {selectedProcess.proposedAdjustment && (
            <>
              <Descriptions.Item label="原授信额度">
                {selectedProcess.proposedAdjustment.originalCreditLine} 万元
              </Descriptions.Item>
              <Descriptions.Item label="拟调整额度">
                {selectedProcess.proposedAdjustment.proposedCreditLine} 万元
              </Descriptions.Item>
              <Descriptions.Item label="调整理由" span={2}>
                {selectedProcess.proposedAdjustment.reason}
              </Descriptions.Item>
            </>
          )}
        </Descriptions>

        <div>
          <h4 className="text-base font-semibold text-neutral-700 mb-4">审批流程</h4>
          <Steps
            direction="vertical"
            current={selectedProcess.currentStep - 1}
            status={selectedProcess.status === 'rejected' ? 'error' : undefined}
            items={selectedProcess.steps.map((step) => ({
              key: step.step,
              title: step.role,
              description: (
                <div className="mt-2">
                  {step.status !== 'pending' ? (
                    <div>
                      <p className="text-sm">处理人：{step.handler}</p>
                      <p className="text-sm">处理时间：{step.handleTime ? new Date(step.handleTime).toLocaleString('zh-CN') : '-'}</p>
                      {step.opinion && <p className="text-sm text-neutral-500">意见：{step.opinion}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-neutral-400">等待处理...</p>
                  )}
                </div>
              ),
              status: getStepStatus(step, selectedProcess.currentStep),
            }))}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-700">审批工作台</h1>
        <p className="text-neutral-400 mt-1">三级审批流程管理与处理</p>
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Card className="shadow-card" bordered={false}>
            <Statistic
              title="待审批"
              value={pendingCount}
              prefix={<ClockCircleOutlined className="text-warning-500" />}
              valueStyle={{ color: '#FF7D00' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-card" bordered={false}>
            <Statistic
              title="已通过"
              value={approvedCount}
              prefix={<CheckCircleOutlined className="text-success-500" />}
              valueStyle={{ color: '#00B42A' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className="shadow-card" bordered={false}>
            <Statistic
              title="已拒绝"
              value={rejectedCount}
              prefix={<CloseCircleOutlined className="text-danger-500" />}
              valueStyle={{ color: '#F53F3F' }}
            />
          </Card>
        </Col>
      </Row>

      <Card className="shadow-card" bordered={false}>
        <Tabs
          items={[
            {
              key: 'all',
              label: '全部审批',
              children: (
                <Table
                  columns={columns}
                  dataSource={approvalProcesses}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                />
              ),
            },
            {
              key: 'pending',
              label: `待我审批 (${pendingCount})`,
              children: (
                <Table
                  columns={columns}
                  dataSource={approvalProcesses.filter(p => p.status === 'pending')}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                />
              ),
            },
            {
              key: 'approved',
              label: '已审批',
              children: (
                <Table
                  columns={columns}
                  dataSource={approvalProcesses.filter(p => p.status !== 'pending')}
                  rowKey="id"
                  pagination={{ pageSize: 10, showSizeChanger: true }}
                />
              ),
            },
          ]}
        />
      </Card>

      <Modal
        title="审批详情"
        open={modalVisible || selectedProcess !== null}
        onCancel={() => {
          setModalVisible(false);
          setSelectedProcess(null);
        }}
        width={700}
        footer={
          modalVisible ? (
            <Space>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
              <Button
                type={actionType === 'approve' ? 'primary' : 'default'}
                danger={actionType === 'reject'}
                onClick={handleSubmit}
              >
                {actionType === 'approve' ? '确认通过' : '确认拒绝'}
              </Button>
            </Space>
          ) : (
            <Button onClick={() => setSelectedProcess(null)}>关闭</Button>
          )
        }
      >
        {modalVisible ? (
          <div className="space-y-4">
            {renderProcessDetail()}
            <Form form={form} layout="vertical">
              <Form.Item
                name="opinion"
                label={`${actionType === 'approve' ? '通过' : '拒绝'}意见`}
                rules={[{ required: true, message: '请填写审批意见' }]}
              >
                <TextArea rows={4} placeholder="请输入审批意见..." />
              </Form.Item>
            </Form>
          </div>
        ) : (
          renderProcessDetail()
        )}
      </Modal>
    </div>
  );
};

export default ApprovalWorkbench;
