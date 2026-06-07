import type { Enterprise } from '../types';
import { db } from '../models/Database';
import { getCreditLevel, randomFloat, getMonthLabel, industrySafetyLines } from '../utils/helpers';

const WEIGHTS = {
  financial: 0.30,
  operation: 0.25,
  creditHistory: 0.20,
  industryRisk: 0.15,
  regionalRisk: 0.10,
};

export function calculateCreditScore(enterprise: Enterprise): number {
  const financialScore = calculateFinancialScore(enterprise);
  const operationScore = calculateOperationScore(enterprise);
  const creditHistoryScore = calculateCreditHistoryScore(enterprise);
  const industryRiskScore = calculateIndustryRiskScore(enterprise);
  const regionalRiskScore = calculateRegionalRiskScore(enterprise);

  const totalScore =
    financialScore * WEIGHTS.financial +
    operationScore * WEIGHTS.operation +
    creditHistoryScore * WEIGHTS.creditHistory +
    industryRiskScore * WEIGHTS.industryRisk +
    regionalRiskScore * WEIGHTS.regionalRisk;

  return parseFloat(Math.max(0, Math.min(100, totalScore + randomFloat(-2, 2))).toFixed(1));
}

function calculateFinancialScore(enterprise: Enterprise): number {
  if (!enterprise.financialData) return 70;

  const { totalAssets, totalLiabilities, netProfit, operatingRevenue, currentAssets, currentLiabilities } = enterprise.financialData;

  const assetLiabilityRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 50;
  const returnOnAssets = totalAssets > 0 ? (netProfit / totalAssets) * 100 : 5;
  const currentRatio = currentLiabilities > 0 ? currentAssets / currentLiabilities : 1.5;
  const profitMargin = operatingRevenue > 0 ? (netProfit / operatingRevenue) * 100 : 8;

  const debtScore = Math.max(0, 100 - assetLiabilityRatio);
  const profitabilityScore = Math.min(100, Math.max(0, returnOnAssets * 8));
  const liquidityScore = Math.min(100, Math.max(0, currentRatio * 40));
  const marginScore = Math.min(100, Math.max(0, profitMargin * 3));

  return (debtScore + profitabilityScore + liquidityScore + marginScore) / 4;
}

function calculateOperationScore(enterprise: Enterprise): number {
  const scaleScores: Record<string, number> = {
    large: 90,
    medium: 75,
    small: 60,
    micro: 45,
  };

  const scaleScore = scaleScores[enterprise.scale] || 60;

  const establishmentDate = new Date(enterprise.establishmentDate);
  const now = new Date();
  const yearsOperated = Math.max(0, (now.getTime() - establishmentDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
  const ageScore = Math.min(100, yearsOperated * 5 + 40);

  const registeredCapital = enterprise.registeredCapital;
  let capitalScore = 50;
  if (registeredCapital >= 10000) capitalScore = 95;
  else if (registeredCapital >= 5000) capitalScore = 85;
  else if (registeredCapital >= 1000) capitalScore = 75;
  else if (registeredCapital >= 500) capitalScore = 65;
  else capitalScore = 55;

  return (scaleScore + ageScore + capitalScore) / 3;
}

function calculateCreditHistoryScore(enterprise: Enterprise): number {
  if (enterprise.creditScoreHistory.length === 0) return 70;

  const recentScores = enterprise.creditScoreHistory.slice(-6);
  const avgScore = recentScores.reduce((sum, h) => sum + h.score, 0) / recentScores.length;

  let trendScore = 0;
  if (recentScores.length >= 2) {
    const firstScore = recentScores[0].score;
    const lastScore = recentScores[recentScores.length - 1].score;
    const trend = lastScore - firstScore;
    trendScore = Math.max(-20, Math.min(20, trend * 2));
  }

  return Math.max(0, Math.min(100, avgScore + trendScore));
}

function calculateIndustryRiskScore(enterprise: Enterprise): number {
  const safetyLine = industrySafetyLines[enterprise.industry] || 60;
  const baseScore = safetyLine + randomFloat(-5, 5);
  return Math.max(0, Math.min(100, baseScore));
}

function calculateRegionalRiskScore(enterprise: Enterprise): number {
  const provinceData = db.provinceData.find(p => p.provinceCode === enterprise.provinceCode);
  if (!provinceData) return 70;

  const defaultRateFactor = Math.max(0, 100 - provinceData.defaultRate * 10);
  const avgScoreFactor = provinceData.avgCreditScore;

  return (defaultRateFactor + avgScoreFactor) / 2;
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

export function recalculateAllEnterprises(): void {
  for (const enterprise of db.enterprises) {
    const newScore = calculateCreditScore(enterprise);
    enterprise.creditScore = newScore;
    enterprise.creditLevel = getCreditLevel(newScore);
    enterprise.defaultProbability = calculateDefaultProbability(newScore);
    enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);
    enterprise.updateTime = new Date().toISOString();
  }
}

export function updateMonthlyScores(): void {
  const monthLabel = getMonthLabel(0);

  for (const enterprise of db.enterprises) {
    const newScore = calculateCreditScore(enterprise);
    enterprise.creditScore = newScore;
    enterprise.creditLevel = getCreditLevel(newScore);
    enterprise.defaultProbability = calculateDefaultProbability(newScore);
    enterprise.debtSolvencyIndex = calculateDebtSolvencyIndex(enterprise);

    const lastEntry = enterprise.creditScoreHistory[enterprise.creditScoreHistory.length - 1];
    if (!lastEntry || lastEntry.date !== monthLabel) {
      enterprise.creditScoreHistory.push({
        date: monthLabel,
        score: newScore,
      });
    } else {
      lastEntry.score = newScore;
    }

    enterprise.updateTime = new Date().toISOString();
  }
}
