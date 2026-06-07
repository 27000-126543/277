import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import { Select, Card, Tabs } from 'antd';
import KPICard from '@/components/KPICard';
import { useAppStore } from '@/store/useAppStore';
import { ArrowRight } from 'lucide-react';

const { Option } = Select;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { provinceData, getKPIData, getIndustryRanking, getRegionRanking, getMonthlyTrendData, getIndustryCreditData } = useAppStore();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('6m');

  const kpiData = getKPIData();
  const industryRanking = getIndustryRanking();
  const regionRanking = getRegionRanking();
  const monthlyTrend = getMonthlyTrendData();
  const industryCredit = getIndustryCreditData();

  const heatmapData = useMemo(() => {
    return provinceData.map(p => ({
      name: p.provinceName.replace('市', '').replace('省', '').replace('壮族自治区', '').replace('回族自治区', '').replace('维吾尔自治区', '').replace('自治区', ''),
      value: p.avgCreditScore,
      code: p.provinceCode,
    }));
  }, [provinceData]);

  const heatmapOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const data = heatmapData.find(d => d.name === params.name);
        if (data) {
          const province = provinceData.find(p => p.provinceCode === data.code);
          return `
            <div style="padding: 8px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
              <div>平均信用分：<span style="color: #165DFF; font-weight: 600;">${data.value}</span></div>
              <div>违约率：${province?.defaultRate}%</div>
              <div>预警企业：${province?.alertCount}家</div>
              <div>企业总数：${province?.enterpriseCount}家</div>
              <div style="color: #165DFF; margin-top: 4px; cursor: pointer;">点击查看详情 →</div>
            </div>
          `;
        }
        return params.name;
      },
    },
    visualMap: {
      min: 60,
      max: 90,
      left: 'left',
      top: 'bottom',
      text: ['高信用', '低信用'],
      calculable: true,
      inRange: {
        color: ['#F53F3F', '#FF7D00', '#FFD54F', '#8ABEFF', '#165DFF'],
      },
    },
    series: [
      {
        name: '信用评分',
        type: 'map',
        mapType: 'china',
        roam: false,
        label: {
          show: true,
          fontSize: 10,
          color: '#4E5969',
        },
        emphasis: {
          label: {
            color: '#fff',
          },
          itemStyle: {
            areaColor: '#0E42D2',
          },
        },
        data: heatmapData,
      },
    ],
  };

  const handleMapClick = (params: any) => {
    const data = heatmapData.find(d => d.name === params.name);
    if (data) {
      navigate(`/dashboard/province/${data.code}`);
    }
  };

  const trendOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
    },
    legend: {
      data: ['违约率', '预警数'],
      right: 0,
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
      data: monthlyTrend.months,
    },
    yAxis: [
      {
        type: 'value',
        name: '违约率(%)',
        position: 'left',
      },
      {
        type: 'value',
        name: '预警数(家)',
        position: 'right',
      },
    ],
    series: [
      {
        name: '违约率',
        type: 'line',
        smooth: true,
        data: monthlyTrend.defaultRates,
        yAxisIndex: 0,
        lineStyle: {
          color: '#F53F3F',
          width: 2,
        },
        itemStyle: {
          color: '#F53F3F',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(245, 63, 63, 0.15)' },
              { offset: 1, color: 'rgba(245, 63, 63, 0.01)' },
            ],
          },
        },
      },
      {
        name: '预警数',
        type: 'bar',
        data: monthlyTrend.alertCounts,
        yAxisIndex: 1,
        barWidth: 20,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#165DFF' },
              { offset: 1, color: '#5CA3FF' },
            ],
          },
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const industryCreditOption = {
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
      type: 'value',
      max: 100,
    },
    yAxis: {
      type: 'category',
      data: industryCredit.map(i => i.industry).reverse(),
    },
    series: [
      {
        type: 'bar',
        data: industryCredit.map(i => i.creditScore).reverse(),
        barWidth: 16,
        itemStyle: {
          color: (params: any) => {
            const val = params.value;
            if (val >= 80) return '#00B42A';
            if (val >= 70) return '#165DFF';
            if (val >= 60) return '#FF7D00';
            return '#F53F3F';
          },
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right',
          formatter: '{c}',
        },
      },
    ],
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-700">核心看板</h1>
          <p className="text-neutral-400 mt-1">全国企业信用风险概览</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedIndustry}
            onChange={setSelectedIndustry}
            style={{ width: 160 }}
            size="middle"
          >
            <Option value="all">全部行业</Option>
            <Option value="manufacturing">制造业</Option>
            <Option value="realestate">房地产</Option>
            <Option value="finance">金融业</Option>
          </Select>
          <Select
            value={selectedTimeRange}
            onChange={setSelectedTimeRange}
            style={{ width: 120 }}
            size="middle"
          >
            <Option value="1m">近1个月</Option>
            <Option value="3m">近3个月</Option>
            <Option value="6m">近6个月</Option>
            <Option value="1y">近1年</Option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((item, index) => (
          <KPICard key={index} data={item} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          className="lg:col-span-2 shadow-card"
          title={
            <div className="flex items-center justify-between w-full">
              <span className="font-semibold">全国企业信用热力图</span>
              <span className="text-xs text-neutral-400">点击省份可下钻查看详情</span>
            </div>
          }
          bordered={false}
        >
          <div style={{ height: 500 }}>
            <ReactECharts
              option={heatmapOption}
              style={{ height: '100%', width: '100%' }}
              onEvents={{ click: handleMapClick }}
            />
          </div>
        </Card>

        <div className="space-y-6">
          <Card
            className="shadow-card"
            title={<span className="font-semibold">行业违约率TOP10</span>}
            bordered={false}
            size="small"
            extra={
              <span className="text-primary-500 text-sm cursor-pointer hover:underline flex items-center gap-1">
                查看全部 <ArrowRight size={12} />
              </span>
            }
          >
            <div className="space-y-3">
              {industryRanking.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-danger-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className="flex-1 text-sm text-neutral-600 truncate">{item.industry}</span>
                  <span className="font-mono text-sm font-semibold text-danger-500">
                    {item.defaultRate}%
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card
            className="shadow-card"
            title={<span className="font-semibold">地区违约率TOP10</span>}
            bordered={false}
            size="small"
            extra={
              <span className="text-primary-500 text-sm cursor-pointer hover:underline flex items-center gap-1">
                查看全部 <ArrowRight size={12} />
              </span>
            }
          >
            <div className="space-y-3">
              {regionRanking.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                      index < 3 ? 'bg-warning-500 text-white' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {item.rank}
                  </span>
                  <span className="flex-1 text-sm text-neutral-600 truncate">{item.region}</span>
                  <span className="font-mono text-sm font-semibold text-warning-500">
                    {item.defaultRate}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="shadow-card"
          title={<span className="font-semibold">违约率与预警数量趋势</span>}
          bordered={false}
        >
          <div style={{ height: 320 }}>
            <ReactECharts option={trendOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>

        <Card
          className="shadow-card"
          title={<span className="font-semibold">各行业平均信用分</span>}
          bordered={false}
        >
          <div style={{ height: 320 }}>
            <ReactECharts option={industryCreditOption} style={{ height: '100%', width: '100%' }} />
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
