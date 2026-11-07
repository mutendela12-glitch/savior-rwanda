-- ============================================================================
-- SAVIOR CYBERSECURITY RWANDA — HARDENED PRODUCTION SCHEMA MIGRATION (FINAL)
-- Migration File: 20261106_initial_savior_schema.sql
-- Target Database: https://aksagkiezgpzvystkzbt.supabase.co
-- Security Level: Government / Enterprise Defense Grade (Zero Trust, Strict RLS)
-- ============================================================================

-- Ensure required cryptographic extensions are available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. ENUMS & STRICT DATA DOMAINS
-- ============================================================================

DO $$ BEGIN
    CREATE TYPE savior_user_role AS ENUM (
        'CITIZEN',
        'INVESTIGATOR',
        'SECURITY_ANALYST',
        'SYSTEM_ADMIN'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE cybercrime_category AS ENUM (
        'MOBILE_MONEY_FRAUD',
        'FINANCIAL_SCAM',
        'PHISHING_LINK',
        'ACCOUNT_HACKING',
        'IDENTITY_THEFT',
        'RANSOMWARE',
        'SOCIAL_MEDIA_IMPERSONATION',
        'MALICIOUS_APP'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_status AS ENUM (
        'RECEIVED',
        'UNDER_REVIEW',
        'ESCALATED_RIB',
        'ESCALATED_RNP',
        'RESOLVED',
        'DISMISSED'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE TYPE report_priority AS ENUM (
        'ROUTINE',
        'URGENT',
        'EMERGENCY'
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================================================================
-- 2. AUTOMATIC TIMESTAMPS TRIGGER FUNCTION (Secure Search Path)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- ============================================================================
-- 3. USER PROFILES TABLE (Strictly Bound to auth.users)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    national_id_masked VARCHAR(50),
    district VARCHAR(100) DEFAULT 'Gasabo (Kigali)',
    province VARCHAR(100) DEFAULT 'Kigali City',
    role savior_user_role NOT NULL DEFAULT 'CITIZEN',
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    is_mfa_enabled BOOLEAN NOT NULL DEFAULT false,
    is_face_enrolled BOOLEAN NOT NULL DEFAULT false,
    has_strong_password BOOLEAN NOT NULL DEFAULT true,
    is_account_locked BOOLEAN NOT NULL DEFAULT false,
    account_protection_mode BOOLEAN NOT NULL DEFAULT false,
    lock_reason TEXT,
    locked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT check_full_name_length CHECK (length(trim(full_name)) >= 2),
    CONSTRAINT check_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

CREATE OR REPLACE TRIGGER trigger_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- Comprehensive User Profile Integrity & Anti-Escalation Trigger
-- Strictly prevents unauthorized role changes, status unlocking, and privilege tampering
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_user_profile_integrity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    caller_is_admin BOOLEAN := false;
    caller_is_service BOOLEAN := false;
BEGIN
    -- Check if caller is backend service_role or database superuser
    IF current_setting('request.jwt.claim.role', true) = 'service_role' OR current_user = 'postgres' THEN
        caller_is_service := true;
    END IF;

    -- Check if caller is authenticated as SYSTEM_ADMIN
    IF NOT caller_is_service AND auth.uid() IS NOT NULL THEN
        SELECT (role = 'SYSTEM_ADMIN') INTO caller_is_admin
        FROM public.user_profiles
        WHERE id = auth.uid();
    END IF;

    -- 1. Strict Role Modification Protection (Zero client-side elevation)
    IF OLD.role IS DISTINCT FROM NEW.role THEN
        IF NOT caller_is_service AND NOT COALESCE(caller_is_admin, false) THEN
            RAISE EXCEPTION 'Access Denied: Only authorized SYSTEM_ADMIN or service_role can modify user roles.';
        END IF;
    END IF;

    -- 2. Account Lock & Suspension Integrity Protection
    IF (OLD.is_account_locked IS DISTINCT FROM NEW.is_account_locked)
       OR (OLD.lock_reason IS DISTINCT FROM NEW.lock_reason)
       OR (OLD.locked_at IS DISTINCT FROM NEW.locked_at) THEN
        IF NOT caller_is_service AND NOT COALESCE(caller_is_admin, false) THEN
            RAISE EXCEPTION 'Access Denied: Account lock status and reasons can only be altered by an authorized administrator.';
        END IF;
    END IF;

    -- 3. Verification Flags Protection (Managed exclusively by server/auth)
    IF OLD.is_email_verified IS DISTINCT FROM NEW.is_email_verified THEN
        IF NOT caller_is_service THEN
            RAISE EXCEPTION 'Access Denied: Email verification status cannot be modified by client requests.';
        END IF;
    END IF;

    -- 4. Identity & Primary Key Immutability
    IF OLD.id IS DISTINCT FROM NEW.id THEN
        RAISE EXCEPTION 'Immutable Field: Profile ID cannot be altered.';
    END IF;

    -- 5. Prevent tampering with created_at timestamp
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        NEW.created_at = OLD.created_at;
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_prevent_role_escalation ON public.user_profiles;
DROP TRIGGER IF EXISTS trigger_protect_user_profile_integrity ON public.user_profiles;
CREATE TRIGGER trigger_protect_user_profile_integrity
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_user_profile_integrity();

-- ----------------------------------------------------------------------------
-- Auto-provision user_profile on auth.users signup (Always default to CITIZEN)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Every incoming auth user starts strictly with CITIZEN role
    INSERT INTO public.user_profiles (
        id,
        email,
        full_name,
        phone,
        role,
        is_email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Citizen User'),
        COALESCE(NEW.raw_user_meta_data->>'phone', '+250 788 000 000'),
        'CITIZEN'::savior_user_role,
        COALESCE(NEW.email_confirmed_at IS NOT NULL, false)
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        updated_at = now();

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ----------------------------------------------------------------------------
-- Secure One-Time Bootstrap Procedure for First Administrator
-- Executable ONLY by service_role (backend server / DBA). Locks permanently after first admin.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.bootstrap_initial_admin(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    admin_count INT;
    target_id UUID;
BEGIN
    -- 1. Enforce strict single-bootstrap lock
    SELECT COUNT(*) INTO admin_count FROM public.user_profiles WHERE role = 'SYSTEM_ADMIN';
    IF admin_count > 0 THEN
        RAISE EXCEPTION 'Bootstrap Locked: A SYSTEM_ADMIN already exists in the system.';
    END IF;

    -- 2. Locate target user profile
    SELECT id INTO target_id FROM public.user_profiles WHERE lower(email) = lower(trim(p_email));
    IF target_id IS NULL THEN
        RAISE EXCEPTION 'Target user profile not found for email: %', p_email;
    END IF;

    -- 3. Elevate user to SYSTEM_ADMIN
    UPDATE public.user_profiles
    SET role = 'SYSTEM_ADMIN', updated_at = now()
    WHERE id = target_id;

    -- 4. Record tamper-proof audit log entry
    INSERT INTO public.audit_logs (
        actor_id,
        actor_email,
        actor_role,
        action,
        target_resource,
        target_id,
        payload,
        integrity_hash
    ) VALUES (
        target_id,
        trim(p_email),
        'SYSTEM_ADMIN',
        'ADMIN_BOOTSTRAP_INITIALIZED',
        'user_profiles',
        target_id::TEXT,
        jsonb_build_object('event', 'first_admin_provisioned', 'email', trim(p_email)),
        encode(digest(concat('BOOTSTRAP:', target_id::TEXT, ':', now()), 'sha256'), 'hex')
    );

    RETURN true;
END;
$$;

-- ============================================================================
-- 4. CYBERCRIME REPORTS TABLE (Data Protection & Privacy Hardened)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.cybercrime_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_id VARCHAR(100) NOT NULL UNIQUE,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    category cybercrime_category NOT NULL DEFAULT 'MOBILE_MONEY_FRAUD',
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    theft_type VARCHAR(50) NOT NULL DEFAULT 'MONEY',
    
    -- Telemetry & loss details
    money_details JSONB DEFAULT '{}'::jsonb,
    information_details JSONB DEFAULT '{}'::jsonb,
    suspect_details JSONB DEFAULT '{}'::jsonb,
    immediate_actions_requested TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    suspect_contact VARCHAR(100),
    financial_loss_amount NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
    
    evidence_files JSONB DEFAULT '[]'::jsonb,
    suspect_location JSONB DEFAULT '{}'::jsonb,
    incident_location JSONB DEFAULT '{}'::jsonb,
    assigned_patrol_unit JSONB DEFAULT '{}'::jsonb,
    fast_actions_taken JSONB DEFAULT '[]'::jsonb,
    
    status report_status NOT NULL DEFAULT 'RECEIVED',
    priority report_priority NOT NULL DEFAULT 'URGENT',
    reporter_contact_masked VARCHAR(50),
    assigned_unit VARCHAR(200) DEFAULT 'SAVIOR Intake & Verification Queue',
    rib_case_number VARCHAR(100),
    rnp_intervention_id VARCHAR(100),
    investigator_notes TEXT[] DEFAULT ARRAY[]::TEXT[],
    chain_of_custody_audit JSONB DEFAULT '[]'::jsonb,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Input sanitization constraints
    CONSTRAINT check_report_title_length CHECK (length(trim(title)) BETWEEN 5 AND 300),
    CONSTRAINT check_report_description_length CHECK (length(trim(description)) BETWEEN 10 AND 10000),
    CONSTRAINT check_report_financial_loss CHECK (financial_loss_amount >= 0.00),
    CONSTRAINT check_report_currency CHECK (currency = 'RWF'),
    CONSTRAINT check_theft_type CHECK (theft_type IN ('MONEY', 'INFORMATION', 'BOTH'))
);

CREATE OR REPLACE TRIGGER trigger_cybercrime_reports_updated_at
    BEFORE UPDATE ON public.cybercrime_reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ----------------------------------------------------------------------------
-- Report Ownership & Tracking ID Immutability Trigger
-- Strictly prevents unauthorized re-assignment of report ownership or tracking identifiers
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.protect_cybercrime_report_immutability()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    -- Prevent modification of tracking_id
    IF NEW.tracking_id != OLD.tracking_id THEN
        RAISE EXCEPTION 'Immutable Field: tracking_id cannot be altered once created.';
    END IF;
    
    -- Prevent changing report ownership (user_id) unless performed by service_role
    IF OLD.user_id IS DISTINCT FROM NEW.user_id THEN
        IF current_setting('request.jwt.claim.role', true) != 'service_role' AND current_user != 'postgres' THEN
            RAISE EXCEPTION 'Unauthorized: Report ownership (user_id) is immutable.';
        END IF;
    END IF;
    
    -- Prevent altering created_at timestamp
    IF NEW.created_at IS DISTINCT FROM OLD.created_at THEN
        NEW.created_at = OLD.created_at;
    END IF;
    
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_protect_cybercrime_report_immutability ON public.cybercrime_reports;
CREATE TRIGGER trigger_protect_cybercrime_report_immutability
    BEFORE UPDATE ON public.cybercrime_reports
    FOR EACH ROW EXECUTE FUNCTION public.protect_cybercrime_report_immutability();

-- ============================================================================
-- 5. SIMULATED FINANCIAL CONNECTIONS & TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.financial_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider_id VARCHAR(100) NOT NULL,
    provider_name VARCHAR(200) NOT NULL,
    provider_type VARCHAR(50) NOT NULL,
    account_number_masked VARCHAR(100) NOT NULL,
    account_holder VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'CONNECTED',
    auth_level VARCHAR(50) NOT NULL DEFAULT 'SAVIOR_HIGH_SHIELD',
    last_simulated_balance NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
    is_simulated BOOLEAN NOT NULL DEFAULT true,
    connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT check_simulated_flag CHECK (is_simulated = true)
);

CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code VARCHAR(100) NOT NULL UNIQUE,
    connection_id UUID NOT NULL REFERENCES public.financial_connections(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    provider_name VARCHAR(200) NOT NULL,
    recipient_name VARCHAR(255) NOT NULL,
    recipient_phone_or_account VARCHAR(100) NOT NULL,
    amount NUMERIC(14, 2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'RWF',
    transaction_type VARCHAR(50) NOT NULL DEFAULT 'MOMO_PAY',
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    risk_level VARCHAR(50) NOT NULL DEFAULT 'LOW',
    risk_factors TEXT[] DEFAULT ARRAY[]::TEXT[],
    data_hash VARCHAR(255) NOT NULL,
    authorization_steps JSONB NOT NULL DEFAULT '{"passwordVerified": false, "mfaVerified": false, "faceBiometricVerified": false}'::jsonb,
    expires_at TIMESTAMPTZ NOT NULL,
    authorized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT check_transaction_amount CHECK (amount > 0)
);

-- ============================================================================
-- 6. SECURITY ALERTS TABLE (Clean Schema — No Fabricated Seed Data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.security_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alert_code VARCHAR(50) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'HIGH',
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    source VARCHAR(200) NOT NULL DEFAULT 'SAVIOR Platform Threat Intelligence',
    district VARCHAR(100) DEFAULT 'National (All Districts)',
    recommended_action TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    published_by UUID REFERENCES public.user_profiles(id),
    published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT check_alert_severity CHECK (severity IN ('INFO', 'WARNING', 'ALERT', 'CRITICAL'))
);

-- ============================================================================
-- 7. BACKUP RECOVERY CODES TABLE (Server-Only Cryptographic Storage)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.backup_recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    code_hash VARCHAR(255) NOT NULL,
    code_hint VARCHAR(50) NOT NULL,
    is_used BOOLEAN NOT NULL DEFAULT false,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT check_code_hash_length CHECK (length(code_hash) >= 32)
);

-- ============================================================================
-- 8. AUDIT LOGS TABLE (Append-Only Forensic Ledger)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    ip_address VARCHAR(100),
    payload JSONB DEFAULT '{}'::jsonb,
    integrity_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 9. PERFORMANCE & QUERY INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_cybercrime_reports_tracking ON public.cybercrime_reports(tracking_id);
CREATE INDEX IF NOT EXISTS idx_cybercrime_reports_user_id ON public.cybercrime_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_cybercrime_reports_status ON public.cybercrime_reports(status);
CREATE INDEX IF NOT EXISTS idx_cybercrime_reports_created ON public.cybercrime_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_alerts_active ON public.security_alerts(is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_connections_user ON public.financial_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON public.transactions(reference_code);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action, created_at DESC);

-- ============================================================================
-- 10. SECURITY DEFINER HELPER FUNCTIONS (Hardened Search Paths)
-- ============================================================================

-- Function to check whether caller has an official law-enforcement / SOC analyst role
CREATE OR REPLACE FUNCTION public.is_savior_official()
RETURNS BOOLEAN 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('INVESTIGATOR', 'SECURITY_ANALYST', 'SYSTEM_ADMIN')
    );
END;
$$;

-- ----------------------------------------------------------------------------
-- SECURE PUBLIC REPORT TRACKING (Zero Exposure of Sensitive Data)
-- Returns strictly non-sensitive case progression telemetry
-- Never exposes victim PII, suspect contact, financial loss, evidence files,
-- investigator notes, or unverified RIB case numbers / RNP intervention IDs.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_report_tracking(p_tracking_id TEXT)
RETURNS TABLE (
    tracking_id VARCHAR,
    category cybercrime_category,
    theft_type VARCHAR,
    status report_status,
    priority report_priority,
    assigned_unit VARCHAR,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    fast_actions_count INT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.tracking_id,
        r.category,
        r.theft_type,
        r.status,
        r.priority,
        r.assigned_unit,
        r.created_at,
        r.updated_at,
        COALESCE(jsonb_array_length(r.fast_actions_taken), 0)::INT AS fast_actions_count
    FROM public.cybercrime_reports r
    WHERE r.tracking_id = trim(p_tracking_id)
    LIMIT 1;
END;
$$;

-- ============================================================================
-- 11. ROW LEVEL SECURITY (RLS) POLICIES — EXPLICIT & ENFORCED
-- ============================================================================

-- Enable RLS across all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cybercrime_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.backup_recovery_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- RLS: user_profiles
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id OR public.is_savior_official());

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

-- ----------------------------------------------------------------------------
-- RLS: cybercrime_reports (Controlled Access)
-- ----------------------------------------------------------------------------
-- Direct anon client insert REVOKED. Authenticated citizens can insert their own reports.
DROP POLICY IF EXISTS "Citizens can submit cybercrime reports" ON public.cybercrime_reports;
DROP POLICY IF EXISTS "Authenticated users insert own reports" ON public.cybercrime_reports;
CREATE POLICY "Authenticated users insert own reports"
    ON public.cybercrime_reports FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Authenticated citizens can ONLY view their own submitted reports.
-- Authorized officials can view all assigned reports for investigative response.
DROP POLICY IF EXISTS "Authenticated users view own reports or officials" ON public.cybercrime_reports;
CREATE POLICY "Authenticated users view own reports or officials"
    ON public.cybercrime_reports FOR SELECT
    USING (
        (auth.uid() IS NOT NULL AND auth.uid() = user_id) 
        OR public.is_savior_official()
    );

-- Only authorized law enforcement officials can update report investigation status
DROP POLICY IF EXISTS "Only officials can update reports" ON public.cybercrime_reports;
CREATE POLICY "Only officials can update reports"
    ON public.cybercrime_reports FOR UPDATE
    USING (public.is_savior_official());

-- Deletions strictly forbidden to regular users (Admins only)
DROP POLICY IF EXISTS "Only admins can delete reports" ON public.cybercrime_reports;
CREATE POLICY "Only admins can delete reports"
    ON public.cybercrime_reports FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND role = 'SYSTEM_ADMIN'
        )
    );

-- ----------------------------------------------------------------------------
-- RLS: financial_connections & transactions (Strict User Isolation)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users view own financial connections" ON public.financial_connections;
CREATE POLICY "Users view own financial connections"
    ON public.financial_connections FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users view own transactions" ON public.transactions;
CREATE POLICY "Users view own transactions"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- RLS: backup_recovery_codes (Server-Only Access — Zero Client Access)
-- ----------------------------------------------------------------------------
-- Any previous client SELECT policy is completely dropped.
-- No citizen can query recovery code hashes directly. Handled exclusively by service_role.
DROP POLICY IF EXISTS "Users access own recovery codes" ON public.backup_recovery_codes;

-- ----------------------------------------------------------------------------
-- RLS: security_alerts (Public Read Active, Official Write)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "Public can read active security alerts" ON public.security_alerts;
CREATE POLICY "Public can read active security alerts"
    ON public.security_alerts FOR SELECT
    USING (is_active = true OR public.is_savior_official());

DROP POLICY IF EXISTS "Officials can manage security alerts" ON public.security_alerts;
CREATE POLICY "Officials can manage security alerts"
    ON public.security_alerts FOR ALL
    USING (public.is_savior_official());

-- ----------------------------------------------------------------------------
-- RLS: audit_logs (Append-Only Ledger, Server Only Insert, Officials Read)
-- ----------------------------------------------------------------------------
DROP POLICY IF EXISTS "System append audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Officials can read audit logs" ON public.audit_logs;
CREATE POLICY "Officials can read audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.is_savior_official());

-- ============================================================================
-- 12. EXPLICIT PRIVILEGES & GRANT MANAGEMENT (Defense-In-Depth)
-- ============================================================================

-- 1. Revoke default public execution & table rights
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC, anon;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC, anon;

-- 2. User Profiles Table Grants
GRANT SELECT, UPDATE ON public.user_profiles TO authenticated;
GRANT ALL ON public.user_profiles TO service_role;

-- 3. Cybercrime Reports Table Grants
GRANT SELECT, INSERT ON public.cybercrime_reports TO authenticated;
GRANT UPDATE, DELETE ON public.cybercrime_reports TO authenticated; -- Governed by RLS: officials update, admin delete
GRANT ALL ON public.cybercrime_reports TO service_role;

-- 4. Financial Connections & Transactions Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_connections TO authenticated, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated, service_role;

-- 5. Security Alerts Grants (Public Read Active)
GRANT SELECT ON public.security_alerts TO anon, authenticated, service_role;
GRANT INSERT, UPDATE, DELETE ON public.security_alerts TO authenticated, service_role;

-- 6. Backup Recovery Codes Grants (Server-Only; REVOKED from authenticated)
REVOKE ALL ON public.backup_recovery_codes FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.backup_recovery_codes TO service_role;

-- 7. Audit Logs Table Grants (Server-Only Insert, Officials Read via RLS)
REVOKE ALL ON public.audit_logs FROM PUBLIC, anon;
GRANT SELECT ON public.audit_logs TO authenticated, service_role;
GRANT INSERT ON public.audit_logs TO service_role;

-- 8. Function Execution Grants
GRANT EXECUTE ON FUNCTION public.get_public_report_tracking(TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_savior_official() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.bootstrap_initial_admin(TEXT) TO service_role;
-- (Trigger functions have NO execution grants to public, anon, or authenticated)
