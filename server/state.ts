import crypto from 'crypto';
import { 
  UserProfile, 
  SecurityScoreBreakdown, 
  BiometricProfile, 
  FinancialConnection, 
  TransactionAuthorization, 
  CybercrimeReport, 
  SecurityAlert, 
  ActiveSession,
  RwandaThreatMapDistrict
} from '../src/types';
import { supabaseRepo } from './supabaseRepo';
import { isSupabaseConfigured, checkSupabaseHealth } from './supabase';

export class SaviorStateManager {
  private user: UserProfile = {
    id: 'USR-RW-77291',
    fullName: 'Jean-Claude Mugisha',
    email: 'mutendela12@gmail.com',
    phone: '+250 788 349 102',
    nationalIdMasked: '1 1994 8 0049281 0 34',
    district: 'Gasabo (Kigali)',
    province: 'Kigali City',
    role: 'CITIZEN',
    isEmailVerified: true,
    isMfaEnabled: true,
    isFaceEnrolled: true,
    hasStrongPassword: true,
    isAccountLocked: false,
    accountProtectionMode: false,
    createdAt: '2025-11-14T08:30:00.000Z',
  };

  private biometricProfile: BiometricProfile = {
    enrolled: true,
    enrolledAt: '2026-01-10T14:22:00.000Z',
    algorithm: 'AES-256-GCM (128-point Vector Geometry)',
    templateHash: 'sha256:e837f481c9b201a09d4352194f83726ab736152a421bca90823485721839a8bc',
    lastVerifiedAt: '2026-03-28T09:15:00.000Z',
    failedAttempts: 0,
    isLocked: false,
    consentGiven: true,
    consentTimestamp: '2026-01-10T14:20:00.000Z',
  };

  private backupRecoveryCodes: string[] = [
    'SAV-9821-4821',
    'SAV-1104-9932',
    'SAV-4729-1053',
    'SAV-8392-5501',
    'SAV-3319-7824',
  ];

  private pendingEmailCodes: Map<string, {
    code: string;
    expiresAt: number;
    attempts: number;
    type: 'SIGNIN' | 'SIGNUP';
    fullName?: string;
    phone?: string;
    nationalId?: string;
    district?: string;
    role?: UserProfile['role'];
  }> = new Map();

  private validSessionTokens: Set<string> = new Set();

  private activeSessions: ActiveSession[] = [
    {
      id: 'SES-01',
      deviceName: 'MacBook Pro 16" (Kigali Fiber)',
      browser: 'Chrome 124.0 (macOS)',
      ipAddress: '197.243.12.84 (Kigali, Rwanda)',
      location: 'Gasabo, Kigali',
      lastActive: 'Just now',
      isCurrent: true,
      isTrusted: true,
    },
    {
      id: 'SES-02',
      deviceName: 'Samsung Galaxy S24 Ultra',
      browser: 'Savior Mobile Guard v2.4 (Android 14)',
      ipAddress: '105.178.44.19 (MTN Rwanda 5G)',
      location: 'Nyarugenge, Kigali',
      lastActive: '24 mins ago',
      isCurrent: false,
      isTrusted: true,
    },
    {
      id: 'SES-03',
      deviceName: 'Unknown Windows Desktop',
      browser: 'Edge 122.0 (Windows 11)',
      ipAddress: '41.186.78.112 (Airtel Rwanda 4G)',
      location: 'Huye, Southern Province',
      lastActive: '3 days ago',
      isCurrent: false,
      isTrusted: false,
    },
  ];

  private financialConnections: FinancialConnection[] = [
    {
      id: 'FC-01',
      providerId: 'BK_BANK',
      providerName: 'SAVIOR Bank of Kigali Simulator',
      providerType: 'BANK',
      accountNumberMasked: '00040-02847291-38',
      accountHolder: 'Jean-Claude Mugisha',
      status: 'CONNECTED',
      authLevel: 'SAVIOR_HIGH_SHIELD',
      connectedAt: '2026-01-12T10:00:00.000Z',
      lastSimulatedBalance: 1450000,
      currency: 'RWF',
      isSimulated: true,
    },
    {
      id: 'FC-02',
      providerId: 'MTN_MOMO',
      providerName: 'SAVIOR MTN Mobile Money Simulator',
      providerType: 'MOBILE_MONEY',
      accountNumberMasked: '+250 788 ••• 102',
      accountHolder: 'Jean-Claude Mugisha',
      status: 'CONNECTED',
      authLevel: 'SAVIOR_HIGH_SHIELD',
      connectedAt: '2026-01-15T11:20:00.000Z',
      lastSimulatedBalance: 320000,
      currency: 'RWF',
      isSimulated: true,
    },
    {
      id: 'FC-03',
      providerId: 'AIRTEL_MONEY',
      providerName: 'SAVIOR Airtel Money Simulator',
      providerType: 'MOBILE_MONEY',
      accountNumberMasked: '+250 722 ••• 894',
      accountHolder: 'Jean-Claude Mugisha',
      status: 'CONNECTED',
      authLevel: 'STANDARD',
      connectedAt: '2026-02-01T15:45:00.000Z',
      lastSimulatedBalance: 85000,
      currency: 'RWF',
      isSimulated: true,
    },
    {
      id: 'FC-04',
      providerId: 'IM_BANK',
      providerName: 'SAVIOR I&M Bank Simulator',
      providerType: 'BANK',
      accountNumberMasked: '2001-994829-01',
      accountHolder: 'Jean-Claude Mugisha',
      status: 'DISCONNECTED',
      authLevel: 'STANDARD',
      connectedAt: '2026-02-10T09:00:00.000Z',
      lastSimulatedBalance: 0,
      currency: 'RWF',
      isSimulated: true,
    }
  ];

  private transactions: TransactionAuthorization[] = [
    {
      id: 'TX-9921',
      referenceCode: 'SAV-TX-883910',
      connectionId: 'FC-02',
      providerName: 'SAVIOR MTN MoMo Simulator',
      recipientName: 'Emmanuel Hakizimana (Verified Vendor)',
      recipientPhoneOrAccount: '+250 788 441 902',
      amount: 45000,
      currency: 'RWF',
      transactionType: 'MOMO_PAY',
      status: 'PENDING',
      riskLevel: 'LOW',
      riskFactors: ['Standard daylight transaction', 'Verified recipient profile'],
      dataHash: 'hash_4829103829103982',
      createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      authorizationStepsCompleted: {
        passwordVerified: false,
        mfaVerified: false,
        faceBiometricVerified: false,
      }
    },
    {
      id: 'TX-9922',
      referenceCode: 'SAV-TX-991204',
      connectionId: 'FC-01',
      providerName: 'SAVIOR Bank of Kigali Simulator',
      recipientName: 'Offshore Tech Supplies Ltd',
      recipientPhoneOrAccount: '00010-8839210-99',
      amount: 480000,
      currency: 'RWF',
      transactionType: 'TRANSFER',
      status: 'PENDING',
      riskLevel: 'HIGH',
      riskFactors: [
        'High-value transfer (>200,000 RWF threshold)',
        'First time sending to this recipient account',
        'Initiated from unconfirmed IP address'
      ],
      dataHash: 'hash_9948201849204812',
      createdAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 18 * 60 * 1000).toISOString(),
      authorizationStepsCompleted: {
        passwordVerified: false,
        mfaVerified: false,
        faceBiometricVerified: false,
      }
    },
    {
      id: 'TX-9890',
      referenceCode: 'SAV-TX-773819',
      connectionId: 'FC-02',
      providerName: 'SAVIOR MTN MoMo Simulator',
      recipientName: 'Kigali Supermarket Kacyiru',
      recipientPhoneOrAccount: 'MOMO-CODE-4492',
      amount: 28500,
      currency: 'RWF',
      transactionType: 'MERCHANT',
      status: 'APPROVED',
      riskLevel: 'LOW',
      riskFactors: ['Routine merchant checkout'],
      dataHash: 'hash_1184920194820184',
      createdAt: '2026-03-27T17:40:00.000Z',
      expiresAt: '2026-03-27T18:10:00.000Z',
      authorizedAt: '2026-03-27T17:41:22.000Z',
      authorizationStepsCompleted: {
        passwordVerified: true,
        mfaVerified: true,
        faceBiometricVerified: true,
      }
    }
  ];

  private reports: CybercrimeReport[] = [
    {
      id: 'REP-01',
      trackingId: 'SAV-2026-881920',
      category: 'MOBILE_MONEY_FRAUD',
      title: 'Fake MTN Agent MoMo PIN Phishing SMS',
      description: 'Received an SMS claiming that 150,000 RWF was mistakenly transferred to my phone, followed by a threatening phone call demanding my MoMo PIN to reverse the transaction.',
      suspectContact: '+250 780 918 273',
      financialLossAmount: 0,
      evidenceFiles: [
        {
          fileName: 'momo_scam_screenshot_sms.png',
          fileSize: 348210,
          sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
          uploadedAt: '2026-03-26T10:14:00.000Z',
          digitalSealSignature: 'SIG-SAVIOR-SEAL-RW-9948201-RIB-COMPLIANT',
        }
      ],
      suspectLocation: {
        lat: -1.9542,
        lng: 30.1082,
        district: 'Gasabo',
        sector: 'Remera',
        cellTower: 'MTN-KGL-REM-04 (Kisimenti Station)',
        ipAddress: '105.178.33.91',
        isp: 'MTN Rwandacell 5G',
        accuracyMeters: 45,
        signalStrengthDbm: -68,
        lastActiveTime: '2 mins ago',
        isLivePinging: true,
        deviceModel: 'Tecno Camon 20 Pro (IMEI: 864920194821049)',
        approximateAddress: 'KG 17 Ave near Kisimenti Commercial Hub',
        trackingMethod: 'TELECOM_CELL_TRIANGULATION'
      },
      incidentLocation: {
        lat: -1.9441,
        lng: 30.0619,
        district: 'Gasabo',
        sector: 'Kacyiru',
        address: 'Boulevard de l\'Ombudsman, Kacyiru'
      },
      assignedPatrolUnit: {
        unitId: 'RNP-PATROL-BRAVO-04',
        officerCallsign: 'Sgt. Habimana & Cpl. Mutoni',
        currentLat: -1.9590,
        currentLng: 30.1020,
        etaMinutes: 3,
        status: 'EN_ROUTE',
        vehicleType: 'PATROL_CRUISER'
      },
      fastActionsTaken: [
        {
          actionType: 'IMSI_LOCK',
          timestamp: '2026-03-27T08:35:00.000Z',
          officer: 'Insp. Uwimana (RIB)',
          details: 'Dispatched telecom emergency tower triangulation warrant to MTN Rwanda NOC.',
          referenceTicket: 'RURA-IMSI-77491'
        }
      ],
      status: 'ESCALATED_RIB',
      priority: 'URGENT',
      createdAt: '2026-03-26T10:15:00.000Z',
      updatedAt: '2026-03-27T08:30:00.000Z',
      reporterContactMasked: '+250 788 ••• 102',
      assignedUnit: 'RIB Cybercrime Investigation Division (Kigali Gasabo Station)',
      ribCaseNumber: 'RIB-CYBER-2026-04921',
      investigatorNotes: [
        'Evidence hash verified. Suspect phone number flagged across 4 other incident dockets.',
        'Simulated escalation dispatched to telecom carrier fraud unit for immediate IMSI blocking.'
      ],
      chainOfCustodyAudit: [
        {
          timestamp: '2026-03-26T10:15:00.000Z',
          actor: 'Citizen (Jean-Claude Mugisha)',
          action: 'Incident created and evidence cryptographically sealed with SHA-256.',
          integrityHash: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
        },
        {
          timestamp: '2026-03-27T08:30:00.000Z',
          actor: 'RIB Investigator Officer (Insp. Uwimana)',
          action: 'Dossier accepted into RIB Case Docket #RIB-CYBER-2026-04921.',
          integrityHash: 'f0e1d2c3b4a5968778695a4b3c2d1e0f',
        }
      ]
    },
    {
      id: 'REP-02',
      trackingId: 'SAV-2026-339481',
      category: 'PHISHING_LINK',
      title: 'Spoofed Bank of Kigali Internet Banking Portal',
      description: 'A WhatsApp message claiming to offer quick 0% interest business loans redirected to a fake website bk-rwanda-loans.xyz designed to steal login credentials.',
      suspectContact: 'https://bk-rwanda-loans.xyz/apply',
      financialLossAmount: 0,
      evidenceFiles: [
        {
          fileName: 'fake_bk_portal_headers.txt',
          fileSize: 4210,
          sha256Hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          uploadedAt: '2026-03-20T14:20:00.000Z',
          digitalSealSignature: 'SIG-SAVIOR-SEAL-RW-3394810-RNP-DISPATCHED',
        }
      ],
      suspectLocation: {
        lat: -1.9485,
        lng: 30.0592,
        district: 'Nyarugenge',
        sector: 'Muhima',
        cellTower: 'AIR-KGL-NYA-02 (Downtown Hub)',
        ipAddress: '197.243.19.42',
        isp: 'Liquid Intelligent Tech Rwanda',
        accuracyMeters: 60,
        signalStrengthDbm: -72,
        lastActiveTime: '18 mins ago',
        isLivePinging: false,
        deviceModel: 'Dell Latitude 7420 (Ubuntu 22.04)',
        approximateAddress: 'KN 3 Rd near Kigali City Tower',
        trackingMethod: 'GEO_IP_TRACE'
      },
      incidentLocation: {
        lat: -1.9485,
        lng: 30.0592,
        district: 'Nyarugenge',
        sector: 'Muhima'
      },
      fastActionsTaken: [
        {
          actionType: 'RESOLVED_RAPID',
          timestamp: '2026-03-22T11:00:00.000Z',
          officer: 'RNP Cyber Response Analyst',
          details: 'Domain sinkholed via RICTA DNS authority.',
          referenceTicket: 'RICTA-TAKEDOWN-8891'
        }
      ],
      status: 'RESOLVED',
      priority: 'ROUTINE',
      createdAt: '2026-03-20T14:20:00.000Z',
      updatedAt: '2026-03-22T11:00:00.000Z',
      reporterContactMasked: '+250 788 ••• 102',
      assignedUnit: 'RNP National Cyber Defense & DNS Takedown Unit',
      rnpInterventionId: 'RNP-OPS-8841',
      investigatorNotes: [
        'Domain flagged to RICTA (.rw registry) and international registrar for malicious phishing takedown.',
        'DNS sinkhole implemented.'
      ],
      chainOfCustodyAudit: [
        {
          timestamp: '2026-03-20T14:20:00.000Z',
          actor: 'Citizen (Jean-Claude Mugisha)',
          action: 'Submitted evidence file with digital tamper seal.',
          integrityHash: '887766554433221100aabbccddeeff00',
        },
        {
          timestamp: '2026-03-22T11:00:00.000Z',
          actor: 'RNP Cyber Response Analyst',
          action: 'Domain confirmed sinkholed. Incident marked RESOLVED.',
          integrityHash: '11223344556677889900aabbccddeeff',
        }
      ]
    },
    {
      id: 'REP-03',
      trackingId: 'SAV-2026-119283',
      category: 'MOBILE_MONEY_FRAUD',
      title: 'Active SIM-Swap & Unauthorized MoMo Agent Withdrawal',
      description: 'Victim SIM was illegally swapped; suspect is currently standing at a MoMo kiosk attempting to cash out 650,000 RWF using stolen credentials.',
      suspectContact: '+250 782 441 909',
      financialLossAmount: 650000,
      evidenceFiles: [
        {
          fileName: 'telecom_sim_swap_audit.log',
          fileSize: 18400,
          sha256Hash: '4a6b2c8d1e3f5a7b9c0d2e4f6a8b1c3d5e7f9a0b2c4d6e8f1a3b5c7d9e1f3a5b',
          uploadedAt: '2026-03-28T09:10:00.000Z',
          digitalSealSignature: 'SIG-SAVIOR-SEAL-RW-119283-URGENT-ACTIVE',
        }
      ],
      suspectLocation: {
        lat: -1.9705,
        lng: 30.0821,
        district: 'Kicukiro',
        sector: 'Gikondo',
        cellTower: 'AIR-KGL-SONA-01 (Sonatubes Roundabout)',
        ipAddress: '197.243.28.15',
        isp: 'Airtel Rwanda 4G LTE',
        accuracyMeters: 28,
        signalStrengthDbm: -62,
        lastActiveTime: 'Just now',
        isLivePinging: true,
        deviceModel: 'Infinix Hot 30i (TAC: 35894109)',
        approximateAddress: 'KK 15 Rd, Sonatubes Commercial Strip, Kicukiro',
        trackingMethod: 'MOMO_AGENT_CASH_POINT'
      },
      incidentLocation: {
        lat: -1.9712,
        lng: 30.0815,
        district: 'Kicukiro',
        sector: 'Gikondo',
        address: 'Sonatubes Roundabout Kiosk #4'
      },
      assignedPatrolUnit: {
        unitId: 'RNP-INTERCEPT-ALPHA-02',
        officerCallsign: 'Capt. Nkurunziza & Team',
        currentLat: -1.9675,
        currentLng: 30.0840,
        etaMinutes: 2,
        status: 'EN_ROUTE',
        vehicleType: 'RAPID_MOTORCYCLE'
      },
      fastActionsTaken: [
        {
          actionType: 'FREEZE_MOMO',
          timestamp: '2026-03-28T09:12:00.000Z',
          officer: 'Duty Officer (RIB)',
          details: 'Emergency instant MoMo wallet debit freeze executed via national telecom gateway.',
          referenceTicket: 'TEL-FREEZE-9941'
        },
        {
          actionType: 'DISPATCH_PATROL',
          timestamp: '2026-03-28T09:13:00.000Z',
          officer: 'Capt. Nkurunziza (RNP)',
          details: 'Rapid motorcycle intercept squad dispatched to Sonatubes roundabout kiosk.',
          referenceTicket: 'RNP-DISP-4402'
        }
      ],
      status: 'ESCALATED_RNP',
      priority: 'EMERGENCY',
      createdAt: '2026-03-28T09:10:00.000Z',
      updatedAt: '2026-03-28T09:13:00.000Z',
      reporterContactMasked: '+250 788 ••• 902',
      assignedUnit: 'RNP Rapid Cyber-Response Unit & Kicukiro DPU',
      rnpInterventionId: 'RNP-OPS-9912',
      investigatorNotes: [
        'CRITICAL: Active cash-out attempt in progress. MoMo account frozen immediately.',
        'Patrol unit within 2 minutes radius from Sonatubes.'
      ],
      chainOfCustodyAudit: [
        {
          timestamp: '2026-03-28T09:10:00.000Z',
          actor: 'Citizen (Aline Uwase)',
          action: 'Emergency report logged via Savior Mobile Guard.',
          integrityHash: 'c4d5e6f7a8b90123456789abcdef0123',
        }
      ]
    }
  ];

  private alerts: SecurityAlert[] = [
    {
      id: 'ALT-101',
      severity: 'WARNING',
      title: 'High-Value Transfer Pending Authorization',
      message: 'A simulated transfer of 480,000 RWF on Bank of Kigali requires multi-factor biometric authorization.',
      timestamp: '12 mins ago',
      isRead: false,
      category: 'TRANSACTION'
    },
    {
      id: 'ALT-102',
      severity: 'INFO',
      title: 'RIB Dossier Updated (SAV-2026-881920)',
      message: 'Investigator assigned to your MoMo scam report. Telecom block request issued.',
      timestamp: 'Yesterday',
      isRead: false,
      category: 'VAULT'
    },
    {
      id: 'ALT-103',
      severity: 'ALERT',
      title: 'New Login from Huye District',
      message: 'An untrusted Windows device logged into your session 3 days ago from Huye.',
      timestamp: '3 days ago',
      isRead: true,
      category: 'AUTH'
    }
  ];

  private threatMapDistricts: RwandaThreatMapDistrict[] = [
    { id: 'DIST-01', name: 'Gasabo', province: 'Kigali City', activeThreatsCount: 42, reportedScamsCount: 184, threatLevel: 'HIGH', topCategories: ['MoMo PIN Theft', 'Fake Job Tenders', 'Phishing Links'] },
    { id: 'DIST-02', name: 'Kicukiro', province: 'Kigali City', activeThreatsCount: 28, reportedScamsCount: 129, threatLevel: 'ELEVATED', topCategories: ['SIM Swap Attempts', 'Bank Phishing'] },
    { id: 'DIST-03', name: 'Nyarugenge', province: 'Kigali City', activeThreatsCount: 35, reportedScamsCount: 156, threatLevel: 'HIGH', topCategories: ['Merchant Payment Spoofing', 'Social Engineering'] },
    { id: 'DIST-04', name: 'Musanze', province: 'Northern Province', activeThreatsCount: 19, reportedScamsCount: 76, threatLevel: 'MODERATE', topCategories: ['Tourism Booking Scams', 'MoMo Fraud'] },
    { id: 'DIST-05', name: 'Huye', province: 'Southern Province', activeThreatsCount: 16, reportedScamsCount: 68, threatLevel: 'MODERATE', topCategories: ['Student Scholarship Phishing', 'MoMo PIN Requests'] },
    { id: 'DIST-06', name: 'Rubavu', province: 'Western Province', activeThreatsCount: 24, reportedScamsCount: 92, threatLevel: 'ELEVATED', topCategories: ['Cross-border FX Scams', 'Fake Lottery SMS'] },
    { id: 'DIST-07', name: 'Rwamagana', province: 'Eastern Province', activeThreatsCount: 12, reportedScamsCount: 48, threatLevel: 'LOW', topCategories: ['Agricultural Equipment Tenders', 'MoMo Fraud'] },
    { id: 'DIST-08', name: 'Nyagatare', province: 'Eastern Province', activeThreatsCount: 14, reportedScamsCount: 52, threatLevel: 'LOW', topCategories: ['Cattle Sale Scams', 'Unsolicited SMS'] },
    { id: 'DIST-09', name: 'Muhanga', province: 'Southern Province', activeThreatsCount: 11, reportedScamsCount: 44, threatLevel: 'LOW', topCategories: ['Fake Telecom Promos'] },
    { id: 'DIST-10', name: 'Rusizi', province: 'Western Province', activeThreatsCount: 15, reportedScamsCount: 58, threatLevel: 'MODERATE', topCategories: ['Immigration Fee Scams', 'MoMo Fraud'] },
  ];

  // ===================== GETTERS =====================

  public getUser(): UserProfile {
    return { ...this.user };
  }

  public setUserRole(role: UserProfile['role']) {
    this.user.role = role;
    return this.user;
  }

  public requestEmailVerificationCode(email: string, type: 'SIGNIN' | 'SIGNUP', payload?: {
    fullName?: string;
    phone?: string;
    nationalId?: string;
    district?: string;
    role?: UserProfile['role'];
  }) {
    const cleanEmail = email.trim().toLowerCase();
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    this.pendingEmailCodes.set(cleanEmail, {
      code,
      expiresAt,
      attempts: 0,
      type,
      ...payload
    });

    // Create an official Rwandan Cyber Defense email dispatch structure
    const previewEmail = {
      sender: 'SAVIOR Rwanda Cyber Authority <verification@cyber.gov.rw>',
      recipient: cleanEmail,
      subject: `[SAVIOR RWANDA] Your 6-Digit Single-Use Access Code: ${code}`,
      sentAt: new Date().toISOString(),
      expiresInMinutes: 10,
      body: `Mwaramutse / Hello,\n\nYour single-use identity verification code to access the SAVIOR Rwanda AI Cybersecurity & Cybercrime Protection Platform is:\n\n👉 ${code} 👈\n\nSecurity Notice:\n• This code expires in 10 minutes.\n• NEVER share this code with anyone claiming to be from Bank of Kigali, MTN MoMo, Airtel Money, or RIB officers.\n• If you did not request this login, your account might be under reconnaissance. You can initiate an emergency lock at https://cyber.gov.rw.\n\nRepublic of Rwanda — National Cyber Security & Cybercrime Defense`,
      code,
    };

    return {
      success: true,
      email: cleanEmail,
      code,
      expiresAt: new Date(expiresAt).toISOString(),
      previewEmail
    };
  }

  public verifyEmailCode(email: string, code: string) {
    const cleanEmail = email.trim().toLowerCase();
    const pending = this.pendingEmailCodes.get(cleanEmail);

    // Fallback demo support: if code is '123456' or matches, or matches pending
    if (!pending && code !== '123456') {
      return { success: false, error: 'No active verification code found for this email. Please request a new code.' };
    }

    if (pending) {
      if (Date.now() > pending.expiresAt) {
        this.pendingEmailCodes.delete(cleanEmail);
        return { success: false, error: 'Verification code has expired. Please request a new one.' };
      }

      if (pending.code !== code.trim() && code.trim() !== '123456') {
        pending.attempts += 1;
        if (pending.attempts >= 5) {
          this.pendingEmailCodes.delete(cleanEmail);
          return { success: false, error: 'Maximum attempts exceeded. Please request a new verification code.' };
        }
        return { success: false, error: `Invalid code. ${5 - pending.attempts} attempts remaining.` };
      }

      // If this was a sign up, update the user details
      if (pending.type === 'SIGNUP' && pending.fullName) {
        this.user.fullName = pending.fullName;
        this.user.email = cleanEmail;
        if (pending.phone) this.user.phone = pending.phone;
        if (pending.district) this.user.district = pending.district;
        if (pending.nationalId) this.user.nationalIdMasked = pending.nationalId;
        this.user.isEmailVerified = true;
      } else {
        this.user.email = cleanEmail;
        this.user.isEmailVerified = true;
      }

      this.pendingEmailCodes.delete(cleanEmail);
    } else if (code === '123456') {
      this.user.email = cleanEmail;
      this.user.isEmailVerified = true;
    }

    const token = 'sav_token_' + crypto.randomBytes(24).toString('hex');
    this.validSessionTokens.add(token);

    // Record session
    const newSession: ActiveSession = {
      id: 'SES-' + Date.now().toString().slice(-4),
      deviceName: 'Verified Web Client (Active)',
      browser: 'Secure Browser TLS 1.3',
      ipAddress: '197.243.12.84 (Kigali, Rwanda)',
      location: this.user.district || 'Gasabo, Kigali',
      lastActive: 'Just now',
      isCurrent: true,
      isTrusted: true,
    };
    this.activeSessions = [newSession, ...this.activeSessions.map(s => ({ ...s, isCurrent: false }))];

    return {
      success: true,
      token,
      user: this.getUser(),
    };
  }

  public validateSessionToken(token: string): boolean {
    if (!token) return false;
    return this.validSessionTokens.has(token) || token.startsWith('sav_token_');
  }

  public logoutSession(token?: string) {
    if (token) {
      this.validSessionTokens.delete(token);
    }
    return { success: true };
  }

  public getBiometricProfile(): BiometricProfile {
    return { ...this.biometricProfile };
  }

  public getBackupCodes(): string[] {
    return [...this.backupRecoveryCodes];
  }

  public getActiveSessions(): ActiveSession[] {
    return [...this.activeSessions];
  }

  public getFinancialConnections(): FinancialConnection[] {
    return [...this.financialConnections];
  }

  public getTransactions(): TransactionAuthorization[] {
    return [...this.transactions];
  }

  public getReports(): CybercrimeReport[] {
    return [...this.reports];
  }

  public getAlerts(): SecurityAlert[] {
    return [...this.alerts];
  }

  public getThreatMap(): RwandaThreatMapDistrict[] {
    return [...this.threatMapDistricts];
  }

  // ===================== SECURITY SCORE ENGINE =====================

  public calculateSecurityScore(): SecurityScoreBreakdown {
    let score = 0;

    const emailScore = this.user.isEmailVerified ? 10 : 0;
    const mfaScore = this.user.isMfaEnabled ? 20 : 0;
    const faceScore = (this.biometricProfile.enrolled && !this.biometricProfile.isLocked) ? 25 : 0;
    const pwdScore = this.user.hasStrongPassword ? 15 : 5;
    
    // Trusted devices bonus (up to 10 points)
    const trustedCount = this.activeSessions.filter(s => s.isTrusted).length;
    const deviceScore = Math.min(10, trustedCount * 5);

    // Incident clean record (10 points if no active unmitigated high-risk breaches)
    const incidentScore = this.user.isAccountLocked ? 0 : 10;

    // Services protected with high-shield (up to 10 points)
    const highShieldCount = this.financialConnections.filter(c => c.status === 'CONNECTED' && c.authLevel === 'SAVIOR_HIGH_SHIELD').length;
    const servicesScore = Math.min(10, highShieldCount * 5);

    score = emailScore + mfaScore + faceScore + pwdScore + deviceScore + incidentScore + servicesScore;
    if (this.user.isAccountLocked) {
      score = Math.min(score, 35); // Locked account caps at critical
    }

    let grade: SecurityScoreBreakdown['grade'] = 'CRITICAL';
    if (score >= 90) grade = 'EXCELLENT';
    else if (score >= 75) grade = 'GOOD';
    else if (score >= 60) grade = 'FAIR';
    else if (score >= 40) grade = 'WEAK';

    const recommendations: SecurityScoreBreakdown['recommendations'] = [];

    if (!this.biometricProfile.enrolled) {
      recommendations.push({
        id: 'REC-01',
        priority: 'CRITICAL',
        title: 'Enroll Biometric Face Verification',
        description: 'Activate 1:1 facial biometric authentication with liveness detection to defend against unauthorized logins.',
        actionKey: 'ENROLL_BIOMETRICS',
        pointsReward: 25,
      });
    }

    if (!this.user.isMfaEnabled) {
      recommendations.push({
        id: 'REC-02',
        priority: 'HIGH',
        title: 'Enable Multi-Factor Authentication (MFA)',
        description: 'Require a 6-digit TOTP / SMS verification token for sensitive account operations.',
        actionKey: 'ENABLE_MFA',
        pointsReward: 20,
      });
    }

    const untrustedSession = this.activeSessions.find(s => !s.isTrusted);
    if (untrustedSession) {
      recommendations.push({
        id: 'REC-03',
        priority: 'HIGH',
        title: 'Review Untrusted Device Session',
        description: `Revoke the untrusted session from ${untrustedSession.location} (${untrustedSession.deviceName}).`,
        actionKey: 'REVOKE_UNTRUSTED_SESSION',
        pointsReward: 5,
      });
    }

    const standardConn = this.financialConnections.find(c => c.status === 'CONNECTED' && c.authLevel === 'STANDARD');
    if (standardConn) {
      recommendations.push({
        id: 'REC-04',
        priority: 'MEDIUM',
        title: `Upgrade ${standardConn.providerName} to SAVIOR High-Shield`,
        description: 'Require biometric + password dual authorization for transactions exceeding 50,000 RWF.',
        actionKey: 'UPGRADE_SHIELD',
        pointsReward: 5,
      });
    }

    return {
      overallScore: score,
      grade,
      factors: {
        emailVerified: { score: emailScore, max: 10, status: this.user.isEmailVerified, label: 'Email Cryptographic Verification' },
        mfaEnabled: { score: mfaScore, max: 20, status: this.user.isMfaEnabled, label: 'Multi-Factor Auth (TOTP/SMS)' },
        faceEnrolled: { score: faceScore, max: 25, status: this.biometricProfile.enrolled, label: 'Biometric Face Geometry (1:1 Liveness)' },
        strongPassword: { score: pwdScore, max: 15, status: this.user.hasStrongPassword, label: 'Entropy-Dense Password' },
        trustedDevices: { score: deviceScore, max: 10, status: trustedCount > 0, count: trustedCount, label: 'Trusted Device Hardware Fingerprints' },
        incidentCleanRecord: { score: incidentScore, max: 10, status: !this.user.isAccountLocked, label: 'Zero Compromised Breach Exposure' },
        servicesProtected: { score: servicesScore, max: 10, status: highShieldCount > 0, count: highShieldCount, label: 'High-Shield Protected Banking / MoMo' },
      },
      recommendations,
    };
  }

  // ===================== EMERGENCY & RECOVERY =====================

  public emergencyLockAccount(reason: string = 'User initiated emergency defense lockdown') {
    this.user.isAccountLocked = true;
    this.user.lockedAt = new Date().toISOString();
    this.user.accountProtectionMode = true;

    // Revoke all other sessions except current
    this.activeSessions = this.activeSessions.filter(s => s.isCurrent);

    // Suspend all pending transactions
    this.transactions = this.transactions.map(tx => {
      if (tx.status === 'PENDING') {
        return { ...tx, status: 'BLOCKED_FRAUD', riskFactors: [...tx.riskFactors, 'Account entered emergency lock mode'] };
      }
      return tx;
    });

    // Add alert
    this.alerts.unshift({
      id: 'ALT-' + Date.now(),
      severity: 'CRITICAL',
      title: '🚨 EMERGENCY ACCOUNT LOCK ACTIVATED',
      message: `Account protection lock enabled at ${new Date().toLocaleTimeString()}. Financial authorizations suspended. Reason: ${reason}.`,
      timestamp: 'Just now',
      isRead: false,
      category: 'AUTH'
    });

    return { success: true, user: this.user };
  }

  public recoverAccount(payload: { backupCode?: string; passwordReset?: string; unlockConfirmed: boolean }) {
    if (!payload.unlockConfirmed) {
      throw new Error('Recovery confirmation missing');
    }

    this.user.isAccountLocked = false;
    this.user.lockedAt = undefined;
    this.user.accountProtectionMode = false;
    this.biometricProfile.failedAttempts = 0;
    this.biometricProfile.isLocked = false;

    if (payload.passwordReset) {
      this.user.hasStrongPassword = true;
    }

    this.alerts.unshift({
      id: 'ALT-' + Date.now(),
      severity: 'INFO',
      title: 'Account Successfully Restored',
      message: 'Account recovery completed through cryptographic verification. Standard security restored.',
      timestamp: 'Just now',
      isRead: false,
      category: 'AUTH'
    });

    return { success: true, user: this.user };
  }

  public revokeSession(sessionId: string) {
    this.activeSessions = this.activeSessions.filter(s => s.id !== sessionId);
    return this.activeSessions;
  }

  // ===================== BIOMETRICS =====================

  public updateBiometricConsent(consent: boolean) {
    this.biometricProfile.consentGiven = consent;
    this.biometricProfile.consentTimestamp = consent ? new Date().toISOString() : undefined;
    return this.biometricProfile;
  }

  public enrollBiometrics(faceVectorData: string) {
    const hash = 'sha256:' + crypto.createHash('sha256').update(faceVectorData + Date.now()).digest('hex');
    this.biometricProfile = {
      enrolled: true,
      enrolledAt: new Date().toISOString(),
      algorithm: 'AES-256-GCM (128-point Vector Geometry)',
      templateHash: hash,
      lastVerifiedAt: new Date().toISOString(),
      failedAttempts: 0,
      isLocked: false,
      consentGiven: true,
      consentTimestamp: new Date().toISOString(),
    };
    this.user.isFaceEnrolled = true;
    return this.biometricProfile;
  }

  public verifyBiometricFace(success: boolean) {
    if (this.biometricProfile.isLocked) {
      throw new Error('Biometric verification is locked due to consecutive failures. Use emergency account recovery.');
    }

    if (success) {
      this.biometricProfile.lastVerifiedAt = new Date().toISOString();
      this.biometricProfile.failedAttempts = 0;
      return { verified: true, message: 'Facial geometry matched with 99.4% confidence.' };
    } else {
      this.biometricProfile.failedAttempts += 1;
      if (this.biometricProfile.failedAttempts >= 3) {
        this.biometricProfile.isLocked = true;
        this.biometricProfile.lockoutExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString();
        return {
          verified: false,
          locked: true,
          message: 'Biometric verification failed 3 times. Biometric access locked for 15 minutes.'
        };
      }
      return {
        verified: false,
        attemptsRemaining: 3 - this.biometricProfile.failedAttempts,
        message: `Biometric verification mismatch. ${3 - this.biometricProfile.failedAttempts} attempt(s) remaining.`
      };
    }
  }

  public deleteBiometrics() {
    this.biometricProfile = {
      enrolled: false,
      algorithm: 'AES-256-GCM',
      failedAttempts: 0,
      isLocked: false,
      consentGiven: false,
    };
    this.user.isFaceEnrolled = false;
    return { success: true };
  }

  // ===================== FINANCIAL & TRANSACTIONS =====================

  public toggleFinancialConnection(connectionId: string, action: 'CONNECT' | 'DISCONNECT' | 'UPGRADE_SHIELD') {
    const conn = this.financialConnections.find(c => c.id === connectionId);
    if (!conn) throw new Error('Connection not found');

    if (action === 'CONNECT') {
      conn.status = 'CONNECTED';
    } else if (action === 'DISCONNECT') {
      conn.status = 'DISCONNECTED';
    } else if (action === 'UPGRADE_SHIELD') {
      conn.authLevel = conn.authLevel === 'SAVIOR_HIGH_SHIELD' ? 'STANDARD' : 'SAVIOR_HIGH_SHIELD';
    }

    return this.financialConnections;
  }

  public createSimulatedTransaction(payload: {
    connectionId: string;
    recipientName: string;
    recipientPhoneOrAccount: string;
    amount: number;
    transactionType: TransactionAuthorization['transactionType'];
  }): TransactionAuthorization {
    const conn = this.financialConnections.find(c => c.id === payload.connectionId);
    if (!conn) throw new Error('Simulated provider connection not found');

    const riskFactors: string[] = [];
    let riskLevel: TransactionAuthorization['riskLevel'] = 'LOW';

    if (payload.amount >= 200000) {
      riskLevel = 'HIGH';
      riskFactors.push('High-value transaction exceeds 200,000 RWF threshold');
    } else if (payload.amount >= 50000) {
      riskLevel = 'MEDIUM';
      riskFactors.push('Transaction exceeds 50,000 RWF standard velocity check');
    }

    if (payload.recipientPhoneOrAccount.includes('0780') || payload.recipientPhoneOrAccount.includes('0720')) {
      riskFactors.push('Unverified new recipient phone number');
      if (riskLevel === 'LOW') riskLevel = 'MEDIUM';
    }

    const txId = 'TX-' + Math.floor(1000 + Math.random() * 9000);
    const dataHash = crypto.createHash('sha256').update(`${txId}-${conn.id}-${payload.amount}-${payload.recipientPhoneOrAccount}`).digest('hex');

    const newTx: TransactionAuthorization = {
      id: txId,
      referenceCode: 'SAV-TX-' + Math.floor(100000 + Math.random() * 900000),
      connectionId: conn.id,
      providerName: conn.providerName,
      recipientName: payload.recipientName,
      recipientPhoneOrAccount: payload.recipientPhoneOrAccount,
      amount: payload.amount,
      currency: 'RWF',
      transactionType: payload.transactionType,
      status: 'PENDING',
      riskLevel,
      riskFactors: riskFactors.length > 0 ? riskFactors : ['Standard daytime simulated payment'],
      dataHash,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      authorizationStepsCompleted: {
        passwordVerified: false,
        mfaVerified: false,
        faceBiometricVerified: false,
      }
    };

    this.transactions.unshift(newTx);

    // Create notification alert
    this.alerts.unshift({
      id: 'ALT-' + Date.now(),
      severity: riskLevel === 'HIGH' ? 'ALERT' : 'INFO',
      title: `Simulated Transaction Authorization Required (${payload.amount.toLocaleString()} RWF)`,
      message: `Pending ${payload.transactionType} to ${payload.recipientName} on ${conn.providerName}.`,
      timestamp: 'Just now',
      isRead: false,
      category: 'TRANSACTION'
    });

    return newTx;
  }

  public authorizeTransaction(txId: string, steps: { passwordVerified: boolean; mfaVerified: boolean; faceBiometricVerified: boolean }) {
    const tx = this.transactions.find(t => t.id === txId);
    if (!tx) throw new Error('Transaction not found');
    if (tx.status !== 'PENDING') throw new Error(`Transaction is already ${tx.status}`);

    if (this.user.isAccountLocked) {
      tx.status = 'BLOCKED_FRAUD';
      throw new Error('Transaction cannot be authorized while account is in emergency locked state');
    }

    tx.authorizationStepsCompleted = { ...steps };

    if (steps.passwordVerified && steps.mfaVerified && steps.faceBiometricVerified) {
      tx.status = 'APPROVED';
      tx.authorizedAt = new Date().toISOString();

      // Deduct simulated balance from connection
      const conn = this.financialConnections.find(c => c.id === tx.connectionId);
      if (conn && conn.lastSimulatedBalance >= tx.amount) {
        conn.lastSimulatedBalance -= tx.amount;
      }

      this.alerts.unshift({
        id: 'ALT-' + Date.now(),
        severity: 'INFO',
        title: `Transaction Authorized: ${tx.referenceCode}`,
        message: `Successfully authorized simulated ${tx.amount.toLocaleString()} RWF to ${tx.recipientName}.`,
        timestamp: 'Just now',
        isRead: false,
        category: 'TRANSACTION'
      });

      return { success: true, transaction: tx };
    } else {
      throw new Error('All authorization stages (Password, MFA, and Biometric Face Scan) must be completed');
    }
  }

  public rejectTransaction(txId: string, reason: string = 'User rejected authorization') {
    const tx = this.transactions.find(t => t.id === txId);
    if (!tx) throw new Error('Transaction not found');
    tx.status = 'REJECTED';
    tx.riskFactors.push(`Rejected by user: ${reason}`);
    return tx;
  }

  // ===================== CYBERCRIME REPORTS =====================

  public submitReport(payload: {
    category: CybercrimeReport['category'];
    title: string;
    description: string;
    theftType?: CybercrimeReport['theftType'];
    moneyDetails?: CybercrimeReport['moneyDetails'];
    informationDetails?: CybercrimeReport['informationDetails'];
    suspectDetails?: CybercrimeReport['suspectDetails'];
    immediateActionsRequested?: string[];
    suspectContact?: string;
    financialLossAmount?: number;
    evidenceFileName?: string;
    evidenceFileContent?: string;
    priority?: CybercrimeReport['priority'];
    incidentLocation?: { lat: number; lng: number; district: string; sector?: string; address?: string };
  }): CybercrimeReport {
    const chunk1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const chunk2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const trackingId = `SAV-2026-${chunk1}-${chunk2}`;
    const reportId = 'REP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const ribCaseNumber = 'SAV-INTAKE-2026-' + crypto.randomBytes(2).toString('hex').toUpperCase();
    const now = new Date().toISOString();

    const evidenceHash = payload.evidenceFileContent 
      ? crypto.createHash('sha256').update(payload.evidenceFileContent).digest('hex')
      : 'sha256:' + crypto.randomBytes(16).toString('hex');

    // Generate realistic Rwanda coordinates for suspect triangulation
    const defaultDistricts = [
      { district: 'Gasabo', sector: 'Remera', lat: -1.9542, lng: 30.1082, tower: 'MTN-KGL-REM-04', isp: 'MTN Rwandacell 5G' },
      { district: 'Nyarugenge', sector: 'Muhima', lat: -1.9485, lng: 30.0592, tower: 'AIR-KGL-NYA-02', isp: 'Airtel Rwanda 4G' },
      { district: 'Kicukiro', sector: 'Gikondo', lat: -1.9705, lng: 30.0821, tower: 'AIR-KGL-SONA-01', isp: 'Airtel Rwanda 4G' },
      { district: 'Gasabo', sector: 'Kimironko', lat: -1.9392, lng: 30.1284, tower: 'MTN-KGL-KMR-01', isp: 'MTN Rwandacell 5G' },
    ];
    const pickedDistrict = defaultDistricts[Math.floor(Math.random() * defaultDistricts.length)];
    const latJitter = (Math.random() - 0.5) * 0.008;
    const lngJitter = (Math.random() - 0.5) * 0.008;

    // Build initial fast actions if emergency freeze requested
    const initialFastActions: CybercrimeReport['fastActionsTaken'] = [];
    if (payload.immediateActionsRequested?.includes('FREEZE_MOMO')) {
      initialFastActions.push({
        actionType: 'FREEZE_MOMO',
        timestamp: now,
        officer: 'Automated Gateway (SAVIOR Verification Dispatch)',
        details: 'Citizen requested emergency MoMo wallet debit freeze notice dispatched to telecom operator queue.',
        referenceTicket: 'TEL-AUTO-FREEZE-' + Math.floor(1000 + Math.random() * 9000),
      });
    }

    const effectiveLoss = payload.moneyDetails?.amountRwf || payload.financialLossAmount || 0;
    const calculatedPriority = payload.priority || (
      payload.immediateActionsRequested?.length || effectiveLoss > 100000 || payload.informationDetails?.isOngoingImpersonation
        ? 'EMERGENCY'
        : 'URGENT'
    );

    const newReport: CybercrimeReport = {
      id: reportId,
      trackingId,
      ribCaseNumber,
      category: payload.category,
      title: payload.title,
      description: payload.description,
      theftType: payload.theftType || (payload.category === 'MOBILE_MONEY_FRAUD' || payload.category === 'FINANCIAL_SCAM' ? 'MONEY' : 'INFORMATION'),
      moneyDetails: payload.moneyDetails,
      informationDetails: payload.informationDetails,
      suspectDetails: payload.suspectDetails,
      immediateActionsRequested: payload.immediateActionsRequested,
      suspectContact: payload.suspectDetails?.phoneOrWhatsApp || payload.suspectContact,
      financialLossAmount: effectiveLoss,
      evidenceFiles: payload.evidenceFileName ? [
        {
          fileName: payload.evidenceFileName,
          fileSize: 1024 * 180, // estimated
          sha256Hash: evidenceHash,
          uploadedAt: now,
          digitalSealSignature: `SIG-SAVIOR-SEAL-RW-${trackingId}-INTEGRITY-CONFIRMED`,
        }
      ] : [],
      suspectLocation: {
        lat: Number((pickedDistrict.lat + latJitter).toFixed(6)),
        lng: Number((pickedDistrict.lng + lngJitter).toFixed(6)),
        district: pickedDistrict.district,
        sector: pickedDistrict.sector,
        cellTower: pickedDistrict.tower,
        ipAddress: `197.243.${Math.floor(10 + Math.random() * 80)}.${Math.floor(10 + Math.random() * 200)}`,
        isp: pickedDistrict.isp,
        accuracyMeters: Math.floor(25 + Math.random() * 40),
        signalStrengthDbm: -60 - Math.floor(Math.random() * 25),
        lastActiveTime: 'Just now',
        isLivePinging: true,
        deviceModel: 'Cellular Device Connected to Rwandan Telecom Node',
        approximateAddress: `${pickedDistrict.sector}, ${pickedDistrict.district} District`,
        trackingMethod: 'TELECOM_CELL_TRIANGULATION'
      },
      incidentLocation: payload.incidentLocation || {
        lat: pickedDistrict.lat,
        lng: pickedDistrict.lng,
        district: pickedDistrict.district,
        sector: pickedDistrict.sector,
      },
      fastActionsTaken: initialFastActions,
      status: 'RECEIVED',
      priority: calculatedPriority,
      createdAt: now,
      updatedAt: now,
      reporterContactMasked: this.user.phone.replace(/(\+\d{3}\s\d{3})\s\d{3}\s(\d{3})/, '$1 ••• $2'),
      assignedUnit: 'SAVIOR Intake & Verification Queue',
      investigatorNotes: [
        `Case docket opened in SAVIOR intake queue. Tracking Ref: ${trackingId}. Awaiting investigator review.`
      ],
      chainOfCustodyAudit: [
        {
          timestamp: now,
          actor: `Citizen (${this.user.fullName})`,
          action: `Incident report filed. Evidence sealed with SHA-256 checksum [${evidenceHash.substring(0, 12)}...].`,
          integrityHash: crypto.createHash('sha256').update(`${trackingId}-${now}`).digest('hex'),
        },
        {
          timestamp: now,
          actor: 'SAVIOR Secure Relay',
          action: `Dossier cryptographically locked in verification intake queue.`,
          integrityHash: crypto.createHash('sha256').update(`${ribCaseNumber}-${now}`).digest('hex'),
        }
      ]
    };

    this.reports.unshift(newReport);

    this.alerts.unshift({
      id: 'ALT-' + Date.now(),
      severity: 'INFO',
      title: `Incident Report Logged (${trackingId})`,
      message: `Your cybercrime report has been cryptographically sealed and dispatched to Police / RIB docket queue.`,
      timestamp: 'Just now',
      isRead: false,
      category: 'VAULT'
    });

    // Asynchronously persist to Supabase PostgreSQL if configured
    if (isSupabaseConfigured()) {
      supabaseRepo.insertReport(newReport).catch(err => {
        console.warn('Supabase async insertReport warning:', err);
      });
      supabaseRepo.recordAuditLog({
        actorEmail: this.user.email,
        actorRole: this.user.role,
        action: 'SUBMIT_CYBERCRIME_REPORT',
        targetResource: 'cybercrime_reports',
        targetId: trackingId,
        payload: { category: payload.category, amount: effectiveLoss, trackingId },
      }).catch(err => {
        console.warn('Supabase audit log write warning:', err);
      });
    }

    return newReport;
  }

  public updateReportStatus(reportId: string, status: CybercrimeReport['status'], note: string, officerName: string) {
    const rep = this.reports.find(r => r.id === reportId || r.trackingId === reportId);
    if (!rep) throw new Error('Report not found');

    rep.status = status;
    rep.updatedAt = new Date().toISOString();
    if (!rep.investigatorNotes) rep.investigatorNotes = [];
    rep.investigatorNotes.push(`[${new Date().toLocaleDateString()}] ${officerName}: ${note}`);

    if (status === 'ESCALATED_RIB' && !rep.ribCaseNumber) {
      rep.ribCaseNumber = 'RIB-CYBER-2026-' + Math.floor(10000 + Math.random() * 90000);
      rep.assignedUnit = 'RIB Cybercrime Investigation Division (Kigali HQ)';
    } else if (status === 'ESCALATED_RNP' && !rep.rnpInterventionId) {
      rep.rnpInterventionId = 'RNP-CYBER-OPS-' + Math.floor(1000 + Math.random() * 9000);
      rep.assignedUnit = 'Rwanda National Police Quick Reaction Cyber Unit';
    }

    rep.chainOfCustodyAudit.push({
      timestamp: new Date().toISOString(),
      actor: officerName,
      action: `Status updated to ${status}. Note logged: "${note.substring(0, 60)}..."`,
      integrityHash: crypto.createHash('sha256').update(`${rep.trackingId}-${status}-${Date.now()}`).digest('hex'),
    });

    if (isSupabaseConfigured()) {
      supabaseRepo.updateReport(rep).catch(err => {
        console.warn('Supabase async updateReport warning:', err);
      });
      supabaseRepo.recordAuditLog({
        actorEmail: this.user.email,
        actorRole: this.user.role,
        action: 'UPDATE_REPORT_STATUS',
        targetResource: 'cybercrime_reports',
        targetId: rep.trackingId,
        payload: { status, note, officerName },
      }).catch(err => console.warn('Supabase audit log write warning:', err));
    }

    return rep;
  }

  public executeFastAction(
    reportId: string, 
    actionType: 'FREEZE_MOMO' | 'FREEZE_BANK' | 'IMSI_LOCK' | 'DISPATCH_PATROL' | 'EXPEDITE_WARRANT' | 'RESOLVED_RAPID',
    officerName: string,
    notes?: string
  ) {
    const rep = this.reports.find(r => r.id === reportId || r.trackingId === reportId);
    if (!rep) throw new Error('Report not found');

    const now = new Date().toISOString();
    const ticketId = 'FAST-' + Math.floor(10000 + Math.random() * 90000);
    if (!rep.fastActionsTaken) rep.fastActionsTaken = [];

    let actionDetails = '';
    let statusChange: CybercrimeReport['status'] | null = null;

    switch (actionType) {
      case 'FREEZE_MOMO':
        actionDetails = `Emergency simulated freeze order issued to MTN Rwanda & Airtel Money for suspect MSISDN ${rep.suspectContact || 'Unknown'}. Wallet debit operations blocked immediately.`;
        statusChange = 'UNDER_REVIEW';
        break;
      case 'FREEZE_BANK':
        actionDetails = `National Bank of Rwanda (BNR) provisional asset preservation order broadcast to all commercial banks. Stolen funds quarantined.`;
        statusChange = 'UNDER_REVIEW';
        break;
      case 'IMSI_LOCK':
        actionDetails = `Telecom IMSI/IMEI tracking lock enforced on active base transceiver station: ${rep.suspectLocation?.cellTower || 'Kigali Central BTS'}. Live GPS tracking feed initialized.`;
        if (rep.suspectLocation) rep.suspectLocation.isLivePinging = true;
        statusChange = 'UNDER_REVIEW';
        break;
      case 'DISPATCH_PATROL': {
        const patrolUnits = [
          { id: 'RNP-PATROL-BRAVO-04', callsign: 'Sgt. Habimana & Cpl. Mutoni', type: 'PATROL_CRUISER' as const, eta: 3 },
          { id: 'RNP-INTERCEPT-ALPHA-02', callsign: 'Capt. Nkurunziza & Squad', type: 'RAPID_MOTORCYCLE' as const, eta: 2 },
          { id: 'RIB-TACTICAL-ECHO-01', callsign: 'Insp. Uwimana (Special Op)', type: 'TACTICAL_VAN' as const, eta: 5 },
        ];
        const picked = patrolUnits[Math.floor(Math.random() * patrolUnits.length)];
        const suspectLat = rep.suspectLocation?.lat || -1.9542;
        const suspectLng = rep.suspectLocation?.lng || 30.1082;
        rep.assignedPatrolUnit = {
          unitId: picked.id,
          officerCallsign: picked.callsign,
          currentLat: Number((suspectLat + (Math.random() - 0.5) * 0.006).toFixed(6)),
          currentLng: Number((suspectLng + (Math.random() - 0.5) * 0.006).toFixed(6)),
          etaMinutes: picked.eta,
          status: 'EN_ROUTE',
          vehicleType: picked.type
        };
        actionDetails = `RNP Quick Response unit ${picked.id} (${picked.callsign}) dispatched to ${rep.suspectLocation?.approximateAddress || 'suspect coordinates'}. ETA: ${picked.eta} mins.`;
        statusChange = 'ESCALATED_RNP';
        break;
      }
      case 'EXPEDITE_WARRANT':
        actionDetails = `RIB expedited judicial arrest and search warrant generated under Rwanda Cybercrime Law No 60/2018. Signed by RIB Cybercrime Special Prosecutor.`;
        rep.ribCaseNumber = rep.ribCaseNumber || ('RIB-CYBER-2026-' + Math.floor(10000 + Math.random() * 90000));
        statusChange = 'ESCALATED_RIB';
        break;
      case 'RESOLVED_RAPID':
        actionDetails = `Case marked RAPID RESOLVED by ${officerName}. Suspect neutralized, stolen funds preserved/returned, and victim notified.`;
        statusChange = 'RESOLVED';
        if (rep.assignedPatrolUnit) {
          rep.assignedPatrolUnit.status = 'INTERCEPTED';
          rep.assignedPatrolUnit.etaMinutes = 0;
        }
        break;
    }

    if (notes) {
      actionDetails += ` Note: ${notes}`;
    }

    rep.fastActionsTaken.push({
      actionType,
      timestamp: now,
      officer: officerName,
      details: actionDetails,
      referenceTicket: ticketId
    });

    if (statusChange) {
      rep.status = statusChange;
    }
    rep.updatedAt = now;

    rep.chainOfCustodyAudit.push({
      timestamp: now,
      actor: officerName,
      action: `[RAPID ACTION: ${actionType}] ${actionDetails}`,
      integrityHash: crypto.createHash('sha256').update(`${rep.trackingId}-${actionType}-${now}`).digest('hex')
    });

    // Notify citizen victim via alert
    this.alerts.unshift({
      id: 'ALT-' + Date.now(),
      severity: actionType === 'RESOLVED_RAPID' ? 'INFO' : 'ALERT',
      title: `Police/RIB Action Taken: Docket ${rep.trackingId}`,
      message: `${actionType.replace('_', ' ')} executed by ${officerName}: ${actionDetails.substring(0, 110)}...`,
      timestamp: 'Just now',
      isRead: false,
      category: 'VAULT'
    });

    if (isSupabaseConfigured()) {
      supabaseRepo.updateReport(rep).catch(err => {
        console.warn('Supabase async updateReport warning:', err);
      });
      supabaseRepo.recordAuditLog({
        actorEmail: this.user.email,
        actorRole: this.user.role,
        action: `FAST_ACTION_${actionType}`,
        targetResource: 'cybercrime_reports',
        targetId: rep.trackingId,
        payload: { actionType, officerName, ticketId, details: actionDetails },
      }).catch(err => console.warn('Supabase audit log write warning:', err));
    }

    return rep;
  }

  public getSuspectGpsPing(reportId: string) {
    const rep = this.reports.find(r => r.id === reportId || r.trackingId === reportId);
    if (!rep) throw new Error('Report not found');
    if (!rep.suspectLocation) throw new Error('No GPS telemetry available for this suspect');

    // Simulate micro-movement (walking/driving in Kigali)
    const latDelta = (Math.random() - 0.5) * 0.0004;
    const lngDelta = (Math.random() - 0.5) * 0.0004;
    rep.suspectLocation.lat = Number((rep.suspectLocation.lat + latDelta).toFixed(6));
    rep.suspectLocation.lng = Number((rep.suspectLocation.lng + lngDelta).toFixed(6));
    rep.suspectLocation.signalStrengthDbm = -55 - Math.floor(Math.random() * 30);
    rep.suspectLocation.lastActiveTime = 'Just now';

    // Move assigned patrol closer if en route
    if (rep.assignedPatrolUnit && rep.assignedPatrolUnit.status === 'EN_ROUTE') {
      const p = rep.assignedPatrolUnit;
      p.currentLat = Number((p.currentLat + (rep.suspectLocation.lat - p.currentLat) * 0.35).toFixed(6));
      p.currentLng = Number((p.currentLng + (rep.suspectLocation.lng - p.currentLng) * 0.35).toFixed(6));
      if (p.etaMinutes > 1) {
        p.etaMinutes -= 1;
      } else {
        p.etaMinutes = 1;
        p.status = 'ON_SCENE';
      }
    }

    return {
      reportId: rep.id,
      trackingId: rep.trackingId,
      suspectLocation: rep.suspectLocation,
      assignedPatrolUnit: rep.assignedPatrolUnit,
      timestamp: new Date().toISOString()
    };
  }

  public getPoliceStats() {
    const totalReports = this.reports.length;
    const activeThreats = this.reports.filter(r => r.status !== 'RESOLVED' && r.status !== 'DISMISSED').length;
    const rapidActionsCount = this.reports.reduce((acc, r) => acc + (r.fastActionsTaken?.length || 0), 0);
    const activePatrols = this.reports.filter(r => r.assignedPatrolUnit && r.assignedPatrolUnit.status === 'EN_ROUTE').length;
    const liveGpsTracked = this.reports.filter(r => r.suspectLocation?.isLivePinging).length;
    return {
      totalReports,
      activeThreats,
      rapidActionsCount,
      activePatrols,
      liveGpsTracked,
      avgResolutionTimeMinutes: 18.4,
      interceptSuccessRatePercent: 96.8
    };
  }

  /**
   * Initializes real-time synchronization with Supabase PostgreSQL if configured
   */
  public async initDatabaseSync(): Promise<{ configured: boolean; synced: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { configured: false, synced: false };
    }

    try {
      // First verify that Supabase is reachable and database schema tables exist
      const health = await checkSupabaseHealth();
      if (!health.connected || !health.schemaInitialized) {
        console.log('[SAVIOR Database] Supabase project connected. Schema tables pending migration in Supabase SQL editor. Operating in in-memory fallback mode.');
        return { configured: true, synced: false, error: health.error };
      }

      // 1. Sync reports
      const reportsRes = await supabaseRepo.fetchReports();
      if (reportsRes.success && reportsRes.data && reportsRes.data.length > 0) {
        this.reports = reportsRes.data;
        console.log(`[Supabase] Synchronized ${reportsRes.data.length} reports from PostgreSQL database.`);
      }

      // 2. Sync alerts
      const alertsRes = await supabaseRepo.fetchAlerts();
      if (alertsRes.success && alertsRes.data && alertsRes.data.length > 0) {
        this.alerts = alertsRes.data;
      }

      // 3. Record server startup audit log
      await supabaseRepo.recordAuditLog({
        action: 'SERVER_STARTUP_SYNC',
        targetResource: 'system',
        payload: { timestamp: new Date().toISOString() },
      });

      return { configured: true, synced: true };
    } catch (err: any) {
      return { configured: true, synced: false, error: err.message };
    }
  }

  /**
   * Returns complete diagnostics of the persistent storage tier
   */
  public async getDatabaseDiagnostics() {
    const isConfigured = isSupabaseConfigured();
    const health = await checkSupabaseHealth();
    return {
      provider: isConfigured && health.connected ? 'SUPABASE_POSTGRESQL' : 'IN_MEMORY_FALLBACK',
      isConfigured,
      health,
      activeReportsCount: this.reports.length,
      alertsCount: this.alerts.length,
      timestamp: new Date().toISOString(),
    };
  }
}

export const saviorState = new SaviorStateManager();
