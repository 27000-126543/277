import { Router } from 'express';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest, filterByUserRegion } from '../middleware/auth';
import type { Alert, AlertLevel, AlertStatus } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  try {
    const { level, status, province, industry } = req.query as {
      level?: AlertLevel;
      status?: AlertStatus;
      province?: string;
      industry?: string;
    };

    let alerts = [...db.alerts];

    if (level) {
      alerts = alerts.filter(a => a.level === level);
    }
    if (status) {
      alerts = alerts.filter(a => a.status === status);
    }
    if (province) {
      alerts = alerts.filter(a => a.province === province);
    }
    if (industry) {
      alerts = alerts.filter(a => a.industry === industry);
    }

    alerts = filterByUserRegion(req, alerts);

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ message: '获取预警列表失败', error });
  }
});

router.get('/statistics', (req: AuthRequest, res) => {
  try {
    let alerts = filterByUserRegion(req, db.alerts);

    const statistics = {
      total: alerts.length,
      level1: alerts.filter(a => a.level === 'level1').length,
      level2: alerts.filter(a => a.level === 'level2').length,
      pending: alerts.filter(a => a.status === 'pending').length,
    };

    res.json({ success: true, data: statistics });
  } catch (error) {
    res.status(500).json({ message: '获取预警统计失败', error });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const alert = db.alerts.find(a => a.id === id);

    if (!alert) {
      return res.status(404).json({ message: '预警不存在' });
    }

    const filteredAlerts = filterByUserRegion(req, [alert]);
    if (filteredAlerts.length === 0) {
      return res.status(403).json({ message: '权限不足' });
    }

    res.json({ success: true, data: alert });
  } catch (error) {
    res.status(500).json({ message: '获取预警详情失败', error });
  }
});

router.put('/:id/handle', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status, resolution } = req.body as {
      status: AlertStatus;
      resolution?: string;
    };

    const alertIndex = db.alerts.findIndex(a => a.id === id);
    if (alertIndex === -1) {
      return res.status(404).json({ message: '预警不存在' });
    }

    const alert = db.alerts[alertIndex];
    const filteredAlerts = filterByUserRegion(req, [alert]);
    if (filteredAlerts.length === 0) {
      return res.status(403).json({ message: '权限不足' });
    }

    db.alerts[alertIndex] = {
      ...alert,
      status,
      handler: req.user?.name,
      resolution,
      resolutionTime: new Date().toISOString(),
    };

    res.json({ success: true, data: db.alerts[alertIndex], message: '处置成功' });
  } catch (error) {
    res.status(500).json({ message: '处置预警失败', error });
  }
});

router.post('/:id/escalate', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body as { reason?: string };

    const alertIndex = db.alerts.findIndex(a => a.id === id);
    if (alertIndex === -1) {
      return res.status(404).json({ message: '预警不存在' });
    }

    const alert = db.alerts[alertIndex];
    const filteredAlerts = filterByUserRegion(req, [alert]);
    if (filteredAlerts.length === 0) {
      return res.status(403).json({ message: '权限不足' });
    }

    if (alert.level === 'level2') {
      return res.status(400).json({ message: '预警已为二级，无需升级' });
    }

    const approvalProcessId = `APR-${Date.now()}`;
    const approvalProcess = {
      id: approvalProcessId,
      alertId: alert.id,
      enterpriseName: alert.enterpriseName,
      type: 'credit_adjust' as const,
      currentStep: 1 as const,
      status: 'pending' as const,
      steps: [
        {
          step: 1 as const,
          role: 'municipal',
          handler: '',
          status: 'pending' as const,
        },
        {
          step: 2 as const,
          role: 'provincial',
          handler: '',
          status: 'pending' as const,
        },
        {
          step: 3 as const,
          role: 'headquarters',
          handler: '',
          status: 'pending' as const,
        },
      ],
      createTime: new Date().toISOString(),
      applicant: req.user?.name || '',
    };

    db.approvalProcesses.push(approvalProcess);

    db.alerts[alertIndex] = {
      ...alert,
      level: 'level2',
      status: 'escalated',
      approvalProcessId,
      firstTriggerTime: alert.firstTriggerTime || alert.triggerTime,
    };

    res.json({
      success: true,
      data: { alert: db.alerts[alertIndex], approvalProcess },
      message: '预警升级成功，已启动审批流程',
    });
  } catch (error) {
    res.status(500).json({ message: '升级预警失败', error });
  }
});

export default router;
