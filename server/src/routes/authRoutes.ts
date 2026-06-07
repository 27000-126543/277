import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../models/Database';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('🔐 登录请求:', { username, password, received: true });
    
    const user = db.users.find(u => u.username === username);
    console.log('👤 找到用户:', user ? user.username : '未找到', user ? '密码hash: ' + user.password.substring(0, 20) + '...' : '');
    
    if (!user) {
      console.log('❌ 用户不存在');
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    console.log('🔑 密码验证:', isPasswordValid ? '成功' : '失败');
    
    if (!isPasswordValid) {
      console.log('❌ 密码不匹配');
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({ message: '登录失败', error });
  }
});

router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  if (!req.user) {
    return res.status(401).json({ message: '未认证' });
  }
  const { password: _, ...userWithoutPassword } = req.user;
  res.json({ user: userWithoutPassword });
});

router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: '登出成功' });
});

export default router;
