import type {
  ProvinceCreditData,
  Enterprise,
  Alert,
  ApprovalProcess,
  WeeklyReport,
  User,
  KPIData,
  IndustryRankingItem,
  RegionRankingItem,
  FinancialAnalysis,
} from '@/types';

const industries = [
  '制造业', '房地产', '金融业', '批发零售', '交通运输',
  '建筑业', '信息技术', '电力热力', '采矿业', '农林牧渔',
  '租赁商务', '科学研究', '水利环境', '居民服务', '教育',
  '卫生社保', '文化娱乐', '住宿餐饮', '其他'
];

const provinces = [
  { code: '110000', name: '北京市', cities: ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '顺义区'] },
  { code: '310000', name: '上海市', cities: ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区'] },
  { code: '440000', name: '广东省', cities: ['广州市', '深圳市', '珠海市', '佛山市', '东莞市', '中山市', '惠州市', '江门市'] },
  { code: '330000', name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '台州市'] },
  { code: '320000', name: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '南通市', '扬州市', '徐州市'] },
  { code: '370000', name: '山东省', cities: ['济南市', '青岛市', '烟台市', '潍坊市', '淄博市', '济宁市', '临沂市', '威海市'] },
  { code: '420000', name: '湖北省', cities: ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市', '孝感市', '十堰市', '咸宁市'] },
  { code: '510000', name: '四川省', cities: ['成都市', '绵阳市', '德阳市', '宜宾市', '南充市', '泸州市', '达州市', '乐山市'] },
  { code: '430000', name: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市', '常德市', '益阳市', '郴州市'] },
  { code: '410000', name: '河南省', cities: ['郑州市', '洛阳市', '开封市', '平顶山市', '安阳市', '新乡市', '焦作市', '许昌市'] },
  { code: '130000', name: '河北省', cities: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市'] },
  { code: '140000', name: '山西省', cities: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市'] },
  { code: '150000', name: '内蒙古', cities: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市'] },
  { code: '210000', name: '辽宁省', cities: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市'] },
  { code: '220000', name: '吉林省', cities: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市'] },
  { code: '230000', name: '黑龙江', cities: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市'] },
  { code: '340000', name: '安徽省', cities: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市'] },
  { code: '350000', name: '福建省', cities: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市'] },
  { code: '360000', name: '江西省', cities: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市'] },
  { code: '450000', name: '广西', cities: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市'] },
  { code: '460000', name: '海南省', cities: ['海口市', '三亚市', '三沙市', '儋州市', '五指山市', '琼海市', '文昌市', '万宁市'] },
  { code: '500000', name: '重庆市', cities: ['渝中区', '大渡口区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区'] },
  { code: '520000', name: '贵州省', cities: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市', '黔西南州', '黔东南州'] },
  { code: '530000', name: '云南省', cities: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市'] },
  { code: '540000', name: '西藏', cities: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'] },
  { code: '610000', name: '陕西省', cities: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市'] },
  { code: '620000', name: '甘肃省', cities: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市'] },
  { code: '630000', name: '青海省', cities: ['西宁市', '海东市', '海北州', '黄南州', '海南州', '果洛州', '玉树州', '海西州'] },
  { code: '640000', name: '宁夏', cities: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'] },
  { code: '650000', name: '新疆', cities: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉州', '博尔塔拉州', '巴音郭楞州', '阿克苏地区'] },
  { code: '120000', name: '天津市', cities: ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区'] },
];

const companyNamePrefixes = ['华为', '中兴', '腾讯', '阿里', '百度', '京东', '美团', '字节', '小米', '网易', '滴滴', '拼多多', '快手', 'B站', '携程', '同程', '360', '搜狗', '金山', '用友'];
const companyNameSuffixes = ['科技有限公司', '信息技术有限公司', '网络科技有限公司', '数据服务有限公司', '智能科技有限公司', '云计算有限公司', '电子商务有限公司', '金融科技有限公司'];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateCreditScoreHistory(baseScore: number): { date: string; score: number }[] {
  const history = [];
  let score = baseScore;
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const change = randomFloat(-5, 5);
    score = Math.max(30, Math.min(95, score + change));
    history.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      score: parseFloat(score.toFixed(1)),
    });
  }
  return history;
}

function generateUnifiedCreditCode(): string {
  return '91' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('') + randomChoice(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X', 'Y']);
}

function getCreditLevel(score: number): Enterprise['creditLevel'] {
  if (score >= 90) return 'AAA';
  if (score >= 85) return 'AA';
  if (score >= 80) return 'A';
  if (score >= 75) return 'BBB';
  if (score >= 70) return 'BB';
  if (score >= 65) return 'B';
  if (score >= 60) return 'CCC';
  if (score >= 55) return 'CC';
  return 'C';
}

export const mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    name: '张总行',
    role: 'headquarters',
    permissions: ['all'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  },
  {
    id: '2',
    username: 'provincial',
    name: '李省行长',
    role: 'provincial',
    region: '广东省',
    regionCode: '440000',
    permissions: ['view_province', 'approve_level2'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=provincial',
  },
  {
    id: '3',
    username: 'municipal',
    name: '王市支行经理',
    role: 'municipal',
    region: '深圳市',
    regionCode: '440300',
    permissions: ['view_city', 'handle_level1'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=municipal',
  },
  {
    id: '4',
    username: 'analyst',
    name: '陈分析师',
    role: 'analyst',
    permissions: ['view_reports', 'configure_models'],
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=analyst',
  },
];

export const mockProvinceData: ProvinceCreditData[] = provinces.map((province) => {
  const avgScore = randomFloat(65, 85);
  const defaultRate = randomFloat(0.5, 5.0);
  const alertCount = randomInt(5, 50);
  const enterpriseCount = randomInt(200, 2000);

  return {
    provinceCode: province.code,
    provinceName: province.name,
    avgCreditScore: parseFloat(avgScore.toFixed(1)),
    defaultRate: parseFloat(defaultRate.toFixed(2)),
    alertCount,
    enterpriseCount,
    cities: province.cities.map((city, idx) => ({
      cityCode: `${province.code}${String(idx + 1).padStart(4, '0')}`,
      cityName: city,
      avgCreditScore: parseFloat((avgScore + randomFloat(-5, 5)).toFixed(1)),
      defaultRate: parseFloat((defaultRate + randomFloat(-1, 1)).toFixed(2)),
      enterpriseCount: randomInt(20, 300),
    })),
  };
});

export const mockEnterprises: Enterprise[] = Array.from({ length: 200 }, (_, i) => {
  const province = randomChoice(provinces);
  const city = randomChoice(province.cities);
  const industry = randomChoice(industries);
  const creditScore = randomFloat(50, 92);
  const creditScoreHistory = generateCreditScoreHistory(creditScore);
  const currentScore = creditScoreHistory[creditScoreHistory.length - 1].score;
  const hasLevel1Alert = Math.random() < 0.1;
  const hasLevel2Alert = Math.random() < 0.05;

  return {
    id: `ent-${i + 1}`,
    name: `${randomChoice(companyNamePrefixes)}${randomChoice(companyNameSuffixes)}`,
    unifiedCreditCode: generateUnifiedCreditCode(),
    legalPerson: randomChoice(['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十']),
    registeredCapital: randomInt(100, 100000),
    establishmentDate: `${randomInt(1990, 2023)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
    province: province.name,
    provinceCode: province.code,
    city: city,
    cityCode: `${province.code}01`,
    industry,
    industryCode: `ind-${industries.indexOf(industry) + 1}`,
    scale: randomChoice(['large', 'medium', 'small', 'micro']),
    creditScore: currentScore,
    creditLevel: getCreditLevel(currentScore),
    defaultProbability: randomFloat(0.1, 15.0),
    debtSolvencyIndex: randomFloat(0.5, 2.5),
    assetLiabilityRatio: randomFloat(30, 85),
    alertStatus: hasLevel2Alert ? 'level2' : hasLevel1Alert ? 'level1' : 'normal',
    creditScoreHistory,
    updateTime: new Date().toISOString(),
    shareholders: [
      { name: '控股股东A', shareRatio: randomFloat(30, 70), subscribedAmount: randomInt(1000, 50000) },
      { name: '股东B', shareRatio: randomFloat(10, 30), subscribedAmount: randomInt(500, 10000) },
    ],
    executives: [
      { name: '董事长', position: '董事长' },
      { name: '总经理', position: '总经理' },
      { name: '财务总监', position: '财务总监' },
    ],
    riskTags: Math.random() > 0.7 ? [randomChoice(['司法涉诉', '税务异常', '行政处罚', '负面舆情'])] : [],
  };
});

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    enterpriseId: 'ent-1',
    enterpriseName: '华为科技有限公司',
    level: 'level1',
    triggerType: 'score_drop',
    triggerReason: '连续3个月信用分下降超过20%',
    triggerDetail: {
      metricName: '信用评分',
      currentValue: 62.5,
      threshold: 20,
      changeRate: -25.3,
    },
    triggerTime: '2026-06-05 14:30:00',
    status: 'pending',
    province: '广东省',
    industry: '信息技术',
  },
  {
    id: 'alert-2',
    enterpriseId: 'ent-2',
    enterpriseName: '腾讯云计算有限公司',
    level: 'level2',
    triggerType: 'debt_ratio_exceed',
    triggerReason: '资产负债率突破行业安全线（75%）',
    triggerDetail: {
      metricName: '资产负债率',
      currentValue: 82.5,
      threshold: 75,
    },
    triggerTime: '2026-06-03 09:15:00',
    status: 'processing',
    handler: '李省行长',
    approvalProcessId: 'appr-1',
    province: '广东省',
    industry: '信息技术',
  },
  {
    id: 'alert-3',
    enterpriseId: 'ent-3',
    enterpriseName: '阿里金融科技有限公司',
    level: 'level1',
    triggerType: 'score_drop',
    triggerReason: '连续3个月信用分下降超过20%',
    triggerDetail: {
      metricName: '信用评分',
      currentValue: 58.2,
      threshold: 20,
      changeRate: -22.8,
    },
    triggerTime: '2026-06-04 16:45:00',
    status: 'processing',
    handler: '王市支行经理',
    province: '浙江省',
    industry: '金融业',
  },
  {
    id: 'alert-4',
    enterpriseId: 'ent-4',
    enterpriseName: '京东电子商务有限公司',
    level: 'level2',
    triggerType: 'debt_ratio_exceed',
    triggerReason: '资产负债率突破行业安全线（70%）',
    triggerDetail: {
      metricName: '资产负债率',
      currentValue: 78.3,
      threshold: 70,
    },
    triggerTime: '2026-06-02 11:20:00',
    status: 'escalated',
    approvalProcessId: 'appr-2',
    province: '北京市',
    industry: '批发零售',
  },
  {
    id: 'alert-5',
    enterpriseId: 'ent-5',
    enterpriseName: '美团智能科技有限公司',
    level: 'level1',
    triggerType: 'score_drop',
    triggerReason: '连续3个月信用分下降超过20%',
    triggerDetail: {
      metricName: '信用评分',
      currentValue: 65.8,
      threshold: 20,
      changeRate: -21.5,
    },
    triggerTime: '2026-06-01 08:00:00',
    status: 'resolved',
    handler: '张总行',
    resolution: '企业已补充抵押资产，信用状况改善',
    resolutionTime: '2026-06-06 10:30:00',
    province: '上海市',
    industry: '信息技术',
  },
  ...mockEnterprises.slice(5, 30).map((ent, i) => ({
    id: `alert-${i + 6}`,
    enterpriseId: ent.id,
    enterpriseName: ent.name,
    level: randomChoice(['level1', 'level2']) as 'level1' | 'level2',
    triggerType: randomChoice(['score_drop', 'debt_ratio_exceed', 'other']) as 'score_drop' | 'debt_ratio_exceed' | 'other',
    triggerReason: randomChoice([
      '连续3个月信用分下降超过20%',
      '资产负债率突破行业安全线',
      '出现重大司法涉诉记录',
      '税务异常记录',
    ]),
    triggerDetail: {
      metricName: randomChoice(['信用评分', '资产负债率', '违约概率']),
      currentValue: randomFloat(50, 90),
      threshold: randomFloat(60, 80),
      changeRate: randomFloat(-30, -10),
    },
    triggerTime: `2026-05-${String(randomInt(1, 30)).padStart(2, '0')} ${String(randomInt(0, 23)).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}:00`,
    status: randomChoice(['pending', 'processing', 'resolved', 'escalated']) as 'pending' | 'processing' | 'resolved' | 'escalated',
    province: ent.province,
    industry: ent.industry,
  })),
];

export const mockApprovalProcesses: ApprovalProcess[] = [
  {
    id: 'appr-1',
    alertId: 'alert-2',
    enterpriseName: '腾讯云计算有限公司',
    type: 'credit_adjust',
    currentStep: 2,
    status: 'pending',
    steps: [
      { step: 1, role: '信贷员', handler: '王市支行经理', status: 'approved', opinion: '情况属实，建议下调授信额度30%', handleTime: '2026-06-04 09:00:00' },
      { step: 2, role: '支行行长', handler: '待定', status: 'pending' },
      { step: 3, role: '总行审批', handler: '待定', status: 'pending' },
    ],
    proposedAdjustment: {
      originalCreditLine: 5000,
      proposedCreditLine: 3500,
      reason: '资产负债率突破行业安全线，信用风险上升',
    },
    createTime: '2026-06-03 10:00:00',
    applicant: '王市支行经理',
  },
  {
    id: 'appr-2',
    alertId: 'alert-4',
    enterpriseName: '京东电子商务有限公司',
    type: 'post_loan',
    currentStep: 3,
    status: 'pending',
    steps: [
      { step: 1, role: '信贷员', handler: '李信贷员', status: 'approved', opinion: '风险较高，建议启动贷后催收程序', handleTime: '2026-06-03 14:00:00' },
      { step: 2, role: '支行行长', handler: '赵行长', status: 'approved', opinion: '同意，需加强监控', handleTime: '2026-06-04 10:00:00' },
      { step: 3, role: '总行审批', handler: '待定', status: 'pending' },
    ],
    createTime: '2026-06-02 15:00:00',
    applicant: '李信贷员',
  },
  {
    id: 'appr-3',
    alertId: 'alert-6',
    enterpriseName: mockEnterprises[5].name,
    type: 'credit_adjust',
    currentStep: 1,
    status: 'pending',
    steps: [
      { step: 1, role: '信贷员', handler: '待定', status: 'pending' },
      { step: 2, role: '支行行长', handler: '待定', status: 'pending' },
      { step: 3, role: '总行审批', handler: '待定', status: 'pending' },
    ],
    proposedAdjustment: {
      originalCreditLine: 3000,
      proposedCreditLine: 2000,
      reason: '信用分连续下降，需调整授信',
    },
    createTime: '2026-06-05 11:00:00',
    applicant: '系统自动',
  },
];

export const mockWeeklyReports: WeeklyReport[] = [
  {
    id: 'report-2026-23',
    weekNumber: 23,
    year: 2026,
    startDate: '2026-06-02',
    endDate: '2026-06-08',
    keyMetrics: {
      overallDefaultRate: 2.35,
      defaultRateYoY: -0.15,
      defaultRateMoM: 0.08,
      industryConcentration: [
        { industry: '房地产', ratio: 28.5 },
        { industry: '制造业', ratio: 22.3 },
        { industry: '批发零售', ratio: 15.7 },
        { industry: '建筑业', ratio: 12.1 },
        { industry: '其他', ratio: 21.4 },
      ],
      creditUtilizationRate: 68.5,
    },
    trendComparison: [
      { metric: '总体违约率', currentWeek: 2.35, lastWeek: 2.27, change: 0.08, unit: '%' },
      { metric: '平均信用分', currentWeek: 75.2, lastWeek: 75.8, change: -0.6, unit: '分' },
      { metric: '预警企业数', currentWeek: 156, lastWeek: 142, change: 14, unit: '家' },
      { metric: '授信使用率', currentWeek: 68.5, lastWeek: 67.8, change: 0.7, unit: '%' },
    ],
    riskStrategyRecommendations: [
      '建议加强房地产行业贷后监控，该行业违约率环比上升0.3个百分点',
      '对连续3个月信用分下降的企业，建议提前开展现场尽调',
      '优化审批流程，缩短二级预警响应时间',
      '建议扩大风险缓释措施覆盖面，提高抵质押贷款比例',
    ],
    keyMonitoringList: [
      { enterpriseName: '腾讯云计算有限公司', industry: '信息技术', region: '广东省', riskReason: '资产负债率过高，已触发二级预警' },
      { enterpriseName: '华为科技有限公司', industry: '信息技术', region: '广东省', riskReason: '信用分连续大幅下降' },
      { enterpriseName: '京东电子商务有限公司', industry: '批发零售', region: '北京市', riskReason: '贷后处理审批中' },
      { enterpriseName: '阿里金融科技有限公司', industry: '金融业', region: '浙江省', riskReason: '信用分低于行业均值20%' },
      { enterpriseName: '美团智能科技有限公司', industry: '信息技术', region: '上海市', riskReason: '已解除预警，持续观察' },
    ],
  },
];

export const mockKPIData: KPIData[] = [
  {
    title: '总体违约率',
    value: 2.35,
    unit: '%',
    change: 0.08,
    changeType: 'increase',
    trendData: [2.1, 2.15, 2.2, 2.25, 2.27, 2.3, 2.35],
  },
  {
    title: '平均信用分',
    value: 75.2,
    unit: '分',
    change: -0.6,
    changeType: 'decrease',
    trendData: [76.5, 76.3, 76.0, 75.8, 75.5, 75.3, 75.2],
  },
  {
    title: '预警企业数',
    value: 156,
    unit: '家',
    change: 14,
    changeType: 'increase',
    trendData: [120, 125, 130, 135, 140, 142, 156],
  },
  {
    title: '授信使用率',
    value: 68.5,
    unit: '%',
    change: 0.7,
    changeType: 'increase',
    trendData: [65.2, 65.8, 66.3, 67.0, 67.5, 67.8, 68.5],
  },
];

export const mockIndustryRanking: IndustryRankingItem[] = [
  { rank: 1, industry: '房地产', defaultRate: 4.85, enterpriseCount: 1256, change: 0.3 },
  { rank: 2, industry: '建筑业', defaultRate: 3.72, enterpriseCount: 892, change: 0.15 },
  { rank: 3, industry: '采矿业', defaultRate: 3.45, enterpriseCount: 356, change: -0.1 },
  { rank: 4, industry: '批发零售', defaultRate: 3.12, enterpriseCount: 2341, change: 0.08 },
  { rank: 5, industry: '交通运输', defaultRate: 2.89, enterpriseCount: 678, change: 0.12 },
  { rank: 6, industry: '制造业', defaultRate: 2.56, enterpriseCount: 4521, change: 0.05 },
  { rank: 7, industry: '住宿餐饮', defaultRate: 2.34, enterpriseCount: 1123, change: -0.08 },
  { rank: 8, industry: '农林牧渔', defaultRate: 2.18, enterpriseCount: 789, change: 0.02 },
  { rank: 9, industry: '租赁商务', defaultRate: 1.95, enterpriseCount: 1567, change: -0.03 },
  { rank: 10, industry: '金融业', defaultRate: 1.56, enterpriseCount: 456, change: 0.01 },
];

export const mockRegionRanking: RegionRankingItem[] = [
  { rank: 1, region: '内蒙古', provinceCode: '150000', defaultRate: 4.12, alertCount: 45 },
  { rank: 2, region: '黑龙江', provinceCode: '230000', defaultRate: 3.89, alertCount: 52 },
  { rank: 3, region: '山西省', provinceCode: '140000', defaultRate: 3.67, alertCount: 48 },
  { rank: 4, region: '辽宁省', provinceCode: '210000', defaultRate: 3.45, alertCount: 56 },
  { rank: 5, region: '吉林省', provinceCode: '220000', defaultRate: 3.34, alertCount: 38 },
  { rank: 6, region: '河北省', provinceCode: '130000', defaultRate: 3.12, alertCount: 62 },
  { rank: 7, region: '河南省', provinceCode: '410000', defaultRate: 2.98, alertCount: 58 },
  { rank: 8, region: '云南省', provinceCode: '530000', defaultRate: 2.87, alertCount: 35 },
  { rank: 9, region: '甘肃省', provinceCode: '620000', defaultRate: 2.76, alertCount: 28 },
  { rank: 10, region: '贵州省', provinceCode: '520000', defaultRate: 2.65, alertCount: 32 },
];

export const mockFinancialAnalysis: FinancialAnalysis = {
  id: 'fin-1',
  enterpriseId: 'ent-1',
  enterpriseName: '华为科技有限公司',
  reportPeriod: '2026年第一季度',
  uploadTime: '2026-06-05 10:30:00',
  keyRatios: [
    { name: '资产负债率', value: 82.5, industryAverage: 65.2, deviationRate: 26.5, isAbnormal: true },
    { name: '流动比率', value: 0.85, industryAverage: 1.35, deviationRate: -37.0, isAbnormal: true },
    { name: '速动比率', value: 0.62, industryAverage: 0.98, deviationRate: -36.7, isAbnormal: true },
    { name: '净资产收益率', value: 5.2, industryAverage: 8.5, deviationRate: -38.8, isAbnormal: true },
    { name: '销售毛利率', value: 18.5, industryAverage: 22.3, deviationRate: -17.0, isAbnormal: false },
    { name: '应收账款周转率', value: 3.2, industryAverage: 5.8, deviationRate: -44.8, isAbnormal: true },
    { name: '存货周转率', value: 4.5, industryAverage: 6.2, deviationRate: -27.4, isAbnormal: false },
    { name: '总资产周转率', value: 0.45, industryAverage: 0.68, deviationRate: -33.8, isAbnormal: true },
  ],
  abnormalItems: [
    {
      ratioName: '资产负债率',
      value: 82.5,
      industryAverage: 65.2,
      deviationRate: 26.5,
      analysis: '公司资产负债率显著高于行业平均水平，表明企业财务杠杆较高，债务负担较重，长期偿债能力存在一定压力。',
      dueDiligenceSuggestion: '建议重点核查公司负债结构，关注短期债务到期情况，核实是否存在逾期债务；了解公司融资计划和偿债资金来源。',
    },
    {
      ratioName: '流动比率',
      value: 0.85,
      industryAverage: 1.35,
      deviationRate: -37.0,
      analysis: '流动比率低于1.0，表明公司流动资产不足以覆盖流动负债，短期偿债能力较弱，存在流动性风险。',
      dueDiligenceSuggestion: '建议核查公司银行流水，核实日常经营现金流情况；了解应付账款账期和支付情况，是否存在拖欠供应商货款情形。',
    },
    {
      ratioName: '净资产收益率',
      value: 5.2,
      industryAverage: 8.5,
      deviationRate: -38.8,
      analysis: '净资产收益率远低于行业均值，表明公司盈利能力较弱，股东回报水平偏低。',
      dueDiligenceSuggestion: '建议深入分析公司利润表，了解营收下滑原因；核查主营业务构成及各业务线盈利情况。',
    },
    {
      ratioName: '应收账款周转率',
      value: 3.2,
      industryAverage: 5.8,
      deviationRate: -44.8,
      analysis: '应收账款周转率显著低于行业平均，表明公司应收账款回收速度慢，资金占用周期长，存在坏账风险。',
      dueDiligenceSuggestion: '建议获取应收账款明细表，核实前五大欠款方资信状况及账龄分布；了解公司信用政策和催收机制。',
    },
    {
      ratioName: '总资产周转率',
      value: 0.45,
      industryAverage: 0.68,
      deviationRate: -33.8,
      analysis: '总资产周转率偏低，表明公司资产运营效率不高，利用资产获取收入的能力较弱。',
      dueDiligenceSuggestion: '建议分析资产构成，核实是否存在闲置或低效资产；了解公司产能利用率和设备更新情况。',
    },
  ],
  overallAssessment: '该企业财务健康状况整体偏弱，多项关键指标偏离行业均值超过30%，主要风险集中在偿债能力和运营效率方面。建议开展现场尽调，重点关注债务结构、流动性状况和应收账款质量，审慎评估授信风险。',
};

export const monthlyTrendData = {
  months: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06'],
  defaultRates: [2.1, 2.15, 2.2, 2.25, 2.27, 2.35],
  alertCounts: [120, 125, 130, 135, 142, 156],
  avgCreditScores: [76.5, 76.3, 76.0, 75.8, 75.5, 75.2],
};

export const industryCreditData = [
  { industry: '金融业', creditScore: 82.5 },
  { industry: '信息技术', creditScore: 78.3 },
  { industry: '科学研究', creditScore: 77.8 },
  { industry: '教育', creditScore: 76.5 },
  { industry: '卫生社保', creditScore: 75.8 },
  { industry: '电力热力', creditScore: 74.2 },
  { industry: '文化娱乐', creditScore: 73.5 },
  { industry: '租赁商务', creditScore: 72.8 },
  { industry: '居民服务', creditScore: 71.5 },
  { industry: '制造业', creditScore: 70.2 },
];
