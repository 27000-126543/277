import { Router } from 'express';
import multer from 'multer';
import { db } from '../models/Database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { financialAnalysisService } from '../services/FinancialAnalysisService';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls'];
    const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    if (allowedTypes.includes(fileExtension)) {
      cb(null, true);
    } else {
      cb(new Error('仅支持 xlsx/xls 格式文件'));
    }
  },
});

router.post('/upload', authMiddleware, upload.single('file'), async (req: AuthRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '请上传文件' });
    }

    const { enterpriseId, enterpriseName } = req.body;
    if (!enterpriseId || !enterpriseName) {
      return res.status(400).json({ message: '请提供企业ID和企业名称' });
    }

    const analysis = await financialAnalysisService.processUploadedFile(
      req.file,
      enterpriseId,
      enterpriseName
    );

    res.json({
      success: true,
      message: '财报分析完成',
      data: analysis,
    });
  } catch (error: any) {
    res.status(500).json({ message: '财报分析失败', error: error.message });
  }
});

router.get('/', authMiddleware, (req: AuthRequest, res) => {
  try {
    const analyses = db.financialAnalyses.sort((a, b) => 
      new Date(b.uploadTime).getTime() - new Date(a.uploadTime).getTime()
    );
    res.json({ data: analyses });
  } catch (error: any) {
    res.status(500).json({ message: '获取财报分析列表失败', error: error.message });
  }
});

router.get('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const analysis = db.financialAnalyses.find(a => a.id === id);
    
    if (!analysis) {
      return res.status(404).json({ message: '财报分析记录不存在' });
    }

    res.json({ data: analysis });
  } catch (error: any) {
    res.status(500).json({ message: '获取财报分析详情失败', error: error.message });
  }
});

router.delete('/:id', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const index = db.financialAnalyses.findIndex(a => a.id === id);
    
    if (index === -1) {
      return res.status(404).json({ message: '财报分析记录不存在' });
    }

    db.financialAnalyses.splice(index, 1);
    res.json({ success: true, message: '删除成功' });
  } catch (error: any) {
    res.status(500).json({ message: '删除失败', error: error.message });
  }
});

export default router;
