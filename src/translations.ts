import { LanguageCode } from './types';

export const translations: Record<LanguageCode, Record<string, string>> = {
  en: {
    // Brand & Header
    appTitle: 'SAVIOR',
    appSubtitle: 'AI Cybersecurity & Cybercrime Protection for Rwanda',
    simulatedNotice: 'SIMULATED FINANCIAL CONNECTION — NO REAL MONEY IS MOVED',
    officialDisclaimer: 'SAVIOR operates in simulated defensive mode. For live police/RIB emergencies, call 112 / 166.',
    
    // Navigation
    navTrustCenter: 'Trust Center',
    navVault: 'Secure Vault',
    navScanner: 'Scam Scanner',
    navSimulator: 'MoMo & Bank Auth',
    navReport: 'Report Incident',
    navOfficial: 'RIB / RNP Portal',
    navAdmin: 'SOC Command',
    navAIAdvisor: 'Savior AI',
    
    // Actions & Buttons
    btnUnlockVault: 'Open Secure Vault',
    btnEmergencyLock: 'Lock My Account',
    btnStartRecovery: 'Account Recovery',
    btnImproveSecurity: 'Improve Score',
    btnVerifyFace: 'Face Verification',
    btnScanNow: 'Analyze Threat',
    btnSubmitReport: 'Submit Incident Report',
    btnAuthorize: 'Authorize Transaction',
    btnReject: 'Reject Transaction',
    btnDismiss: 'Dismiss',
    btnCopy: 'Copy',
    btnDownloadReceipt: 'Download Proof Seal',
    
    // Security Score
    scoreTitle: 'SAVIOR Security Score',
    scoreSubtitle: 'Real-time defense posture & cyber resilience index',
    scoreCritical: 'CRITICAL RISK',
    scoreWeak: 'WEAK PROTECTION',
    scoreFair: 'FAIR SECURITY',
    scoreGood: 'GOOD SECURITY',
    scoreExcellent: 'MAXIMUM SHIELD',
    
    // Vault Tabs
    vaultProfile: 'My Profile',
    vaultSecurity: 'Security & Sessions',
    vaultIncidents: 'My Incidents',
    vaultConnections: 'Connected Services',
    vaultTransactions: 'Authorizations',
    vaultRecovery: 'Emergency Recovery',
    vaultPrivacy: 'Privacy & Biometrics',
    
    // Biometric & Face
    bioTitle: 'Biometric Face Verification',
    bioSubtitle: '1:1 Liveness verified facial template authentication',
    bioScanning: 'Scanning Facial Geometry...',
    bioLivenessPrompt: 'Liveness Challenge in Progress',
    bioSuccess: 'Biometric Identity Verified',
    bioFailed: 'Face Verification Failed',
    bioLockoutWarning: 'Account locked due to 3 failed attempts. Please use backup recovery.',
    
    // Scam Scanner
    scannerTitle: 'AI Cybercrime & Scam Message Scanner',
    scannerSubtitle: 'Detect SMS, WhatsApp, Email scams & phishing links targeting Rwanda',
    scannerInputPlaceholder: 'Paste suspicious SMS message, WhatsApp text, Email, or MoMo notification here...',
    scannerUrlPlaceholder: 'https://example-suspicious-site.rw/claim-prize',
    scannerAnalyzing: 'Analyzing with Savior AI Neural Heuristics...',
    
    // Emergency
    emergencyLockedBanner: 'ACCOUNT IS LOCKED IN HIGH-PROTECTION EMERGENCY MODE',
    emergencyLockedDesc: 'All active sessions have been revoked and financial authorizations suspended to prevent unauthorized access.',
    
    // Quick Actions
    askAI: 'Ask Savior AI',
    helplineRIB: 'RIB Hotline: 166',
    helplineRNP: 'Police Cyberline: 112',
  },
  
  rw: {
    // Brand & Header
    appTitle: 'SAVIOR',
    appSubtitle: 'Umutekano w’Ikoranabuhanga & Kurwanya Ibyaha mu Rwanda',
    simulatedNotice: 'IHUZANKURUGANO RIGEREGEZWA — NTA FARANGA NYARYO RYIMURWA',
    officialDisclaimer: 'SAVIOR ikora mu buryo bwo kwirinda. Ku bibazo byihuse bya Polisi cyangwa RIB, hamagara 112 / 166.',
    
    // Navigation
    navTrustCenter: 'Icyicaro cy’Umutekano',
    navVault: 'Ububiko Butekanye',
    navScanner: 'Gusuzuma Ubutekamutwe',
    navSimulator: 'Kugenzura MoMo & Banki',
    navReport: 'Gutanga Raporo',
    navOfficial: 'Ibiro bya RIB / Polisi',
    navAdmin: 'Igenzura Rikuru',
    navAIAdvisor: 'Umujyanama Savior AI',
    
    // Actions & Buttons
    btnUnlockVault: 'Fungura Ububiko Butekanye',
    btnEmergencyLock: 'Funga Konti Byihutirwa',
    btnStartRecovery: 'Kugarura Konti',
    btnImproveSecurity: 'Kuzamura Amanota',
    btnVerifyFace: 'Gusuzuma Isura (Biometric)',
    btnScanNow: 'Suzuma Icyago',
    btnSubmitReport: 'Ohereza Raporo y’Icyaha',
    btnAuthorize: 'Emeza Ihererekanya',
    btnReject: 'Hagarika Ihererekanya',
    btnDismiss: 'Birengagize',
    btnCopy: 'Koporora',
    btnDownloadReceipt: 'Kura hano Ikimenyetso',
    
    // Security Score
    scoreTitle: 'Amanota y’Umutekano wa SAVIOR',
    scoreSubtitle: 'Urugero rw’ubwirinzi n’umutekano wawe bwite',
    scoreCritical: 'ICYAGO GIKOMEYE',
    scoreWeak: 'UMUTEKANO MUKE',
    scoreFair: 'UMUTEKANO URI MU KIGERERANYO',
    scoreGood: 'UMUTEKANO MWIZA',
    scoreExcellent: 'UMUTEKANO UTUNGANYE',
    
    // Vault Tabs
    vaultProfile: 'Umwirondoro Wanjye',
    vaultSecurity: 'Umutekano & Ibikoresho',
    vaultIncidents: 'Raporo Zanjye',
    vaultConnections: 'Serivisi Zihujwe',
    vaultTransactions: 'Uruhushya rw’Amafaranga',
    vaultRecovery: 'Uburyo bwo Kugarura',
    vaultPrivacy: 'Ubuzima Bwite & Isura',
    
    // Biometric & Face
    bioTitle: 'Gusuzuma Isura (Biometric)',
    bioSubtitle: 'Kugenzura ko uri umuntu muzima hakoreshejwe isura',
    bioScanning: 'Turimo gupima imiterere y’isura...',
    bioLivenessPrompt: 'Kora ibyo usabwa na gahunda y’isura',
    bioSuccess: 'Isura yawe yemewe neza',
    bioFailed: 'Isura ntiyemewe, ongera ugerageze',
    bioLockoutWarning: 'Konti yafunzwe nyuma yo kunanirwa inshuro 3. Koresha uburyo bwo kugarura.',
    
    // Scam Scanner
    scannerTitle: 'Gusuzuma Ubutumwa bw’Ubutekamutwe n’Imiyoboro Mibi',
    scannerSubtitle: 'Genzura ubutumwa bwa SMS, WhatsApp, Email cyangwa MoMo igamije kwiba',
    scannerInputPlaceholder: 'Shyiramo ubutumwa ukeka bwa SMS, WhatsApp, cyangwa MoMo...',
    scannerUrlPlaceholder: 'https://urubuga-rukekerwa.rw/hembwa',
    scannerAnalyzing: 'SAVIOR AI irimo gusesengura...',
    
    // Emergency
    emergencyLockedBanner: 'KONTI YAFUNZWE BY’AGATEGANYO KU MPAMVU Z’UMUTEKANO',
    emergencyLockedDesc: 'Ibikoresho byose byahagaritswe ndetse no guhererekanya amafaranga byarahagaritswe.',
    
    // Quick Actions
    askAI: 'Baza Savior AI',
    helplineRIB: 'Numero ya RIB: 166',
    helplineRNP: 'Numero ya Polisi: 112',
  },
  
  fr: {
    // Brand & Header
    appTitle: 'SAVIOR',
    appSubtitle: 'Cybersécurité IA & Protection Contre la Cybercriminalité au Rwanda',
    simulatedNotice: 'CONNEXION FINANCIÈRE SIMULÉE — AUCUN ARGENT RÉEL N’EST DÉPLACÉ',
    officialDisclaimer: 'SAVIOR fonctionne en mode défensif simulé. Pour toute urgence RIB/Police, composez le 112 / 166.',
    
    // Navigation
    navTrustCenter: 'Centre de Confiance',
    navVault: 'Coffre-fort Sécurisé',
    navScanner: 'Détecteur d’Arnaques',
    navSimulator: 'Auth MoMo & Banque',
    navReport: 'Signaler Cybercrime',
    navOfficial: 'Portail RIB / Police',
    navAdmin: 'Commandement SOC',
    navAIAdvisor: 'Savior AI',
    
    // Actions & Buttons
    btnUnlockVault: 'Ouvrir le Coffre-fort',
    btnEmergencyLock: 'Verrouiller Mon Compte',
    btnStartRecovery: 'Récupération du Compte',
    btnImproveSecurity: 'Améliorer le Score',
    btnVerifyFace: 'Vérification Faciale',
    btnScanNow: 'Analyser la Menace',
    btnSubmitReport: 'Envoyer le Signalement',
    btnAuthorize: 'Autoriser la Transaction',
    btnReject: 'Rejeter la Transaction',
    btnDismiss: 'Ignorer',
    btnCopy: 'Copier',
    btnDownloadReceipt: 'Télécharger le Sceau de Preuve',
    
    // Security Score
    scoreTitle: 'Score de Sécurité SAVIOR',
    scoreSubtitle: 'Indice de résilience et posture de défense en temps réel',
    scoreCritical: 'RISQUE CRITIQUE',
    scoreWeak: 'FAIBLE PROTECTION',
    scoreFair: 'SÉCURITÉ MOYENNE',
    scoreGood: 'BONNE SÉCURITÉ',
    scoreExcellent: 'PROTECTION MAXIMALE',
    
    // Vault Tabs
    vaultProfile: 'Mon Profil',
    vaultSecurity: 'Sécurité & Sessions',
    vaultIncidents: 'Mes Signalements',
    vaultConnections: 'Services Connectés',
    vaultTransactions: 'Autorisations',
    vaultRecovery: 'Récupération d’Urgence',
    vaultPrivacy: 'Confidentialité & Biométrie',
    
    // Biometric & Face
    bioTitle: 'Vérification Faciale Biométrique',
    bioSubtitle: 'Authentification faciale 1:1 avec détection du vivant',
    bioScanning: 'Analyse de la géométrie faciale...',
    bioLivenessPrompt: 'Défi de présence vivante en cours',
    bioSuccess: 'Identité Biométrique Validée',
    bioFailed: 'Échec de la Vérification Faciale',
    bioLockoutWarning: 'Compte verrouillé après 3 tentatives infructueuses. Utilisez la récupération.',
    
    // Scam Scanner
    scannerTitle: 'Scanner IA d’Arnaques & Liens Suspects',
    scannerSubtitle: 'Détectez les escroqueries SMS, WhatsApp, Email et liens malveillants au Rwanda',
    scannerInputPlaceholder: 'Collez le SMS suspect, message WhatsApp, Email ou notification MoMo...',
    scannerUrlPlaceholder: 'https://site-suspect.rw/recompense',
    scannerAnalyzing: 'Analyse IA en cours avec les heuristiques Savior...',
    
    // Emergency
    emergencyLockedBanner: 'COMPTE VERROUILLÉ EN MODE D’URGENCE HAUTE PROTECTION',
    emergencyLockedDesc: 'Toutes les sessions actives ont été révoquées et les autorisations financières suspendues.',
    
    // Quick Actions
    askAI: 'Consulter Savior AI',
    helplineRIB: 'Ligne directe RIB : 166',
    helplineRNP: 'Cyberpolice RNP : 112',
  },

  sw: {
    // Brand & Header
    appTitle: 'SAVIOR',
    appSubtitle: 'Usalama wa Mtandao wa AI & Ulinzi Dhidi ya Uhalifu wa Kidijitali Rwanda',
    simulatedNotice: 'MUUNGANISHO WA KIFEDHA WA MAJARIBIO — HAKUNA PESA HALISI INAYOHAMISHWA',
    officialDisclaimer: 'SAVIOR inafanya kazi katika mfumo wa majaribio ya ulinzi. Kwa dharura za Polisi au RIB, piga 112 / 166.',
    
    // Navigation
    navTrustCenter: 'Kituo cha Uaminifu',
    navVault: 'Hifadhi Salama',
    navScanner: 'Kichanganuzi cha Ulaghai',
    navSimulator: 'Idhini ya MoMo & Benki',
    navReport: 'Ripoti Tukio',
    navOfficial: 'Lango la RIB / Polisi',
    navAdmin: 'Amri ya SOC',
    navAIAdvisor: 'Mshauri Savior AI',
    
    // Actions & Buttons
    btnUnlockVault: 'Fungua Hifadhi Salama',
    btnEmergencyLock: 'Funga Akaunti Yangu',
    btnStartRecovery: 'Urejeshaji wa Akaunti',
    btnImproveSecurity: 'Boresha Alama',
    btnVerifyFace: 'Uthibitishaji wa Uso',
    btnScanNow: 'Changanua Tishio',
    btnSubmitReport: 'Wasilisha Ripoti ya Tukio',
    btnAuthorize: 'Idhinisha Muamala',
    btnReject: 'Kataa Muamala',
    btnDismiss: 'Puuza',
    btnCopy: 'Nakili',
    btnDownloadReceipt: 'Pakua Muhuri wa Ushahidi',
    
    // Security Score
    scoreTitle: 'Alama ya Usalama ya SAVIOR',
    scoreSubtitle: 'Hali ya ulinzi wa wakati halisi na fahirisi ya ustahimilivu wa kidijitali',
    scoreCritical: 'HATARI KUBWA',
    scoreWeak: 'ULINZI DHAIFU',
    scoreFair: 'USALAMA WA WASTANI',
    scoreGood: 'USALAMA MZURI',
    scoreExcellent: 'ULINZI WA JUU ZAIDI',
    
    // Vault Tabs
    vaultProfile: 'Wasifu Wangu',
    vaultSecurity: 'Usalama & Vipindi',
    vaultIncidents: 'Matukio Yangu',
    vaultConnections: 'Huduma Zilizounganishwa',
    vaultTransactions: 'Idhini za Miamala',
    vaultRecovery: 'Urejeshaji wa Dharura',
    vaultPrivacy: 'Faragha & Bayometriki',
    
    // Biometric & Face
    bioTitle: 'Uthibitishaji wa Uso wa Kibayometriki',
    bioSubtitle: 'Uthibitishaji wa kiolezo cha uso wa 1:1 kwa uhakiki wa uhai',
    bioScanning: 'Inachanganua jiometri ya uso...',
    bioLivenessPrompt: 'Changamoto ya uthibitisho wa uwepo inaendelea',
    bioSuccess: 'Utambulisho wa kibayometriki umethibitishwa',
    bioFailed: 'Uthibitishaji wa uso umeshindikana, jaribu tena',
    bioLockoutWarning: 'Akaunti imefungwa baada ya majaribio 3 yasiyo sahihi. Tumia urejeshaji wa akiba.',
    
    // Scam Scanner
    scannerTitle: 'Kichanganuzi cha AI cha Jumbe za Ulaghai & Viungo Hatari',
    scannerSubtitle: 'Gundua ulaghai wa SMS, WhatsApp, Barua pepe na viungo vya wizi vinavyolenga Rwanda',
    scannerInputPlaceholder: 'Bandika ujumbe unaotiliwa shaka wa SMS, WhatsApp, Barua pepe, au taarifa ya MoMo...',
    scannerUrlPlaceholder: 'https://tovuti-ya-mashaka.rw/zawadi',
    scannerAnalyzing: 'SAVIOR AI inachanganua kwa mifumo ya kiakili...',
    
    // Emergency
    emergencyLockedBanner: 'AKAUNTI IMEFUNGWA KATIKA MFUMO WA DHARURA WA ULINZI MKUBWA',
    emergencyLockedDesc: 'Vipindi vyote vilivyotumika vimebatilishwa na idhini za kifedha zimesitishwa ili kuzuia ufikiaji usioidhinishwa.',
    
    // Quick Actions
    askAI: 'Uliza Savior AI',
    helplineRIB: 'Nambari ya RIB: 166',
    helplineRNP: 'Polisi wa Mtandao: 112',
  }
};
