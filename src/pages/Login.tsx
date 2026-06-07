import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/useAppStore';
import { Form, Input, Button, Card, message, Select } from 'antd';
import { UserOutlined, LockOutlined, BankOutlined } from '@ant-design/icons';

const { Option } = Select;

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const onFinish = (values: { username: string; password: string }) => {
    setLoading(true);
    setTimeout(() => {
      const success = login(values.username, values.password);
      if (success) {
        message.success('登录成功！');
        navigate('/dashboard');
      } else {
        message.error('用户名或密码错误！');
      }
      setLoading(false);
    }, 500);
  };

  const presetAccounts = [
    { username: 'admin', name: '张总行（总行管理员）' },
    { username: 'provincial', name: '李省行长（省分行主管）' },
    { username: 'municipal', name: '王市支行经理（市支行）' },
    { username: 'analyst', name: '陈分析师（风控分析师）' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl flex gap-8 items-center">
        <div className="flex-1 hidden lg:block">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary-500 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <BankOutlined className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-neutral-700">信用风控平台</h1>
            </div>
            <p className="text-lg text-neutral-500 mb-8">
              全国性企业信用与投融资风险评估分析平台
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold">1</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-700 mb-1">多源数据融合</h3>
                <p className="text-sm text-neutral-500">接入工商、司法、税务、银行流水等十多个数据源</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold">2</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-700 mb-1">智能风险预警</h3>
                <p className="text-sm text-neutral-500">自动识别信用分异常下降和负债率超标风险</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-white/60 backdrop-blur rounded-xl">
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 font-bold">3</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-700 mb-1">三级审批流程</h3>
                <p className="text-sm text-neutral-500">信贷员-支行行长-总行三级审批，规范授信调整</p>
              </div>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-96">
          <Card className="shadow-card-hover border-0">
            <div className="text-center mb-8 lg:hidden">
              <div className="inline-flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-lg bg-primary-500 flex items-center justify-center">
                  <BankOutlined className="text-white text-lg" />
                </div>
                <h2 className="text-xl font-bold text-neutral-700">信用风控平台</h2>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-neutral-700 mb-1 text-center lg:text-left">
              欢迎登录
            </h2>
            <p className="text-neutral-400 text-sm mb-6 text-center lg:text-left">
              请输入您的账号密码登录系统
            </p>

            <div className="mb-4">
              <label className="block text-sm text-neutral-500 mb-2">选择测试账号</label>
              <Select
                placeholder="选择账号快速登录"
                size="large"
                onChange={(value) => {
                  form.setFieldsValue({ username: value, password: '123456' });
                }}
              >
                {presetAccounts.map((acc) => (
                  <Option key={acc.username} value={acc.username}>
                    {acc.name}
                  </Option>
                ))}
              </Select>
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              size="large"
              initialValues={{ username: 'admin', password: '123456' }}
            >
              <Form.Item
                name="username"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input
                  prefix={<UserOutlined className="text-neutral-400" />}
                  placeholder="用户名"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-neutral-400" />}
                  placeholder="密码（默认：123456）"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  size="large"
                  className="h-11 font-medium"
                >
                  登录
                </Button>
              </Form.Item>
            </Form>

            <div className="text-center text-xs text-neutral-400 mt-4">
              <p>默认密码：123456</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Login;
