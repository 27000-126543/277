import React, { useState, useEffect } from 'react';
import { Card, Upload, Button, Progress, Table, Tag, Space, Alert, Tabs } from 'antd';
import { UploadOutlined, FileExcelOutlined } from '@ant-design/icons';
import { AlertTriangle, CheckCircle, FileText, Download, ArrowUp, ArrowDown } from 'lucide-react';
import type { UploadProps } from 'antd';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import { Inbox } from 'lucide-react';

const { Dragger } = Upload;

const FinancialAnalysis: React.FC = () => {
  const { financialAnalysis, fetchEnterprises, uploadFinancialReport } = useAppStore();
  const [uploaded, setUploaded] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedEnterprise, setSelectedEnterprise] = useState<string>('');

  useEffect(() => {
    fetchEnterprises();
  }, [fetchEnterprises]);

  const financialData = financialAnalysis.length > 0 ? financialAnalysis[0] : null;

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    accept: '.xlsx,.xls',
    showUploadList: false,
    beforeUpload: (file) => {
      setAnalyzing(true);
      setTimeout(() => {
        setAnalyzing(false);
        setUploaded(true);
      }, 2000);
      return false;
    },
  };

  const ratioColumns = [
    {
      title: '财务指标',
      dataIndex: 'name',
      key: 'name',
      width: 160,
    },
    {
      title: '企业值',
      dataIndex: 'value',
      key: 'value',
      width: 120,
      render: (val: number, record: any) => (
        <span className={`font-mono font-semibold ${record.isAbnormal ? 'text-danger-500' : 'text-neutral-700'}`}>
          {val}
          {record.name.includes('率') || record.name.includes('比') ? '%' : ''}
        </span>
      ),
    },
    {
      title: '行业均值',
      dataIndex: 'industryAverage',
      key: 'industryAverage',
      width: 120,
      render: (val: number, record: any) => (
        <span className="font-mono text-neutral-500">
          {val}
          {record.name.includes('率') || record.name.includes('比') ? '%' : ''}
        </span>
      ),
    },
    {
      title: '偏离度',
      dataIndex: 'deviationRate',
      key: 'deviationRate',
      width: 200,
      render: (val: number) => (
        <div className="flex items-center gap-2">
          <Progress
            percent={Math.abs(val)}
            size="small"
            status={Math.abs(val) > 30 ? 'exception' : Math.abs(val) > 20 ? 'normal' : 'success'}
            style={{ width: 100 }}
          />
          <span className={`font-mono text-sm ${Math.abs(val) > 30 ? 'text-danger-500 font-semibold' : 'text-neutral-500'}`}>
            {val > 0 ? '+' : ''}{val}%
          </span>
        </div>
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 100,
      render: (_: any, record: any) => (
        record.isAbnormal ? (
          <Tag color="red">异常</Tag>
        ) : (
          <Tag color="green">正常</Tag>
        )
      ),
    },
  ];

  const radarOption = {
    tooltip: {},
    radar: {
      indicator: financialData.keyRatios.map(r => ({ name: r.name, max: Math.max(r.value, r.industryAverage) * 1.5 })),
      radius: 110,
    },
    series: [
      {
        type: 'radar',
        data: [
          {
            value: financialData.keyRatios.map(r => r.value),
            name: '当前企业',
            areaStyle: { color: 'rgba(245, 63, 63, 0.2)' },
            lineStyle: { color: '#F53F3F' },
            itemStyle: { color: '#F53F3F' },
          },
          {
            value: financialData.keyRatios.map(r => r.industryAverage),
            name: '行业均值',
            areaStyle: { color: 'rgba(22, 93, 255, 0.15)' },
            lineStyle: { color: '#165DFF', type: 'dashed' },
            itemStyle: { color: '#165DFF' },
          },
        ],
      },
    ],
    legend: {
      data: ['当前企业', '行业均值'],
      bottom: 0,
    },
  };

  const abnormalCount = financialData.abnormalItems.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-700">财报分析</h1>
          <p className="text-neutral-400 mt-1">上传企业财报，自动提取关键指标并进行行业对比分析</p>
        </div>
        <Button icon={<Download size={14} />}>下载模板</Button>
      </div>

      {!uploaded ? (
        <Card className="shadow-card" bordered={false}>
          <Dragger {...uploadProps} className="!border-dashed !border-2 !border-neutral-200 hover:!border-primary-300">
            {analyzing ? (
              <div className="py-8 text-center">
                <div className="text-4xl mb-4">
                  <FileText className="text-primary-500 animate-pulse" size={48} />
                </div>
                <p className="text-lg font-medium text-neutral-700">正在分析中...</p>
                <p className="text-neutral-400 mt-2">正在提取财务指标并进行行业对比</p>
              </div>
            ) : (
              <div className="py-8">
                <p className="text-4xl mb-4">
                  <Inbox size={48} className="mx-auto text-neutral-300" />
                </p>
                <p className="text-lg font-medium text-neutral-700">点击或拖拽文件到此处上传</p>
                <p className="text-neutral-400 mt-2">支持 .xlsx, .xls 格式的企业财报或审计报告</p>
                <Button type="primary" className="mt-4" icon={<UploadOutlined />}>
                  选择文件
                </Button>
              </div>
            )}
          </Dragger>
        </Card>
      ) : (
        <>
          <Card className="shadow-card" bordered={false}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{financialData.enterpriseName}</h3>
                <p className="text-sm text-neutral-400">
                  报告期：{financialData.reportPeriod} | 上传时间：{financialData.uploadTime}
                </p>
              </div>
              <Space>
                <Button onClick={() => setUploaded(false)}>重新上传</Button>
                <Button type="primary">导出分析报告</Button>
              </Space>
            </div>

            {abnormalCount > 0 && (
              <Alert
                message={`检测到 ${abnormalCount} 项财务指标异常`}
                description="以下指标偏离行业均值超过30%，建议重点关注并开展尽调"
                type="warning"
                showIcon
                className="mb-6"
              />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
              <Card size="small" className="shadow-none border">
                <div className="text-xs text-neutral-400 mb-1">资产负债率</div>
                <div className="text-xl font-bold font-mono text-danger-500">
                  {financialData.keyRatios[0].value}%
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                  <ArrowUp className="text-danger-500" />
                  高于行业均值 {financialData.keyRatios[0].deviationRate}%
                </div>
              </Card>
              <Card size="small" className="shadow-none border">
                <div className="text-xs text-neutral-400 mb-1">流动比率</div>
                <div className="text-xl font-bold font-mono text-danger-500">
                  {financialData.keyRatios[1].value}
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                  <ArrowDown className="text-danger-500" />
                  低于行业均值 {Math.abs(financialData.keyRatios[1].deviationRate)}%
                </div>
              </Card>
              <Card size="small" className="shadow-none border">
                <div className="text-xs text-neutral-400 mb-1">净资产收益率</div>
                <div className="text-xl font-bold font-mono text-danger-500">
                  {financialData.keyRatios[3].value}%
                </div>
                <div className="text-xs text-neutral-400 mt-1 flex items-center gap-1">
                  <ArrowDown className="text-danger-500" />
                  低于行业均值 {Math.abs(financialData.keyRatios[3].deviationRate)}%
                </div>
              </Card>
              <Card size="small" className="shadow-none border">
                <div className="text-xs text-neutral-400 mb-1">异常指标数</div>
                <div className="text-xl font-bold font-mono text-warning-500">
                  {abnormalCount} 项
                </div>
                <div className="text-xs text-neutral-400 mt-1">
                  共 {financialData.keyRatios.length} 项指标
                </div>
              </Card>
            </div>

            <Tabs
              defaultActiveKey="1"
              items={[
                {
                  key: '1',
                  label: '指标对比',
                  children: (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2">
                        <Table
                          columns={ratioColumns}
                          dataSource={financialData.keyRatios.map((r, i) => ({ ...r, key: i }))}
                          pagination={false}
                          size="small"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium mb-3">雷达图对比</h4>
                        <div style={{ height: 320 }}>
                          <ReactECharts option={radarOption} style={{ height: '100%', width: '100%' }} />
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: '2',
                  label: '异常分析',
                  children: (
                    <div className="space-y-4">
                      {financialData.abnormalItems.map((item, index) => (
                        <Card key={index} size="small" className="border-l-4 border-l-danger-500">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-semibold flex items-center gap-2">
                                <Tag color="red">{item.ratioName}</Tag>
                                <span className="font-mono text-danger-500">
                                  {item.value}
                                  {item.ratioName.includes('率') || item.ratioName.includes('比') ? '%' : ''}
                                </span>
                                <span className="text-neutral-400 text-sm font-normal">
                                  （行业均值：{item.industryAverage}
                                  {item.ratioName.includes('率') || item.ratioName.includes('比') ? '%' : ''}，
                                  偏离：{item.deviationRate > 0 ? '+' : ''}{item.deviationRate}%）
                                </span>
                              </h4>
                              <p className="text-neutral-600 mt-2 text-sm">{item.analysis}</p>
                              <div className="mt-3 p-3 bg-primary-50 rounded-md">
                                <p className="text-sm font-medium text-primary-700 mb-1">💡 尽调建议</p>
                                <p className="text-sm text-neutral-600">{item.dueDiligenceSuggestion}</p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ),
                },
                {
                  key: '3',
                  label: '综合评估',
                  children: (
                    <Card size="small" className="shadow-none border">
                      <h4 className="font-medium mb-3">总体评估</h4>
                      <p className="text-neutral-600 leading-relaxed">{financialData.overallAssessment}</p>

                      <h4 className="font-medium mt-6 mb-3">风控策略建议</h4>
                      <ul className="space-y-2 text-neutral-600">
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          <span>建议开展现场尽调，重点核查企业负债结构和偿债资金来源</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          <span>要求企业补充提供近期银行流水，核实经营现金流稳定性</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          <span>关注应收账款回收情况，评估坏账风险</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary-500 mt-1">•</span>
                          <span>建议适当下调授信额度或增加担保措施</span>
                        </li>
                      </ul>
                    </Card>
                  ),
                },
              ]}
            />
          </Card>
        </>
      )}
    </div>
  );
};

export default FinancialAnalysis;
