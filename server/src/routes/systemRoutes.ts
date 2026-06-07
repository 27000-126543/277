import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest, requireRole } from '../middleware/auth';
import { generateId, getCurrentTime } from '../utils/helpers';
import type { User } from '../types';

const router = Router();

router.get('/users', authMiddleware, requireRole('headquarters'), (req: AuthRequest, res) => {
  try {
    const users = db.users.map(({ password, ...user }) => user);
    res.json({ data: users });
  } catch (error: any) {
    res.status(500).json({ message: '获取用户列表失败', error: error.message });
  }
});

router.post('/users', authMiddleware, requireRole('headquarters'), (req: AuthRequest, res) => {
  try {
    const { username, name, password, role, region, regionCode, permissions } = req.body;

    if (!username || !name || !password || !role) {
      return res.status(400).json({ message: '请填写必填字段' });
    }

    const existingUser = db.users.find(u => u.username === username);
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const newUser: User = {
      id: generateId(),
      username,
      name,
      password: hashedPassword,
      role,
      region,
      regionCode,
      permissions: permissions || [],
      createdAt: getCurrentTime(),
    };

    db.users.push(newUser);

    const { password: _, ...userWithoutPassword } = newUser;
    res.json({
      success: true,
      message: '用户创建成功',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ message: '创建用户失败', error: error.message });
  }
});

router.put('/users/:id', authMiddleware, requireRole('headquarters'), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { name, password, role, region, regionCode, permissions } = req.body;

    const userIndex = db.users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const user = db.users[userIndex];

    if (password) {
      user.password = bcrypt.hashSync(password, 10);
    }

    user.name = name ?? user.name;
    user.role = role ?? user.role;
    user.region = region ?? user.region;
    user.regionCode = regionCode ?? user.regionCode;
    user.permissions = permissions ?? user.permissions;

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: '用户更新成功',
      data: userWithoutPassword,
    });
  } catch (error: any) {
    res.status(500).json({ message: '更新用户失败', error: error.message });
  }
});

router.delete('/users/:id', authMiddleware, requireRole('headquarters'), (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userIndex = db.users.findIndex(u => u.id === id);

    if (userIndex === -1) {
      return res.status(404).json({ message: '用户不存在' });
    }

    db.users.splice(userIndex, 1);
    res.json({ success: true, message: '用户删除成功' });
  } catch (error: any) {
    res.status(500).json({ message: '删除用户失败', error: error.message });
  }
});

router.get('/datasources', authMiddleware, (req: AuthRequest, res) => {
  try {
    const dataSourceTypes = [
      { type: 'business', name: '工商数据', description: '企业工商注册信息' },
      { type: 'judicial', name: '司法诉讼数据', description: '企业司法涉诉信息' },
      { type: 'tax', name: '税务数据', description: '企业税务申报信息' },
      { type: 'bank', name: '银行流水数据', description: '企业银行账户流水' },
      { type: 'credit', name: '征信数据', description: '企业征信报告信息' },
    ];

    const dataSources = dataSourceTypes.map(ds => {
      const latestRecord = db.enterprises
        .flatMap(e => e.dataSources)
        .filter(d => d.sourceType === ds.type)
        .sort((a, b) => new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime())[0];

      return {
        ...ds,
        status: latestRecord ? 'normal' : 'pending',
        lastSyncTime: latestRecord?.fetchedAt || null,
        syncCount: db.enterprises.filter(e => 
          e.dataSources.some(d => d.sourceType === ds.type)
        ).length,
      };
    });

    res.json({ data: dataSources });
  } catch (error: any) {
    res.status(500).json({ message: '获取数据源状态失败', error: error.message });
  }
});

router.post('/datasources/:id/sync', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const validTypes = ['business', 'judicial', 'tax', 'bank', 'credit'];
    if (!validTypes.includes(id)) {
      return res.status(400).json({ message: '无效的数据源类型' });
    }

    const syncCount = db.enterprises.length;

    res.json({
      success: true,
      message: `数据源同步已触发，共 ${syncCount} 家企业`,
      data: {
        sourceType: id,
        syncCount,
        triggeredAt: getCurrentTime(),
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '触发数据源同步失败', error: error.message });
  }
});

export default router;
