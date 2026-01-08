// Known fake/blacklisted brands for verification
export const BLACKLISTED_BRANDS = [
  'fake seeds co',
  'unknown brand',
  'xyz seeds',
  'cheap seeds ltd',
  'miracle grow fake',
  'counterfeit agro',
];

// Trusted authorities for seed certification
export const TRUSTED_AUTHORITIES = [
  'Indian Council of Agricultural Research (ICAR)',
  'National Seeds Corporation (NSC)',
  'State Seeds Corporation',
  'Agricultural University',
  'Central Seed Certification Board',
];

// Mock seed registry data
export const SEED_REGISTRY = [
  {
    id: '1',
    crop_type: 'Rice',
    region: 'Telangana',
    variety_name: 'BPT-5204 (Samba Mahsuri)',
    issuing_authority: 'Telangana State Seeds Development Corporation',
    description:
      'Fine grain, medium duration variety suitable for kharif and rabi seasons. High yield potential of 5-6 tonnes per hectare.',
    certification_status: 'certified' as const,
  },
  {
    id: '2',
    crop_type: 'Rice',
    region: 'Andhra Pradesh',
    variety_name: 'MTU-1010 (Cotton Dora Sannalu)',
    issuing_authority: 'ANGRAU',
    description:
      'Short duration variety with excellent cooking quality. Resistant to blast and bacterial blight.',
    certification_status: 'certified' as const,
  },
  {
    id: '3',
    crop_type: 'Wheat',
    region: 'Punjab',
    variety_name: 'HD-2967',
    issuing_authority: 'ICAR-Indian Agricultural Research Institute',
    description:
      'High yielding variety with good chapati making quality. Suitable for timely sown irrigated conditions.',
    certification_status: 'certified' as const,
  },
  {
    id: '4',
    crop_type: 'Cotton',
    region: 'Gujarat',
    variety_name: 'Bt Cotton Hybrid',
    issuing_authority: 'Gujarat State Seeds Corporation',
    description:
      'Bollworm resistant hybrid with high fiber quality. Suitable for irrigated and rainfed conditions.',
    certification_status: 'registered' as const,
  },
  {
    id: '5',
    crop_type: 'Maize',
    region: 'Karnataka',
    variety_name: 'DHM-117',
    issuing_authority: 'UAS Dharwad',
    description:
      'Single cross hybrid with high grain yield. Tolerant to turcicum leaf blight.',
    certification_status: 'certified' as const,
  },
  {
    id: '6',
    crop_type: 'Soybean',
    region: 'Madhya Pradesh',
    variety_name: 'JS-335',
    issuing_authority: 'JNKVV Jabalpur',
    description:
      'Medium duration variety with high oil content. Resistant to major diseases.',
    certification_status: 'certified' as const,
  },
  {
    id: '7',
    crop_type: 'Groundnut',
    region: 'Andhra Pradesh',
    variety_name: 'K-6',
    issuing_authority: 'ANGRAU',
    description:
      'Bunch type variety with bold kernels. Good shelling percentage and oil content.',
    certification_status: 'approved' as const,
  },
  {
    id: '8',
    crop_type: 'Pulses',
    region: 'Maharashtra',
    variety_name: 'BSMR-736 (Pigeon Pea)',
    issuing_authority: 'PDKV Akola',
    description:
      'Short duration variety with wilt resistance. High dal recovery percentage.',
    certification_status: 'certified' as const,
  },
];

// Mock OCR responses for different scenarios
export const MOCK_OCR_RESPONSES = {
  genuine: {
    detected_text:
      'Brand: National Seeds Corporation\nVariety: BPT-5204\nBatch No: NSC-2024-78456\nMRP: ₹450\nPacked: Jan 2024\nExpiry: Dec 2025\nLicense: SEED/TG/2024/1234',
    confidence: 0.92,
  },
  suspicious: {
    detected_text:
      'Brand: Premium Agro Seeds\nVariety: Unknown Hybrid\nBatch: PAG-2024\nPrice: ₹300\nDate: 2024',
    confidence: 0.68,
  },
  fake: {
    detected_text:
      'Brand: XYZ Seeds Company\nBest Seeds Ever\nMRP: ₹200\nNo batch number visible',
    confidence: 0.35,
  },
};

// Chat response templates
export const CHAT_TEMPLATES = {
  greeting:
    "Hello! I'm your agricultural assistant. I can help you with seed verification results, farming recommendations, and general agricultural queries. How can I assist you today?",
  verificationHelp:
    'Based on your recent verification, here are some insights: ',
  noData:
    "I don't have any recent verification data for your account. Would you like to verify a seed or fertilizer product first?",
  generalAdvice:
    'For best results, always purchase seeds from authorized dealers and check for proper certification labels.',
};
