export type UserRole = 'CITIZEN' | 'INVESTIGATOR' | 'SECURITY_ANALYST' | 'SYSTEM_ADMIN';

export type LanguageCode = 'en' | 'rw' | 'fr' | 'sw';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  nationalIdMasked: string;
  district: string;
  province: string;
  role: UserRole;
  isEmailVerified: boolean;
  isMfaEnabled: boolean;
  isFaceEnrolled: boolean;
  hasStrongPassword: boolean;
  isAccountLocked: boolean;
  lockedAt?: string;
  accountProtectionMode: boolean;
  createdAt: string;
}

export interface SecurityScoreBreakdown {
  overallScore: number;
  grade: 'CRITICAL' | 'WEAK' | 'FAIR' | 'GOOD' | 'EXCELLENT';
  factors: {
    emailVerified: { score: number; max: 10; status: boolean; label: string };
    mfaEnabled: { score: number; max: 20; status: boolean; label: string };
    faceEnrolled: { score: number; max: 25; status: boolean; label: string };
    strongPassword: { score: number; max: 15; status: boolean; label: string };
    trustedDevices: { score: number; max: 10; status: boolean; count: number; label: string };
    incidentCleanRecord: { score: number; max: 10; status: boolean; label: string };
    servicesProtected: { score: number; max: 10; status: boolean; count: number; label: string };
  };
  recommendations: Array<{
    id: string;
    priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    title: string;
    description: string;
    actionKey: string;
    pointsReward: number;
  }>;
}

export interface BiometricProfile {
  enrolled: boolean;
  enrolledAt?: string;
  algorithm: string;
  templateHash?: string;
  lastVerifiedAt?: string;
  failedAttempts: number;
  isLocked: boolean;
  lockoutExpiry?: string;
  consentGiven: boolean;
  consentTimestamp?: string;
}

export interface LivenessChallenge {
  id: string;
  type: 'BLINK' | 'SMILE' | 'HEAD_RIGHT' | 'HEAD_LEFT';
  prompt: string;
  durationSeconds: number;
}

export interface FinancialConnection {
  id: string;
  providerId: 'BK_BANK' | 'IM_BANK' | 'MTN_MOMO' | 'AIRTEL_MONEY';
  providerName: string;
  providerType: 'BANK' | 'MOBILE_MONEY';
  accountNumberMasked: string;
  accountHolder: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'SUSPENDED';
  authLevel: 'STANDARD' | 'SAVIOR_HIGH_SHIELD';
  connectedAt: string;
  lastSimulatedBalance: number;
  currency: string;
  isSimulated: true;
}

export interface TransactionAuthorization {
  id: string;
  referenceCode: string;
  connectionId: string;
  providerName: string;
  recipientName: string;
  recipientPhoneOrAccount: string;
  amount: number;
  currency: string;
  transactionType: 'TRANSFER' | 'MOMO_PAY' | 'WITHDRAWAL' | 'MERCHANT';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'EXPIRED' | 'BLOCKED_FRAUD';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  riskFactors: string[];
  dataHash: string;
  createdAt: string;
  expiresAt: string;
  authorizedAt?: string;
  authorizationStepsCompleted: {
    passwordVerified: boolean;
    mfaVerified: boolean;
    faceBiometricVerified: boolean;
  };
}

export interface CybercrimeReport {
  id: string;
  trackingId: string; // e.g. SAV-2026-981245
  category: 
    | 'MOBILE_MONEY_FRAUD'
    | 'FINANCIAL_SCAM'
    | 'PHISHING_LINK'
    | 'ACCOUNT_HACKING'
    | 'IDENTITY_THEFT'
    | 'RANSOMWARE'
    | 'SOCIAL_MEDIA_IMPERSONATION'
    | 'MALICIOUS_APP';
  title: string;
  description: string;
  theftType?: 'MONEY' | 'INFORMATION' | 'BOTH';
  moneyDetails?: {
    amountRwf: number;
    paymentChannel: 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER' | 'AGENT_KIOSK' | 'OTHER';
    providerName?: string;
    transactionReference?: string;
    deceptionMethod: string;
    recipientAccountOrPhone?: string;
  };
  informationDetails?: {
    compromisedItems: string[];
    theftMethod: string;
    isOngoingImpersonation: boolean;
    extortionOrBlackmail: boolean;
    contactsAtRiskNotes?: string;
  };
  suspectDetails?: {
    aliasOrName?: string;
    phoneOrWhatsApp?: string;
    platformUsed?: string;
    languageUsed?: string;
  };
  immediateActionsRequested?: string[];
  suspectContact?: string;
  financialLossAmount?: number;
  evidenceFiles: Array<{
    fileName: string;
    fileSize: number;
    sha256Hash: string;
    uploadedAt: string;
    digitalSealSignature: string;
  }>;
  suspectLocation?: {
    lat: number;
    lng: number;
    district: string;
    sector: string;
    cellTower: string;
    ipAddress: string;
    isp: string;
    accuracyMeters: number;
    signalStrengthDbm: number;
    lastActiveTime: string;
    isLivePinging: boolean;
    deviceModel?: string;
    approximateAddress?: string;
    trackingMethod: 'TELECOM_CELL_TRIANGULATION' | 'GEO_IP_TRACE' | 'WEB_SESSION_GPS' | 'MOMO_AGENT_CASH_POINT';
  };
  incidentLocation?: {
    lat: number;
    lng: number;
    district: string;
    sector?: string;
    address?: string;
  };
  assignedPatrolUnit?: {
    unitId: string;
    officerCallsign: string;
    currentLat: number;
    currentLng: number;
    etaMinutes: number;
    status: 'STANDBY' | 'EN_ROUTE' | 'ON_SCENE' | 'INTERCEPTED';
    vehicleType: 'PATROL_CRUISER' | 'RAPID_MOTORCYCLE' | 'TACTICAL_VAN';
  };
  fastActionsTaken?: Array<{
    actionType: 'FREEZE_MOMO' | 'FREEZE_BANK' | 'IMSI_LOCK' | 'DISPATCH_PATROL' | 'EXPEDITE_WARRANT' | 'RESOLVED_RAPID';
    timestamp: string;
    officer: string;
    details: string;
    referenceTicket: string;
  }>;
  status: 'RECEIVED' | 'UNDER_REVIEW' | 'ESCALATED_RIB' | 'ESCALATED_RNP' | 'RESOLVED' | 'DISMISSED';
  priority: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
  createdAt: string;
  updatedAt: string;
  reporterContactMasked: string;
  assignedUnit?: string;
  investigatorNotes?: string[];
  ribCaseNumber?: string;
  rnpInterventionId?: string;
  chainOfCustodyAudit: Array<{
    timestamp: string;
    actor: string;
    action: string;
    integrityHash: string;
  }>;
}

export interface ThreatScanResult {
  scanId: string;
  scanType: 'MESSAGE' | 'URL' | 'FILE';
  inputSample: string;
  threatLevel: 'SAFE' | 'LOW' | 'SUSPICIOUS' | 'HIGH' | 'CRITICAL';
  confidenceScore: number; // 0 to 100
  scamType?: string;
  isKinyarwandaPattern: boolean;
  detectedKeywords: string[];
  warningSigns: string[];
  analysisExplanation: string;
  actionGuidance: string[];
  officialWarningNotes?: string;
  scannedAt: string;
}

export interface SecurityAlert {
  id: string;
  severity: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  category: 'AUTH' | 'TRANSACTION' | 'VAULT' | 'THREAT_ALERT';
}

export interface ActiveSession {
  id: string;
  deviceName: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
  isTrusted: boolean;
}

export interface RwandaThreatMapDistrict {
  id: string;
  name: string;
  province: string;
  activeThreatsCount: number;
  reportedScamsCount: number;
  threatLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  topCategories: string[];
}
