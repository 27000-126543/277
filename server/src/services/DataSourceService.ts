import cron from 'node-cron';
import { db } from '../models/Database';
import type { Enterprise, DataSourceType, DataSourceRecord } from '../types';
import { getCurrentTime, randomFloat, randomInt, getCreditLevel, calculateDefaultProbability, calculateDebtSolvencyIndex } from '../utils/helpers';

class DataSourceService {
  private static instance: DataSourceService;
  private scheduledTasks: cron.ScheduledTask[] = [];

  private constructor() {}

  public static getInstance(): DataSourceService {
    if (!DataSourceService.instance) {
      DataSourceService.instance = new DataSourceService();
    }
    return DataSourceService.instance;
  }

  public fetchBusinessData(enterprise: Enterprise): DataSourceRecord {
    const registeredCapitalChange = randomFloat(-10, 30);
    const newRegisteredCapital = Math.max(10, enterprise.registeredCapital * (1 + registeredCapitalChange / 100));

    const businessScopes = [
      '技术开发、技术咨询、技术转让、技术服务',
      '货物进出口、技术进出口、代理进出口',
      '销售电子产品、计算机软硬件及辅助设备',
      '企业管理咨询、经济贸易咨询',
      '市场调查、设计、制作、代理、发布广告',
    ];

    const rawData = {
      registeredCapital: parseFloat(newRegisteredCapital.toFixed(2)),
      registeredCapitalChange: parseFloat(registeredCapitalChange.toFixed(2)),
      businessScope: businessScopes[randomInt(0, businessScopes.length - 1)],
      legalPerson: enterprise.legalPerson,
      establishmentDate: enterprise.establishmentDate,
      operationalStatus: '存续',
      lastAnnualReportDate: getCurrentTime(),
    };

    const record: DataSourceRecord = {
      sourceType: 'business',
      sourceName: '工商数据',
      rawData,
      fetchedAt: getCurrentTime(),
    };

    enterprise.registeredCapital = rawData.registeredCapital;
    enterprise.dataSources = enterprise.dataSources.filter(ds => ds.sourceType !== 'business');
    enterprise.dataSources.push(record);
    enterprise.updateTime = getCurrentTime();

    return record;
  }

  public fetchJudicialData(enterprise: Enterprise): DataSourceRecord {
    const lawsuitCount = randomInt(0, 5);
    const pendingLawsuits = randomInt(0, lawsuitCount);
    const involvedAmount = randomFloat(0, 500);

    const rawData = {
      totalLawsuits: lawsuitCount,
      pendingLawsuits,
      closedLawsuits: lawsuitCount - pendingLawsuits,
      involvedAmount: parseFloat(involvedAmount.toFixed(2)),
      hasJudgment: lawsuitCount > 0,
      isEnforced: lawsuitCount > 2,
      lastLawsuitDate: lawsuitCount > 0 ? getCurrentTime() : null,
    };

    const record: DataSourceRecord = {
      sourceType: 'judicial',
      sourceName: '司法诉讼数据',
      rawData,
      fetchedAt: getCurrentTime(),
    };

    enterprise.dataSources = enterprise.dataSources.filter(ds => ds.sourceType !== 'judicial');
    enterprise.dataSources.push(record);
    enterprise.updateTime = getCurrentTime();

    if (lawsuitCount > 2) {
      enterprise.creditScore = Math.max(30, enterprise.creditScore - randomFloat(2, 8));
      enterprise.creditLevel = getCreditLevel(enterprise.creditScore);
      enterprise.defaultProbability = calculateDefaultProbability(enterprise.creditScore);
      enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);
    }

    return record;
  }

  public fetchTaxData(enterprise: Enterprise): DataSourceRecord {
    const annualTaxAmount = randomFloat(50, 5000);
    const hasTaxArrears = Math.random() < 0.1;
    const taxArrearsAmount = hasTaxArrears ? randomFloat(1, 100) : 0;
    const taxCreditLevel = ['A', 'B', 'C', 'D', 'M'][randomInt(0, 4)];

    const rawData = {
      annualTaxAmount: parseFloat(annualTaxAmount.toFixed(2)),
      taxCreditLevel,
      hasTaxArrears,
      taxArrearsAmount: parseFloat(taxArrearsAmount.toFixed(2)),
      taxDeclarationStatus: '正常',
      lastTaxDeclarationDate: getCurrentTime(),
      invoiceUsageRate: randomFloat(60, 100),
    };

    const record: DataSourceRecord = {
      sourceType: 'tax',
      sourceName: '税务数据',
      rawData,
      fetchedAt: getCurrentTime(),
    };

    enterprise.dataSources = enterprise.dataSources.filter(ds => ds.sourceType !== 'tax');
    enterprise.dataSources.push(record);
    enterprise.updateTime = getCurrentTime();

    if (hasTaxArrears || taxCreditLevel === 'D') {
      enterprise.creditScore = Math.max(30, enterprise.creditScore - randomFloat(3, 10));
      enterprise.creditLevel = getCreditLevel(enterprise.creditScore);
      enterprise.defaultProbability = calculateDefaultProbability(enterprise.creditScore);
      enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);
    }

    return record;
  }

  public fetchBankData(enterprise: Enterprise): DataSourceRecord {
    const monthlyCashFlow = randomFloat(100, 5000);
    const currentLiabilitiesChange = randomFloat(-15, 25);
    const newAssetLiabilityRatio = Math.min(95, Math.max(20, enterprise.assetLiabilityRatio + currentLiabilitiesChange));

    const rawData = {
      monthlyCashFlow: parseFloat(monthlyCashFlow.toFixed(2)),
      cashFlowTrend: ['increasing', 'stable', 'decreasing'][randomInt(0, 2)],
      currentLiabilitiesChange: parseFloat(currentLiabilitiesChange.toFixed(2)),
      newAssetLiabilityRatio: parseFloat(newAssetLiabilityRatio.toFixed(1)),
      averageAccountBalance: randomFloat(50, 1000),
      loanOverdueCount: randomInt(0, 3),
      hasSufficientGuarantee: Math.random() > 0.2,
    };

    const record: DataSourceRecord = {
      sourceType: 'bank',
      sourceName: '银行流水数据',
      rawData,
      fetchedAt: getCurrentTime(),
    };

    enterprise.assetLiabilityRatio = rawData.newAssetLiabilityRatio;
    enterprise.dataSources = enterprise.dataSources.filter(ds => ds.sourceType !== 'bank');
    enterprise.dataSources.push(record);
    enterprise.updateTime = getCurrentTime();

    enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);

    if (rawData.loanOverdueCount > 1) {
      enterprise.creditScore = Math.max(30, enterprise.creditScore - randomFloat(2, 6));
      enterprise.creditLevel = getCreditLevel(enterprise.creditScore);
      enterprise.defaultProbability = calculateDefaultProbability(enterprise.creditScore);
    }

    return record;
  }

  public fetchCreditData(enterprise: Enterprise): DataSourceRecord {
    const creditScoreChange = randomFloat(-5, 3);
    const newCreditScore = Math.min(99, Math.max(30, enterprise.creditScore + creditScoreChange));

    const rawData = {
      originalScore: enterprise.creditScore,
      newScore: parseFloat(newCreditScore.toFixed(1)),
      scoreChange: parseFloat(creditScoreChange.toFixed(1)),
      creditLevel: getCreditLevel(newCreditScore),
      overdueRecords: randomInt(0, 3),
      totalCreditLimit: randomFloat(100, 10000),
      usedCreditLimit: randomFloat(20, 8000),
      creditUtilizationRate: randomFloat(20, 90),
      queryCountLast3Months: randomInt(1, 15),
    };

    const record: DataSourceRecord = {
      sourceType: 'credit',
      sourceName: '征信数据',
      rawData,
      fetchedAt: getCurrentTime(),
    };

    enterprise.creditScore = rawData.newScore;
    enterprise.creditLevel = rawData.creditLevel;
    enterprise.defaultProbability = calculateDefaultProbability(enterprise.creditScore);
    enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const existingHistory = enterprise.creditScoreHistory.find(h => h.date === currentMonth);
    
    if (existingHistory) {
      existingHistory.score = enterprise.creditScore;
    } else {
      enterprise.creditScoreHistory.push({
        date: currentMonth,
        score: enterprise.creditScore,
      });
    }

    if (enterprise.creditScoreHistory.length > 12) {
      enterprise.creditScoreHistory = enterprise.creditScoreHistory.slice(-12);
    }

    enterprise.dataSources = enterprise.dataSources.filter(ds => ds.sourceType !== 'credit');
    enterprise.dataSources.push(record);
    enterprise.updateTime = getCurrentTime();

    return record;
  }

  public fetchAllDataSources(): { enterpriseId: string; enterpriseName: string; records: DataSourceRecord[] }[] {
    const results: { enterpriseId: string; enterpriseName: string; records: DataSourceRecord[] }[] = [];

    for (const enterprise of db.enterprises) {
      const records: DataSourceRecord[] = [];
      records.push(this.fetchBusinessData(enterprise));
      records.push(this.fetchJudicialData(enterprise));
      records.push(this.fetchTaxData(enterprise));
      records.push(this.fetchBankData(enterprise));
      records.push(this.fetchCreditData(enterprise));

      results.push({
        enterpriseId: enterprise.id,
        enterpriseName: enterprise.name,
        records,
      });
    }

    return results;
  }

  public startScheduledTasks(): void {
    this.stopScheduledTasks();

    const hourlyTask = cron.schedule('0 * * * *', () => {
      console.log(`[${getCurrentTime()}] 执行定时任务：每小时数据源更新`);
      try {
        const results = this.fetchAllDataSources();
        console.log(`[${getCurrentTime()}] 数据源更新完成，共更新 ${results.length} 家企业`);
      } catch (error) {
        console.error(`[${getCurrentTime()}] 数据源更新失败:`, error);
      }
    });

    const dailyTask = cron.schedule('0 0 * * *', () => {
      console.log(`[${getCurrentTime()}] 执行定时任务：每日凌晨信用评分重算`);
      try {
        for (const enterprise of db.enterprises) {
          enterprise.creditScore = parseFloat((Math.max(30, Math.min(99, enterprise.creditScore + randomFloat(-2, 2)))).toFixed(1));
          enterprise.creditLevel = getCreditLevel(enterprise.creditScore);
          enterprise.defaultProbability = calculateDefaultProbability(enterprise.creditScore);
          enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);

          const now = new Date();
          const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const existingHistory = enterprise.creditScoreHistory.find(h => h.date === currentMonth);
          
          if (existingHistory) {
            existingHistory.score = enterprise.creditScore;
          } else {
            enterprise.creditScoreHistory.push({
              date: currentMonth,
              score: enterprise.creditScore,
            });
          }

          if (enterprise.creditScoreHistory.length > 12) {
            enterprise.creditScoreHistory = enterprise.creditScoreHistory.slice(-12);
          }

          enterprise.updateTime = getCurrentTime();
        }
        console.log(`[${getCurrentTime()}] 信用评分重算完成，共处理 ${db.enterprises.length} 家企业`);
      } catch (error) {
        console.error(`[${getCurrentTime()}] 信用评分重算失败:`, error);
      }
    });

    this.scheduledTasks.push(hourlyTask, dailyTask);
    console.log(`[${getCurrentTime()}] 定时任务已启动：每小时数据源更新、每日凌晨信用评分重算`);
  }

  public stopScheduledTasks(): void {
    for (const task of this.scheduledTasks) {
      task.stop();
    }
    this.scheduledTasks = [];
    console.log(`[${getCurrentTime()}] 定时任务已停止`);
  }
}

export const dataSourceService = DataSourceService.getInstance();
