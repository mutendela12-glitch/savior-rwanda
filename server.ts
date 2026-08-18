import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { saviorState } from './server/state';
import { analyzeScamMessageWithAI, analyzeUrlWithAI, askSaviorAIAdvisor } from './server/gemini';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==================== API ROUTES ====================

// 1. Health & Meta
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    platform: 'SAVIOR — Rwanda AI Cybersecurity Platform',
    version: '2.4.0-SECURE-VAULT',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    simulatedMode: true,
  });
});

// 2. User & Roles
app.get('/api/user/profile', (req, res) => {
  res.json(saviorState.getUser());
});

app.post('/api/user/role', (req, res) => {
  const { role } = req.body;
  if (!['CITIZEN', 'INVESTIGATOR', 'SECURITY_ANALYST', 'SYSTEM_ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const updatedUser = saviorState.setUserRole(role);
  res.json(updatedUser);
});

// 3. Emergency Account Lock & Recovery
app.post('/api/user/emergency-lock', (req, res) => {
  try {
    const { reason } = req.body;
    const result = saviorState.emergencyLockAccount(reason);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to lock account' });
  }
});

app.post('/api/user/recover', (req, res) => {
  try {
    const { backupCode, passwordReset, unlockConfirmed } = req.body;
    const result = saviorState.recoverAccount({ backupCode, passwordReset, unlockConfirmed });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Account recovery failed' });
  }
});

app.get('/api/user/sessions', (req, res) => {
  res.json(saviorState.getActiveSessions());
});

app.delete('/api/user/sessions/:id', (req, res) => {
  const updatedSessions = saviorState.revokeSession(req.params.id);
  res.json(updatedSessions);
});

// 4. Security Score Engine
app.get(['/api/security/score', '/api/security-score'], (req, res) => {
  const breakdown = saviorState.calculateSecurityScore();
  res.json(breakdown);
});

// 5. Biometric Face Verification Engine
app.get(['/api/biometrics', '/api/biometrics/status'], (req, res) => {
  res.json(saviorState.getBiometricProfile());
});

app.post('/api/biometrics/consent', (req, res) => {
  const { consent } = req.body;
  const profile = saviorState.updateBiometricConsent(Boolean(consent));
  res.json(profile);
});

app.post('/api/biometrics/enroll', (req, res) => {
  try {
    const { faceVectorData } = req.body;
    const profile = saviorState.enrollBiometrics(faceVectorData || 'vec_default_128_geom');
    res.json({ success: true, profile });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/biometrics/verify', (req, res) => {
  try {
    const { success } = req.body;
    const result = saviorState.verifyBiometricFace(Boolean(success));
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/biometrics', (req, res) => {
  const result = saviorState.deleteBiometrics();
  res.json(result);
});

app.get('/api/vault/backup-codes', (req, res) => {
  res.json({ backupCodes: saviorState.getBackupCodes() });
});

// 6. Financial Connections & Multi-Stage Transaction Authorizations
app.get('/api/financial/connections', (req, res) => {
  res.json(saviorState.getFinancialConnections());
});

app.post('/api/financial/connections/toggle', (req, res) => {
  try {
    const { connectionId, action } = req.body;
    const connections = saviorState.toggleFinancialConnection(connectionId, action);
    res.json(connections);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/transactions', (req, res) => {
  res.json(saviorState.getTransactions());
});

app.post('/api/transactions/create-simulated', (req, res) => {
  try {
    const { connectionId, recipientName, recipientPhoneOrAccount, amount, transactionType } = req.body;
    if (!connectionId || !recipientName || !recipientPhoneOrAccount || !amount) {
      return res.status(400).json({ error: 'Missing required transaction fields' });
    }
    const newTx = saviorState.createSimulatedTransaction({
      connectionId,
      recipientName,
      recipientPhoneOrAccount,
      amount: Number(amount),
      transactionType: transactionType || 'MOMO_PAY',
    });
    res.json(newTx);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/transactions/authorize', (req, res) => {
  try {
    const { txId, passwordVerified, mfaVerified, faceBiometricVerified } = req.body;
    const result = saviorState.authorizeTransaction(txId, {
      passwordVerified: Boolean(passwordVerified),
      mfaVerified: Boolean(mfaVerified),
      faceBiometricVerified: Boolean(faceBiometricVerified),
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/transactions/reject', (req, res) => {
  try {
    const { txId, reason } = req.body;
    const result = saviorState.rejectTransaction(txId, reason);
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 7. Cybercrime Reports & Evidence Seals
app.get('/api/reports', (req, res) => {
  res.json(saviorState.getReports());
});

app.get('/api/reports/track/:trackingId', (req, res) => {
  const reports = saviorState.getReports();
  const found = reports.find(r => r.trackingId.toLowerCase() === req.params.trackingId.toLowerCase());
  if (!found) {
    return res.status(404).json({ error: 'Tracking ID not found in SAVIOR registry.' });
  }
  res.json(found);
});

app.post('/api/reports/submit', (req, res) => {
  try {
    const { category, title, description, suspectContact, financialLossAmount, evidenceFileName, evidenceFileContent, priority } = req.body;
    if (!category || !title || !description) {
      return res.status(400).json({ error: 'Please provide category, title, and description' });
    }
    const report = saviorState.submitReport({
      category,
      title,
      description,
      suspectContact,
      financialLossAmount: Number(financialLossAmount) || 0,
      evidenceFileName,
      evidenceFileContent,
      priority,
    });
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.patch('/api/reports/:id/status', (req, res) => {
  try {
    const { status, note, officerName } = req.body;
    const updated = saviorState.updateReportStatus(
      req.params.id, 
      status, 
      note || 'Status updated via command console', 
      officerName || 'Duty Officer'
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. AI Threat Scanner (Messages & URLs)
app.post('/api/scanner/analyze-message', async (req, res) => {
  try {
    const { message, language } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Please provide message content to analyze.' });
    }
    const result = await analyzeScamMessageWithAI(message, language || 'en');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Scam analysis failed' });
  }
});

app.post('/api/scanner/analyze-url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'Please provide a URL to inspect.' });
    }
    const result = await analyzeUrlWithAI(url);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'URL inspection failed' });
  }
});

// 9. Interactive AI Cyber Advisor
app.post('/api/ai/ask', async (req, res) => {
  try {
    const { query, language } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });
    const answer = await askSaviorAIAdvisor(query, { user: saviorState.getUser() }, language || 'en');
    res.json({ answer, timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Admin & Telemetry
app.get('/api/admin/threat-map', (req, res) => {
  res.json(saviorState.getThreatMap());
});

app.get(['/api/alerts', '/api/security/alerts'], (req, res) => {
  res.json(saviorState.getAlerts());
});

// ==================== VITE MIDDLEWARE & STATIC ====================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🛡️ SAVIOR Rwanda AI Cybersecurity Platform running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
