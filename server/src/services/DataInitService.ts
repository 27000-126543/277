import type {
  User,
  Enterprise,
  CreditScoreHistory,
  DataSourceRecord,
  ProvinceCreditData,
  CityCreditData,
  FinancialData,
  Shareholder,
  Executive,
} from '../types';
import { db } from '../models/Database';
import {
  generateId,
  getCurrentTime,
  randomChoice,
  randomInt,
  randomFloat,
  getCreditLevel,
  generateUnifiedCreditCode,
  formatDate,
  getMonthLabel,
  industries,
  industryAverages,
  provinces,
} from '../utils/helpers';
import { calculateCreditScore, calculateDefaultProbability, calculateDebtSolvencyIndex } from './CreditScoringService';

function initUsers(): void {
  const users: User[] = [
    {
      id: generateId(),
      username: 'admin',
      name: '系统管理员',
      password: '123456',
      role: 'headquarters',
      permissions: ['all'],
      createdAt: getCurrentTime(),
    },
    {
      id: generateId(),
      username: 'provincial',
      name: '省级管理员',
      password: '123456',
      role: 'provincial',
      region: '广东省',
      regionCode: '440000',
      permissions: ['view', 'edit', 'approve'],
      createdAt: getCurrentTime(),
    },
    {
      id: generateId(),
      username: 'municipal',
      name: '市级管理员',
      password: '123456',
      role: 'municipal',
      region: '广州市',
      regionCode: '440100',
      permissions: ['view', 'edit'],
      createdAt: getCurrentTime(),
    },
    {
      id: generateId(),
      username: 'analyst',
      name: '分析师',
      password: '123456',
      role: 'analyst',
      permissions: ['view', 'analyze'],
      createdAt: getCurrentTime(),
    },
  ];

  db.users = users;
}

function generateEnterpriseName(index: number): Enterprise {
  const province = randomChoice(provinces);
  const city = randomChoice(province.cities);
  const industry = randomChoice(industries);
  const scale = randomChoice(['large', 'medium', 'small', 'micro'] as const);

  const enterpriseNames = ['科技', '贸易', '实业', '投资', '发展', '集团', '控股', '实业', '电子', '机械', '化工', '建材', '食品', '纺织', '物流'];
  const namePrefix = ['华', '中', '国', '盛', '宏', '远', '大', '新', '东', '南', '西', '北', '金', '银', '宝'];
  const name = `${randomChoice(namePrefix)}${randomChoice(enterpriseNames)}有限公司`;

  const establishmentDate = new Date();
  establishmentDate.setFullYear(establishmentDate.getFullYear() - randomInt(1, 20));
  establishmentDate.setMonth(randomInt(0, 11));
  establishmentDate.setDate(randomInt(1, 28));

  const registeredCapital = scale === 'large' ? randomInt(5000, 50000) :
    scale === 'medium' ? randomInt(1000, 5000) :
    scale === 'small' ? randomInt(100, 1000) :
    randomInt(10, 100);

  const industryAvg = industryAverages[industry] || industryAverages['其他'];

  const totalAssets = registeredCapital * randomFloat(2, 5);
  const totalLiabilities = totalAssets * (industryAvg.assetLiabilityRatio / 100) * randomFloat(0.8, 1.2);
  const currentAssets = totalAssets * randomFloat(0.3, 0.6);
  const currentLiabilities = totalLiabilities * randomFloat(0.4, 0.7);
  const operatingRevenue = totalAssets * randomFloat(0.5, 1.5);
  const netProfit = operatingRevenue * randomFloat(0.02, 0.15);
  const shareholdersEquity = totalAssets - totalLiabilities;
  const accountsReceivable = currentAssets * randomFloat(0.15, 0.35);
  const inventory = currentAssets * randomFloat(0.1, 0.3);

  const financialData: FinancialData = {
    totalAssets: parseFloat(totalAssets.toFixed(2)),
    totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
    currentAssets: parseFloat(currentAssets.toFixed(2)),
    currentLiabilities: parseFloat(currentLiabilities.toFixed(2)),
    netProfit: parseFloat(netProfit.toFixed(2)),
    shareholdersEquity: parseFloat(shareholdersEquity.toFixed(2)),
    operatingRevenue: parseFloat(operatingRevenue.toFixed(2)),
    accountsReceivable: parseFloat(accountsReceivable.toFixed(2)),
    inventory: parseFloat(inventory.toFixed(2)),
  };

  const shareholders: Shareholder[] = [
    { name: `${randomChoice(['张', '李', '王', '刘', '陈'])}${randomChoice(['伟', '芳', '娜', '强', '磊'])}`, shareRatio: randomFloat(51, 100), subscribedAmount: registeredCapital * randomFloat(0.51, 1) },
  ];

  if (Math.random() > 0.5) {
    shareholders.push({
      name: `${randomChoice(['赵', '钱', '孙', '周', '吴'])}${randomChoice(['明', '华', '丽', '军', '艳'])}`,
      shareRatio: randomFloat(10, 49),
      subscribedAmount: registeredCapital * randomFloat(0.1, 0.49),
    });
  }

  const executives: Executive[] = [
    { name: `${randomChoice(['张', '李', '王', '刘', '陈'])}${randomChoice(['建国', '建军', '丽华', '志强', '海燕'])}`, position: '法定代表人' },
    { name: `${randomChoice(['赵', '钱', '孙', '周', '吴'])}${randomChoice(['志明', '春燕', '小明', '小红', '小华'])}`, position: '总经理' },
  ];

  const dataSources: DataSourceRecord[] = generateDataSources();
  const creditScoreHistory: CreditScoreHistory[] = generateCreditScoreHistory();

  const lastScore = creditScoreHistory[creditScoreHistory.length - 1]?.score || 70;
  const assetLiabilityRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 50;

  const enterprise: Enterprise = {
    id: generateId(),
    name: name,
    unifiedCreditCode: generateUnifiedCreditCode(),
    legalPerson: executives[0].name,
    registeredCapital,
    establishmentDate: formatDate(establishmentDate),
    province: province.name,
    provinceCode: province.code,
    city: city,
    cityCode: province.code.substring(0, 4) + '00',
    industry,
    industryCode: String(randomInt(1000, 9999)),
    scale,
    creditScore: lastScore,
    creditLevel: getCreditLevel(lastScore),
    defaultProbability: calculateDefaultProbability(lastScore),
    debtSolvencyIndex: 0,
    assetLiabilityRatio: parseFloat(assetLiabilityRatio.toFixed(2)),
    alertStatus: 'normal',
    creditScoreHistory,
    dataSources,
    updateTime: getCurrentTime(),
    shareholders,
    executives,
    riskTags: [],
    financialData,
  };

  enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);

  return enterprise;
}

function generateCreditScoreHistory(): CreditScoreHistory[] {
  const history: CreditScoreHistory[] = [];
  let baseScore = randomFloat(55, 85);

  for (let i = 11; i >= 0; i--) {
    const monthLabel = getMonthLabel(-i);
    const variation = randomFloat(-3, 3);
    baseScore = Math.max(40, Math.min(95, baseScore + variation));
    history.push({
      date: monthLabel,
      score: parseFloat(baseScore.toFixed(1)),
    });
  }

  return history;
}

function generateDataSources(): DataSourceRecord[] {
  const now = getCurrentTime();

  return [
    {
      sourceType: 'business',
      sourceName: '工商登记信息',
      rawData: {
        registrationStatus: '存续',
        businessScope: '一般项目：技术服务、技术开发、技术咨询、技术交流、技术转让、技术推广。',
        organizationCode: randomInt(10000000, 99999999),
        taxNumber: '91' + randomInt(10000000, 99999999) + randomChoice(['A', 'B', 'C', 'D']),
      },
      fetchedAt: now,
    },
    {
      sourceType: 'judicial',
      sourceName: '司法信息',
      rawData: {
        lawsuitCount: randomInt(0, 3),
        executionCount: randomInt(0, 2),
        dishonestCount: randomInt(0, 1),
       行政处罚: [],
      },
      fetchedAt: now,
    },
    {
      sourceType: 'tax',
      sourceName: '税务信息',
      rawData: {
        taxLevel: randomChoice(['A', 'B', 'C', 'M']),
        taxAmount: randomFloat(10, 500),
        overdueCount: randomInt(0, 2),
      },
      fetchedAt: now,
    },
    {
      sourceType: 'bank',
      sourceName: '银行流水',
      rawData: {
        accountCount: randomInt(1, 5),
        totalBalance: randomFloat(100, 10000),
        monthlyInflow: randomFloat(50, 5000),
        monthlyOutflow: randomFloat(40, 4500),
        loanBalance: randomFloat(0, 2000),
      },
      fetchedAt: now,
    },
    {
      sourceType: 'credit',
      sourceName: '征信信息',
      rawData: {
        creditCardCount: randomInt(0, 3),
        loanCount: randomInt(0, 5),
        overdueRecord: randomInt(0, 2),
      },
      fetchedAt: now,
    },
  ];
}

function initEnterprises(): void {
  const enterprises: Enterprise[] = [];

  for (let i = 0; i < 200; i++) {
    enterprises.push(generateEnterpriseName(i));
  }

  db.enterprises = enterprises;
}

function initProvinceData(): void {
  const provinceDataList: ProvinceCreditData[] = [];

  for (const province of provinces) {
    const provinceEnterprises = db.enterprises.filter(e => e.provinceCode === province.code);
    const enterpriseCount = provinceEnterprises.length;

    if (enterpriseCount === 0) continue;

    const avgCreditScore = provinceEnterprises.reduce((sum, e) => sum + e.creditScore, 0) / enterpriseCount;
    const defaultRate = provinceEnterprises.reduce((sum, e) => sum + e.defaultProbability, 0) / enterpriseCount;
    const alertCount = provinceEnterprises.filter(e => e.alertStatus !== 'normal').length;

    const cities: CityCreditData[] = [];
    const cityGroups: Record<string, Enterprise[]> = {};

    for (const enterprise of provinceEnterprises) {
      if (!cityGroups[enterprise.city]) {
        cityGroups[enterprise.city] = [];
      }
      cityGroups[enterprise.city].push(enterprise);
    }

    for (const [cityName, cityEnterprises] of Object.entries(cityGroups)) {
      const cityEnterpriseCount = cityEnterprises.length;
      const cityAvgScore = cityEnterprises.reduce((sum, e) => sum + e.creditScore, 0) / cityEnterpriseCount;
      const cityDefaultRate = cityEnterprises.reduce((sum, e) => sum + e.defaultProbability, 0) / cityEnterpriseCount;

      cities.push({
        cityCode: province.code.substring(0, 4) + '00',
        cityName,
        avgCreditScore: parseFloat(cityAvgScore.toFixed(2)),
        defaultRate: parseFloat(cityDefaultRate.toFixed(2)),
        enterpriseCount: cityEnterpriseCount,
      });
    }

    provinceDataList.push({
      provinceCode: province.code,
      provinceName: province.name,
      avgCreditScore: parseFloat(avgCreditScore.toFixed(2)),
      defaultRate: parseFloat(defaultRate.toFixed(2)),
      alertCount,
      enterpriseCount,
      cities,
    });
  }

  db.provinceData = provinceDataList;
}

export function initDatabase(): void {
  db.reset();
  initUsers();
  initEnterprises();
  initProvinceData();

  for (const enterprise of db.enterprises) {
    const newScore = calculateCreditScore(enterprise);
    enterprise.creditScore = newScore;
    enterprise.creditLevel = getCreditLevel(newScore);
    enterprise.defaultProbability = calculateDefaultProbability(newScore);
    enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);
  }

  initProvinceData();
}
