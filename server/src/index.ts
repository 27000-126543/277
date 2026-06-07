import express from 'express';
import cors from 'cors';
import * as net from 'net';
import { initDatabase } from './services/DataInitService';
import { dataSourceService } from './services/DataSourceService';
import { reportService } from './services/ReportService';
import { AlertEngineService } from './services/AlertEngineService';
import { db } from './models/Database';
import authRoutes from './routes/authRoutes';
import enterpriseRoutes from './routes/enterpriseRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import alertRoutes from './routes/alertRoutes';
import approvalRoutes from './routes/approvalRoutes';
import financialRoutes from './routes/financialRoutes';
import reportRoutes from './routes/reportRoutes';
import systemRoutes from './routes/systemRoutes';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        server.close();
        resolve(findAvailablePort(startPort + 1));
      } else {
        reject(err);
      }
    });
    server.once('listening', () => {
      server.close();
      resolve(startPort);
    });
    server.listen(startPort);
  });
}

async function startServer() {
  try {
    initDatabase();
    console.log('✅ 数据库初始化完成');

    const alertEngine = AlertEngineService.getInstance();
    alertEngine.runAlertChecks();
    console.log('✅ 初始预警检测完成');

    dataSourceService.startScheduledTasks();
    console.log('✅ 数据源定时任务已启动');

    reportService.startWeeklyReportTask();
    console.log('✅ 周报定时任务已启动');

    if (db.weeklyReports.length === 0) {
      reportService.generateWeeklyReport();
      console.log('✅ 初始周度报告已生成');
    } else {
      console.log(`📊 已有 ${db.weeklyReports.length} 份周度报告`);
    }

    console.log(`📊 当前企业数: ${db.enterprises.length}`);
    console.log(`📊 当前预警数: ${db.alerts.length}`);
    console.log(`📊 当前审批流程数: ${db.approvalProcesses.length}`);

    app.get('/api/health', (req, res) => {
      res.json({
        status: 'ok',
        message: '企业信用风险评估平台后端服务运行正常',
        stats: {
          enterprises: db.enterprises.length,
          alerts: db.alerts.length,
          approvals: db.approvalProcesses.length,
          reports: db.weeklyReports.length,
          users: db.users.length,
        },
      });
    });

    app.use('/api/auth', authRoutes);
    app.use('/api/enterprises', enterpriseRoutes);
    app.use('/api/dashboard', dashboardRoutes);
    app.use('/api/alerts', alertRoutes);
    app.use('/api/approvals', approvalRoutes);
    app.use('/api/financial', financialRoutes);
    app.use('/api/reports', reportRoutes);
    app.use('/api/system', systemRoutes);

    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
      console.error('服务器错误:', err);
      res.status(500).json({ message: '服务器内部错误', error: err.message });
    });

    const availablePort = await findAvailablePort(PORT);
    if (availablePort !== PORT) {
      console.log(`⚠️  端口 ${PORT} 被占用，使用端口 ${availablePort}`);
    }

    app.listen(availablePort, () => {
      console.log(`\n🚀 服务器已启动: http://localhost:${availablePort}`);
      console.log(`📊 健康检查: http://localhost:${availablePort}/api/health`);
      console.log(`\n🔑 测试账号:`);
      console.log(`   - 总行管理员: admin / 123456`);
      console.log(`   - 省分行用户: provincial / 123456`);
      console.log(`   - 市支行用户: municipal / 123456`);
      console.log(`   - 分析师: analyst / 123456\n`);
    });
  } catch (error) {
    console.error('❌ 服务器启动失败:', error);
    process.exit(1);
  }
}

startServer();
