import { db } from '../models/Database';
import type { Enterprise, Alert, AlertLevel, AlertTriggerType, ApprovalProcess, ApprovalStep } from '../types';
import { generateId, getCurrentTime, industrySafetyLines } from '../utils/helpers';

class AlertEngineService {
  private static instance: AlertEngineService;

  private constructor() {}

  public static getInstance(): AlertEngineService {
    if (!AlertEngineService.instance) {
      AlertEngineService.instance = new AlertEngineService();
    }
    return AlertEngineService.instance;
  }

  public checkScoreDrop(enterprise: Enterprise): Alert | null {
    const history = enterprise.creditScoreHistory;
    if (history.length < 3) {
      return null;
    }

    const recentHistory = history.slice(-3);
    const isContinuousDrop = recentHistory.every((item, index, arr) => {
      if (index === 0) return true;
      return item.score < arr[index - 1].score;
    });

    if (!isContinuousDrop) {
      return null;
    }

    const oldestScore = recentHistory[0].score;
    const newestScore = recentHistory[recentHistory.length - 1].score;
    const dropRate = ((oldestScore - newestScore) / oldestScore) * 100;

    if (dropRate < 20) {
      return null;
    }

    const existingAlert = db.alerts.find(
      a => a.enterpriseId === enterprise.id && 
           a.triggerType === 'score_drop' && 
           (a.status === 'pending' || a.status === 'processing')
    );

    if (existingAlert) {
      return null;
    }

    const alert: Alert = {
      id: generateId(),
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      level: 'level1',
      triggerType: 'score_drop',
      triggerReason: '连续3个月信用分下降超过20%',
      triggerDetail: {
        metricName: '信用评分',
        currentValue: newestScore,
        threshold: oldestScore * 0.8,
        changeRate: -dropRate,
      },
      triggerTime: getCurrentTime(),
      status: 'pending',
      province: enterprise.province,
      provinceCode: enterprise.provinceCode,
      cityCode: enterprise.cityCode,
      industry: enterprise.industry,
      firstTriggerTime: getCurrentTime(),
    };

    db.alerts.push(alert);
    enterprise.alertStatus = 'level1';

    return alert;
  }

  public checkDebtRatio(enterprise: Enterprise): Alert | null {
    const safetyLine = industrySafetyLines[enterprise.industry] || industrySafetyLines['其他'];
    const currentRatio = enterprise.assetLiabilityRatio;

    if (currentRatio <= safetyLine) {
      return null;
    }

    const existingAlert = db.alerts.find(
      a => a.enterpriseId === enterprise.id && 
           a.triggerType === 'debt_ratio_exceed' && 
           (a.status === 'pending' || a.status === 'processing')
    );

    if (existingAlert) {
      return null;
    }

    const alert: Alert = {
      id: generateId(),
      enterpriseId: enterprise.id,
      enterpriseName: enterprise.name,
      level: 'level1',
      triggerType: 'debt_ratio_exceed',
      triggerReason: `资产负债率突破${enterprise.industry}行业安全线`,
      triggerDetail: {
        metricName: '资产负债率',
        currentValue: currentRatio,
        threshold: safetyLine,
        changeRate: ((currentRatio - safetyLine) / safetyLine) * 100,
      },
      triggerTime: getCurrentTime(),
      status: 'pending',
      province: enterprise.province,
      provinceCode: enterprise.provinceCode,
      cityCode: enterprise.cityCode,
      industry: enterprise.industry,
      firstTriggerTime: getCurrentTime(),
    };

    db.alerts.push(alert);
    enterprise.alertStatus = 'level1';

    return alert;
  }

  public checkAlertEscalation(): { escalated: Alert[]; newProcesses: ApprovalProcess[] } {
    const escalated: Alert[] = [];
    const newProcesses: ApprovalProcess[] = [];
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    for (const alert of db.alerts) {
      if (alert.level !== 'level1' || alert.status === 'resolved' || alert.status === 'escalated') {
        continue;
      }

      const firstTriggerTime = alert.firstTriggerTime || alert.triggerTime;
      const triggerDate = new Date(firstTriggerTime);

      if (triggerDate <= oneMonthAgo) {
        alert.level = 'level2';
        alert.status = 'escalated';
        escalated.push(alert);

        const enterprise = db.enterprises.find(e => e.id === alert.enterpriseId);
        if (enterprise) {
          enterprise.alertStatus = 'level2';
        }

        const approvalProcess = this.createApprovalProcess(alert);
        newProcesses.push(approvalProcess);
      }
    }

    return { escalated, newProcesses };
  }

  public createApprovalProcess(alert: Alert): ApprovalProcess {
    const steps: ApprovalStep[] = [
      {
        step: 1,
        role: '信贷员',
        handler: '',
        status: 'pending',
      },
      {
        step: 2,
        role: '支行行长',
        handler: '',
        status: 'pending',
      },
      {
        step: 3,
        role: '总行审批',
        handler: '',
        status: 'pending',
      },
    ];

    const process: ApprovalProcess = {
      id: generateId(),
      alertId: alert.id,
      enterpriseName: alert.enterpriseName,
      type: 'post_loan',
      currentStep: 1,
      status: 'pending',
      steps,
      createTime: getCurrentTime(),
      applicant: 'system',
    };

    db.approvalProcesses.push(process);
    alert.approvalProcessId = process.id;

    return process;
  }

  public runAlertChecks(): { newAlerts: Alert[]; escalated: Alert[]; newProcesses: ApprovalProcess[] } {
    const newAlerts: Alert[] = [];

    for (const enterprise of db.enterprises) {
      const scoreDropAlert = this.checkScoreDrop(enterprise);
      if (scoreDropAlert) {
        newAlerts.push(scoreDropAlert);
      }

      const debtRatioAlert = this.checkDebtRatio(enterprise);
      if (debtRatioAlert) {
        newAlerts.push(debtRatioAlert);
      }
    }

    const { escalated, newProcesses } = this.checkAlertEscalation();

    return { newAlerts, escalated, newProcesses };
  }

  public getEnterpriseAlerts(enterpriseId: string): Alert[] {
    return db.alerts
      .filter(alert => alert.enterpriseId === enterpriseId)
      .sort((a, b) => new Date(b.triggerTime).getTime() - new Date(a.triggerTime).getTime());
  }

  public getAlertById(alertId: string): Alert | undefined {
    return db.alerts.find(alert => alert.id === alertId);
  }

  public updateAlertStatus(alertId: string, status: Alert['status'], handler?: string, resolution?: string): Alert | null {
    const alert = db.alerts.find(a => a.id === alertId);
    if (!alert) {
      return null;
    }

    alert.status = status;
    if (handler) {
      alert.handler = handler;
    }
    if (resolution) {
      alert.resolution = resolution;
      alert.resolutionTime = getCurrentTime();
    }

    if (status === 'resolved') {
      const enterprise = db.enterprises.find(e => e.id === alert.enterpriseId);
      if (enterprise) {
        const hasActiveAlerts = db.alerts.some(
          a => a.enterpriseId === enterprise.id && 
               (a.status === 'pending' || a.status === 'processing' || a.status === 'escalated') &&
               a.id !== alertId
        );
        if (!hasActiveAlerts) {
          enterprise.alertStatus = 'resolved';
        }
      }
    }

    return alert;
  }

  public getAllAlerts(level?: AlertLevel, status?: Alert['status']): Alert[] {
    let alerts = [...db.alerts];
    
    if (level) {
      alerts = alerts.filter(a => a.level === level);
    }
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    
    return alerts.sort((a, b) => new Date(b.triggerTime).getTime() - new Date(a.triggerTime).getTime());
  }
}

export const alertEngineService = AlertEngineService.getInstance();
