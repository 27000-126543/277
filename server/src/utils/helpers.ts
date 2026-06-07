import { v4 as uuidv4 } from 'uuid';
import type { CreditLevel, Enterprise } from '../types';

export function generateId(): string {
  return uuidv4();
}

export function getCurrentTime(): string {
  return new Date().toISOString();
}

export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFloat(min: number, max: number, decimals: number = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

export function getCreditLevel(score: number): CreditLevel {
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

export function generateUnifiedCreditCode(): string {
  return '91' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('') + randomChoice(['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'T', 'U', 'W', 'X', 'Y']);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getMonthLabel(offset: number = 0): string {
  const now = new Date();
  now.setMonth(now.getMonth() + offset);
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function calculateDefaultProbability(creditScore: number): number {
  const basePD = Math.max(0.1, 15 - creditScore * 0.15 + randomFloat(-1, 1));
  return parseFloat(basePD.toFixed(2));
}

export function calculateDebtSolvencyIndex(enterprise: Enterprise): number {
  const score = enterprise.creditScore;
  const debtRatio = enterprise.assetLiabilityRatio;
  const index = Math.max(0, Math.min(100, score * 0.6 + (100 - debtRatio) * 0.4 + randomFloat(-3, 3)));
  return parseFloat(index.toFixed(1));
}

export const industries = [
  '制造业', '房地产', '金融业', '批发零售', '交通运输',
  '建筑业', '信息技术', '电力热力', '采矿业', '农林牧渔',
  '租赁商务', '科学研究', '水利环境', '居民服务', '教育',
  '卫生社保', '文化娱乐', '住宿餐饮', '其他'
];

export const industrySafetyLines: Record<string, number> = {
  '制造业': 65,
  '房地产': 70,
  '金融业': 80,
  '批发零售': 60,
  '交通运输': 55,
  '建筑业': 75,
  '信息技术': 50,
  '电力热力': 60,
  '采矿业': 55,
  '农林牧渔': 55,
  '租赁商务': 65,
  '科学研究': 50,
  '水利环境': 60,
  '居民服务': 55,
  '教育': 45,
  '卫生社保': 50,
  '文化娱乐': 55,
  '住宿餐饮': 60,
  '其他': 60,
};

export const industryAverages: Record<string, {
  assetLiabilityRatio: number;
  currentRatio: number;
  returnOnEquity: number;
  grossMargin: number;
  assetTurnover: number;
  quickRatio: number;
  interestCoverage: number;
  operatingCashFlowRatio: number;
}> = {
  '制造业': { assetLiabilityRatio: 55, currentRatio: 1.5, returnOnEquity: 12, grossMargin: 25, assetTurnover: 0.8, quickRatio: 1.1, interestCoverage: 5, operatingCashFlowRatio: 8 },
  '房地产': { assetLiabilityRatio: 68, currentRatio: 1.8, returnOnEquity: 15, grossMargin: 35, assetTurnover: 0.3, quickRatio: 0.8, interestCoverage: 4, operatingCashFlowRatio: 5 },
  '金融业': { assetLiabilityRatio: 75, currentRatio: 1.2, returnOnEquity: 18, grossMargin: 60, assetTurnover: 0.1, quickRatio: 1.0, interestCoverage: 8, operatingCashFlowRatio: 15 },
  '批发零售': { assetLiabilityRatio: 50, currentRatio: 1.3, returnOnEquity: 10, grossMargin: 15, assetTurnover: 2.0, quickRatio: 0.9, interestCoverage: 6, operatingCashFlowRatio: 10 },
  '交通运输': { assetLiabilityRatio: 48, currentRatio: 1.1, returnOnEquity: 8, grossMargin: 20, assetTurnover: 0.6, quickRatio: 0.8, interestCoverage: 4, operatingCashFlowRatio: 12 },
  '建筑业': { assetLiabilityRatio: 68, currentRatio: 1.4, returnOnEquity: 10, grossMargin: 12, assetTurnover: 0.9, quickRatio: 1.0, interestCoverage: 3, operatingCashFlowRatio: 6 },
  '信息技术': { assetLiabilityRatio: 40, currentRatio: 2.5, returnOnEquity: 20, grossMargin: 50, assetTurnover: 0.7, quickRatio: 2.0, interestCoverage: 10, operatingCashFlowRatio: 18 },
  '电力热力': { assetLiabilityRatio: 52, currentRatio: 1.0, returnOnEquity: 7, grossMargin: 18, assetTurnover: 0.4, quickRatio: 0.7, interestCoverage: 3, operatingCashFlowRatio: 15 },
  '采矿业': { assetLiabilityRatio: 48, currentRatio: 1.2, returnOnEquity: 9, grossMargin: 30, assetTurnover: 0.5, quickRatio: 0.9, interestCoverage: 4, operatingCashFlowRatio: 14 },
  '农林牧渔': { assetLiabilityRatio: 45, currentRatio: 1.5, returnOnEquity: 6, grossMargin: 22, assetTurnover: 0.7, quickRatio: 1.1, interestCoverage: 3, operatingCashFlowRatio: 10 },
  '租赁商务': { assetLiabilityRatio: 58, currentRatio: 1.4, returnOnEquity: 11, grossMargin: 28, assetTurnover: 0.6, quickRatio: 1.0, interestCoverage: 5, operatingCashFlowRatio: 12 },
  '科学研究': { assetLiabilityRatio: 42, currentRatio: 2.2, returnOnEquity: 16, grossMargin: 45, assetTurnover: 0.5, quickRatio: 1.8, interestCoverage: 7, operatingCashFlowRatio: 16 },
  '水利环境': { assetLiabilityRatio: 52, currentRatio: 1.3, returnOnEquity: 7, grossMargin: 20, assetTurnover: 0.4, quickRatio: 0.9, interestCoverage: 3, operatingCashFlowRatio: 11 },
  '居民服务': { assetLiabilityRatio: 45, currentRatio: 1.6, returnOnEquity: 12, grossMargin: 35, assetTurnover: 1.2, quickRatio: 1.2, interestCoverage: 6, operatingCashFlowRatio: 18 },
  '教育': { assetLiabilityRatio: 38, currentRatio: 2.0, returnOnEquity: 10, grossMargin: 40, assetTurnover: 0.5, quickRatio: 1.5, interestCoverage: 8, operatingCashFlowRatio: 20 },
  '卫生社保': { assetLiabilityRatio: 42, currentRatio: 1.8, returnOnEquity: 9, grossMargin: 30, assetTurnover: 0.6, quickRatio: 1.3, interestCoverage: 6, operatingCashFlowRatio: 16 },
  '文化娱乐': { assetLiabilityRatio: 48, currentRatio: 1.7, returnOnEquity: 14, grossMargin: 45, assetTurnover: 0.7, quickRatio: 1.2, interestCoverage: 7, operatingCashFlowRatio: 14 },
  '住宿餐饮': { assetLiabilityRatio: 52, currentRatio: 1.4, returnOnEquity: 11, grossMargin: 55, assetTurnover: 1.0, quickRatio: 1.0, interestCoverage: 5, operatingCashFlowRatio: 12 },
  '其他': { assetLiabilityRatio: 55, currentRatio: 1.5, returnOnEquity: 10, grossMargin: 25, assetTurnover: 0.8, quickRatio: 1.1, interestCoverage: 5, operatingCashFlowRatio: 10 },
};

export const provinces = [
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
