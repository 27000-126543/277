import { Router } from 'express';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest, requireRole, filterByUserRegion } from '../middleware/auth';
import type { Enterprise } from '../types';

const router = Router();

router.use(authMiddleware);

router.get('/', (req: AuthRequest, res) => {
  try {
    const { page = 1, pageSize = 10, province, industry, scale, creditLevel, alertStatus } = req.query;

    let enterprises = [...db.enterprises];

    enterprises = filterByUserRegion(req, enterprises);

    if (province) {
      enterprises = enterprises.filter(e => e.province === province);
    }
    if (industry) {
      enterprises = enterprises.filter(e => e.industry === industry);
    }
    if (scale) {
      enterprises = enterprises.filter(e => e.scale === scale);
    }
    if (creditLevel) {
      enterprises = enterprises.filter(e => e.creditLevel === creditLevel);
    }
    if (alertStatus) {
      enterprises = enterprises.filter(e => e.alertStatus === alertStatus);
    }

    const pageNum = parseInt(page as string);
    const size = parseInt(pageSize as string);
    const total = enterprises.length;
    const start = (pageNum - 1) * size;
    const paginatedEnterprises = enterprises.slice(start, start + size);

    res.json({
      success: true,
      data: paginatedEnterprises,
      pagination: {
        page: pageNum,
        pageSize: size,
        total,
        totalPages: Math.ceil(total / size),
      },
    });
  } catch (error) {
    res.status(500).json({ message: '获取企业列表失败', error });
  }
});

router.get('/:id', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const enterprise = db.enterprises.find(e => e.id === id);

    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }

    const filtered = filterByUserRegion(req, [enterprise]);
    if (filtered.length === 0) {
      return res.status(403).json({ message: '无权限访问该企业' });
    }

    res.json({ success: true, data: enterprise });
  } catch (error) {
    res.status(500).json({ message: '获取企业详情失败', error });
  }
});

router.get('/:id/credit-history', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const enterprise = db.enterprises.find(e => e.id === id);

    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }

    const filtered = filterByUserRegion(req, [enterprise]);
    if (filtered.length === 0) {
      return res.status(403).json({ message: '无权限访问该企业' });
    }

    res.json({
      success: true,
      data: enterprise.creditScoreHistory || [],
    });
  } catch (error) {
    res.status(500).json({ message: '获取信用分历史失败', error });
  }
});

router.get('/:id/alerts', (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const enterprise = db.enterprises.find(e => e.id === id);

    if (!enterprise) {
      return res.status(404).json({ message: '企业不存在' });
    }

    const filtered = filterByUserRegion(req, [enterprise]);
    if (filtered.length === 0) {
      return res.status(403).json({ message: '无权限访问该企业' });
    }

    const alerts = db.alerts.filter(a => a.enterpriseId === id);

    res.json({ success: true, data: alerts });
  } catch (error) {
    res.status(500).json({ message: '获取预警记录失败', error });
  }
});

router.put('/:id', requireRole('headquarters', 'provincial'), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const enterpriseIndex = db.enterprises.findIndex(e => e.id === id);

    if (enterpriseIndex === -1) {
      return res.status(404).json({ message: '企业不存在' });
    }

    const enterprise = db.enterprises[enterpriseIndex];
    const filtered = filterByUserRegion(req, [enterprise]);
    if (filtered.length === 0) {
      return res.status(403).json({ message: '无权限修改该企业' });
    }

    const updateData = req.body;
    db.enterprises[enterpriseIndex] = {
      ...enterprise,
      ...updateData,
      id: enterprise.id,
      updateTime: new Date().toISOString(),
    };

    res.json({
      success: true,
      message: '企业信息更新成功',
      data: db.enterprises[enterpriseIndex],
    });
  } catch (error) {
    res.status(500).json({ message: '更新企业信息失败', error });
  }
});

export default router;
