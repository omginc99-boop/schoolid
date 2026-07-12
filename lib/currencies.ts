// Currency registry: every African currency (all 54 countries covered),
// plus the major international ones schools abroad may bill in.
// schools.currency stores the ISO 4217 code; all money formatting flows
// through lib/format.ts using the symbols here.

export interface CurrencyInfo {
  code: string;      // ISO 4217
  name: string;
  symbol: string;
  countries: string[];
}

export const CURRENCIES: CurrencyInfo[] = [
  // ---- Africa (A→Z by code) ----
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', countries: ['Angola'] },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', countries: ['Burundi'] },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', countries: ['Botswana'] },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', countries: ['DR Congo', 'Democratic Republic of the Congo', 'Congo-Kinshasa', 'DRC'] },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'CVE', countries: ['Cape Verde', 'Cabo Verde'] },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', countries: ['Djibouti'] },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', countries: ['Algeria'] },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', countries: ['Egypt'] },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', countries: ['Eritrea'] },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', countries: ['Ethiopia'] },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', countries: ['Ghana'] },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', countries: ['Gambia', 'The Gambia'] },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', countries: ['Guinea'] },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', countries: ['Kenya'] },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', countries: ['Comoros'] },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', countries: ['Liberia'] },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', countries: ['Lesotho'] },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD', countries: ['Libya'] },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', countries: ['Morocco', 'Western Sahara'] },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', countries: ['Madagascar'] },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', countries: ['Mauritania'] },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', countries: ['Mauritius'] },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', countries: ['Malawi'] },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', countries: ['Mozambique'] },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', countries: ['Namibia'] },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', countries: ['Nigeria'] },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', countries: ['Rwanda'] },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: 'SR', countries: ['Seychelles'] },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG', countries: ['Sudan'] },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', countries: ['Sierra Leone'] },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', countries: ['Somalia'] },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: 'SS£', countries: ['South Sudan'] },
  { code: 'STN', name: 'São Tomé & Príncipe Dobra', symbol: 'Db', countries: ['São Tomé and Príncipe', 'Sao Tome and Principe'] },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', countries: ['Eswatini', 'Swaziland'] },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', countries: ['Tunisia'] },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', countries: ['Tanzania'] },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', countries: ['Uganda'] },
  {
    code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA',
    countries: ['Cameroon', 'Central African Republic', 'Chad', 'Republic of the Congo', 'Congo-Brazzaville', 'Congo', 'Equatorial Guinea', 'Gabon'],
  },
  {
    code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA',
    countries: ['Benin', 'Burkina Faso', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast', 'Guinea-Bissau', 'Mali', 'Niger', 'Senegal', 'Togo'],
  },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', countries: ['South Africa'] },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'K', countries: ['Zambia'] },
  { code: 'ZWG', name: 'Zimbabwe Gold', symbol: 'ZiG', countries: ['Zimbabwe'] },
  // ---- International ----
  { code: 'USD', name: 'US Dollar', symbol: '$', countries: ['United States'] },
  { code: 'EUR', name: 'Euro', symbol: '€', countries: [] },
  { code: 'GBP', name: 'British Pound', symbol: '£', countries: ['United Kingdom'] },
];

const AFRICAN_CODES = new Set(CURRENCIES.slice(0, 42).map(c => c.code));

export const AFRICAN_CURRENCIES = CURRENCIES.filter(c => AFRICAN_CODES.has(c.code));
export const INTERNATIONAL_CURRENCIES = CURRENCIES.filter(c => !AFRICAN_CODES.has(c.code));

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map(c => [c.code, c]),
);

/** '₦' for NGN, 'R' for ZAR, falls back to the code itself. */
export function currencySymbol(code: string): string {
  return CURRENCY_MAP[code?.toUpperCase()]?.symbol ?? code;
}

const COUNTRY_TO_CURRENCY: Record<string, string> = Object.fromEntries(
  CURRENCIES.flatMap(c => c.countries.map(country => [country.toLowerCase(), c.code])),
);

/** Best-guess currency for a country name (case/spacing tolerant). Defaults to NGN. */
export function currencyForCountry(country: string): string {
  return COUNTRY_TO_CURRENCY[country.trim().toLowerCase()] ?? 'NGN';
}
