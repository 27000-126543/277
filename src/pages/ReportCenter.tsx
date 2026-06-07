import React, { useState } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Descriptions,
  Table,
  Space,
  Row,
  Col,
  Statistic,
  Progress,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { useAppStore } from '@/store/useAppStore';
import type { WeeklyReport } from '@/types';

const ReportCenter: React.FC = () => {
  const { weeklyReports } = useAppStore();
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(weeklyReports[0] || null);

  const trendComparisonOption = (report: WeeklyReport) => {
    const metrics = report.trendComparison.map(t => t.metric);
    const currentWeekData = report.trendComparison.map(t => t.currentWeek);
    const lastWeekData = report.trendComparison.map(t => t.lastWeek);

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      legend: {
        data: ['本周', '上周'],
        top: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: metrics,
      },
      yAxis: {
        type: 'value',
      },
      series: [
        {
          name: '本周',
          type: 'bar',
          data: currentWeekData,
          itemStyle: { color: '#165DFF', borderRadius: [4, 4, 0, 0] },
        },
        {
          name: '上周',
          type: 'bar',
          data: lastWeekData,
          itemStyle: { color: '#86909C', borderRadius: [4, 4, 0, 0] },
        },
      ],
    };
  };

  const industryConcentrationOption = (report: WeeklyReport) => {
    const data = report.keyMetrics.industryConcentration;
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}% ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: ['45%', '75%'],
          center: ['50%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{d}%',
            fontSize: 11,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: data.slice(0, 8),
        },
      ],
    };
  };

  const monitoringColumns = [
    {
      title: '企业名称',
      dataIndex: 'enterpriseName',
      key: 'enterpriseName',
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 100,
    },
    {
      title: '地区',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '风险原因',
      dataIndex: 'riskReason',
      key: 'riskReason',
      render: (text: string) => (
        <Tag color="orange">{text}</Tag>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-700">报告中心</h1>
          <p className="text-neutral-400 mt-1">信用风险健康报告与分析</p>
        </div>
        <Button type="primary" icon={<FileTextOutlined />}>
          生成报告
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card
          className="lg:col-span-1 shadow-card"
          title={<span className="font-semibold">报告列表</span>}
          bordered={false}
          bodyStyle={{ padding: 0 }}
        >
          <List
            dataSource={weeklyReports}
            renderItem={(item) => (
              <List.Item
                className={`cursor-pointer hover:bg-neutral-50 px-4 py-3 ${
                  selectedReport?.id === item.id ? 'bg-primary-50 border-l-4 border-primary-500' : ''
                }`}
                onClick={() => setSelectedReport(item)}
              >
                <List.Item.Meta
                  avatar={<FileTextOutlined className="text-primary-500 text-xl mt-1" />}
                  title={
                    <span className="font-medium">
                      {item.year}年 第{item.weekNumber}周
                    </span>
                  }
                  description={
                    <div className="text-xs text-neutral-400">
                      <CalendarOutlined className="mr-1" />
                      {item.startDate} ~ {item.endDate}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Card>

        <div className="lg:col-span-3 space-y-6">
          {selectedReport && (
            <>
              <Card className="shadow-card" bordered={false} extra={
                <Space>
                  <Button icon={<DownloadOutlined />}>下载PDF</Button>
                  <Button icon={<DownloadOutlined />}>导出Excel</Button>
                </Space>
              }>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-700">
                      {selectedReport.year}年 第{selectedReport.weekNumber}周 信用风险健康报告
                    </h2>
                    <p className="text-neutral-400 mt-1">
                      报告周期：{selectedReport.startDate} 至 {selectedReport.endDate}
                    </p>
                  </div>
                  <Tag color="success">已生成</Tag>
                </div>

                <Row gutter={16}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="总体违约率"
                        value={selectedReport.keyMetrics.overallDefaultRate}
                        suffix="%"
                        precision={2}
                        valueStyle={{ color: selectedReport.keyMetrics.defaultRateMoM > 0 ? '#F53F3F' : '#00B42A' }}
                        prefix={
                          selectedReport.keyMetrics.defaultRateMoM > 0
                            ? <RiseOutlined />
                            : <FallOutlined />
                        }
                      />
                      <div className="text-xs text-neutral-400 mt-2">
                        同比 <span className={selectedReport.keyMetrics.defaultRateYoY > 0 ? 'text-danger-500' : 'text-success-500'}>
                          {selectedReport.keyMetrics.defaultRateYoY > 0 ? '+' : ''}{selectedReport.keyMetrics.defaultRateYoY}%
                        </span>
                        {' '}环比 <span className={selectedReport.keyMetrics.defaultRateMoM > 0 ? 'text-danger-500' : 'text-success-500'}>
                          {selectedReport.keyMetrics.defaultRateMoM > 0 ? '+' : ''}{selectedReport.keyMetrics.defaultRateMoM}%
                        </span>
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="授信使用率"
                        value={selectedReport.keyMetrics.creditUtilizationRate}
                        suffix="%"
                        precision={2}
                        valueStyle={{ color: '#165DFF' }}
                      />
                      <Progress
                        percent={selectedReport.keyMetrics.creditUtilizationRate}
                        size="small"
                        strokeColor="#165DFF"
                        className="mt-2"
                      />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="行业集中度CR5"
                        value={
                          selectedReport.keyMetrics.industryConcentration
                            .slice(0, 5)
                            .reduce((sum, i) => sum + i.ratio, 0)
                        }
                        suffix="%"
                        precision={1}
                        valueStyle={{ color: '#FF7D00' }}
                      />
                      <div className="text-xs text-neutral-400 mt-2">
                        Top5行业占比
                      </div>
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic
                        title="重点监控企业"
                        value={selectedReport.keyMonitoringList.length}
                        suffix="家"
                        valueStyle={{ color: '#F53F3F' }}
                      />
                      <div className="text-xs text-neutral-400 mt-2">
                        需重点关注
                      </div>
                    </Card>
                  </Col>
                </Row>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card
                  className="shadow-card"
                  title={<span className="font-semibold">关键指标周度对比</span>}
                  bordered={false}
                >
                  <div style={{ height: 300 }}>
                    <ReactECharts
                      option={trendComparisonOption(selectedReport)}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </Card>

                <Card
                  className="shadow-card"
                  title={<span className="font-semibold">行业集中度分布</span>}
                  bordered={false}
                >
                  <div style={{ height: 300 }}>
                    <ReactECharts
                      option={industryConcentrationOption(selectedReport)}
                      style={{ height: '100%', width: '100%' }}
                    />
                  </div>
                </Card>
              </div>

              <Card
                className="shadow-card"
                title={<span className="font-semibold">风控策略优化建议</span>}
                bordered={false}
              >
                <div className="space-y-3">
                  {selectedReport.riskStrategyRecommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                      <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-neutral-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card
                className="shadow-card"
                title={<span className="font-semibold">重点监控名单</span>}
                bordered={false}
              >
                <Table
                  columns={monitoringColumns}
                  dataSource={selectedReport.keyMonitoringList}
                  rowKey="enterpriseName"
                  pagination={false}
                  size="small"
                />
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportCenter;
