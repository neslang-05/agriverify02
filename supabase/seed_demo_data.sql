-- Demo Data Seed Script

-- 1. Insert into auth.users (Note: Passwords are not set, user must reset or use dashboard)
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('7b606994-6e78-4dbb-a29a-77e37894d8b9', 'user0_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('32c4d7bd-29ad-4566-98ed-1f03e3f9990d', 'user1_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('1094560a-6097-469f-98fc-cf5a68abfd16', 'user2_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('631cfe43-63cd-4450-ac62-e70efccde747', 'user3_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('b0f528fc-1837-49bc-8aba-9b91e3956534', 'user4_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('e5a777ea-a962-4e85-aaab-3dec6983099b', 'user5_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('6f6de0ee-2e08-4c5c-9f5e-57ae9ec15a26', 'user6_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('d0dba60b-a694-4c5b-8872-cbe3acd2206b', 'user7_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('f4e25321-541e-466d-8d27-332e2caffd2e', 'user8_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('0e758853-777a-41ac-a9b5-d3285eff8178', 'user9_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('b581a109-0deb-42bf-9e4c-d54dd3884f99', 'user10_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('fe7dab0a-0b99-4044-8d5a-3d09c11c4f9d', 'user11_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('404a6bc5-6a34-4cdd-bf4d-2e0f5433e3bd', 'user12_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('f8a908d4-a971-4236-b490-878a9ba48ef5', 'user13_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('908b7b17-d9e1-4184-9c6f-befa6e0d25c2', 'user14_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('3e3cf1ae-2940-43f6-86fb-cc1005f0df7b', 'user15_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('35f7287d-9c8a-4e6c-b2d8-e0546a356f55', 'user16_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('4b009cd9-73fe-409a-9ce9-65c8fdaa5d0d', 'user17_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('c89c23fc-2d51-4b79-a781-4b62fe1bd927', 'user18_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('de57abc3-e71d-4775-8d2c-3aa3272f092a', 'user19_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('acb10a40-1a6c-4f60-a14b-3f1fdbd533ff', 'user20_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('cf8c5028-f87f-4334-b048-9946c37bd9a3', 'user21_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('c587dc64-3487-44f4-ae99-28ddc43dc623', 'user22_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('bca6715e-0db4-4e73-ad4d-89dc0bc60ba1', 'user23_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('4cd1fdfb-0c13-4b35-a506-bdf7ead70ca6', 'user24_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('d57c79e7-e981-4893-a92b-35365d753a20', 'user25_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('71b4f617-fcc0-4137-a6ed-2acad12fd3ca', 'user26_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('26d1d0ec-2717-4cf4-97e7-e25c9c50d83c', 'user27_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('eeff9d55-6eec-461e-916e-d3254e2e7995', 'user28_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('a29d68c4-1dfe-4193-8a7e-b2dd9aa217bd', 'user29_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('8d0b4473-3ed0-41d3-8bf6-90fd18c5a6ff', 'user30_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('08329ff6-dcd5-4767-a95d-b428f9f78f78', 'user31_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('11eccc01-1638-4062-b563-7474e77ffe00', 'user32_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('5a8fd779-00e7-4c8b-8875-e21f70c1d2b4', 'user33_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('c7b53eb4-6795-40e7-af12-e5a814c3f637', 'user34_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('2971bcb1-e55b-4ec2-b9c3-85b06fa025c7', 'user35_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('221d089f-1c61-475c-84b1-b6252ce6d094', 'user36_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('2884851c-d0e0-44f9-b8c7-ada0a5a6cc3b', 'user37_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('94d5fca4-236b-492f-8502-a7df749b4ba3', 'user38_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('e55bb6a9-021c-4580-8843-b758916cc69e', 'user39_farmer@example.com', '{"role": "farmer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('d8e5526a-702c-425c-88c4-9eadd068e7ff', 'user40_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('1c6f91ae-0089-4f55-a743-dc80952d4309', 'user41_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('814515ce-9a74-4311-b3b5-a5d3345637c4', 'user42_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('fed3f24b-969f-46f3-8ad4-3b4bd5f39da9', 'user43_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('80f3159f-a76a-47bf-bf7b-917d95df0749', 'user44_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('9b411218-5b41-4d70-acca-a20b0874a6d7', 'user45_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('05885028-b0f2-4c90-8c02-252edb73c635', 'user46_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('43fa3f23-0097-4ee0-b0ad-4149dab9445d', 'user47_officer@example.com', '{"role": "officer"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('32c8ed47-dc51-46f7-8866-e1c37a1a9baa', 'user48_admin@example.com', '{"role": "admin"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;
INSERT INTO auth.users (id, email, raw_user_meta_data, role, email_confirmed_at, last_sign_in_at) 
VALUES ('6eb1ef77-344d-425e-a791-efbd4c92bd8f', 'user49_admin@example.com', '{"role": "admin"}', 'authenticated', now(), now()) ON CONFLICT (id) DO NOTHING;

-- 2. Insert into public.profiles
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('7b606994-6e78-4dbb-a29a-77e37894d8b9', 'user0_farmer@example.com', 'Demo Farmer 0', 'farmer', 'Imphal West', '2026-04-25 17:44:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('32c4d7bd-29ad-4566-98ed-1f03e3f9990d', 'user1_farmer@example.com', 'Demo Farmer 1', 'farmer', 'Churachandpur', '2026-03-15 10:59:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('1094560a-6097-469f-98fc-cf5a68abfd16', 'user2_farmer@example.com', 'Demo Farmer 2', 'farmer', 'Pherzawl', '2026-03-12 04:18:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('631cfe43-63cd-4450-ac62-e70efccde747', 'user3_farmer@example.com', 'Demo Farmer 3', 'farmer', 'Kakching', '2026-04-02 19:01:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('b0f528fc-1837-49bc-8aba-9b91e3956534', 'user4_farmer@example.com', 'Demo Farmer 4', 'farmer', 'Imphal West', '2026-04-15 22:18:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('e5a777ea-a962-4e85-aaab-3dec6983099b', 'user5_farmer@example.com', 'Demo Farmer 5', 'farmer', 'Kakching', '2026-04-06 02:32:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('6f6de0ee-2e08-4c5c-9f5e-57ae9ec15a26', 'user6_farmer@example.com', 'Demo Farmer 6', 'farmer', 'Imphal East', '2026-04-04 16:41:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('d0dba60b-a694-4c5b-8872-cbe3acd2206b', 'user7_farmer@example.com', 'Demo Farmer 7', 'farmer', 'Kakching', '2026-04-24 05:19:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('f4e25321-541e-466d-8d27-332e2caffd2e', 'user8_farmer@example.com', 'Demo Farmer 8', 'farmer', 'Bishnupur', '2026-03-24 20:53:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('0e758853-777a-41ac-a9b5-d3285eff8178', 'user9_farmer@example.com', 'Demo Farmer 9', 'farmer', 'Thoubal', '2026-04-25 13:16:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('b581a109-0deb-42bf-9e4c-d54dd3884f99', 'user10_farmer@example.com', 'Demo Farmer 10', 'farmer', 'Jiribam', '2026-04-14 17:57:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('fe7dab0a-0b99-4044-8d5a-3d09c11c4f9d', 'user11_farmer@example.com', 'Demo Farmer 11', 'farmer', 'Tengnoupal', '2026-04-06 20:34:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('404a6bc5-6a34-4cdd-bf4d-2e0f5433e3bd', 'user12_farmer@example.com', 'Demo Farmer 12', 'farmer', 'Kangpokpi', '2026-05-02 11:06:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('f8a908d4-a971-4236-b490-878a9ba48ef5', 'user13_farmer@example.com', 'Demo Farmer 13', 'farmer', 'Churachandpur', '2026-03-26 04:48:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('908b7b17-d9e1-4184-9c6f-befa6e0d25c2', 'user14_farmer@example.com', 'Demo Farmer 14', 'farmer', 'Churachandpur', '2026-04-06 20:22:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('3e3cf1ae-2940-43f6-86fb-cc1005f0df7b', 'user15_farmer@example.com', 'Demo Farmer 15', 'farmer', 'Kakching', '2026-03-16 22:13:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('35f7287d-9c8a-4e6c-b2d8-e0546a356f55', 'user16_farmer@example.com', 'Demo Farmer 16', 'farmer', 'Pherzawl', '2026-04-23 10:04:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('4b009cd9-73fe-409a-9ce9-65c8fdaa5d0d', 'user17_farmer@example.com', 'Demo Farmer 17', 'farmer', 'Kangpokpi', '2026-03-08 13:24:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('c89c23fc-2d51-4b79-a781-4b62fe1bd927', 'user18_farmer@example.com', 'Demo Farmer 18', 'farmer', 'Chandel', '2026-03-30 21:16:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('de57abc3-e71d-4775-8d2c-3aa3272f092a', 'user19_farmer@example.com', 'Demo Farmer 19', 'farmer', 'Kakching', '2026-03-15 12:33:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('acb10a40-1a6c-4f60-a14b-3f1fdbd533ff', 'user20_farmer@example.com', 'Demo Farmer 20', 'farmer', 'Jiribam', '2026-03-20 13:27:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('cf8c5028-f87f-4334-b048-9946c37bd9a3', 'user21_farmer@example.com', 'Demo Farmer 21', 'farmer', 'Tamenglong', '2026-03-14 17:37:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('c587dc64-3487-44f4-ae99-28ddc43dc623', 'user22_farmer@example.com', 'Demo Farmer 22', 'farmer', 'Senapati', '2026-04-20 01:11:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('bca6715e-0db4-4e73-ad4d-89dc0bc60ba1', 'user23_farmer@example.com', 'Demo Farmer 23', 'farmer', 'Kamjong', '2026-03-27 07:26:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('4cd1fdfb-0c13-4b35-a506-bdf7ead70ca6', 'user24_farmer@example.com', 'Demo Farmer 24', 'farmer', 'Chandel', '2026-03-20 11:58:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('d57c79e7-e981-4893-a92b-35365d753a20', 'user25_farmer@example.com', 'Demo Farmer 25', 'farmer', 'Kamjong', '2026-03-26 20:12:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('71b4f617-fcc0-4137-a6ed-2acad12fd3ca', 'user26_farmer@example.com', 'Demo Farmer 26', 'farmer', 'Tengnoupal', '2026-03-18 06:08:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('26d1d0ec-2717-4cf4-97e7-e25c9c50d83c', 'user27_farmer@example.com', 'Demo Farmer 27', 'farmer', 'Kangpokpi', '2026-05-02 02:43:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('eeff9d55-6eec-461e-916e-d3254e2e7995', 'user28_farmer@example.com', 'Demo Farmer 28', 'farmer', 'Thoubal', '2026-04-07 13:10:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('a29d68c4-1dfe-4193-8a7e-b2dd9aa217bd', 'user29_farmer@example.com', 'Demo Farmer 29', 'farmer', 'Thoubal', '2026-04-09 00:38:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('8d0b4473-3ed0-41d3-8bf6-90fd18c5a6ff', 'user30_farmer@example.com', 'Demo Farmer 30', 'farmer', 'Bishnupur', '2026-04-11 09:58:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('08329ff6-dcd5-4767-a95d-b428f9f78f78', 'user31_farmer@example.com', 'Demo Farmer 31', 'farmer', 'Thoubal', '2026-04-03 18:44:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('11eccc01-1638-4062-b563-7474e77ffe00', 'user32_farmer@example.com', 'Demo Farmer 32', 'farmer', 'Tengnoupal', '2026-04-25 13:22:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('5a8fd779-00e7-4c8b-8875-e21f70c1d2b4', 'user33_farmer@example.com', 'Demo Farmer 33', 'farmer', 'Noney', '2026-05-01 10:29:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('c7b53eb4-6795-40e7-af12-e5a814c3f637', 'user34_farmer@example.com', 'Demo Farmer 34', 'farmer', 'Kangpokpi', '2026-04-05 19:01:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('2971bcb1-e55b-4ec2-b9c3-85b06fa025c7', 'user35_farmer@example.com', 'Demo Farmer 35', 'farmer', 'Kakching', '2026-04-10 04:08:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('221d089f-1c61-475c-84b1-b6252ce6d094', 'user36_farmer@example.com', 'Demo Farmer 36', 'farmer', 'Ukhrul', '2026-03-25 08:54:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('2884851c-d0e0-44f9-b8c7-ada0a5a6cc3b', 'user37_farmer@example.com', 'Demo Farmer 37', 'farmer', 'Jiribam', '2026-04-09 17:57:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('94d5fca4-236b-492f-8502-a7df749b4ba3', 'user38_farmer@example.com', 'Demo Farmer 38', 'farmer', 'Bishnupur', '2026-03-17 16:09:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('e55bb6a9-021c-4580-8843-b758916cc69e', 'user39_farmer@example.com', 'Demo Farmer 39', 'farmer', 'Kamjong', '2026-03-30 18:14:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('d8e5526a-702c-425c-88c4-9eadd068e7ff', 'user40_officer@example.com', 'Demo Officer 40', 'officer', 'Tamenglong', '2026-04-02 20:29:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('1c6f91ae-0089-4f55-a743-dc80952d4309', 'user41_officer@example.com', 'Demo Officer 41', 'officer', 'Ukhrul', '2026-03-12 01:34:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('814515ce-9a74-4311-b3b5-a5d3345637c4', 'user42_officer@example.com', 'Demo Officer 42', 'officer', 'Jiribam', '2026-04-05 23:19:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('fed3f24b-969f-46f3-8ad4-3b4bd5f39da9', 'user43_officer@example.com', 'Demo Officer 43', 'officer', 'Kamjong', '2026-03-24 07:36:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('80f3159f-a76a-47bf-bf7b-917d95df0749', 'user44_officer@example.com', 'Demo Officer 44', 'officer', 'Kamjong', '2026-04-15 10:37:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('9b411218-5b41-4d70-acca-a20b0874a6d7', 'user45_officer@example.com', 'Demo Officer 45', 'officer', 'Ukhrul', '2026-03-24 14:09:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('05885028-b0f2-4c90-8c02-252edb73c635', 'user46_officer@example.com', 'Demo Officer 46', 'officer', 'Kangpokpi', '2026-04-06 16:42:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('43fa3f23-0097-4ee0-b0ad-4149dab9445d', 'user47_officer@example.com', 'Demo Officer 47', 'officer', 'Ukhrul', '2026-03-26 10:30:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('32c8ed47-dc51-46f7-8866-e1c37a1a9baa', 'user48_admin@example.com', 'Demo Admin 48', 'admin', 'Imphal West', '2026-04-28 10:03:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.profiles (id, email, full_name, role, district, created_at) 
VALUES ('6eb1ef77-344d-425e-a791-efbd4c92bd8f', 'user49_admin@example.com', 'Demo Admin 49', 'admin', 'Imphal West', '2026-04-17 06:46:40+00') ON CONFLICT (id) DO NOTHING;

-- 3. Insert into public.seed_registry
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('40beeb1f-dfe2-406b-8b13-a42a96c383e1', 'Kaveri', 'Kaveri Maize Hybrid 270', 'Maize', 'V-25', 'Kaveri Agri Ltd', 'LIC-90093', 'CERT-826787', true, '2026-05-03 15:57:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('9c4b686e-cdbc-44eb-8585-5c67cad45f84', 'Mahyco', 'Mahyco Chilli Hybrid 169', 'Chilli', 'V-54', 'Mahyco Agri Ltd', 'LIC-27347', 'CERT-303908', true, '2026-04-07 21:02:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('f6ff9154-8013-40f3-8203-f1238361be04', 'Kaveri', 'Kaveri Tomato Hybrid 750', 'Tomato', 'V-66', 'Kaveri Agri Ltd', 'LIC-89621', 'CERT-695581', true, '2026-04-22 18:32:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('8db9d4aa-dd49-4e0c-8f03-fa5e6ca4717f', 'Monsanto', 'Monsanto Chilli Hybrid 173', 'Chilli', 'V-69', 'Monsanto Agri Ltd', 'LIC-15432', 'CERT-643569', true, '2026-03-07 11:16:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('40cabadf-edc2-4696-a6fc-a33ceb8c4c21', 'Rasi Seeds', 'Rasi Seeds Mustard Hybrid 766', 'Mustard', 'V-52', 'Rasi Seeds Agri Ltd', 'LIC-29499', 'CERT-778808', true, '2026-04-11 11:58:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('75ff8d63-0900-41d7-9d8e-d7a6bb5b945f', 'Nuziveedu', 'Nuziveedu Tomato Hybrid 301', 'Tomato', 'V-67', 'Nuziveedu Agri Ltd', 'LIC-32161', 'CERT-501391', true, '2026-03-23 10:42:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('0a1b54a5-db63-4d76-b9fc-274afeacc0ed', 'Mahyco', 'Mahyco Maize Hybrid 181', 'Maize', 'V-80', 'Mahyco Agri Ltd', 'LIC-58489', 'CERT-284977', true, '2026-03-10 23:44:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('5e55976a-ce06-4e96-b392-91749ed98b27', 'Kaveri', 'Kaveri Tomato Hybrid 436', 'Tomato', 'V-35', 'Kaveri Agri Ltd', 'LIC-99824', 'CERT-745749', true, '2026-05-03 22:47:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('2b617711-f947-46da-9092-ebe8823ad6ce', 'Kaveri', 'Kaveri Tomato Hybrid 468', 'Tomato', 'V-23', 'Kaveri Agri Ltd', 'LIC-71217', 'CERT-753799', true, '2026-04-05 11:44:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('1473a0b1-09e1-47c4-af83-8eee1f0fc9b5', 'Mahyco', 'Mahyco Potato Hybrid 310', 'Potato', 'V-17', 'Mahyco Agri Ltd', 'LIC-54097', 'CERT-388025', true, '2026-03-14 00:13:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('1485bd63-4646-4023-8d0a-f0d69aa0b8c4', 'Syngenta', 'Syngenta Maize Hybrid 739', 'Maize', 'V-43', 'Syngenta Agri Ltd', 'LIC-51544', 'CERT-249621', true, '2026-03-26 04:01:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('55e144a2-fe7d-4e61-8ea3-f9e93b115341', 'Monsanto', 'Monsanto Mustard Hybrid 179', 'Mustard', 'V-23', 'Monsanto Agri Ltd', 'LIC-46784', 'CERT-307000', true, '2026-04-22 19:12:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('d6275a5a-e00d-4857-bbe0-07070df7370f', 'Mahyco', 'Mahyco Potato Hybrid 372', 'Potato', 'V-57', 'Mahyco Agri Ltd', 'LIC-37076', 'CERT-250494', true, '2026-04-06 00:34:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('251614c3-bc7d-46a2-b4a6-864ccefd75ae', 'Monsanto', 'Monsanto Tomato Hybrid 630', 'Tomato', 'V-55', 'Monsanto Agri Ltd', 'LIC-65457', 'CERT-822551', true, '2026-04-16 00:27:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('e78897d3-5973-46a3-b0c4-2fa5fca5c958', 'Nuziveedu', 'Nuziveedu Potato Hybrid 860', 'Potato', 'V-89', 'Nuziveedu Agri Ltd', 'LIC-52818', 'CERT-448064', true, '2026-04-30 09:43:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('9087c0c7-691b-4d22-bb0a-ee7b5f8346d7', 'Rasi Seeds', 'Rasi Seeds Mustard Hybrid 450', 'Mustard', 'V-27', 'Rasi Seeds Agri Ltd', 'LIC-94411', 'CERT-743784', true, '2026-04-09 09:56:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('0e648f87-e524-4576-a8de-50dfe330ad73', 'Syngenta', 'Syngenta Maize Hybrid 404', 'Maize', 'V-78', 'Syngenta Agri Ltd', 'LIC-73751', 'CERT-563896', true, '2026-03-16 18:43:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('798dacfb-aba0-40a9-a21f-4a9b76b17f61', 'Nuziveedu', 'Nuziveedu Wheat Hybrid 547', 'Wheat', 'V-90', 'Nuziveedu Agri Ltd', 'LIC-21481', 'CERT-821158', true, '2026-03-29 19:10:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('80ccbe6d-60f5-48b5-b888-95483691ddfc', 'Nuziveedu', 'Nuziveedu Maize Hybrid 539', 'Maize', 'V-53', 'Nuziveedu Agri Ltd', 'LIC-15609', 'CERT-134522', true, '2026-03-24 01:09:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('4fcd3f22-145c-40f5-a46b-1b94556788c8', 'Nuziveedu', 'Nuziveedu Potato Hybrid 747', 'Potato', 'V-17', 'Nuziveedu Agri Ltd', 'LIC-66660', 'CERT-874119', true, '2026-03-25 13:08:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('026c6af5-9a98-4806-bed5-41346089c700', 'Nuziveedu', 'Nuziveedu Maize Hybrid 118', 'Maize', 'V-92', 'Nuziveedu Agri Ltd', 'LIC-72787', 'CERT-530897', true, '2026-03-15 10:11:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('de7ca91e-ac22-4cad-8cff-b221ec303504', 'Rasi Seeds', 'Rasi Seeds Potato Hybrid 523', 'Potato', 'V-66', 'Rasi Seeds Agri Ltd', 'LIC-24208', 'CERT-949617', true, '2026-04-23 21:47:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('faf603e7-f40f-4b0f-81f7-d0a32620f666', 'Syngenta', 'Syngenta Mustard Hybrid 510', 'Mustard', 'V-13', 'Syngenta Agri Ltd', 'LIC-41133', 'CERT-939627', true, '2026-04-21 14:53:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('a10f0520-255c-4ada-8490-68da5f6b996c', 'Kaveri', 'Kaveri Rice Hybrid 253', 'Rice', 'V-99', 'Kaveri Agri Ltd', 'LIC-20550', 'CERT-241071', true, '2026-04-21 22:26:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('5cd65c06-cf41-49aa-8160-aafebda679e8', 'Monsanto', 'Monsanto Wheat Hybrid 143', 'Wheat', 'V-32', 'Monsanto Agri Ltd', 'LIC-53424', 'CERT-538144', true, '2026-03-19 01:53:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('47e9eebb-0d04-4e36-972d-31e60bf21664', 'JK Seeds', 'JK Seeds Maize Hybrid 287', 'Maize', 'V-70', 'JK Seeds Agri Ltd', 'LIC-56614', 'CERT-356763', true, '2026-03-11 00:40:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('3bf82eef-a61b-4640-9669-c17d5b07cf59', 'Kaveri', 'Kaveri Wheat Hybrid 219', 'Wheat', 'V-28', 'Kaveri Agri Ltd', 'LIC-91539', 'CERT-151181', true, '2026-04-10 19:18:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('f89091ed-0829-4967-b3b4-d59484d1f74e', 'JK Seeds', 'JK Seeds Potato Hybrid 755', 'Potato', 'V-50', 'JK Seeds Agri Ltd', 'LIC-25064', 'CERT-188086', true, '2026-04-16 20:52:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('aa3d44cd-e8e7-4343-8716-e760424d758f', 'Mahyco', 'Mahyco Maize Hybrid 394', 'Maize', 'V-95', 'Mahyco Agri Ltd', 'LIC-86408', 'CERT-881301', true, '2026-04-15 18:31:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.seed_registry (id, brand_name, product_name, crop_type, variety_name, manufacturer_name, manufacturer_license, certification_number, is_active, created_at) 
VALUES ('f17c3888-0735-496a-ae6f-e2f4e7b7a2f8', 'Rasi Seeds', 'Rasi Seeds Rice Hybrid 319', 'Rice', 'V-73', 'Rasi Seeds Agri Ltd', 'LIC-47929', 'CERT-730078', true, '2026-03-08 11:39:40+00') ON CONFLICT (id) DO NOTHING;

-- 4. Insert into public.verification_history
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('55f0c7b1-c75d-484d-b907-ae7a3abc1235', '35f7287d-9c8a-4e6c-b2d8-e0546a356f55', 'https://example.com/seeds/0.jpg', 'genuine', 0.8094, 'Maize', 0.7333, 'JK Seeds Maize Hybrid 287', 'Safe to use', '2026-03-17 02:27:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('49c0a6f3-ccde-49b5-8ccd-76b1aec19515', '32c4d7bd-29ad-4566-98ed-1f03e3f9990d', 'https://example.com/seeds/1.jpg', 'genuine', 0.9151, 'Mustard', 0.9693, 'Monsanto Mustard Hybrid 179', 'Safe to use', '2026-03-06 21:13:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('fc6c99c4-5538-40a8-ac72-dba79f6aa2f9', '26d1d0ec-2717-4cf4-97e7-e25c9c50d83c', 'https://example.com/seeds/2.jpg', 'suspicious', 0.6679, 'Maize', 0.8413, 'Nuziveedu Maize Hybrid 118', 'Consult local officer', '2026-03-07 11:50:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('84b779c2-0f4d-4326-8156-9d14b222fb5c', 'c587dc64-3487-44f4-ae99-28ddc43dc623', 'https://example.com/seeds/3.jpg', 'genuine', 0.635, 'Maize', 0.9345, 'JK Seeds Maize Hybrid 287', 'Safe to use', '2026-04-12 20:41:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('3af3f50e-2e4d-43c7-b17b-4c1661a7abec', '94d5fca4-236b-492f-8502-a7df749b4ba3', 'https://example.com/seeds/4.jpg', 'suspicious', 0.8896, 'Wheat', 0.7402, 'Monsanto Wheat Hybrid 143', 'Consult local officer', '2026-03-20 19:07:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('ae128c0d-2441-49af-9f70-0a75e4b89e50', 'de57abc3-e71d-4775-8d2c-3aa3272f092a', 'https://example.com/seeds/5.jpg', 'fake', 0.6815, 'Maize', 0.7166, 'Mahyco Maize Hybrid 394', 'Consult local officer', '2026-03-30 07:49:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('6ad86579-e029-4396-a8fc-2e9eaba374f1', 'bca6715e-0db4-4e73-ad4d-89dc0bc60ba1', 'https://example.com/seeds/6.jpg', 'genuine', 0.7469, 'Maize', 0.861, 'Kaveri Maize Hybrid 270', 'Safe to use', '2026-04-05 01:12:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('f2680602-9f4e-4613-9b45-b438f91e4dae', '1094560a-6097-469f-98fc-cf5a68abfd16', 'https://example.com/seeds/7.jpg', 'genuine', 0.6593, 'Tomato', 0.9056, 'Kaveri Tomato Hybrid 750', 'Safe to use', '2026-03-08 07:10:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('04c622dd-8d47-41f7-b0a8-33d1b07cbebc', 'de57abc3-e71d-4775-8d2c-3aa3272f092a', 'https://example.com/seeds/8.jpg', 'genuine', 0.9416, 'Potato', 0.9212, 'Mahyco Potato Hybrid 372', 'Safe to use', '2026-05-01 23:45:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('895870d9-7c3c-423a-9979-bc5364ed4fc8', '11eccc01-1638-4062-b563-7474e77ffe00', 'https://example.com/seeds/9.jpg', 'fake', 0.8516, 'Potato', 0.8621, 'Mahyco Potato Hybrid 310', 'Consult local officer', '2026-03-21 08:00:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('7bc19b7d-c9db-4adb-b234-a14b45982aaa', 'fe7dab0a-0b99-4044-8d5a-3d09c11c4f9d', 'https://example.com/seeds/10.jpg', 'genuine', 0.9296, 'Chilli', 0.7401, 'Monsanto Chilli Hybrid 173', 'Safe to use', '2026-03-07 14:44:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('18f69c47-1b63-4e84-841a-c39c8bac47f9', '0e758853-777a-41ac-a9b5-d3285eff8178', 'https://example.com/seeds/11.jpg', 'fake', 0.6949, 'Potato', 0.7774, 'JK Seeds Potato Hybrid 755', 'Consult local officer', '2026-03-19 03:35:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('8bd36899-888f-4d89-913c-1b1c424201d6', 'd0dba60b-a694-4c5b-8872-cbe3acd2206b', 'https://example.com/seeds/12.jpg', 'genuine', 0.8996, 'Wheat', 0.9183, 'Monsanto Wheat Hybrid 143', 'Safe to use', '2026-03-27 13:47:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('a272007a-064c-4688-8e0c-a62ae6e75e25', 'b581a109-0deb-42bf-9e4c-d54dd3884f99', 'https://example.com/seeds/13.jpg', 'genuine', 0.9853, 'Wheat', 0.8249, 'Kaveri Wheat Hybrid 219', 'Safe to use', '2026-04-06 15:46:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('b4a938ee-4d92-4309-adbf-1399b9767020', 'b0f528fc-1837-49bc-8aba-9b91e3956534', 'https://example.com/seeds/14.jpg', 'fake', 0.8516, 'Wheat', 0.7555, 'Monsanto Wheat Hybrid 143', 'Consult local officer', '2026-04-06 16:44:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('dec1c123-84fb-4873-b3d5-b741d2129017', 'a29d68c4-1dfe-4193-8a7e-b2dd9aa217bd', 'https://example.com/seeds/15.jpg', 'genuine', 0.8296, 'Maize', 0.9636, 'JK Seeds Maize Hybrid 287', 'Safe to use', '2026-03-27 23:05:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('f6607be2-720c-4f7e-961e-c1f11df67648', '8d0b4473-3ed0-41d3-8bf6-90fd18c5a6ff', 'https://example.com/seeds/16.jpg', 'suspicious', 0.8367, 'Maize', 0.7571, 'Mahyco Maize Hybrid 181', 'Consult local officer', '2026-05-01 21:17:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('731dabf8-7267-4641-a393-e211135970ce', '71b4f617-fcc0-4137-a6ed-2acad12fd3ca', 'https://example.com/seeds/17.jpg', 'genuine', 0.7945, 'Maize', 0.8893, 'Syngenta Maize Hybrid 739', 'Safe to use', '2026-03-10 11:52:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('642d6804-0e5f-47eb-9638-8a69932613f7', '631cfe43-63cd-4450-ac62-e70efccde747', 'https://example.com/seeds/18.jpg', 'fake', 0.8847, 'Rice', 0.7348, 'Kaveri Rice Hybrid 253', 'Consult local officer', '2026-04-11 17:11:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('28a12ef7-2ab6-48b8-8b77-b71231f1af99', 'd57c79e7-e981-4893-a92b-35365d753a20', 'https://example.com/seeds/19.jpg', 'genuine', 0.6981, 'Maize', 0.8399, 'Nuziveedu Maize Hybrid 118', 'Safe to use', '2026-05-04 13:07:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('0448c6e0-4161-4b4a-97a3-4c30fb629501', '631cfe43-63cd-4450-ac62-e70efccde747', 'https://example.com/seeds/20.jpg', 'genuine', 0.7834, 'Mustard', 0.8466, 'Syngenta Mustard Hybrid 510', 'Safe to use', '2026-03-18 21:48:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('3c1d8f21-416a-492e-86f3-82caa50bf751', 'eeff9d55-6eec-461e-916e-d3254e2e7995', 'https://example.com/seeds/21.jpg', 'genuine', 0.6439, 'Maize', 0.8992, 'Syngenta Maize Hybrid 739', 'Safe to use', '2026-03-29 00:41:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('4c536aff-0117-443e-a27e-c2638b9dbfc6', '7b606994-6e78-4dbb-a29a-77e37894d8b9', 'https://example.com/seeds/22.jpg', 'genuine', 0.6933, 'Potato', 0.9111, 'JK Seeds Potato Hybrid 755', 'Safe to use', '2026-03-23 10:27:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('f2576151-85e9-4e1e-9945-c6ad1383348f', '2971bcb1-e55b-4ec2-b9c3-85b06fa025c7', 'https://example.com/seeds/23.jpg', 'fake', 0.9391, 'Potato', 0.9732, 'Nuziveedu Potato Hybrid 747', 'Consult local officer', '2026-03-12 02:37:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('81857d31-d214-4c39-b656-b14ec22d5462', '1094560a-6097-469f-98fc-cf5a68abfd16', 'https://example.com/seeds/24.jpg', 'suspicious', 0.7337, 'Maize', 0.7309, 'Mahyco Maize Hybrid 394', 'Consult local officer', '2026-04-03 02:45:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('26f56077-bbc1-4877-9e58-c234e7ce716c', '11eccc01-1638-4062-b563-7474e77ffe00', 'https://example.com/seeds/25.jpg', 'fake', 0.7889, 'Maize', 0.7796, 'Mahyco Maize Hybrid 181', 'Consult local officer', '2026-03-29 19:33:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('af112338-df82-45cb-b50b-270a4b4d107b', 'fe7dab0a-0b99-4044-8d5a-3d09c11c4f9d', 'https://example.com/seeds/26.jpg', 'genuine', 0.9698, 'Potato', 0.876, 'JK Seeds Potato Hybrid 755', 'Safe to use', '2026-04-28 08:09:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('b83dae87-abfa-4b4a-87d3-ecfc8bf14507', 'b581a109-0deb-42bf-9e4c-d54dd3884f99', 'https://example.com/seeds/27.jpg', 'fake', 0.9562, 'Maize', 0.8605, 'Mahyco Maize Hybrid 394', 'Consult local officer', '2026-03-23 16:13:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('9d2579c6-4fab-4a6d-873e-19cf83bd172d', '2971bcb1-e55b-4ec2-b9c3-85b06fa025c7', 'https://example.com/seeds/28.jpg', 'suspicious', 0.8266, 'Chilli', 0.8528, 'Mahyco Chilli Hybrid 169', 'Consult local officer', '2026-03-10 18:30:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('fe1438d4-9592-4339-be12-8b65f3d1cd92', '08329ff6-dcd5-4767-a95d-b428f9f78f78', 'https://example.com/seeds/29.jpg', 'fake', 0.6676, 'Chilli', 0.9212, 'Mahyco Chilli Hybrid 169', 'Consult local officer', '2026-03-29 00:43:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('b4c344ce-940e-4ae8-bbbc-11aad142bb6f', '35f7287d-9c8a-4e6c-b2d8-e0546a356f55', 'https://example.com/seeds/30.jpg', 'genuine', 0.7309, 'Mustard', 0.9385, 'Rasi Seeds Mustard Hybrid 766', 'Safe to use', '2026-03-22 13:47:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('15b4f328-253b-455c-bf4f-077813c5697e', '35f7287d-9c8a-4e6c-b2d8-e0546a356f55', 'https://example.com/seeds/31.jpg', 'genuine', 0.9038, 'Mustard', 0.8214, 'Rasi Seeds Mustard Hybrid 766', 'Safe to use', '2026-04-20 02:56:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('3685a125-40e4-40a5-b294-649ae60525c4', 'c7b53eb4-6795-40e7-af12-e5a814c3f637', 'https://example.com/seeds/32.jpg', 'genuine', 0.772, 'Maize', 0.8209, 'Syngenta Maize Hybrid 404', 'Safe to use', '2026-05-01 06:02:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('a2b0b9e2-31a4-494f-b793-47e32ddda591', 'e5a777ea-a962-4e85-aaab-3dec6983099b', 'https://example.com/seeds/33.jpg', 'fake', 0.7667, 'Tomato', 0.9443, 'Monsanto Tomato Hybrid 630', 'Consult local officer', '2026-04-22 14:54:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('3b953f2a-6fd1-4e1a-980a-cb7c0f05c9b5', 'acb10a40-1a6c-4f60-a14b-3f1fdbd533ff', 'https://example.com/seeds/34.jpg', 'suspicious', 0.7152, 'Wheat', 0.961, 'Monsanto Wheat Hybrid 143', 'Consult local officer', '2026-04-14 03:23:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('bbc91ac6-76c7-483b-98bc-8f2f00ae036e', 'bca6715e-0db4-4e73-ad4d-89dc0bc60ba1', 'https://example.com/seeds/35.jpg', 'fake', 0.6082, 'Wheat', 0.8458, 'Kaveri Wheat Hybrid 219', 'Consult local officer', '2026-03-18 19:17:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('1c24228e-3fc2-48ce-94c2-3bfefb6dfaa6', '221d089f-1c61-475c-84b1-b6252ce6d094', 'https://example.com/seeds/36.jpg', 'suspicious', 0.9127, 'Tomato', 0.9158, 'Kaveri Tomato Hybrid 750', 'Consult local officer', '2026-03-31 11:06:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('902f0800-56af-44ba-88be-ae60ba37472e', '0e758853-777a-41ac-a9b5-d3285eff8178', 'https://example.com/seeds/37.jpg', 'fake', 0.853, 'Potato', 0.7383, 'JK Seeds Potato Hybrid 755', 'Consult local officer', '2026-03-23 09:50:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('bff61d08-9bf3-4ccb-bfb6-6352af59aa31', '908b7b17-d9e1-4184-9c6f-befa6e0d25c2', 'https://example.com/seeds/38.jpg', 'suspicious', 0.6924, 'Potato', 0.7415, 'Mahyco Potato Hybrid 372', 'Consult local officer', '2026-03-10 09:06:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('db58dbb4-cd4d-406a-be46-6bd5e3e041e4', 'c587dc64-3487-44f4-ae99-28ddc43dc623', 'https://example.com/seeds/39.jpg', 'suspicious', 0.7768, 'Chilli', 0.913, 'Mahyco Chilli Hybrid 169', 'Consult local officer', '2026-03-25 09:12:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('815dd61d-9d48-457d-8550-787a0d6faf91', 'd57c79e7-e981-4893-a92b-35365d753a20', 'https://example.com/seeds/40.jpg', 'genuine', 0.6741, 'Wheat', 0.9584, 'Monsanto Wheat Hybrid 143', 'Safe to use', '2026-03-07 13:03:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('b86d9884-8473-42e8-9fbd-3baa92786630', '2971bcb1-e55b-4ec2-b9c3-85b06fa025c7', 'https://example.com/seeds/41.jpg', 'genuine', 0.8528, 'Wheat', 0.928, 'Kaveri Wheat Hybrid 219', 'Safe to use', '2026-04-30 00:48:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('24e746ec-7295-4cdb-8bc4-7c8014393795', 'd0dba60b-a694-4c5b-8872-cbe3acd2206b', 'https://example.com/seeds/42.jpg', 'fake', 0.8965, 'Potato', 0.974, 'Nuziveedu Potato Hybrid 860', 'Consult local officer', '2026-04-27 13:48:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('b6a6d907-acd5-4935-ba33-76c54f787f9a', 'a29d68c4-1dfe-4193-8a7e-b2dd9aa217bd', 'https://example.com/seeds/43.jpg', 'suspicious', 0.658, 'Mustard', 0.7068, 'Rasi Seeds Mustard Hybrid 450', 'Consult local officer', '2026-03-06 23:38:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('79151124-258c-42ea-8c48-edcd5c6fab1e', '404a6bc5-6a34-4cdd-bf4d-2e0f5433e3bd', 'https://example.com/seeds/44.jpg', 'fake', 0.9032, 'Mustard', 0.7703, 'Rasi Seeds Mustard Hybrid 766', 'Consult local officer', '2026-04-22 22:01:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('ed99ad7c-aae8-4815-8d3b-c40d6e9aedc2', 'd57c79e7-e981-4893-a92b-35365d753a20', 'https://example.com/seeds/45.jpg', 'genuine', 0.8329, 'Chilli', 0.7843, 'Mahyco Chilli Hybrid 169', 'Safe to use', '2026-04-26 21:26:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('5771ebb4-4ca1-4b64-a413-a7b9b37223aa', '8d0b4473-3ed0-41d3-8bf6-90fd18c5a6ff', 'https://example.com/seeds/46.jpg', 'suspicious', 0.8202, 'Rice', 0.9235, 'Kaveri Rice Hybrid 253', 'Consult local officer', '2026-03-25 03:18:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('f2b5163c-1191-4188-ade5-c8350e991fe8', 'f4e25321-541e-466d-8d27-332e2caffd2e', 'https://example.com/seeds/47.jpg', 'genuine', 0.8025, 'Rice', 0.8968, 'Rasi Seeds Rice Hybrid 319', 'Safe to use', '2026-05-01 01:33:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('e3ab3683-73c6-4023-93b5-df23fc633692', '221d089f-1c61-475c-84b1-b6252ce6d094', 'https://example.com/seeds/48.jpg', 'genuine', 0.9347, 'Tomato', 0.8733, 'Kaveri Tomato Hybrid 436', 'Safe to use', '2026-03-30 21:51:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('a0aebad7-6f7a-4a38-aaef-69c62df607c8', 'bca6715e-0db4-4e73-ad4d-89dc0bc60ba1', 'https://example.com/seeds/49.jpg', 'genuine', 0.6032, 'Potato', 0.932, 'Rasi Seeds Potato Hybrid 523', 'Safe to use', '2026-03-27 23:45:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('14e19d57-2800-496a-ba15-405c28677236', '908b7b17-d9e1-4184-9c6f-befa6e0d25c2', 'https://example.com/seeds/50.jpg', 'fake', 0.8746, 'Potato', 0.8891, 'Nuziveedu Potato Hybrid 747', 'Consult local officer', '2026-03-16 03:10:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('ee2bbd36-9351-4277-85d6-eece9cfb58a7', '3e3cf1ae-2940-43f6-86fb-cc1005f0df7b', 'https://example.com/seeds/51.jpg', 'suspicious', 0.9701, 'Mustard', 0.8854, 'Rasi Seeds Mustard Hybrid 450', 'Consult local officer', '2026-03-13 22:35:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('250ed9c1-b52e-49c8-8e09-33087c072899', 'c89c23fc-2d51-4b79-a781-4b62fe1bd927', 'https://example.com/seeds/52.jpg', 'fake', 0.7508, 'Maize', 0.8218, 'Kaveri Maize Hybrid 270', 'Consult local officer', '2026-03-17 14:14:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('167f9ee7-c27a-4954-acce-12cab00be410', '7b606994-6e78-4dbb-a29a-77e37894d8b9', 'https://example.com/seeds/53.jpg', 'suspicious', 0.7919, 'Tomato', 0.7311, 'Nuziveedu Tomato Hybrid 301', 'Consult local officer', '2026-03-20 18:24:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('74769059-a358-422b-b91b-7a9cbd11122a', '0e758853-777a-41ac-a9b5-d3285eff8178', 'https://example.com/seeds/54.jpg', 'fake', 0.7264, 'Maize', 0.9345, 'Syngenta Maize Hybrid 404', 'Consult local officer', '2026-04-20 20:17:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('d53f33ed-3080-45f3-b08b-c4f0760d90a7', 'c89c23fc-2d51-4b79-a781-4b62fe1bd927', 'https://example.com/seeds/55.jpg', 'fake', 0.7632, 'Potato', 0.8836, 'Mahyco Potato Hybrid 372', 'Consult local officer', '2026-04-04 18:59:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('550e3e51-2ef7-486b-94fb-13b0b4bef715', 'c7b53eb4-6795-40e7-af12-e5a814c3f637', 'https://example.com/seeds/56.jpg', 'genuine', 0.7372, 'Maize', 0.9699, 'Mahyco Maize Hybrid 181', 'Safe to use', '2026-04-08 23:35:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('8920f357-a9b6-4631-9629-69ee592682b3', '32c4d7bd-29ad-4566-98ed-1f03e3f9990d', 'https://example.com/seeds/57.jpg', 'fake', 0.8299, 'Maize', 0.868, 'Kaveri Maize Hybrid 270', 'Consult local officer', '2026-04-14 21:47:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('149513a1-2a2b-44bf-9b35-470bb33ff7c3', 'f8a908d4-a971-4236-b490-878a9ba48ef5', 'https://example.com/seeds/58.jpg', 'genuine', 0.7738, 'Tomato', 0.9587, 'Monsanto Tomato Hybrid 630', 'Safe to use', '2026-04-05 20:58:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.verification_history (id, user_id, image_url, status, confidence, vision_ai_tag, vision_ai_confidence, seed_variety, recommendation, created_at) 
VALUES ('8ec2650c-51ac-4a6b-83c3-212521711d4a', '221d089f-1c61-475c-84b1-b6252ce6d094', 'https://example.com/seeds/59.jpg', 'fake', 0.8336, 'Potato', 0.9061, 'Nuziveedu Potato Hybrid 747', 'Consult local officer', '2026-04-10 15:49:40+00') ON CONFLICT (id) DO NOTHING;

-- 5. Insert into public.product_complaints
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('61a28410-5f83-4f48-a8af-3c4fc5c6323e', '11eccc01-1638-4062-b563-7474e77ffe00', '26f56077-bbc1-4877-9e58-c234e7ce716c', 'fed3f24b-969f-46f3-8ad4-3b4bd5f39da9', 'BATCH-8974', 'Mahyco', 'Maize', 'Tengnoupal', 'other', 'Observed issues with germination in Tengnoupal.', 3, 'received', '2026-05-03 17:11:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('e2e1a99e-e52a-4e56-ac58-9147ca77a3e3', 'bca6715e-0db4-4e73-ad4d-89dc0bc60ba1', 'bbc91ac6-76c7-483b-98bc-8f2f00ae036e', '1c6f91ae-0089-4f55-a743-dc80952d4309', 'BATCH-5457', 'Kaveri', 'Wheat', 'Kamjong', 'other', 'Observed issues with germination in Kamjong.', 1, 'under_review', '2026-03-15 23:50:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('22f844a2-c152-4c95-bc45-d6474409dc1c', '26d1d0ec-2717-4cf4-97e7-e25c9c50d83c', 'fc6c99c4-5538-40a8-ac72-dba79f6aa2f9', '80f3159f-a76a-47bf-bf7b-917d95df0749', 'BATCH-5903', 'Nuziveedu', 'Maize', 'Kangpokpi', 'other', 'Observed issues with germination in Kangpokpi.', 3, 'finished', '2026-04-09 07:27:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('f0921c6e-afa0-4660-9411-60ce1882dce1', '08329ff6-dcd5-4767-a95d-b428f9f78f78', 'fe1438d4-9592-4339-be12-8b65f3d1cd92', '80f3159f-a76a-47bf-bf7b-917d95df0749', 'BATCH-4142', 'Mahyco', 'Chilli', 'Thoubal', 'poor_germination', 'Observed issues with germination in Thoubal.', 5, 'finished', '2026-03-22 04:14:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('29851317-3de1-4b77-ba86-ef38b8d707ff', '404a6bc5-6a34-4cdd-bf4d-2e0f5433e3bd', '79151124-258c-42ea-8c48-edcd5c6fab1e', '80f3159f-a76a-47bf-bf7b-917d95df0749', 'BATCH-1804', 'Rasi', 'Mustard', 'Kangpokpi', 'no_yield', 'Observed issues with germination in Kangpokpi.', 3, 'under_review', '2026-04-22 23:09:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('1d689c98-8f92-44ce-afcb-bb9b3298a9db', 'c89c23fc-2d51-4b79-a781-4b62fe1bd927', '250ed9c1-b52e-49c8-8e09-33087c072899', '1c6f91ae-0089-4f55-a743-dc80952d4309', 'BATCH-1071', 'Kaveri', 'Maize', 'Chandel', 'stunted_growth', 'Observed issues with germination in Chandel.', 5, 'received', '2026-04-06 00:39:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('1afd817c-5444-49c8-bf91-24b89cba60a1', '1094560a-6097-469f-98fc-cf5a68abfd16', '81857d31-d214-4c39-b656-b14ec22d5462', '05885028-b0f2-4c90-8c02-252edb73c635', 'BATCH-9256', 'Mahyco', 'Maize', 'Pherzawl', 'no_yield', 'Observed issues with germination in Pherzawl.', 2, 'under_review', '2026-03-20 11:33:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('33e5035a-d1f2-481c-b005-e553ed124686', '0e758853-777a-41ac-a9b5-d3285eff8178', '902f0800-56af-44ba-88be-ae60ba37472e', '9b411218-5b41-4d70-acca-a20b0874a6d7', 'BATCH-7499', 'JK', 'Potato', 'Thoubal', 'no_yield', 'Observed issues with germination in Thoubal.', 3, 'received', '2026-04-09 17:20:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('0c261012-a8b2-431b-82c8-9b702280b6b9', 'c587dc64-3487-44f4-ae99-28ddc43dc623', 'db58dbb4-cd4d-406a-be46-6bd5e3e041e4', '05885028-b0f2-4c90-8c02-252edb73c635', 'BATCH-2953', 'Mahyco', 'Chilli', 'Senapati', 'other', 'Observed issues with germination in Senapati.', 5, 'received', '2026-04-24 08:49:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('5f2d2624-fa75-45ee-b62c-7e7914a5cb68', '32c4d7bd-29ad-4566-98ed-1f03e3f9990d', '8920f357-a9b6-4631-9629-69ee592682b3', '05885028-b0f2-4c90-8c02-252edb73c635', 'BATCH-9510', 'Kaveri', 'Maize', 'Churachandpur', 'stunted_growth', 'Observed issues with germination in Churachandpur.', 4, 'received', '2026-03-04 21:41:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('1501a3bc-3a82-457b-80ee-c8913c2dbcda', '8d0b4473-3ed0-41d3-8bf6-90fd18c5a6ff', 'f6607be2-720c-4f7e-961e-c1f11df67648', '80f3159f-a76a-47bf-bf7b-917d95df0749', 'BATCH-7538', 'Mahyco', 'Maize', 'Bishnupur', 'physical_impurity', 'Observed issues with germination in Bishnupur.', 3, 'finished', '2026-04-26 12:57:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('d4d992d7-2fb8-4f73-a379-03520e893a68', '11eccc01-1638-4062-b563-7474e77ffe00', '895870d9-7c3c-423a-9979-bc5364ed4fc8', '80f3159f-a76a-47bf-bf7b-917d95df0749', 'BATCH-7651', 'Mahyco', 'Potato', 'Tengnoupal', 'pest_susceptibility', 'Observed issues with germination in Tengnoupal.', 3, 'finished', '2026-03-11 11:09:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('59633066-42ce-4f59-84e9-efbfdbd8ee57', 'b0f528fc-1837-49bc-8aba-9b91e3956534', 'b4a938ee-4d92-4309-adbf-1399b9767020', '1c6f91ae-0089-4f55-a743-dc80952d4309', 'BATCH-6491', 'Monsanto', 'Wheat', 'Imphal West', 'other', 'Observed issues with germination in Imphal West.', 2, 'finished', '2026-03-17 21:42:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('5bef7e0a-5fef-45a8-9839-41870a0477aa', 'd0dba60b-a694-4c5b-8872-cbe3acd2206b', '24e746ec-7295-4cdb-8bc4-7c8014393795', 'fed3f24b-969f-46f3-8ad4-3b4bd5f39da9', 'BATCH-6132', 'Nuziveedu', 'Potato', 'Kakching', 'stunted_growth', 'Observed issues with germination in Kakching.', 5, 'received', '2026-05-04 07:07:40+00') ON CONFLICT (id) DO NOTHING;
INSERT INTO public.product_complaints (id, user_id, verification_id, assigned_officer_id, batch_number, brand_name, crop_type, district, issue_type, description, severity_score, status, created_at) 
VALUES ('f2684b95-f152-4387-af54-193edada317d', '7b606994-6e78-4dbb-a29a-77e37894d8b9', '167f9ee7-c27a-4954-acce-12cab00be410', 'd8e5526a-702c-425c-88c4-9eadd068e7ff', 'BATCH-5910', 'Nuziveedu', 'Tomato', 'Imphal West', 'physical_impurity', 'Observed issues with germination in Imphal West.', 4, 'under_review', '2026-04-27 18:27:40+00') ON CONFLICT (id) DO NOTHING;
