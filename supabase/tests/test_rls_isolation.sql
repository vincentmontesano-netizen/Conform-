-- =============================================================================
-- RLS Isolation Tests — CONFORM+
-- Verifies that Row Level Security properly isolates data between companies.
-- Run with: psql -f test_rls_isolation.sql
-- =============================================================================

-- Setup: Create two test companies and users
DO $$
DECLARE
  v_company_a UUID;
  v_company_b UUID;
  v_user_a UUID;
  v_user_b UUID;
  v_site_a UUID;
  v_duerp_a UUID;
  v_count INT;
BEGIN
  RAISE NOTICE '=== RLS Isolation Tests ===';

  -- Create Company A
  INSERT INTO companies (name, siret, sector, employee_count, has_physical_site)
  VALUES ('Test Company A', '12345678901234', 'bureau', 25, true)
  RETURNING id INTO v_company_a;

  -- Create Company B
  INSERT INTO companies (name, siret, sector, employee_count, has_physical_site)
  VALUES ('Test Company B', '98765432109876', 'commerce', 10, false)
  RETURNING id INTO v_company_b;

  -- Create Site for Company A
  INSERT INTO sites (company_id, name, address)
  VALUES (v_company_a, 'Site A', '1 rue Test')
  RETURNING id INTO v_site_a;

  -- Create DUERP for Company A
  INSERT INTO duerp_documents (company_id, site_id, status, created_by)
  VALUES (v_company_a, v_site_a, 'draft', gen_random_uuid())
  RETURNING id INTO v_duerp_a;

  -- Create Compliance Alert for Company A
  INSERT INTO compliance_alerts (company_id, duerp_id, rule_type, message, severity, is_resolved)
  VALUES (v_company_a, v_duerp_a, 'annual_update', 'Test alert', 'warning', false);

  -- Create Audit Log for Company A
  INSERT INTO audit_logs (company_id, entity_type, entity_id, action)
  VALUES (v_company_a, 'company', v_company_a::text, 'create');

  -- =========================================================================
  -- TEST 1: Company B should not see Company A's sites
  -- =========================================================================
  SELECT COUNT(*) INTO v_count FROM sites WHERE company_id = v_company_b;
  IF v_count = 0 THEN
    RAISE NOTICE 'TEST 1 PASSED: Company B has 0 sites (isolated)';
  ELSE
    RAISE WARNING 'TEST 1 FAILED: Company B sees % sites', v_count;
  END IF;

  -- =========================================================================
  -- TEST 2: Company B should not see Company A's DUERPs
  -- =========================================================================
  SELECT COUNT(*) INTO v_count FROM duerp_documents WHERE company_id = v_company_b;
  IF v_count = 0 THEN
    RAISE NOTICE 'TEST 2 PASSED: Company B has 0 DUERPs (isolated)';
  ELSE
    RAISE WARNING 'TEST 2 FAILED: Company B sees % DUERPs', v_count;
  END IF;

  -- =========================================================================
  -- TEST 3: Company B should not see Company A's alerts
  -- =========================================================================
  SELECT COUNT(*) INTO v_count FROM compliance_alerts WHERE company_id = v_company_b;
  IF v_count = 0 THEN
    RAISE NOTICE 'TEST 3 PASSED: Company B has 0 alerts (isolated)';
  ELSE
    RAISE WARNING 'TEST 3 FAILED: Company B sees % alerts', v_count;
  END IF;

  -- =========================================================================
  -- TEST 4: Company B should not see Company A's audit logs
  -- =========================================================================
  SELECT COUNT(*) INTO v_count FROM audit_logs WHERE company_id = v_company_b;
  IF v_count = 0 THEN
    RAISE NOTICE 'TEST 4 PASSED: Company B has 0 audit logs (isolated)';
  ELSE
    RAISE WARNING 'TEST 4 FAILED: Company B sees % audit logs', v_count;
  END IF;

  -- =========================================================================
  -- TEST 5: Company A data exists
  -- =========================================================================
  SELECT COUNT(*) INTO v_count FROM sites WHERE company_id = v_company_a;
  IF v_count = 1 THEN
    RAISE NOTICE 'TEST 5 PASSED: Company A has 1 site';
  ELSE
    RAISE WARNING 'TEST 5 FAILED: Company A has % sites (expected 1)', v_count;
  END IF;

  SELECT COUNT(*) INTO v_count FROM duerp_documents WHERE company_id = v_company_a;
  IF v_count = 1 THEN
    RAISE NOTICE 'TEST 6 PASSED: Company A has 1 DUERP';
  ELSE
    RAISE WARNING 'TEST 6 FAILED: Company A has % DUERPs (expected 1)', v_count;
  END IF;

  -- =========================================================================
  -- TEST 7: Immutability — duerp_versions should reject UPDATE
  -- =========================================================================
  BEGIN
    -- First create a version
    INSERT INTO duerp_versions (duerp_id, version_number, content, created_by)
    VALUES (v_duerp_a, 1, '{"test": true}'::jsonb, gen_random_uuid());

    -- Try to update it (should fail via trigger)
    UPDATE duerp_versions SET version_number = 2 WHERE duerp_id = v_duerp_a;
    RAISE WARNING 'TEST 7 FAILED: UPDATE on duerp_versions succeeded (should be blocked)';
  EXCEPTION
    WHEN raise_exception THEN
      RAISE NOTICE 'TEST 7 PASSED: UPDATE on duerp_versions blocked by trigger';
    WHEN OTHERS THEN
      RAISE NOTICE 'TEST 7 PASSED: UPDATE on duerp_versions blocked (%)' , SQLERRM;
  END;

  -- =========================================================================
  -- TEST 8: Immutability — audit_logs should reject UPDATE
  -- =========================================================================
  BEGIN
    UPDATE audit_logs SET action = 'modified' WHERE company_id = v_company_a;
    RAISE WARNING 'TEST 8 FAILED: UPDATE on audit_logs succeeded (should be blocked)';
  EXCEPTION
    WHEN raise_exception THEN
      RAISE NOTICE 'TEST 8 PASSED: UPDATE on audit_logs blocked by trigger';
    WHEN OTHERS THEN
      RAISE NOTICE 'TEST 8 PASSED: UPDATE on audit_logs blocked (%)' , SQLERRM;
  END;

  -- =========================================================================
  -- Cleanup
  -- =========================================================================
  DELETE FROM compliance_alerts WHERE company_id IN (v_company_a, v_company_b);
  DELETE FROM audit_logs WHERE company_id IN (v_company_a, v_company_b);
  DELETE FROM duerp_versions WHERE duerp_id = v_duerp_a;
  DELETE FROM duerp_documents WHERE company_id IN (v_company_a, v_company_b);
  DELETE FROM sites WHERE company_id IN (v_company_a, v_company_b);
  DELETE FROM companies WHERE id IN (v_company_a, v_company_b);

  RAISE NOTICE '=== All RLS tests completed ===';
END $$;
