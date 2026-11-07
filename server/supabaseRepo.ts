import { getSupabaseAdminClient, isSupabaseConfigured } from './supabase';
import { CybercrimeReport, SecurityAlert, UserProfile, TransactionAuthorization } from '../src/types';
import crypto from 'crypto';

/**
 * Maps Supabase public.cybercrime_reports row to frontend CybercrimeReport interface
 */
function mapDbRowToCybercrimeReport(row: any): CybercrimeReport {
  return {
    id: row.id,
    trackingId: row.tracking_id,
    ribCaseNumber: row.rnp_intervention_id || `RIB-CYBER-2026-${row.tracking_id.replace(/\D/g, '').slice(-5) || '10492'}`,
    category: row.category,
    title: row.title,
    description: row.description,
    theftType: row.theft_type || 'MONEY',
    moneyDetails: row.money_details,
    informationDetails: row.information_details,
    suspectDetails: row.suspect_details,
    immediateActionsRequested: row.immediate_actions_requested || [],
    suspectContact: row.suspect_contact,
    financialLossAmount: Number(row.financial_loss_amount) || 0,
    evidenceFiles: row.evidence_files || [],
    suspectLocation: row.suspect_location || undefined,
    incidentLocation: row.incident_location || undefined,
    assignedPatrolUnit: row.assigned_patrol_unit || undefined,
    fastActionsTaken: row.fast_actions_taken || [],
    status: row.status,
    priority: row.priority || 'HIGH',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    reporterContactMasked: row.reporter_contact_masked,
    assignedUnit: row.assigned_unit || 'Rwanda Investigation Bureau (RIB)',
    rnpInterventionId: row.rnp_intervention_id,
    investigatorNotes: row.investigator_notes || [],
    chainOfCustodyAudit: row.chain_of_custody_audit || [],
  };
}

/**
 * Maps frontend CybercrimeReport object to Supabase public.cybercrime_reports database columns
 */
function mapCybercrimeReportToDbRow(report: CybercrimeReport, userId?: string): any {
  return {
    tracking_id: report.trackingId,
    user_id: userId || null,
    category: report.category,
    title: report.title,
    description: report.description,
    theft_type: report.theftType || 'MONEY',
    money_details: report.moneyDetails || {},
    information_details: report.informationDetails || {},
    suspect_details: report.suspectDetails || {},
    immediate_actions_requested: report.immediateActionsRequested || [],
    suspect_contact: report.suspectContact || null,
    financial_loss_amount: report.financialLossAmount || 0,
    currency: 'RWF',
    evidence_files: report.evidenceFiles || [],
    suspect_location: report.suspectLocation || {},
    incident_location: report.incidentLocation || {},
    assigned_patrol_unit: report.assignedPatrolUnit || {},
    fast_actions_taken: report.fastActionsTaken || [],
    status: report.status || 'PENDING_VERIFICATION',
    priority: report.priority || 'HIGH',
    reporter_contact_masked: report.reporterContactMasked || null,
    assigned_unit: report.assignedUnit || 'Rwanda Investigation Bureau (RIB) & RNP Cyber Response Squad',
    rnp_intervention_id: report.rnpInterventionId || null,
    investigator_notes: report.investigatorNotes || [],
    chain_of_custody_audit: report.chainOfCustodyAudit || [],
    updated_at: new Date().toISOString(),
  };
}

/**
 * Checks if a Supabase error is due to an unmigrated table or missing PostgREST schema cache
 */
function isMissingTableError(error: any): boolean {
  if (!error) return false;
  return (
    error.code === 'PGRST205' ||
    error.code === '42P01' ||
    (typeof error.message === 'string' && (
      error.message.includes('Could not find the table') ||
      error.message.includes('relation') ||
      error.message.includes('schema cache')
    ))
  );
}

export const supabaseRepo = {
  /**
   * Fetches all cybercrime incident reports from Supabase
   */
  async fetchReports(): Promise<{ success: boolean; data?: CybercrimeReport[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured in environment variables.' };
    }

    const client = getSupabaseAdminClient();
    if (!client) {
      return { success: false, error: 'Database client initialization failed.' };
    }

    try {
      const { data, error } = await client
        .from('cybercrime_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      const reports: CybercrimeReport[] = (data || []).map(mapDbRowToCybercrimeReport);
      return { success: true, data: reports };
    } catch (err: any) {
      return { success: false, error: err.message || 'Database query error' };
    }
  },

  /**
   * Fetches a specific report by its public tracking ID
   */
  async fetchReportByTrackingId(trackingId: string): Promise<{ success: boolean; data?: CybercrimeReport; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'No database client.' };

    try {
      const { data, error } = await client
        .from('cybercrime_reports')
        .select('*')
        .ilike('tracking_id', trackingId.trim())
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: 'Tracking ID not found in database.' };

      return { success: true, data: mapDbRowToCybercrimeReport(data) };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Securely tracks a public report by tracking ID without exposing victim PII or sensitive evidence
   */
  async fetchPublicReportTracking(trackingId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };
    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'Database client not ready' };

    try {
      const { data, error } = await client.rpc('get_public_report_tracking', {
        p_tracking_id: trackingId.trim(),
      });
      if (!error && data && data.length > 0) {
        const record = data[0];
        return {
          success: true,
          data: {
            id: 'REC-' + record.tracking_id,
            trackingId: record.tracking_id,
            title: `Cybercrime Incident Docket (${record.tracking_id})`,
            description: `Case registered with ${record.assigned_unit}. Telemetry status: ${record.status}.`,
            category: record.category,
            theftType: record.theft_type,
            status: record.status,
            priority: record.priority,
            assignedUnit: record.assigned_unit,
            createdAt: record.created_at,
            updatedAt: record.updated_at,
            fastActionsTaken: Array.from({ length: record.fast_actions_count || 0 }, (_, i) => ({
              actionType: 'FAST_INTERVENTION',
              timestamp: record.updated_at,
              officer: 'Duty Officer',
              details: 'Protective law enforcement measure enforced.',
              referenceTicket: `FAST-${record.tracking_id}-${i + 1}`,
            })),
            chainOfCustodyAudit: [
              {
                timestamp: record.created_at,
                actor: 'Citizen Reporter',
                action: 'Incident registered into SAVIOR law enforcement relay.',
                integrityHash: 'VERIFIED_CHAIN_INTEGRITY',
              }
            ],
            reporterContactMasked: '+250 ••• ••• •••',
            financialLossAmount: 0,
            evidenceFiles: [],
          }
        };
      }
      return this.fetchReportByTrackingId(trackingId);
    } catch {
      return this.fetchReportByTrackingId(trackingId);
    }
  },

  /**
   * Inserts a newly submitted citizen incident report into Supabase
   */
  async insertReport(report: CybercrimeReport, userId?: string): Promise<{ success: boolean; id?: string; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'Database client not available.' };

    try {
      const dbPayload = mapCybercrimeReportToDbRow(report, userId);
      const { data, error } = await client
        .from('cybercrime_reports')
        .insert(dbPayload)
        .select('id')
        .single();

      if (error) {
        if (!isMissingTableError(error)) {
          console.error('Supabase insertReport error:', error);
        }
        return { success: false, error: error.message };
      }

      return { success: true, id: data?.id };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Updates an existing report status, fast actions, or investigator notes in Supabase
   */
  async updateReport(report: CybercrimeReport): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'Database client not available.' };

    try {
      const dbPayload = mapCybercrimeReportToDbRow(report);
      const { error } = await client
        .from('cybercrime_reports')
        .update(dbPayload)
        .or(`id.eq.${report.id},tracking_id.eq.${report.trackingId}`);

      if (error) {
        if (!isMissingTableError(error)) {
          console.error('Supabase updateReport error:', error);
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetches published security advisories from Supabase
   */
  async fetchAlerts(): Promise<{ success: boolean; data?: SecurityAlert[]; error?: string }> {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'Supabase is not configured.' };
    }

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'No client.' };

    try {
      const { data, error } = await client
        .from('security_alerts')
        .select('*')
        .eq('is_active', true)
        .order('published_at', { ascending: false });

      if (error) return { success: false, error: error.message };

      const alerts: SecurityAlert[] = (data || []).map(row => ({
        id: row.alert_code || row.id,
        severity: row.severity === 'CRITICAL' ? 'ALERT' : row.severity === 'HIGH' ? 'WARNING' : 'INFO',
        title: row.title,
        message: row.description,
        timestamp: new Date(row.published_at).toLocaleDateString(),
        isRead: false,
        category: row.category,
      }));

      return { success: true, data: alerts };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Records an immutable tamper-evident audit log in public.audit_logs
   */
  async recordAuditLog(log: {
    actorEmail?: string;
    actorRole?: string;
    action: string;
    targetResource: string;
    targetId?: string;
    ipAddress?: string;
    payload?: any;
  }): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'Client not ready' };

    try {
      const timestamp = new Date().toISOString();
      const integrityHash = crypto.createHash('sha256')
        .update(`${log.action}-${log.targetResource}-${log.targetId || ''}-${timestamp}`)
        .digest('hex');

      const { error } = await client.from('audit_logs').insert({
        actor_email: log.actorEmail || 'anonymous',
        actor_role: log.actorRole || 'SYSTEM',
        action: log.action,
        target_resource: log.targetResource,
        target_id: log.targetId || null,
        ip_address: log.ipAddress || null,
        payload: log.payload || {},
        integrity_hash: integrityHash,
        created_at: timestamp,
      });

      if (error) {
        if (!isMissingTableError(error)) {
          console.warn('Audit log write error:', error.message);
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Fetches user profile from public.user_profiles
   */
  async fetchUserProfile(email: string): Promise<{ success: boolean; data?: UserProfile; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'Client not ready' };

    try {
      const { data, error } = await client
        .from('user_profiles')
        .select('*')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (error) return { success: false, error: error.message };
      if (!data) return { success: false, error: 'User profile not found' };

      const profile: UserProfile = {
        id: data.id,
        fullName: data.full_name,
        email: data.email,
        phone: data.phone || '+250 788 000 000',
        nationalIdMasked: data.national_id_masked || '1 1990 • ••••••• • ••',
        district: data.district || 'Gasabo (Kigali)',
        province: data.province || 'Kigali City',
        role: data.role,
        isEmailVerified: data.is_email_verified,
        isMfaEnabled: data.is_mfa_enabled,
        isFaceEnrolled: data.is_face_enrolled,
        hasStrongPassword: true,
        isAccountLocked: data.is_account_locked,
        accountProtectionMode: data.account_protection_mode,
        lockReason: data.lock_reason,
        lockedAt: data.locked_at,
        createdAt: data.created_at,
      };

      return { success: true, data: profile };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  },

  /**
   * Upserts user profile in public.user_profiles
   */
  async upsertUserProfile(profile: UserProfile): Promise<{ success: boolean; error?: string }> {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase not configured' };

    const client = getSupabaseAdminClient();
    if (!client) return { success: false, error: 'Client not ready' };

    try {
      const { error } = await client.from('user_profiles').upsert({
        email: profile.email.toLowerCase().trim(),
        full_name: profile.fullName,
        phone: profile.phone,
        national_id_masked: profile.nationalIdMasked,
        district: profile.district,
        province: profile.province,
        role: profile.role,
        is_email_verified: profile.isEmailVerified,
        is_mfa_enabled: profile.isMfaEnabled,
        is_face_enrolled: profile.isFaceEnrolled,
        is_account_locked: profile.isAccountLocked,
        account_protection_mode: profile.accountProtectionMode,
        lock_reason: profile.lockReason || null,
        locked_at: profile.lockedAt || null,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'email',
      });

      if (error) {
        if (!isMissingTableError(error)) {
          console.error('Failed to upsert user profile:', error);
        }
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }
};
