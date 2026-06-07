import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Card, Button, Space, Table, Tag } from 'antd';
import { ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import KPICard from '@/components/KPICard';
import { useAppStore } from '@/store/useAppStore';
import type { ColumnsType } from 'antd/es/table';
import type { Enterprise } from '@/types';

const ProvinceDashboard: React.FC = () => {
  const { provinceCode } = useParams<{ provinceCode: string }>();
  const navigate = useNavigate();
  const { getProvinceByCode, getFilteredEnterprises, getIndustryCreditData } = useAppStore();

  const provinceData = getProvinceByCode(provinceCode || '');
  const provinceEnterprises = getFilteredEnterprises({ province: provinceCode });
  const industryCreditData = getIndustryCreditData();

  const kpiData = useMemo(() => {
    if (!provinceData) return [];
    const avgCreditScore = provinceEnterprises.length > 0
      ? (provinceEnterprises.reduce((sum, e) => sum + e.creditScore, 0) / provinceEnterprises.length).toFixed(1)
      : 0;
    const defaultRate = provinceData.defaultRate;
    const alertCount = provinceEnterprises.filter(e => e.alertStatus !== 'normal').length;
    const enterpriseCount = provinceEnterprises.length;

    return [
      { title: '企业总数', value: enterpriseCount, unit: '家', change: 5.2, changeType: 'increase' as const, trendData: [120, 132, 145, 158, 172, 189] },
      { title: '平均信用分', value: avgCreditScore, change: 1.2, changeType: 'increase' as const, trendData: [72, 73, 72.5, 74, 73.8, 75.2] },
      { title: '违约率', value: defaultRate, unit: '%', change: -0.3, changeType: 'decrease' as const, trendData: [3.2, 3.5, 3.3, 3.1, 2.9, 2.8] },
      { title: '预警企业', value: alertCount, unit: '家', change: 2, changeType: 'increase' as const, trendData: [8, 10, 9, 11, 12, 14] },
    ];
  }, [provinceData, provinceEnterprises]);

  const cityCreditOption = useMemo(() => {
    if (!provinceData?.cities) return {};
    const cities = provinceData.cities;
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: cities.map(c => c.cityName),
        axisLabel: {
          rotate: 30,
          fontSize: 11,
        },
      },
      yAxis: {
        type: 'value',
        name: '平均信用分',
        min: 60,
        max: 90,
      },
      series: [
        {
          type: 'bar',
          data: cities.map(c => c.avgCreditScore),
          barWidth: '50%',
          itemStyle: {
            color: (params: any) => {
              const val = params.value;
              if (val >= 80) return '#00B42A';
              if (val >= 70) return '#165DFF';
              if (val >= 60) return '#FF7D00';
              return '#F53F3F';
            },
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };
  }, [provinceData]);

  const industryDistributionOption = useMemo(() => {
    const industryCount: Record<string, number> = {};
    provinceEnterprises.forEach(e => {
      industryCount[e.industry] = (industryCount[e.industry] || 0) + 1;
    });
    const data = Object.entries(industryCount).map(([name, value]) => ({ name, value }));
    
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}家 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: 10,
        top: 'center',
      },
      series: [
        {
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: data.slice(0, 8),
        },
      ],
    };
  }, [provinceEnterprises]);

  const financialTrendOption = useMemo(() => {
    const months = ['2024-07', '2024-08', '2024-09', '2024-10', '2024-11', '2024-12'];
    const avgScores = months.map((_, i) => {
      const baseScore = 72 + i * 0.5 + (Math.random() - 0.5) * 2;
      return parseFloat(baseScore.toFixed(1));
    });
    const debtRatios = months.map((_, i) => {
      const baseRatio = 55 - i * 0.3 + (Math.random() - 0.5) * 3;
      return parseFloat(baseRatio.toFixed(1));
    });

    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'cross' },
      },
      legend: {
        data: ['平均信用分', '平均资产负债率'],
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
        boundaryGap: false,
        data: months,
      },
      yAxis: [
        {
          type: 'value',
          name: '信用分',
          position: 'left',
        },
        {
          type: 'value',
          name: '资产负债率(%)',
          position: 'right',
        },
      ],
      series: [
        {
          name: '平均信用分',
          type: 'line',
          smooth: true,
          data: avgScores,
          yAxisIndex: 0,
          lineStyle: { color: '#165DFF', width: 2 },
          itemStyle: { color: '#165DFF' },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(22, 93, 255, 0.15)' },
                { offset: 1, color: 'rgba(22, 93, 255, 0.01)' },
              ],
            },
          },
        },
        {
          name: '平均资产负债率',
          type: 'line',
          smooth: true,
          data: debtRatios,
          yAxisIndex: 1,
          lineStyle: { color: '#FF7D00', width: 2 },
          itemStyle: { color: '#FF7D00' },
        },
      ],
    };
  }, []);

  const enterpriseColumns: ColumnsType<Enterprise> = [
    {
      title: '企业名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium text-neutral-700">{text}</span>,
    },
    {
      title: '行业',
      dataIndex: 'industry',
      key: 'industry',
      width: 100,
    },
    {
      title: '信用等级',
      dataIndex: 'creditLevel',
      key: 'creditLevel',
      width: 90,
      render: (level) => {
        const colorMap: Record<string, string> = {
          AAA: 'green', AA: 'green', A: 'blue',
          BBB: 'blue', BB: 'gold', B: 'gold',
          CCC: 'orange', CC: 'orange', C: 'red',
        };
        return <Tag color={colorMap[level]}>{level}</Tag>;
      },
    },
    {
      title: '信用分',
      dataIndex: 'creditScore',
      key: 'creditScore',
      width: 80,
      sorter: (a, b) => a.creditScore - b.creditScore,
      render: (score) => <span className="font-mono font-semibold">{score}</span>,
    },
    {
      title: '违约概率',
      dataIndex: 'defaultProbability',
      key: 'defaultProbability',
      width: 90,
      render: (val) => <span className="font-mono">{val}%</span>,
    },
    {
      title: '资产负债率',
      dataIndex: 'assetLiabilityRatio',
      key: 'assetLiabilityRatio',
      width: 100,
      render: (val) => <span className="font-mono">{val}%</span>,
    },
    {
      title: '预警状态',
      dataIndex: 'alertStatus',
      key: 'alertStatus',
      width: 90,
      render: (status) => {
        const statusMap: Record<string, { text: string; color: string }> = {
          normal: { text: '正常', color: 'success' },
          level1: { text: '一级预警', color: 'warning' },
          level2: { text: '二级预警', color: 'error' },
          resolved: { text: '已解除', color: 'default' },
        };
        const s = statusMap[status] || statusMap.normal;
        return <Tag color={s.color}>{s.text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/enterprises/${record.id}`)}
        >
          详情
        </Button>
      ),
    },
  ];

  if (!provinceData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">未找到该省份数据</p>
          <Button type="primary" onClick={() => navigate('/dashboard')}>返回看板</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard')}
        >
          返回全国看板
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-700">{provinceData.provinceName}</h1>
          <p className="text-neutral-400 mt-1">区域信用风险详细分析</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item, index) => (
          <KPICard key={index} data={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="shadow-card"
          title={<span className="font-semibold">各地市信用分分布</span>}
          bordered={false}
        >
          <div style={{ height: 320 }}>
            <ReactECharts option={cityCreditOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>

        <Card
          className="shadow-card"
          title={<span className="font-semibold">行业企业数量分布</span>}
          bordered={false}
        >
          <div style={{ height: 320 }}>
            <ReactECharts option={industryDistributionOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>
      </div>

      <Card
        className="shadow-card"
        title={<span className="font-semibold">区域财务趋势分析</span>}
        bordered={false}
      >
        <div style={{ height: 320 }}>
          <ReactECharts option={financialTrendOption} style={{ height: '100%', width: '100%' }} />
        </div>
      </Card>

      <Card
        className="shadow-card"
        title={<span className="font-semibold">辖区企业列表</span>}
        bordered={false}
      >
        <Table
          columns={enterpriseColumns}
          dataSource={provinceEnterprises}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          scroll={{ x: 900 }}
        />
      </Card>
    </div>
  );
};

export default ProvinceDashboard;
