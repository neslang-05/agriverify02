-- Demo Data Seed Script (Reset and Expanded Paddy Data)

-- 1. Clear existing data
DELETE FROM public.audit_logs;
DELETE FROM public.chat_messages;
DELETE FROM public.product_complaints;
DELETE FROM public.verification_history;
DELETE FROM public.batch_risk_registry;
DELETE FROM public.seed_registry;
DELETE FROM public.blacklisted_brands;
DELETE FROM public.vision_ai_usage_logs;
DELETE FROM public.vision_ai_models;
DELETE FROM public.profiles;
DELETE FROM auth.users;

-- 2. Insert 30 Users (25 Farmers, 3 Officers, 2 Admins)
-- IDs for deterministic seeding
DO $$
DECLARE
    i INTEGER;
    user_id UUID;
    v_role TEXT;
    v_email TEXT;
    v_name TEXT;
    v_district TEXT;
    districts TEXT[] := ARRAY['Imphal West', 'Imphal East', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Senapati', 'Ukhrul', 'Chandel', 'Tamenglong', 'Jiribam', 'Kangpokpi', 'Kakching', 'Tengnoupal', 'Kamjong', 'Noney', 'Pherzawl'];
BEGIN
    FOR i IN 1..30 LOOP
        user_id := gen_random_uuid();
        IF i <= 2 THEN
            v_role := 'admin';
            v_email := 'admin' || i || '@example.com';
            v_name := 'Admin User ' || i;
            v_district := 'Imphal West';
        ELSIF i <= 5 THEN
            v_role := 'officer';
            v_email := 'officer' || (i-2) || '@example.com';
            v_name := 'Officer ' || (i-2);
            v_district := districts[(i % 16) + 1];
        ELSE
            v_role := 'farmer';
            v_email := 'farmer' || (i-5) || '@example.com';
            v_name := 'Farmer ' || (i-5);
            v_district := districts[(i % 16) + 1];
        END IF;

        INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
        VALUES (user_id, v_email, jsonb_build_object('role', v_role), 'authenticated', now(), now());

        INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
        VALUES (user_id, v_email, v_name, v_role, v_district, now());
    END LOOP;
END $$;

-- 3. Insert 30 Paddy varieties (RC Maniphou Brand)
DO $$
DECLARE
    i INTEGER;
    v_variety_num INTEGER;
BEGIN
    FOR i IN 1..30 LOOP
        v_variety_num := (i % 15) + 1; -- Varieties 1 to 15
        INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
        VALUES (
            gen_random_uuid(), 
            'RC Maniphou', 
            'RC Maniphou ' || v_variety_num, 
            'Paddy', 
            v_variety_num::text, 
            'ICAR Manipur', 
            'LIC-MN-001', 
            'CERT-PADDY-' || LPAD(i::text, 3, '0'), 
            true, 
            now()
        );
    END LOOP;
END $$;

-- 4. Insert 30 Verification History Records
DO $$
DECLARE
    i INTEGER;
    v_farmer_id UUID;
    v_variety_name TEXT;
    v_status TEXT;
    v_conf DECIMAL;
BEGIN
    FOR i IN 1..30 LOOP
        -- Select a random farmer
        SELECT id INTO v_farmer_id FROM public.profiles WHERE role = 'farmer' ORDER BY random() LIMIT 1;
        -- Select a random variety
        SELECT product_name INTO v_variety_name FROM public.seed_registry ORDER BY random() LIMIT 1;
        
        v_status := (ARRAY['genuine', 'genuine', 'genuine', 'suspicious', 'fake'])[ (i % 5) + 1 ];
        v_conf := 0.6 + (random() * 0.35);

        INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
        VALUES (
            gen_random_uuid(), 
            v_farmer_id, 
            'https://example.com/seeds/paddy' || i || '.jpg', 
            v_status, 
            v_conf, 
            'Paddy', 
            0.8 + (random() * 0.18), 
            v_variety_name, 
            CASE WHEN v_status = 'genuine' THEN 'Safe to use' ELSE 'Consult local officer' END, 
            now() - (i || ' hours')::interval
        );
    END LOOP;
END $$;

-- 5. Insert 30 Product Complaints
DO $$
DECLARE
    i INTEGER;
    v_farmer_id UUID;
    v_officer_id UUID;
    v_verify_id UUID;
    v_variety_name TEXT;
    v_district TEXT;
    v_issue public.complaint_issue_type;
    issues public.complaint_issue_type[] := ARRAY['poor_germination', 'stunted_growth', 'no_yield', 'pest_susceptibility', 'physical_impurity', 'other']::public.complaint_issue_type[];
BEGIN
    FOR i IN 1..30 LOOP
        -- Select a random farmer profile
        SELECT id, district INTO v_farmer_id, v_district FROM public.profiles WHERE role = 'farmer' ORDER BY random() LIMIT 1;
        -- Select a random officer
        SELECT id INTO v_officer_id FROM public.profiles WHERE role = 'officer' ORDER BY random() LIMIT 1;
        -- Select a random verification (can be null)
        SELECT id INTO v_verify_id FROM public.verification_history WHERE user_id = v_farmer_id ORDER BY random() LIMIT 1;
        
        v_issue := issues[(i % 6) + 1];

        INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
        VALUES (
            gen_random_uuid(), 
            v_farmer_id, 
            v_verify_id, 
            v_officer_id, 
            'BATCH-PADDY-' || (1000 + i), 
            'RC Maniphou', 
            'Paddy', 
            v_district, 
            v_issue, 
            'Automated complaint report ' || i || ' regarding ' || v_issue || '.', 
            (i % 5) + 1, 
            (ARRAY['received', 'under_review', 'finished'])[ (i % 3) + 1 ], 
            now() - (i || ' days')::interval
        );
    END LOOP;
END $$;
