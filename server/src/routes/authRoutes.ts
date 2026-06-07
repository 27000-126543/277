import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../models/Database';
import { generateToken, authMiddleware, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    
    const user = db.users.find(u => u.username === username);
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
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
