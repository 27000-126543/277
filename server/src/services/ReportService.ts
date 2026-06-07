import * as cron from 'node-cron';
import { db } from '../models/Database';
import { generateId, getCurrentTime, randomFloat } from '../utils/helpers';
import type { WeeklyReport, Enterprise, Alert } from '../types';

class ReportService {
  private weeklyTask: cron.ScheduledTask | null = null;

  calculateDefaultRates(): {
    overallDefaultRate: number;
    defaultRateYoY: number;
    defaultRateMoM: number;
  } {
    const enterprises = db.enterprises;
    const totalCount = enterprises.length;

    if (totalCount === 0) {
      return { overallDefaultRate: 0, defaultRateYoY: 0, defaultRateMoM: 0 };
    }

    const defaultCount = enterprises.filter(e => e.defaultProbability > 50).length;
    const overallDefaultRate = parseFloat(((defaultCount / totalCount) * 100).toFixed(2));

    const defaultRateYoY = parseFloat(randomFloat(-5, 5, 2).toFixed(2));
    const defaultRateMoM = parseFloat(randomFloat(-3, 3, 2).toFixed(2));

    return { overallDefaultRate, defaultRateYoY, defaultRateMoM };
  }

  calculateIndustryConcentration(): { industry: string; ratio: number }[] {
    const enterprises = db.enterprises;
    const totalCount = enterprises.length;

    if (totalCount === 0) {
      return [];
    }

    const industryCount: Record<string, number> = {};
    for (const enterprise of enterprises) {
      const industry = enterprise.industry || '其他';
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    }

    const sortedIndustries = Object.entries(industryCount)
      .map(([industry, count]) => ({
        industry,
        ratio: parseFloat(((count / totalCount) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.ratio - a.ratio);

    return sortedIndustries.slice(0, 10);
  }

  calculateCreditUtilization(): number {
    const enterprises = db.enterprises;
    if (enterprises.length === 0) return 0;

    const avgUtilization = enterprises.reduce((sum, e) => {
      const utilization = 60 + (e.defaultProbability * 0.3);
      return sum + Math.min(100, Math.max(0, utilization));
    }, 0) / enterprises.length;

    return parseFloat(avgUtilization.toFixed(2));
  }

  getTrendComparison(): {
    metric: string;
    currentWeek: number;
    lastWeek: number;
    change: number;
    unit: string;
  }[] {
    const defaultRates = this.calculateDefaultRates();
    const creditUtilization = this.calculateCreditUtilization();

    const metrics = [
      {
        metric: '总体违约率',
        currentWeek: defaultRates.overallDefaultRate,
        lastWeek: parseFloat((defaultRates.overallDefaultRate - defaultRates.defaultRateMoM).toFixed(2)),
        change: defaultRates.defaultRateMoM,
        unit: '%',
      },
      {
        metric: '授信使用率',
        currentWeek: creditUtilization,
        lastWeek: parseFloat((creditUtilization - randomFloat(-2, 2, 2)).toFixed(2)),
        change: parseFloat(randomFloat(-2, 2, 2).toFixed(2)),
        unit: '%',
      },
      {
        metric: '预警数量',
        currentWeek: db.alerts.filter(a => a.status === 'pending').length,
        lastWeek: Math.max(0, db.alerts.filter(a => a.status === 'pending').length + Math.floor(randomFloat(-5, 5, 0))),
        change: 0,
        unit: '个',
      },
      {
        metric: '平均信用评分',
        currentWeek: db.enterprises.length > 0
          ? parseFloat((db.enterprises.reduce((sum, e) => sum + e.creditScore, 0) / db.enterprises.length).toFixed(1))
          : 0,
        lastWeek: db.enterprises.length > 0
          ? parseFloat(((db.enterprises.reduce((sum, e) => sum + e.creditScore, 0) / db.enterprises.length) + randomFloat(-1, 1, 1)).toFixed(1))
          : 0,
        change: 0,
        unit: '分',
      },
    ];

    return metrics.map(m => ({
      ...m,
      change: parseFloat((m.currentWeek - m.lastWeek).toFixed(2)),
    }));
  }

  generateRiskRecommendations(defaultRate: number, alerts: Alert[]): string[] {
    const recommendations: string[] = [];
    const pendingAlerts = alerts.filter(a => a.status === 'pending');
    const level2Alerts = alerts.filter(a => a.level === 'level2');

    if (defaultRate > 8) {
      recommendations.push('整体违约率较高，建议收紧新增授信审批标准，提高风险准备金计提比例。');
    } else if (defaultRate > 5) {
      recommendations.push('违约率处于警戒水平，建议加强贷后监控频率，优化风险预警模型阈值。');
    } else {
      recommendations.push('整体违约率处于可控范围，建议维持当前授信政策，持续监控风险变化趋势。');
    }

    if (pendingAlerts.length > 20) {
      recommendations.push(`待处理预警数量较多（${pendingAlerts.length}个），建议增派风控人员，优化预警处理流程。`);
    } else if (pendingAlerts.length > 10) {
      recommendations.push(`存在${pendingAlerts.length}个待处理预警，建议及时核查处理，避免风险累积。`);
    }

    if (level2Alerts.length > 5) {
      recommendations.push(`二级预警数量较多（${level2Alerts.length}个），建议启动专项风险排查，对高风险企业制定风险处置方案。`);
    }

    recommendations.push('建议加强对房地产、建筑等周期性行业的风险监控，密切关注政策变化对相关企业的影响。');
    recommendations.push('建议优化行业集中度管理，对单一行业授信占比过高的情况进行适度调整。');
    recommendations.push('建议完善贷后监控体系，提高预警响应速度，建立风险处置快速通道。');

    return recommendations;
  }

  generateMonitoringList(): {
    enterpriseName: string;
    industry: string;
    region: string;
    riskReason: string;
  }[] {
    const enterprises = db.enterprises;
    const monitoringList: {
      enterpriseName: string;
      industry: string;
      region: string;
      riskReason: string;
    }[] = [];

    const highRiskEnterprises = enterprises
      .filter(e => e.defaultProbability > 40 || e.alertStatus === 'level2')
      .sort((a, b) => b.defaultProbability - a.defaultProbability)
      .slice(0, 10);

    for (const enterprise of highRiskEnterprises) {
      let riskReason = '';
      if (enterprise.defaultProbability > 60) {
        riskReason = '违约概率极高，需立即启动风险处置程序';
      } else if (enterprise.defaultProbability > 40) {
        riskReason = '违约概率较高，建议加强监控频率';
      }
      if (enterprise.alertStatus === 'level2') {
        riskReason = riskReason ? riskReason + '；存在二级风险预警' : '存在二级风险预警';
      }
      if (enterprise.assetLiabilityRatio > 70) {
        riskReason = riskReason ? riskReason + '；资产负债率偏高' : '资产负债率偏高';
      }

      monitoringList.push({
        enterpriseName: enterprise.name,
        industry: enterprise.industry,
        region: enterprise.province,
        riskReason: riskReason || '信用评分较低，需持续关注',
      });
    }

    return monitoringList;
  }

  generateWeeklyReport(): WeeklyReport {
    const now = new Date();
    const weekNumber = this.getWeekNumber(now);
    const year = now.getFullYear();
    const startDate = this.getWeekStartDate(now);
    const endDate = this.getWeekEndDate(now);

    const defaultRates = this.calculateDefaultRates();
    const industryConcentration = this.calculateIndustryConcentration();
    const creditUtilizationRate = this.calculateCreditUtilization();
    const trendComparison = this.getTrendComparison();
    const riskStrategyRecommendations = this.generateRiskRecommendations(defaultRates.overallDefaultRate, db.alerts);
    const keyMonitoringList = this.generateMonitoringList();

    const report: WeeklyReport = {
      id: generateId(),
      weekNumber,
      year,
      startDate,
      endDate,
      keyMetrics: {
        overallDefaultRate: defaultRates.overallDefaultRate,
        defaultRateYoY: defaultRates.defaultRateYoY,
        defaultRateMoM: defaultRates.defaultRateMoM,
        industryConcentration: industryConcentration.slice(0, 5),
        creditUtilizationRate,
      },
      trendComparison,
      riskStrategyRecommendations,
      keyMonitoringList,
      createdAt: getCurrentTime(),
    };

    db.weeklyReports.push(report);

    return report;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  private getWeekStartDate(date: Date): string {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date);
    monday.setDate(diff);
    return monday.toISOString().split('T')[0];
  }

  private getWeekEndDate(date: Date): string {
    const startDate = new Date(this.getWeekStartDate(date));
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    return endDate.toISOString().split('T')[0];
  }

  startWeeklyReportTask(): void {
    if (this.weeklyTask) {
      console.log('周报定时任务已在运行中');
      return;
    }

    this.weeklyTask = cron.schedule('0 0 2 * * 1', () => {
      console.log('开始生成周度报告...');
      try {
        const report = this.generateWeeklyReport();
        console.log(`周度报告生成成功，ID: ${report.id}`);
      } catch (error) {
        console.error('生成周度报告失败:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Shanghai',
    });

    console.log('周报定时任务已启动（每周一凌晨2:00执行）');
  }

  stopWeeklyReportTask(): void {
    if (this.weeklyTask) {
      this.weeklyTask.stop();
      this.weeklyTask = null;
      console.log('周报定时任务已停止');
    }
  }
}

export const reportService = new ReportService();
