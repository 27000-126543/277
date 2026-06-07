import { Router } from 'express';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest, filterByUserRegion } from '../middleware/auth';
import type { ApprovalProcess, ApprovalStatus, ApprovalType, UserRole } from '../types';

const router = Router();

router.use(authMiddleware);

const stepRoleMap: Record<1 | 2 | 3, UserRole[]> = {
  1: ['municipal'],
  2: ['provincial'],
  3: ['headquarters'],
};

function filterApprovalsByUserRole(
  req: AuthRequest,
  approvals: ApprovalProcess[]
): ApprovalProcess[] {
  if (!req.user) return [];

  if (req.user.role === 'headquarters' || req.user.role === 'analyst') {
    return approvals;
  }

  if (req.user.role === 'provincial') {
    return approvals.filter(a => a.currentStep <= 2);
  }

  if (req.user.role === 'municipal') {
    return approvals.filter(a => a.currentStep === 1);
  }

  return [];
}

router.get('/', (req: AuthRequest, res) => {
  try {
    const { status, type } = req.query as {
      status?: ApprovalStatus;
      type?: ApprovalType;
    };

    let approvals = [...db.approvalProcesses];

    if (status) {
      approvals = approvals.filter(a => a.status === status);
    }
    if (type) {
      approvals = approvals.filter(a => a.type === type);
    }

    approvals = filterApprovalsByUserRole(req, approvals);

    res.json({ success: true, data: approvals });
  } catch (error) {
    res.status(500).json({ message: '获取审批列表失败', error });
  }
});

router.get('/statistics', (req: AuthRequest, res) => {
  try {
    let approvals = filterApprovalsByUserRole(req, db.approvalProcesses);

    const statistics = {
      pending: approvals.filter(a => a.status === 'pending').length,
      approved: approvals.filter(a => a.status === 'approved').length,
      rejected: approvals.filter(a => a.status === 'rejected').length,
    };

    res.json({ success: true, data: statistics });
  } catch (error) {
    res.status(500).json({ message: '获取审批统计失败', error });
  }
});

router.get('/mine', (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }

    const userRole = req.user.role;
    let currentStep: 1 | 2 | 3 | null = null;

    if (userRole === 'municipal') currentStep = 1;
    else if (userRole === 'provincial') currentStep = 2;
    else if (userRole === 'headquarters') currentStep = 3;

    let myApprovals = db.approvalProcesses.filter(a => {
      if (a.status !== 'pending') return false;
      if (currentStep && a.currentStep !== currentStep) return false;
      return true;
    });

    myApprovals = filterApprovalsByUserRole(req, myApprovals);

    res.json({ success: true, data: myApprovals });
  } catch (error) {
    res.status(500).json({ message: '获取我的待办失败', error });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const approval = db.approvalProcesses.find(a => a.id === id);

    if (!approval) {
      return res.status(404).json({ message: '审批流程不存在' });
    }

    const filteredApprovals = filterApprovalsByUserRole(req, [approval]);
    if (filteredApprovals.length === 0) {
      return res.status(403).json({ message: '权限不足' });
    }

    res.json({ success: true, data: approval });
  } catch (error) {
    res.status(500).json({ message: '获取审批详情失败', error });
  }
});

router.post('/:id/approve', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { opinion } = req.body as { opinion?: string };

    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }

    const approvalIndex = db.approvalProcesses.findIndex(a => a.id === id);
    if (approvalIndex === -1) {
      return res.status(404).json({ message: '审批流程不存在' });
    }

    const approval = db.approvalProcesses[approvalIndex];

    if (approval.status !== 'pending') {
      return res.status(400).json({ message: '审批流程已完成，无法操作' });
    }

    const allowedRoles = stepRoleMap[approval.currentStep];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: '当前角色无此审批节点权限' });
    }

    const stepIndex = approval.steps.findIndex(s => s.step === approval.currentStep);
    if (stepIndex === -1) {
      return res.status(500).json({ message: '审批步骤异常' });
    }

    approval.steps[stepIndex] = {
      ...approval.steps[stepIndex],
      handler: req.user.name,
      status: 'approved',
      opinion,
      handleTime: new Date().toISOString(),
    };

    if (approval.currentStep < 3) {
      approval.currentStep = (approval.currentStep + 1) as 1 | 2 | 3;
    } else {
      approval.status = 'approved';
    }

    db.approvalProcesses[approvalIndex] = { ...approval };

    res.json({
      success: true,
      data: db.approvalProcesses[approvalIndex],
      message: approval.status === 'approved' ? '审批通过，流程完成' : '审批通过，进入下一节点',
    });
  } catch (error) {
    res.status(500).json({ message: '审批失败', error });
  }
});

router.post('/:id/reject', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { opinion } = req.body as { opinion?: string };

    if (!req.user) {
      return res.status(401).json({ message: '未认证' });
    }

    const approvalIndex = db.approvalProcesses.findIndex(a => a.id === id);
    if (approvalIndex === -1) {
      return res.status(404).json({ message: '审批流程不存在' });
    }

    const approval = db.approvalProcesses[approvalIndex];

    if (approval.status !== 'pending') {
      return res.status(400).json({ message: '审批流程已完成，无法操作' });
    }

    const allowedRoles = stepRoleMap[approval.currentStep];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: '当前角色无此审批节点权限' });
    }

    const stepIndex = approval.steps.findIndex(s => s.step === approval.currentStep);
    if (stepIndex === -1) {
      return res.status(500).json({ message: '审批步骤异常' });
    }

    approval.steps[stepIndex] = {
      ...approval.steps[stepIndex],
      handler: req.user.name,
      status: 'rejected',
      opinion,
      handleTime: new Date().toISOString(),
    };

    approval.status = 'rejected';

    db.approvalProcesses[approvalIndex] = { ...approval };

    res.json({
      success: true,
      data: db.approvalProcesses[approvalIndex],
      message: '审批已拒绝',
    });
  } catch (error) {
    res.status(500).json({ message: '审批拒绝失败', error });
  }
});

export default router;
