import { Router } from 'express';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { reportService } from '../services/ReportService';

const router = Router();

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const reports = db.weeklyReports.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    res.json({ data: reports });
  } catch (error: any) {
    res.status(500).json({ message: '获取周度报告列表失败', error: error.message });
  }
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const report = db.weeklyReports.find(r => r.id === id);
    
    if (!report) {
      return res.status(404).json({ message: '周度报告不存在' });
    }

    res.json({ data: report });
  } catch (error: any) {
    res.status(500).json({ message: '获取周度报告详情失败', error: error.message });
  }
});

router.post('/generate', authMiddleware, (req: AuthRequest, res) => {
  try {
    const report = reportService.generateWeeklyReport();
    res.json({
      success: true,
      message: '周度报告生成成功',
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({ message: '生成周度报告失败', error: error.message });
  }
});

router.get('/download/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const report = db.weeklyReports.find(r => r.id === id);
    
    if (!report) {
      return res.status(404).json({ message: '周度报告不存在' });
    }

    res.json({
      success: true,
      message: '报告下载成功',
      data: {
        reportId: id,
        fileName: `周度报告_${report.year}年第${report.weekNumber}周.pdf`,
        downloadUrl: `#`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: '下载报告失败', error: error.message });
  }
});

export default router;
