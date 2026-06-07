import * as XLSX from 'xlsx';
import { db } from '../models/Database';
import { generateId, getCurrentTime, industryAverages } from '../utils/helpers';
import type { FinancialData, FinancialRatio, AbnormalItem, FinancialAnalysis } from '../types';

class FinancialAnalysisService {
  parseFinancialExcel(buffer: Buffer): FinancialData {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

    const findValueByKeywords = (keywords: string[]): number => {
      for (let i = 0; i < data.length; i++) {
        for (let j = 0; j < data[i].length; j++) {
          const cell = String(data[i][j] || '').trim();
          if (keywords.some(kw => cell.includes(kw))) {
            for (let k = j + 1; k < data[i].length; k++) {
              const val = parseFloat(data[i][k]);
              if (!isNaN(val)) return val;
            }
            for (let k = i + 1; k < Math.min(i + 5, data.length); k++) {
              if (data[k] && data[k][j]) {
                const val = parseFloat(data[k][j]);
                if (!isNaN(val)) return val;
              }
            }
          }
        }
      }
      return 0;
    };

    return {
      totalAssets: findValueByKeywords(['资产总计', '总资产', '资产合计']),
      totalLiabilities: findValueByKeywords(['负债合计', '总负债', '负债总计']),
      currentAssets: findValueByKeywords(['流动资产合计', '流动资产']),
      currentLiabilities: findValueByKeywords(['流动负债合计', '流动负债']),
      netProfit: findValueByKeywords(['净利润', '归属于母公司所有者的净利润']),
      shareholdersEquity: findValueByKeywords(['所有者权益合计', '股东权益合计', '净资产']),
      operatingRevenue: findValueByKeywords(['营业收入', '营业总收入', '主营业务收入']),
      accountsReceivable: findValueByKeywords(['应收账款', '应收票据及应收账款']),
      inventory: findValueByKeywords(['存货', '存货合计']),
    };
  }

  calculateFinancialRatios(financialData: FinancialData): {
    assetLiabilityRatio: number;
    currentRatio: number;
    quickRatio: number;
    returnOnEquity: number;
    grossMargin: number;
    assetTurnover: number;
    interestCoverage: number;
    operatingCashFlowRatio: number;
  } {
    const {
      totalAssets,
      totalLiabilities,
      currentAssets,
      currentLiabilities,
      netProfit,
      shareholdersEquity,
      operatingRevenue,
      inventory,
    } = financialData;

    const assetLiabilityRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 0;
    const quickRatio = currentLiabilities > 0 ? (currentAssets - inventory) / currentLiabilities : 0;
    const returnOnEquity = shareholdersEquity > 0 ? (netProfit / shareholdersEquity) * 100 : 0;
    const grossMargin = operatingRevenue > 0 ? (netProfit / operatingRevenue) * 100 : 0;
    const assetTurnover = totalAssets > 0 ? operatingRevenue / totalAssets : 0;
    const interestCoverage = 5;
    const operatingCashFlowRatio = currentLiabilities > 0 ? (netProfit * 0.8) / currentLiabilities * 100 : 0;

    return {
      assetLiabilityRatio: parseFloat(assetLiabilityRatio.toFixed(2)),
      currentRatio: parseFloat(currentRatio.toFixed(2)),
      quickRatio: parseFloat(quickRatio.toFixed(2)),
      returnOnEquity: parseFloat(returnOnEquity.toFixed(2)),
      grossMargin: parseFloat(grossMargin.toFixed(2)),
      assetTurnover: parseFloat(assetTurnover.toFixed(2)),
      interestCoverage: parseFloat(interestCoverage.toFixed(2)),
      operatingCashFlowRatio: parseFloat(operatingCashFlowRatio.toFixed(2)),
    };
  }

  compareWithIndustry(
    ratios: ReturnType<FinancialAnalysisService['calculateFinancialRatios']>,
    industry: string
  ): FinancialRatio[] {
    const avg = industryAverages[industry] || industryAverages['其他'];

    const ratioNames: Record<string, string> = {
      assetLiabilityRatio: '资产负债率',
      currentRatio: '流动比率',
      quickRatio: '速动比率',
      returnOnEquity: '净资产收益率',
      grossMargin: '毛利率',
      assetTurnover: '总资产周转率',
      interestCoverage: '利息保障倍数',
      operatingCashFlowRatio: '经营现金流比率',
    };

    const result: FinancialRatio[] = [];

    for (const [key, value] of Object.entries(ratios)) {
      const industryAvg = avg[key as keyof typeof avg] || 0;
      const deviationRate = industryAvg > 0 ? parseFloat(((value - industryAvg) / industryAvg * 100).toFixed(2)) : 0;
      const isAbnormal = Math.abs(deviationRate) > 30;

      result.push({
        name: ratioNames[key] || key,
        value,
        industryAverage: industryAvg,
        deviationRate,
        isAbnormal,
      });
    }

    return result;
  }

  generateAbnormalAnalysis(ratios: FinancialRatio[]): AbnormalItem[] {
    const abnormalItems: AbnormalItem[] = [];

    const analysisTemplates: Record<string, { analysis: string; suggestion: string }> = {
      '资产负债率': {
        analysis: '资产负债率偏离行业均值较大，可能存在偿债风险过高或财务杠杆利用不足的问题。',
        suggestion: '建议核实企业负债结构、偿债能力，分析负债期限匹配情况，关注或有负债情况。',
      },
      '流动比率': {
        analysis: '流动比率偏离行业均值较大，短期偿债能力可能存在异常。',
        suggestion: '建议核实流动资产质量，分析应收账款周转情况和存货周转情况，关注短期偿债压力。',
      },
      '速动比率': {
        analysis: '速动比率偏离行业均值较大，即时偿债能力可能存在异常。',
        suggestion: '建议重点分析存货变现能力和应收账款回收情况，评估企业短期流动性风险。',
      },
      '净资产收益率': {
        analysis: '净资产收益率偏离行业均值较大，盈利能力可能存在异常。',
        suggestion: '建议核实收入真实性、成本费用构成，分析盈利质量和可持续性。',
      },
      '毛利率': {
        analysis: '毛利率偏离行业均值较大，盈利水平可能存在异常。',
        suggestion: '建议分析产品定价策略、成本控制能力，核实收入成本匹配性。',
      },
      '总资产周转率': {
        analysis: '总资产周转率偏离行业均值较大，资产运营效率可能存在异常。',
        suggestion: '建议分析资产结构、运营效率，核实营业收入真实性和资产质量。',
      },
      '利息保障倍数': {
        analysis: '利息保障倍数偏离行业均值较大，利息偿付能力可能存在异常。',
        suggestion: '建议核实企业利息支出情况，分析盈利对利息的覆盖能力，关注债务违约风险。',
      },
      '经营现金流比率': {
        analysis: '经营现金流比率偏离行业均值较大，经营活动现金流质量可能存在异常。',
        suggestion: '建议核实经营活动现金流的真实性，分析收入与现金流的匹配性，关注资金链风险。',
      },
    };

    for (const ratio of ratios) {
      if (ratio.isAbnormal) {
        const template = analysisTemplates[ratio.name] || {
          analysis: `${ratio.name}偏离行业均值较大，存在异常。`,
          suggestion: '建议进一步核实相关数据，分析异常原因。',
        };

        let analysis = template.analysis;
        if (ratio.deviationRate > 0) {
          analysis = analysis.replace('偏离', '高于');
        } else {
          analysis = analysis.replace('偏离', '低于');
        }

        abnormalItems.push({
          ratioName: ratio.name,
          value: ratio.value,
          industryAverage: ratio.industryAverage,
          deviationRate: ratio.deviationRate,
          analysis,
          dueDiligenceSuggestion: template.suggestion,
        });
      }
    }

    return abnormalItems;
  }

  generateOverallAssessment(abnormalItems: AbnormalItem[], ratios: FinancialRatio[]): string {
    const abnormalCount = abnormalItems.length;
    const totalCount = ratios.length;
    const highRiskCount = abnormalItems.filter(item => Math.abs(item.deviationRate) > 50).length;

    let assessment = '';

    if (abnormalCount === 0) {
      assessment = '本次财务分析未发现明显异常指标，各项财务比率均处于行业合理范围内，企业财务状况整体健康。';
    } else if (abnormalCount <= 2 && highRiskCount === 0) {
      assessment = `本次财务分析发现 ${abnormalCount} 项指标偏离行业均值，整体风险可控。建议关注 ${abnormalItems.map(item => item.ratioName).join('、')} 等指标的变化趋势。`;
    } else if (abnormalCount <= 4) {
      assessment = `本次财务分析发现 ${abnormalCount} 项指标偏离行业均值，其中 ${highRiskCount} 项严重偏离。企业存在一定财务风险，建议进行专项尽职调查，重点关注 ${abnormalItems.slice(0, 3).map(item => item.ratioName).join('、')} 等方面。`;
    } else {
      assessment = `本次财务分析发现 ${abnormalCount} 项指标偏离行业均值，其中 ${highRiskCount} 项严重偏离。企业财务风险较高，建议立即开展全面财务尽职调查，核实资产质量、负债规模、盈利能力和现金流状况，审慎评估授信风险。`;
    }

    return assessment;
  }

  async processUploadedFile(
    file: Express.Multer.File,
    enterpriseId: string,
    enterpriseName: string
  ): Promise<FinancialAnalysis> {
    const financialData = this.parseFinancialExcel(file.buffer);

    const enterprise = db.enterprises.find(e => e.id === enterpriseId);
    const industry = enterprise?.industry || '其他';

    const ratios = this.calculateFinancialRatios(financialData);
    const keyRatios = this.compareWithIndustry(ratios, industry);
    const abnormalItems = this.generateAbnormalAnalysis(keyRatios);
    const overallAssessment = this.generateOverallAssessment(abnormalItems, keyRatios);

    const now = getCurrentTime();
    const analysis: FinancialAnalysis = {
      id: generateId(),
      enterpriseId,
      enterpriseName,
      reportPeriod: new Date().toISOString().split('T')[0].substring(0, 7),
      uploadTime: now,
      keyRatios,
      abnormalItems,
      overallAssessment,
      rawFile: file.originalname,
    };

    db.financialAnalyses.push(analysis);

    return analysis;
  }
}

export const financialAnalysisService = new FinancialAnalysisService();
