import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { createServer as createViteServer } from 'vite';
import { saviorState } from './server/state';
import { supabaseRepo } from './server/supabaseRepo';
import { analyzeScamMessageWithAI, analyzeUrlWithAI, analyzeScreenshotWithAI, askSaviorAIAdvisor, verifyFaceBiometricWithAI } from './server/gemini';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Anti-Abuse Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { error: 'Too many authentication attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportSubmitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Report submission rate limit reached. Please wait before submitting another report.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const reportTrackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Tracking query rate limit reached. Please wait a few minutes before trying again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ==================== API ROUTES ====================

// 1. Health & Meta
app.get('/api/health', async (req, res) => {
  const dbStatus = await saviorState.getDatabaseDiagnostics();
  res.json({
    status: 'online',
    platform: 'SAVIOR — Rwanda AI Cybersecurity Platform',
    version: '2.5.0-SUPABASE-READY',
    timestamp: new Date().toISOString(),
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY),
    database: dbStatus,
  });
});

app.get('/api/database/status', async (req, res) => {
  try {
    const diagnostics = await saviorState.getDatabaseDiagnostics();
    res.json(diagnostics);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to query database status' });
  }
});

// ==================== AUTHENTICATION & EMAIL VERIFICATION ====================

app.post('/api/auth/send-code', authLimiter, (req, res) => {
  try {
    const { email, type, fullName, phone, nationalId, district, role } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }
    const result = saviorState.requestEmailVerificationCode(email, type || 'SIGNIN', {
      fullName,
      phone,
      nationalId,
      district,
      role,
    });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch verification code' });
  }
});

app.post('/api/auth/verify-code', authLimiter, (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }
    const result = saviorState.verifyEmailCode(email, code);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Verification process failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const result = saviorState.logoutSession(token);
  res.json(result);
});

app.get('/api/auth/session', (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token || !saviorState.validateSessionToken(token)) {
    return res.status(401).json({ authenticated: false });
  }
  res.json({ authenticated: true, user: saviorState.getUser() });
});

// 2. User & Roles (Protected Anti-Privilege Escalation)
app.get('/api/user/profile', (req, res) => {
  res.json(saviorState.getUser());
});

app.post('/api/user/role', (req, res) => {
  const { role } = req.body;
  if (!['CITIZEN', 'INVESTIGATOR', 'SECURITY_ANALYST', 'SYSTEM_ADMIN'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const token = req.headers.authorization?.replace('Bearer ', '');
  const currentUser = saviorState.getUser();

  // Enforce server-side authorization: Only verified SYSTEM_ADMIN can elevate to privileged roles
  if (role !== 'CITIZEN' && role !== currentUser.role) {
    if (!token || !saviorState.validateSessionToken(token)) {
      return res.status(401).json({ error: 'Authentication required to assign privileged roles.' });
    }
    if (currentUser.role !== 'SYSTEM_ADMIN') {
      return res.status(403).json({ error: 'Access Denied: Only authorized SYSTEM_ADMIN users can alter roles.' });
    }
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

app.post('/api/biometrics/enroll', async (req, res) => {
  try {
    const { faceVectorData, imageBase64 } = req.body;
    let aiVerification = null;
    if (imageBase64) {
      aiVerification = await verifyFaceBiometricWithAI(imageBase64);
      if (aiVerification && !aiVerification.isHumanFace) {
        return res.status(400).json({
          success: false,
          error: aiVerification.details || 'No human face detected in the camera frame. Please align your face inside the circle and ensure good lighting.',
          aiVerification,
        });
      }
    }
    const profile = saviorState.enrollBiometrics(faceVectorData || 'vec_128_geom_live_' + Date.now());
    res.json({ success: true, profile, aiVerification });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/biometrics/verify', async (req, res) => {
  try {
    const { success, imageBase64, faceDetected } = req.body;
    let aiVerification = null;
    if (imageBase64) {
      aiVerification = await verifyFaceBiometricWithAI(imageBase64);
      if (aiVerification && !aiVerification.isHumanFace) {
        const failureResult = saviorState.verifyBiometricFace(false);
        return res.status(400).json({
          verified: false,
          error: aiVerification.details || 'No human face detected in camera capture. Please face the camera and try again.',
          attemptsRemaining: failureResult.attemptsRemaining,
          locked: failureResult.locked,
          aiVerification,
        });
      }
    } else if (faceDetected === false) {
      const failureResult = saviorState.verifyBiometricFace(false);
      return res.status(400).json({
        verified: false,
        error: 'No human face was detected in front of the camera.',
        attemptsRemaining: failureResult.attemptsRemaining,
        locked: failureResult.locked,
      });
    }
    const result = saviorState.verifyBiometricFace(Boolean(success));
    res.json({ ...result, aiVerification });
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

function sanitizeReportForPublicTracking(r: any) {
  return {
    id: r.id,
    trackingId: r.trackingId,
    category: r.category,
    title: r.title,
    description: r.description?.length > 200 ? r.description.substring(0, 197) + '...' : (r.description || ''),
    theftType: r.theftType || 'MONEY',
    status: r.status,
    priority: r.priority,
    assignedUnit: r.assignedUnit || 'SAVIOR Intake & Verification Queue',
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
    fastActionsTaken: (r.fastActionsTaken || []).map((a: any) => ({
      actionType: a.actionType,
      timestamp: a.timestamp,
      details: a.details,
      referenceTicket: a.referenceTicket,
      officer: 'Verification Gateway',
    })),
    chainOfCustodyAudit: (r.chainOfCustodyAudit || []).map((c: any) => ({
      timestamp: c.timestamp,
      actor: c.actor?.includes('Citizen') ? 'Citizen Reporter' : 'Intake Relay',
      action: c.action,
      integrityHash: c.integrityHash,
    })),
    reporterContactMasked: '+250 ••• ••• •••',
    hasEvidence: Boolean(r.evidenceFiles && r.evidenceFiles.length > 0),
  };
}

app.get('/api/reports/track/:trackingId', reportTrackingLimiter, async (req, res) => {
  const trackingId = (req.params.trackingId || '').trim();
  const token = req.headers.authorization?.replace('Bearer ', '');
  const currentUser = token && saviorState.validateSessionToken(token) ? saviorState.getUser() : null;
  const isOfficial = currentUser && ['INVESTIGATOR', 'SECURITY_ANALYST', 'SYSTEM_ADMIN'].includes(currentUser.role);

  // 1. Search local memory cache
  const reports = saviorState.getReports();
  const found = reports.find(r => r.trackingId.toLowerCase() === trackingId.toLowerCase());
  if (found) {
    if (isOfficial) return res.json(found);
    return res.json(sanitizeReportForPublicTracking(found));
  }

  // 2. Query Supabase database
  try {
    const dbRes = await supabaseRepo.fetchPublicReportTracking(trackingId);
    if (dbRes.success && dbRes.data) {
      if (isOfficial) {
        const fullRes = await supabaseRepo.fetchReportByTrackingId(trackingId);
        if (fullRes.success && fullRes.data) return res.json(fullRes.data);
      }
      return res.json(sanitizeReportForPublicTracking(dbRes.data));
    }
  } catch (err: any) {
    console.warn('Database query error on trackingId:', err.message);
  }

  return res.status(404).json({ error: 'Tracking ID not found in SAVIOR registry.' });
});

app.post('/api/reports/submit', reportSubmitLimiter, (req, res) => {
  try {
    const { 
      category, 
      title, 
      description, 
      theftType,
      moneyDetails,
      informationDetails,
      suspectDetails,
      immediateActionsRequested,
      suspectContact, 
      financialLossAmount, 
      evidenceFileName, 
      evidenceFileContent, 
      priority,
      incidentLocation 
    } = req.body;

    const validCategories = [
      'MOBILE_MONEY_FRAUD', 'FINANCIAL_SCAM', 'PHISHING_LINK',
      'ACCOUNT_HACKING', 'IDENTITY_THEFT', 'RANSOMWARE',
      'SOCIAL_MEDIA_IMPERSONATION', 'MALICIOUS_APP'
    ];

    if (!category || !validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid or missing incident category' });
    }

    const cleanTitle = typeof title === 'string' ? title.replace(/<[^>]*>?/gm, '').trim() : '';
    const cleanDesc = typeof description === 'string' ? description.replace(/<[^>]*>?/gm, '').trim() : '';

    if (cleanTitle.length < 5 || cleanTitle.length > 300) {
      return res.status(400).json({ error: 'Incident title must be between 5 and 300 characters' });
    }
    if (cleanDesc.length < 10 || cleanDesc.length > 10000) {
      return res.status(400).json({ error: 'Incident description must be between 10 and 10,000 characters' });
    }

    const lossAmount = Math.max(0, Number(moneyDetails?.amountRwf || financialLossAmount) || 0);

    const report = saviorState.submitReport({
      category,
      title: cleanTitle,
      description: cleanDesc,
      theftType: ['MONEY', 'INFORMATION', 'BOTH'].includes(theftType) ? theftType : 'MONEY',
      moneyDetails,
      informationDetails,
      suspectDetails,
      immediateActionsRequested,
      suspectContact: suspectDetails?.phoneOrWhatsApp || suspectContact,
      financialLossAmount: lossAmount,
      evidenceFileName,
      evidenceFileContent,
      priority,
      incidentLocation,
    });
    res.json(report);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to submit report' });
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

app.post('/api/reports/:id/fast-action', (req, res) => {
  try {
    const { actionType, officerName, notes } = req.body;
    if (!actionType) {
      return res.status(400).json({ error: 'Please specify actionType' });
    }
    const updated = saviorState.executeFastAction(
      req.params.id,
      actionType,
      officerName || 'Duty Officer',
      notes
    );
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/reports/:id/gps-track', (req, res) => {
  try {
    const telemetry = saviorState.getSuspectGpsPing(req.params.id);
    res.json(telemetry);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/police/stats', (req, res) => {
  res.json(saviorState.getPoliceStats());
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

app.post('/api/scanner/analyze-screenshot', async (req, res) => {
  try {
    const { imageBase64, language } = req.body;
    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ error: 'Please provide image screenshot data (base64).' });
    }
    const result = await analyzeScreenshotWithAI(imageBase64, language || 'en');
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Screenshot threat analysis failed' });
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
  // Initialize persistent database synchronization if Supabase credentials are configured
  try {
    const syncRes = await saviorState.initDatabaseSync();
    if (syncRes.configured) {
      console.log(`[SAVIOR Database] Supabase PostgreSQL sync initialized (Success: ${syncRes.synced})`);
    } else {
      console.log('[SAVIOR Database] Running in fallback storage mode (Supabase credentials pending in .env)');
    }
  } catch (err: any) {
    console.warn('[SAVIOR Database Warning] Initial sync error:', err.message);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false,
      },
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
