import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Card, Tabs, Tag, Button, Descriptions, Table, Alert as AntAlert, Spin } from 'antd';
import { ArrowLeft, AlertTriangle, FileText, TrendingDown } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import type { Enterprise } from '@/types';
import type { ColumnsType } from 'antd/es/table';

const EnterpriseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enterprises, alerts, loading, fetchEnterpriseDetail, fetchAlerts } = useAppStore();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);

  useEffect(() => {
    if (id) {
      fetchEnterpriseDetail(id).then(data => {
        if (data) setEnterprise(data);
      });
      fetchAlerts();
    }
  }, [id, fetchEnterpriseDetail, fetchAlerts]);

  useEffect(() => {
    const found = enterprises.find(e => e.id === id);
    if (found && !enterprise) {
      setEnterprise(found);
    }
  }, [enterprises, id, enterprise]);

  if (loading.enterprises && !enterprise) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spin size="large" tip="加载企业详情中..." />
      </div>
    );
  }

  if (!enterprise) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-400 mb-4">企业不存在</p>
        <Button onClick={() => navigate('/enterprises')}>返回列表</Button>
      </div>
    );
  }

  const enterpriseAlerts = alerts.filter(a => a.enterpriseId === id);

  const scoreHistoryOption = {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: enterprise.creditScoreHistory.map(h => h.date),
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
    },
    series: [
      {
        name: '信用分',
        type: 'line',
        smooth: true,
        data: enterprise.creditScoreHistory.map(h => h.score),
        lineStyle: {
          color: '#165DFF',
          width: 3,
        },
        itemStyle: {
          color: '#165DFF',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(22, 93, 255, 0.2)' },
              { offset: 1, color: 'rgba(22, 93, 255, 0.02)' },
            ],
          },
        },
        markLine: {
          silent: true,
          data: [
            { yAxis: 60, lineStyle: { color: '#F53F3F', type: 'dashed' }, label: { formatter: '风险线' } },
          ],
        },
      },
    ],
  };

  const gaugeOption = {
    series: [
      {
        type: 'gauge',
        startAngle: 180,
        endAngle: 0,
        min: 0,
        max: 100,
        splitNumber: 5,
        radius: '100%',
        center: ['50%', '75%'],
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#F53F3F'],
              [0.5, '#FF7D00'],
              [0.7, '#FFD54F'],
              [0.85, '#5CA3FF'],
              [1, '#00B42A'],
            ],
          },
        },
        pointer: {
          icon: 'path://M12.8,0.7l12,40.1H0.7L12.8,0.7z',
          length: '60%',
          width: 10,
          offsetCenter: [0, '-60%'],
          itemStyle: {
            color: 'auto',
          },
        },
        axisTick: {
          show: false,
        },
        splitLine: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        title: {
          offsetCenter: [0, '-10%'],
          fontSize: 14,
          color: '#86909C',
        },
        detail: {
          valueAnimation: true,
          fontSize: 32,
          fontWeight: 'bold',
          offsetCenter: [0, '0%'],
          formatter: '{value}',
          color: 'inherit',
        },
        data: [
          {
            value: enterprise.creditScore,
            name: '信用分',
          },
        ],
      },
    ],
  };

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: [
        { name: '基础资质', max: 100 },
        { name: '财务健康', max: 100 },
        { name: '公共信用', max: 100 },
        { name: '银行行为', max: 100 },
        { name: '发展前景', max: 100 },
      ],
      radius: 90,
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: [85, 62, 78, 70, 75],
            name: '当前企业',
            areaStyle: {
              color: 'rgba(22, 93, 255, 0.2)',
            },
            lineStyle: {
              color: '#165DFF',
            },
            itemStyle: {
              color: '#165DFF',
            },
          },
          {
            value: [78, 72, 80, 75, 72],
            name: '行业均值',
            areaStyle: {
              color: 'rgba(134, 144, 156, 0.1)',
            },
            lineStyle: {
              color: '#86909C',
              type: 'dashed',
            },
            itemStyle: {
              color: '#86909C',
            },
          },
        ],
      },
    ],
    legend: {
      data: ['当前企业', '行业均值'],
      bottom: 0,
    },
  };

  const alertColumns: ColumnsType<any> = [
    {
      title: '预警等级',
      dataIndex: 'level',
      key: 'level',
      width: 100,
      render: (level) => (
        <Tag color={level === 'level2' ? 'error' : 'warning'}>
          {level === 'level2' ? '二级预警' : '一级预警'}
        </Tag>
      ),
    },
    {
      title: '触发原因',
      dataIndex: 'triggerReason',
      key: 'triggerReason',
    },
    {
      title: '触发时间',
      dataIndex: 'triggerTime',
      key: 'triggerTime',
      width: 180,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'warning', text: '待处理' },
          processing: { color: 'processing', text: '处理中' },
          resolved: { color: 'success', text: '已解除' },
          escalated: { color: 'error', text: '已升级' },
        };
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" size="small" onClick={() => navigate(`/alerts/${record.id}`)}>
          查看详情
        </Button>
      ),
    },
  ];

  const creditLevelTag = (level: string) => {
    const colorMap: Record<string, string> = {
      AAA: 'success', AA: 'success', A: 'blue',
      BBB: 'blue', BB: 'gold', B: 'gold',
      CCC: 'orange', CC: 'red', C: 'red',
    };
    return <Tag color={colorMap[level]} className="font-semibold">{level}</Tag>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate('/enterprises')}
          className="p-0"
        >
          返回
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-neutral-700">{enterprise.name}</h1>
            {creditLevelTag(enterprise.creditLevel)}
            {enterprise.alertStatus !== 'normal' && (
              <Tag
                color={enterprise.alertStatus === 'level2' ? 'error' : 'warning'}
                icon={<AlertTriangle size={12} />}
              >
                {enterprise.alertStatus === 'level2' ? '二级预警' : '一级预警'}
              </Tag>
            )}
          </div>
          <p className="text-neutral-400 mt-1 font-mono text-sm">{enterprise.unifiedCreditCode}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/financial?enterpriseId=${enterprise.id}`)}>
            <FileText size={14} className="inline mr-1" /> 财报分析
          </Button>
          <Button type="primary">生成信用报告</Button>
        </div>
      </div>

      {enterprise.alertStatus !== 'normal' && (
        <AntAlert
          message={enterprise.alertStatus === 'level2' ? '二级预警' : '一级预警'}
          description={enterpriseAlerts[0]?.triggerReason || '该企业存在风险，请及时处理'}
          type={enterprise.alertStatus === 'level2' ? 'error' : 'warning'}
          showIcon
          action={
            <Button size="small" danger={enterprise.alertStatus === 'level2'} type="primary">
              立即处理
            </Button>
          }
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="shadow-card lg:col-span-1" bordered={false}>
          <div className="text-center">
            <div style={{ height: 180, marginTop: -20 }}>
              <ReactECharts option={gaugeOption} style={{ height: '100%', width: '100%' }} />
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-neutral-100">
              <div>
                <div className="text-xs text-neutral-400 mb-1">违约概率</div>
                <div className="font-mono font-semibold text-danger-500">
                  {enterprise.defaultProbability.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-neutral-400 mb-1">偿债能力</div>
                <div className="font-mono font-semibold text-primary-600">
                  {enterprise.debtSolvencyIndex.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-card lg:col-span-3" bordered={false} title="企业基本信息">
          <Descriptions column={3} size="small">
            <Descriptions.Item label="法定代表人">{enterprise.legalPerson}</Descriptions.Item>
            <Descriptions.Item label="注册资本">{enterprise.registeredCapital}万元</Descriptions.Item>
            <Descriptions.Item label="成立日期">{enterprise.establishmentDate}</Descriptions.Item>
            <Descriptions.Item label="所属地区">{enterprise.province} {enterprise.city}</Descriptions.Item>
            <Descriptions.Item label="所属行业">{enterprise.industry}</Descriptions.Item>
            <Descriptions.Item label="企业规模">
              {{large: '大型', medium: '中型', small: '小型', micro: '微型'}[enterprise.scale]}
            </Descriptions.Item>
            <Descriptions.Item label="资产负债率">
              <span className={enterprise.assetLiabilityRatio > 75 ? 'text-danger-500 font-semibold' : ''}>
                {enterprise.assetLiabilityRatio.toFixed(1)}%
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="数据更新时间">{enterprise.updateTime.split('T')[0]}</Descriptions.Item>
          </Descriptions>
        </Card>
      </div>

      <Card className="shadow-card" bordered={false}>
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: '信用画像',
              children: (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                  <div>
                    <h4 className="font-medium mb-4">信用分历史趋势</h4>
                    <div style={{ height: 300 }}>
                      <ReactECharts option={scoreHistoryOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4">多维度评分对比</h4>
                    <div style={{ height: 300 }}>
                      <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: '2',
              label: '财务分析',
              children: (
                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card size="small" className="shadow-none border">
                      <div className="text-xs text-neutral-400 mb-1">资产负债率</div>
                      <div className="text-xl font-bold font-mono">{enterprise.assetLiabilityRatio.toFixed(1)}%</div>
                    </Card>
                    <Card size="small" className="shadow-none border">
                      <div className="text-xs text-neutral-400 mb-1">流动比率</div>
                      <div className="text-xl font-bold font-mono">1.25</div>
                    </Card>
                    <Card size="small" className="shadow-none border">
                      <div className="text-xs text-neutral-400 mb-1">净资产收益率</div>
                      <div className="text-xl font-bold font-mono">5.2%</div>
                    </Card>
                    <Card size="small" className="shadow-none border">
                      <div className="text-xs text-neutral-400 mb-1">总资产周转率</div>
                      <div className="text-xl font-bold font-mono">0.45</div>
                    </Card>
                  </div>
                </div>
              ),
            },
            {
              key: '3',
              label: '股东信息',
              children: (
                <div className="pt-4">
                  <Table
                    dataSource={enterprise.shareholders || []}
                    rowKey={(record, index) => index?.toString() || ''}
                    pagination={false}
                    columns={[
                      { title: '股东名称', dataIndex: 'name', key: 'name' },
                      { title: '持股比例', dataIndex: 'shareRatio', key: 'shareRatio', render: v => `${v}%` },
                      { title: '认缴出资额', dataIndex: 'subscribedAmount', key: 'subscribedAmount', render: v => `${v}万元` },
                    ]}
                  />
                </div>
              ),
            },
            {
              key: '4',
              label: '预警记录',
              children: (
                <div className="pt-4">
                  <Table
                    dataSource={enterpriseAlerts}
                    columns={alertColumns}
                    rowKey="id"
                    pagination={false}
                  />
                  {enterpriseAlerts.length === 0 && (
                    <div className="text-center py-12 text-neutral-400">暂无预警记录</div>
                  )}
                </div>
              ),
            },
            {
              key: '5',
              label: '风险标签',
              children: (
                <div className="flex flex-wrap gap-2 pt-4">
                  {(enterprise.riskTags || []).length > 0 ? (
                    enterprise.riskTags?.map((tag, i) => (
                      <Tag key={i} color="red" icon={<AlertTriangle size={12} />}>{tag}</Tag>
                    ))
                  ) : (
                    <div className="text-neutral-400">暂无风险标签</div>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default EnterpriseDetail;
