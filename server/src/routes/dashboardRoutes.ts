import { Router } from 'express';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest, filterByUserRegion } from '../middleware/auth';
import { getMonthLabel } from '../utils/helpers';

const router = Router();

router.use(authMiddleware);

router.get('/kpi', (req: AuthRequest, res) => {
  try {
    const enterprises = filterByUserRegion(req, [...db.enterprises]);
    const alerts = filterByUserRegion(req, [...db.alerts]);

    const totalEnterprises = enterprises.length;
    const defaultedEnterprises = enterprises.filter(e => e.defaultProbability >= 10).length;
    const overallDefaultRate = totalEnterprises > 0 ? parseFloat(((defaultedEnterprises / totalEnterprises) * 100).toFixed(2)) : 0;

    const avgCreditScore = totalEnterprises > 0
      ? parseFloat((enterprises.reduce((sum, e) => sum + e.creditScore, 0) / totalEnterprises).toFixed(1))
      : 0;

    const alertEnterprises = new Set(alerts.filter(a => a.status !== 'resolved').map(a => a.enterpriseId)).size;

    const creditUtilizationRate = totalEnterprises > 0
      ? parseFloat((enterprises.reduce((sum, e) => sum + (e.assetLiabilityRatio || 0), 0) / totalEnterprises).toFixed(1))
      : 0;

    const kpiData = [
      {
        title: '总体违约率',
        value: overallDefaultRate,
        unit: '%',
        change: -0.5,
        changeType: 'decrease' as const,
        trendData: [3.2, 3.5, 3.8, 3.6, 3.4, overallDefaultRate],
      },
      {
        title: '平均信用分',
        value: avgCreditScore,
        unit: '分',
        change: 2.3,
        changeType: 'increase' as const,
        trendData: [72.5, 73.1, 72.8, 73.5, 74.2, avgCreditScore],
      },
      {
        title: '预警企业数',
        value: alertEnterprises,
        unit: '家',
        change: 5,
        changeType: 'increase' as const,
        trendData: [45, 48, 52, 50, 55, alertEnterprises],
      },
      {
        title: '授信使用率',
        value: creditUtilizationRate,
        unit: '%',
        change: -1.2,
        changeType: 'decrease' as const,
        trendData: [58.5, 59.2, 57.8, 56.5, 55.8, creditUtilizationRate],
      },
    ];

    res.json({ success: true, data: kpiData });
  } catch (error) {
    res.status(500).json({ message: '获取KPI数据失败', error });
  }
});

router.get('/province-data', (req: AuthRequest, res) => {
  try {
    const enterprises = filterByUserRegion(req, [...db.enterprises]);

    const provinceMap = new Map<string, {
      provinceName: string;
      provinceCode: string;
      totalScore: number;
      count: number;
      defaultCount: number;
      alertCount: number;
    }>();

    enterprises.forEach(e => {
      if (!provinceMap.has(e.provinceCode)) {
        provinceMap.set(e.provinceCode, {
          provinceName: e.province,
          provinceCode: e.provinceCode,
          totalScore: 0,
          count: 0,
          defaultCount: 0,
          alertCount: 0,
        });
      }
      const data = provinceMap.get(e.provinceCode)!;
      data.totalScore += e.creditScore;
      data.count += 1;
      if (e.defaultProbability >= 10) data.defaultCount += 1;
      if (e.alertStatus !== 'normal' && e.alertStatus !== 'resolved') data.alertCount += 1;
    });

    const provinceData = Array.from(provinceMap.values()).map(d => ({
      provinceCode: d.provinceCode,
      provinceName: d.provinceName,
      avgCreditScore: d.count > 0 ? parseFloat((d.totalScore / d.count).toFixed(1)) : 0,
      defaultRate: d.count > 0 ? parseFloat(((d.defaultCount / d.count) * 100).toFixed(2)) : 0,
      alertCount: d.alertCount,
      enterpriseCount: d.count,
    }));

    res.json({ success: true, data: provinceData });
  } catch (error) {
    res.status(500).json({ message: '获取省份数据失败', error });
  }
});

router.get('/province/:code', (req: AuthRequest, res) => {
  try {
    const { code } = req.params;
    const enterprises = filterByUserRegion(req, [...db.enterprises]);
    const provinceEnterprises = enterprises.filter(e => e.provinceCode === code);

    if (provinceEnterprises.length === 0) {
      return res.status(404).json({ message: '省份数据不存在' });
    }

    const cityMap = new Map<string, {
      cityName: string;
      cityCode: string;
      totalScore: number;
      count: number;
      defaultCount: number;
    }>();

    provinceEnterprises.forEach(e => {
      if (!cityMap.has(e.cityCode)) {
        cityMap.set(e.cityCode, {
          cityName: e.city,
          cityCode: e.cityCode,
          totalScore: 0,
          count: 0,
          defaultCount: 0,
        });
      }
      const data = cityMap.get(e.cityCode)!;
      data.totalScore += e.creditScore;
      data.count += 1;
      if (e.defaultProbability >= 10) data.defaultCount += 1;
    });

    const cityData = Array.from(cityMap.values()).map(d => ({
      cityCode: d.cityCode,
      cityName: d.cityName,
      avgCreditScore: d.count > 0 ? parseFloat((d.totalScore / d.count).toFixed(1)) : 0,
      defaultRate: d.count > 0 ? parseFloat(((d.defaultCount / d.count) * 100).toFixed(2)) : 0,
      enterpriseCount: d.count,
    }));

    res.json({
      success: true,
      data: {
        cities: cityData,
        enterprises: provinceEnterprises.slice(0, 50),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取省份下钻数据失败', error });
  }
});

router.get('/industry-ranking', (req: AuthRequest, res) => {
  try {
    const enterprises = filterByUserRegion(req, [...db.enterprises]);

    const industryMap = new Map<string, {
      industry: string;
      count: number;
      defaultCount: number;
    }>();

    enterprises.forEach(e => {
      if (!industryMap.has(e.industry)) {
        industryMap.set(e.industry, {
          industry: e.industry,
          count: 0,
          defaultCount: 0,
        });
      }
      const data = industryMap.get(e.industry)!;
      data.count += 1;
      if (e.defaultProbability >= 10) data.defaultCount += 1;
    });

    const industryRanking = Array.from(industryMap.values())
      .map((d, index) => ({
        rank: index + 1,
        industry: d.industry,
        defaultRate: d.count > 0 ? parseFloat(((d.defaultCount / d.count) * 100).toFixed(2)) : 0,
        enterpriseCount: d.count,
        change: parseFloat((Math.random() * 2 - 1).toFixed(2)),
      }))
      .sort((a, b) => b.defaultRate - a.defaultRate)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.json({ success: true, data: industryRanking });
  } catch (error) {
    res.status(500).json({ message: '获取行业排名失败', error });
  }
});

router.get('/region-ranking', (req: AuthRequest, res) => {
  try {
    const enterprises = filterByUserRegion(req, [...db.enterprises]);
    const alerts = filterByUserRegion(req, [...db.alerts]);

    const regionMap = new Map<string, {
      region: string;
      provinceCode: string;
      count: number;
      defaultCount: number;
      alertCount: number;
    }>();

    enterprises.forEach(e => {
      if (!regionMap.has(e.provinceCode)) {
        regionMap.set(e.provinceCode, {
          region: e.province,
          provinceCode: e.provinceCode,
          count: 0,
          defaultCount: 0,
          alertCount: 0,
        });
      }
      const data = regionMap.get(e.provinceCode)!;
      data.count += 1;
      if (e.defaultProbability >= 10) data.defaultCount += 1;
    });

    alerts.forEach(a => {
      if (a.province && regionMap.has(a.province)) {
        regionMap.get(a.province)!.alertCount += 1;
      }
    });

    const regionRanking = Array.from(regionMap.values())
      .map(d => ({
        region: d.region,
        provinceCode: d.provinceCode,
        defaultRate: d.count > 0 ? parseFloat(((d.defaultCount / d.count) * 100).toFixed(2)) : 0,
        alertCount: d.alertCount,
      }))
      .sort((a, b) => b.defaultRate - a.defaultRate)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    res.json({ success: true, data: regionRanking });
  } catch (error) {
    res.status(500).json({ message: '获取地区排名失败', error });
  }
});

router.get('/monthly-trend', (req: AuthRequest, res) => {
  try {
    const enterprises = filterByUserRegion(req, [...db.enterprises]);
    const alerts = filterByUserRegion(req, [...db.alerts]);

    const months = [];
    for (let i = 5; i >= 0; i--) {
      months.push(getMonthLabel(-i));
    }

    const monthlyData = months.map(month => {
      const monthEnterprises = enterprises.filter(e => {
        const updateMonth = e.updateTime.substring(0, 7);
        return updateMonth <= month;
      });

      const monthAlerts = alerts.filter(a => {
        const triggerMonth = a.triggerTime.substring(0, 7);
        return triggerMonth === month;
      });

      const defaultCount = monthEnterprises.filter(e => e.defaultProbability >= 10).length;
      const defaultRate = monthEnterprises.length > 0
        ? parseFloat(((defaultCount / monthEnterprises.length) * 100).toFixed(2))
        : 0;

      return {
        month,
        defaultRate,
        alertCount: monthAlerts.length,
      };
    });

    res.json({ success: true, data: monthlyData });
  } catch (error) {
    res.status(500).json({ message: '获取月度趋势失败', error });
  }
});

router.get('/industry-credit', (req: AuthRequest, res) => {
  try {
    const enterprises = filterByUserRegion(req, [...db.enterprises]);

    const industryMap = new Map<string, {
      industry: string;
      totalScore: number;
      count: number;
    }>();

    enterprises.forEach(e => {
      if (!industryMap.has(e.industry)) {
        industryMap.set(e.industry, {
          industry: e.industry,
          totalScore: 0,
          count: 0,
        });
      }
      const data = industryMap.get(e.industry)!;
      data.totalScore += e.creditScore;
      data.count += 1;
    });

    const industryCredit = Array.from(industryMap.values()).map(d => ({
      industry: d.industry,
      avgCreditScore: d.count > 0 ? parseFloat((d.totalScore / d.count).toFixed(1)) : 0,
    }));

    res.json({ success: true, data: industryCredit });
  } catch (error) {
    res.status(500).json({ message: '获取行业信用分失败', error });
  }
});

export default router;
