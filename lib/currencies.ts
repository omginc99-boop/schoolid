// Currency registry — every national currency in circulation worldwide
// (154 ISO 4217 codes; excludes non-circulating codes such as precious
// metals, IMF SDRs and test codes).
//
// schools.currency stores the ISO 4217 code. All money formatting flows
// through lib/format.ts using this registry. African currencies are listed
// first: they are SchoolID's primary market and win country-name conflicts
// when the country → currency map is built.

export type CurrencyRegion =
  | 'Africa' | 'Americas' | 'Asia & Middle East' | 'Europe' | 'Oceania';

export interface CurrencyInfo {
  code: string;            // ISO 4217
  name: string;
  symbol: string;
  region: CurrencyRegion;
  /** ISO 4217 minor units. Defaults to 2 — matters for payment gateways. */
  decimals?: 0 | 2 | 3;
  /** Symbol conventionally written after the amount (e.g. "1 200 zł"). */
  suffix?: true;
  countries: string[];
}

export const CURRENCIES: CurrencyInfo[] = [
  // ───────────────────────── Africa (42) ─────────────────────────
  { code: 'AOA', name: 'Angolan Kwanza', symbol: 'Kz', region: 'Africa', countries: ['Angola'] },
  { code: 'BIF', name: 'Burundian Franc', symbol: 'FBu', region: 'Africa', decimals: 0, countries: ['Burundi'] },
  { code: 'BWP', name: 'Botswana Pula', symbol: 'P', region: 'Africa', countries: ['Botswana'] },
  { code: 'CDF', name: 'Congolese Franc', symbol: 'FC', region: 'Africa', countries: ['DR Congo', 'Democratic Republic of the Congo', 'Congo-Kinshasa', 'DRC'] },
  { code: 'CVE', name: 'Cape Verdean Escudo', symbol: 'CVE', region: 'Africa', countries: ['Cape Verde', 'Cabo Verde'] },
  { code: 'DJF', name: 'Djiboutian Franc', symbol: 'Fdj', region: 'Africa', decimals: 0, countries: ['Djibouti'] },
  { code: 'DZD', name: 'Algerian Dinar', symbol: 'DA', region: 'Africa', countries: ['Algeria'] },
  { code: 'EGP', name: 'Egyptian Pound', symbol: 'E£', region: 'Africa', countries: ['Egypt'] },
  { code: 'ERN', name: 'Eritrean Nakfa', symbol: 'Nfk', region: 'Africa', countries: ['Eritrea'] },
  { code: 'ETB', name: 'Ethiopian Birr', symbol: 'Br', region: 'Africa', countries: ['Ethiopia'] },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵', region: 'Africa', countries: ['Ghana'] },
  { code: 'GMD', name: 'Gambian Dalasi', symbol: 'D', region: 'Africa', countries: ['Gambia', 'The Gambia'] },
  { code: 'GNF', name: 'Guinean Franc', symbol: 'FG', region: 'Africa', decimals: 0, countries: ['Guinea'] },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh', region: 'Africa', countries: ['Kenya'] },
  { code: 'KMF', name: 'Comorian Franc', symbol: 'CF', region: 'Africa', decimals: 0, countries: ['Comoros'] },
  { code: 'LRD', name: 'Liberian Dollar', symbol: 'L$', region: 'Africa', countries: ['Liberia'] },
  { code: 'LSL', name: 'Lesotho Loti', symbol: 'L', region: 'Africa', countries: ['Lesotho'] },
  { code: 'LYD', name: 'Libyan Dinar', symbol: 'LD', region: 'Africa', decimals: 3, countries: ['Libya'] },
  { code: 'MAD', name: 'Moroccan Dirham', symbol: 'DH', region: 'Africa', countries: ['Morocco', 'Western Sahara'] },
  { code: 'MGA', name: 'Malagasy Ariary', symbol: 'Ar', region: 'Africa', decimals: 0, countries: ['Madagascar'] },
  { code: 'MRU', name: 'Mauritanian Ouguiya', symbol: 'UM', region: 'Africa', countries: ['Mauritania'] },
  { code: 'MUR', name: 'Mauritian Rupee', symbol: '₨', region: 'Africa', countries: ['Mauritius'] },
  { code: 'MWK', name: 'Malawian Kwacha', symbol: 'MK', region: 'Africa', countries: ['Malawi'] },
  { code: 'MZN', name: 'Mozambican Metical', symbol: 'MT', region: 'Africa', countries: ['Mozambique'] },
  { code: 'NAD', name: 'Namibian Dollar', symbol: 'N$', region: 'Africa', countries: ['Namibia'] },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦', region: 'Africa', countries: ['Nigeria'] },
  { code: 'RWF', name: 'Rwandan Franc', symbol: 'FRw', region: 'Africa', decimals: 0, countries: ['Rwanda'] },
  { code: 'SCR', name: 'Seychellois Rupee', symbol: 'SR', region: 'Africa', countries: ['Seychelles'] },
  { code: 'SDG', name: 'Sudanese Pound', symbol: 'SDG', region: 'Africa', countries: ['Sudan'] },
  { code: 'SLE', name: 'Sierra Leonean Leone', symbol: 'Le', region: 'Africa', countries: ['Sierra Leone'] },
  { code: 'SOS', name: 'Somali Shilling', symbol: 'Sh.So.', region: 'Africa', countries: ['Somalia'] },
  { code: 'SSP', name: 'South Sudanese Pound', symbol: 'SS£', region: 'Africa', countries: ['South Sudan'] },
  { code: 'STN', name: 'São Tomé & Príncipe Dobra', symbol: 'Db', region: 'Africa', countries: ['São Tomé and Príncipe', 'Sao Tome and Principe'] },
  { code: 'SZL', name: 'Swazi Lilangeni', symbol: 'E', region: 'Africa', countries: ['Eswatini', 'Swaziland'] },
  { code: 'TND', name: 'Tunisian Dinar', symbol: 'DT', region: 'Africa', decimals: 3, countries: ['Tunisia'] },
  { code: 'TZS', name: 'Tanzanian Shilling', symbol: 'TSh', region: 'Africa', countries: ['Tanzania'] },
  { code: 'UGX', name: 'Ugandan Shilling', symbol: 'USh', region: 'Africa', decimals: 0, countries: ['Uganda'] },
  {
    code: 'XAF', name: 'Central African CFA Franc', symbol: 'FCFA', region: 'Africa', decimals: 0,
    countries: ['Cameroon', 'Central African Republic', 'Chad', 'Republic of the Congo', 'Congo-Brazzaville', 'Congo', 'Equatorial Guinea', 'Gabon'],
  },
  {
    code: 'XOF', name: 'West African CFA Franc', symbol: 'CFA', region: 'Africa', decimals: 0,
    countries: ['Benin', 'Burkina Faso', "Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast', 'Guinea-Bissau', 'Mali', 'Niger', 'Senegal', 'Togo'],
  },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R', region: 'Africa', countries: ['South Africa'] },
  { code: 'ZMW', name: 'Zambian Kwacha', symbol: 'K', region: 'Africa', countries: ['Zambia'] },
  { code: 'ZWG', name: 'Zimbabwe Gold', symbol: 'ZiG', region: 'Africa', countries: ['Zimbabwe'] },

  // ───────────────────────── Americas (32) ─────────────────────────
  { code: 'ARS', name: 'Argentine Peso', symbol: '$', region: 'Americas', countries: ['Argentina'] },
  { code: 'AWG', name: 'Aruban Florin', symbol: 'ƒ', region: 'Americas', countries: ['Aruba'] },
  { code: 'BBD', name: 'Barbadian Dollar', symbol: 'Bds$', region: 'Americas', countries: ['Barbados'] },
  { code: 'BMD', name: 'Bermudian Dollar', symbol: 'BD$', region: 'Americas', countries: ['Bermuda'] },
  { code: 'BOB', name: 'Bolivian Boliviano', symbol: 'Bs', region: 'Americas', countries: ['Bolivia'] },
  { code: 'BRL', name: 'Brazilian Real', symbol: 'R$', region: 'Americas', countries: ['Brazil'] },
  { code: 'BSD', name: 'Bahamian Dollar', symbol: 'B$', region: 'Americas', countries: ['Bahamas', 'The Bahamas'] },
  { code: 'BZD', name: 'Belize Dollar', symbol: 'BZ$', region: 'Americas', countries: ['Belize'] },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', region: 'Americas', countries: ['Canada'] },
  { code: 'CLP', name: 'Chilean Peso', symbol: 'CLP$', region: 'Americas', decimals: 0, countries: ['Chile'] },
  { code: 'COP', name: 'Colombian Peso', symbol: 'COL$', region: 'Americas', countries: ['Colombia'] },
  { code: 'CRC', name: 'Costa Rican Colón', symbol: '₡', region: 'Americas', countries: ['Costa Rica'] },
  { code: 'CUP', name: 'Cuban Peso', symbol: '₱', region: 'Americas', countries: ['Cuba'] },
  { code: 'DOP', name: 'Dominican Peso', symbol: 'RD$', region: 'Americas', countries: ['Dominican Republic'] },
  { code: 'GTQ', name: 'Guatemalan Quetzal', symbol: 'Q', region: 'Americas', countries: ['Guatemala'] },
  { code: 'GYD', name: 'Guyanese Dollar', symbol: 'GY$', region: 'Americas', countries: ['Guyana'] },
  { code: 'HNL', name: 'Honduran Lempira', symbol: 'L', region: 'Americas', countries: ['Honduras'] },
  { code: 'HTG', name: 'Haitian Gourde', symbol: 'G', region: 'Americas', countries: ['Haiti'] },
  { code: 'JMD', name: 'Jamaican Dollar', symbol: 'J$', region: 'Americas', countries: ['Jamaica'] },
  { code: 'KYD', name: 'Cayman Islands Dollar', symbol: 'CI$', region: 'Americas', countries: ['Cayman Islands'] },
  { code: 'MXN', name: 'Mexican Peso', symbol: 'MX$', region: 'Americas', countries: ['Mexico'] },
  { code: 'NIO', name: 'Nicaraguan Córdoba', symbol: 'C$', region: 'Americas', countries: ['Nicaragua'] },
  { code: 'PAB', name: 'Panamanian Balboa', symbol: 'B/.', region: 'Americas', countries: ['Panama'] },
  { code: 'PEN', name: 'Peruvian Sol', symbol: 'S/', region: 'Americas', countries: ['Peru'] },
  { code: 'PYG', name: 'Paraguayan Guaraní', symbol: '₲', region: 'Americas', decimals: 0, countries: ['Paraguay'] },
  { code: 'SRD', name: 'Surinamese Dollar', symbol: 'SR$', region: 'Americas', countries: ['Suriname'] },
  { code: 'TTD', name: 'Trinidad & Tobago Dollar', symbol: 'TT$', region: 'Americas', countries: ['Trinidad and Tobago'] },
  { code: 'USD', name: 'US Dollar', symbol: '$', region: 'Americas', countries: ['United States', 'USA', 'Ecuador', 'El Salvador', 'Puerto Rico'] },
  { code: 'UYU', name: 'Uruguayan Peso', symbol: '$U', region: 'Americas', countries: ['Uruguay'] },
  { code: 'VES', name: 'Venezuelan Bolívar', symbol: 'Bs.', region: 'Americas', countries: ['Venezuela'] },
  { code: 'XCD', name: 'East Caribbean Dollar', symbol: 'EC$', region: 'Americas', countries: ['Antigua and Barbuda', 'Dominica', 'Grenada', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Anguilla', 'Montserrat'] },
  { code: 'XCG', name: 'Caribbean Guilder', symbol: 'Cg', region: 'Americas', countries: ['Curaçao', 'Curacao', 'Sint Maarten'] },

  // ─────────────────── Asia & Middle East (47) ───────────────────
  { code: 'AED', name: 'UAE Dirham', symbol: 'AED', region: 'Asia & Middle East', countries: ['United Arab Emirates', 'UAE'] },
  { code: 'AFN', name: 'Afghan Afghani', symbol: '؋', region: 'Asia & Middle East', countries: ['Afghanistan'] },
  { code: 'AMD', name: 'Armenian Dram', symbol: '֏', region: 'Asia & Middle East', countries: ['Armenia'] },
  { code: 'AZN', name: 'Azerbaijani Manat', symbol: '₼', region: 'Asia & Middle East', countries: ['Azerbaijan'] },
  { code: 'BDT', name: 'Bangladeshi Taka', symbol: '৳', region: 'Asia & Middle East', countries: ['Bangladesh'] },
  { code: 'BHD', name: 'Bahraini Dinar', symbol: 'BD', region: 'Asia & Middle East', decimals: 3, countries: ['Bahrain'] },
  { code: 'BND', name: 'Brunei Dollar', symbol: 'B$', region: 'Asia & Middle East', countries: ['Brunei'] },
  { code: 'BTN', name: 'Bhutanese Ngultrum', symbol: 'Nu.', region: 'Asia & Middle East', countries: ['Bhutan'] },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', region: 'Asia & Middle East', countries: ['China'] },
  { code: 'GEL', name: 'Georgian Lari', symbol: '₾', region: 'Asia & Middle East', countries: ['Georgia'] },
  { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$', region: 'Asia & Middle East', countries: ['Hong Kong'] },
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', region: 'Asia & Middle East', countries: ['Indonesia'] },
  { code: 'ILS', name: 'Israeli New Shekel', symbol: '₪', region: 'Asia & Middle East', countries: ['Israel', 'Palestine'] },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', region: 'Asia & Middle East', countries: ['India'] },
  { code: 'IQD', name: 'Iraqi Dinar', symbol: 'ID', region: 'Asia & Middle East', decimals: 3, countries: ['Iraq'] },
  { code: 'IRR', name: 'Iranian Rial', symbol: '﷼', region: 'Asia & Middle East', decimals: 0, countries: ['Iran'] },
  { code: 'JOD', name: 'Jordanian Dinar', symbol: 'JD', region: 'Asia & Middle East', decimals: 3, countries: ['Jordan'] },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', region: 'Asia & Middle East', decimals: 0, countries: ['Japan'] },
  { code: 'KGS', name: 'Kyrgyzstani Som', symbol: 'с', region: 'Asia & Middle East', suffix: true, countries: ['Kyrgyzstan'] },
  { code: 'KHR', name: 'Cambodian Riel', symbol: '៛', region: 'Asia & Middle East', countries: ['Cambodia'] },
  { code: 'KPW', name: 'North Korean Won', symbol: '₩', region: 'Asia & Middle East', countries: ['North Korea'] },
  { code: 'KRW', name: 'South Korean Won', symbol: '₩', region: 'Asia & Middle East', decimals: 0, countries: ['South Korea', 'Korea'] },
  { code: 'KWD', name: 'Kuwaiti Dinar', symbol: 'KD', region: 'Asia & Middle East', decimals: 3, countries: ['Kuwait'] },
  { code: 'KZT', name: 'Kazakhstani Tenge', symbol: '₸', region: 'Asia & Middle East', suffix: true, countries: ['Kazakhstan'] },
  { code: 'LAK', name: 'Lao Kip', symbol: '₭', region: 'Asia & Middle East', countries: ['Laos'] },
  { code: 'LBP', name: 'Lebanese Pound', symbol: 'L£', region: 'Asia & Middle East', decimals: 0, countries: ['Lebanon'] },
  { code: 'LKR', name: 'Sri Lankan Rupee', symbol: 'Rs', region: 'Asia & Middle East', countries: ['Sri Lanka'] },
  { code: 'MMK', name: 'Myanmar Kyat', symbol: 'K', region: 'Asia & Middle East', countries: ['Myanmar', 'Burma'] },
  { code: 'MNT', name: 'Mongolian Tögrög', symbol: '₮', region: 'Asia & Middle East', countries: ['Mongolia'] },
  { code: 'MOP', name: 'Macanese Pataca', symbol: 'MOP$', region: 'Asia & Middle East', countries: ['Macau', 'Macao'] },
  { code: 'MVR', name: 'Maldivian Rufiyaa', symbol: 'Rf', region: 'Asia & Middle East', countries: ['Maldives'] },
  { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM', region: 'Asia & Middle East', countries: ['Malaysia'] },
  { code: 'NPR', name: 'Nepalese Rupee', symbol: 'Rs', region: 'Asia & Middle East', countries: ['Nepal'] },
  { code: 'OMR', name: 'Omani Rial', symbol: 'OR', region: 'Asia & Middle East', decimals: 3, countries: ['Oman'] },
  { code: 'PHP', name: 'Philippine Peso', symbol: '₱', region: 'Asia & Middle East', countries: ['Philippines'] },
  { code: 'PKR', name: 'Pakistani Rupee', symbol: 'Rs', region: 'Asia & Middle East', countries: ['Pakistan'] },
  { code: 'QAR', name: 'Qatari Riyal', symbol: 'QR', region: 'Asia & Middle East', countries: ['Qatar'] },
  { code: 'SAR', name: 'Saudi Riyal', symbol: 'SR', region: 'Asia & Middle East', countries: ['Saudi Arabia'] },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', region: 'Asia & Middle East', countries: ['Singapore'] },
  { code: 'SYP', name: 'Syrian Pound', symbol: 'S£', region: 'Asia & Middle East', countries: ['Syria'] },
  { code: 'THB', name: 'Thai Baht', symbol: '฿', region: 'Asia & Middle East', countries: ['Thailand'] },
  { code: 'TJS', name: 'Tajikistani Somoni', symbol: 'SM', region: 'Asia & Middle East', suffix: true, countries: ['Tajikistan'] },
  { code: 'TMT', name: 'Turkmenistani Manat', symbol: 'm', region: 'Asia & Middle East', suffix: true, countries: ['Turkmenistan'] },
  { code: 'TWD', name: 'New Taiwan Dollar', symbol: 'NT$', region: 'Asia & Middle East', countries: ['Taiwan'] },
  { code: 'UZS', name: 'Uzbekistani Som', symbol: "so'm", region: 'Asia & Middle East', suffix: true, countries: ['Uzbekistan'] },
  { code: 'VND', name: 'Vietnamese Dong', symbol: '₫', region: 'Asia & Middle East', decimals: 0, suffix: true, countries: ['Vietnam'] },
  { code: 'YER', name: 'Yemeni Rial', symbol: 'YR', region: 'Asia & Middle East', countries: ['Yemen'] },

  // ───────────────────────── Europe (24) ─────────────────────────
  { code: 'ALL', name: 'Albanian Lek', symbol: 'L', region: 'Europe', suffix: true, countries: ['Albania'] },
  { code: 'BAM', name: 'Bosnia-Herzegovina Convertible Mark', symbol: 'KM', region: 'Europe', suffix: true, countries: ['Bosnia and Herzegovina'] },
  { code: 'BGN', name: 'Bulgarian Lev', symbol: 'лв', region: 'Europe', suffix: true, countries: ['Bulgaria'] },
  { code: 'BYN', name: 'Belarusian Ruble', symbol: 'Br', region: 'Europe', suffix: true, countries: ['Belarus'] },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', region: 'Europe', countries: ['Switzerland', 'Liechtenstein'] },
  { code: 'CZK', name: 'Czech Koruna', symbol: 'Kč', region: 'Europe', suffix: true, countries: ['Czechia', 'Czech Republic'] },
  { code: 'DKK', name: 'Danish Krone', symbol: 'kr', region: 'Europe', suffix: true, countries: ['Denmark', 'Greenland', 'Faroe Islands'] },
  {
    code: 'EUR', name: 'Euro', symbol: '€', region: 'Europe',
    countries: ['Austria', 'Belgium', 'Croatia', 'Cyprus', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Portugal', 'Slovakia', 'Slovenia', 'Spain', 'Andorra', 'Monaco', 'Montenegro', 'San Marino', 'Vatican City', 'Kosovo'],
  },
  { code: 'FKP', name: 'Falkland Islands Pound', symbol: 'FK£', region: 'Europe', countries: ['Falkland Islands'] },
  { code: 'GBP', name: 'British Pound', symbol: '£', region: 'Europe', countries: ['United Kingdom', 'UK', 'England', 'Scotland', 'Wales', 'Northern Ireland', 'Guernsey', 'Jersey', 'Isle of Man'] },
  { code: 'GIP', name: 'Gibraltar Pound', symbol: 'GI£', region: 'Europe', countries: ['Gibraltar'] },
  { code: 'HUF', name: 'Hungarian Forint', symbol: 'Ft', region: 'Europe', suffix: true, countries: ['Hungary'] },
  { code: 'ISK', name: 'Icelandic Króna', symbol: 'kr', region: 'Europe', decimals: 0, suffix: true, countries: ['Iceland'] },
  { code: 'MDL', name: 'Moldovan Leu', symbol: 'L', region: 'Europe', suffix: true, countries: ['Moldova'] },
  { code: 'MKD', name: 'Macedonian Denar', symbol: 'ден', region: 'Europe', suffix: true, countries: ['North Macedonia', 'Macedonia'] },
  { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr', region: 'Europe', suffix: true, countries: ['Norway'] },
  { code: 'PLN', name: 'Polish Złoty', symbol: 'zł', region: 'Europe', suffix: true, countries: ['Poland'] },
  { code: 'RON', name: 'Romanian Leu', symbol: 'lei', region: 'Europe', suffix: true, countries: ['Romania'] },
  { code: 'RSD', name: 'Serbian Dinar', symbol: 'дин', region: 'Europe', suffix: true, countries: ['Serbia'] },
  { code: 'RUB', name: 'Russian Ruble', symbol: '₽', region: 'Europe', suffix: true, countries: ['Russia'] },
  { code: 'SEK', name: 'Swedish Krona', symbol: 'kr', region: 'Europe', suffix: true, countries: ['Sweden'] },
  { code: 'SHP', name: 'Saint Helena Pound', symbol: 'SH£', region: 'Europe', countries: ['Saint Helena'] },
  { code: 'TRY', name: 'Turkish Lira', symbol: '₺', region: 'Europe', countries: ['Turkey', 'Türkiye'] },
  { code: 'UAH', name: 'Ukrainian Hryvnia', symbol: '₴', region: 'Europe', countries: ['Ukraine'] },

  // ───────────────────────── Oceania (9) ─────────────────────────
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', region: 'Oceania', countries: ['Australia', 'Kiribati', 'Nauru', 'Tuvalu'] },
  { code: 'FJD', name: 'Fijian Dollar', symbol: 'FJ$', region: 'Oceania', countries: ['Fiji'] },
  { code: 'NZD', name: 'New Zealand Dollar', symbol: 'NZ$', region: 'Oceania', countries: ['New Zealand', 'Cook Islands', 'Niue', 'Tokelau'] },
  { code: 'PGK', name: 'Papua New Guinean Kina', symbol: 'K', region: 'Oceania', countries: ['Papua New Guinea'] },
  { code: 'SBD', name: 'Solomon Islands Dollar', symbol: 'SI$', region: 'Oceania', countries: ['Solomon Islands'] },
  { code: 'TOP', name: 'Tongan Paʻanga', symbol: 'T$', region: 'Oceania', countries: ['Tonga'] },
  { code: 'VUV', name: 'Vanuatu Vatu', symbol: 'VT', region: 'Oceania', decimals: 0, countries: ['Vanuatu'] },
  { code: 'WST', name: 'Samoan Tala', symbol: 'WS$', region: 'Oceania', countries: ['Samoa'] },
  { code: 'XPF', name: 'CFP Franc', symbol: '₣', region: 'Oceania', decimals: 0, suffix: true, countries: ['New Caledonia', 'French Polynesia', 'Wallis and Futuna'] },
];

export const REGION_ORDER: CurrencyRegion[] = [
  'Africa', 'Americas', 'Asia & Middle East', 'Europe', 'Oceania',
];

export const CURRENCY_MAP: Record<string, CurrencyInfo> = Object.fromEntries(
  CURRENCIES.map(c => [c.code, c]),
);

export const AFRICAN_CURRENCIES = CURRENCIES.filter(c => c.region === 'Africa');

/** Currencies grouped by region, Africa first — drives the picker. */
export const CURRENCIES_BY_REGION: { region: CurrencyRegion; currencies: CurrencyInfo[] }[] =
  REGION_ORDER.map(region => ({
    region,
    currencies: CURRENCIES.filter(c => c.region === region),
  }));

export function currencyInfo(code: string): CurrencyInfo | undefined {
  return CURRENCY_MAP[code?.toUpperCase()];
}

/** '₦' for NGN, 'R' for ZAR, '€' for EUR — falls back to the code itself. */
export function currencySymbol(code: string): string {
  return currencyInfo(code)?.symbol ?? code;
}

/** ISO 4217 minor units — JPY 0, KWD 3, most others 2. */
export function currencyDecimals(code: string): number {
  return currencyInfo(code)?.decimals ?? 2;
}

/**
 * Convert a display amount to the gateway's minor unit (kobo, cents, …).
 * Paystack and most PSPs charge in minor units; JPY-style currencies have none.
 */
export function toMinorUnits(amount: number, code: string): number {
  return Math.round(amount * 10 ** currencyDecimals(code));
}

// Built from the array above; Africa comes first, so an African country name
// always wins if the same name appears twice.
const COUNTRY_TO_CURRENCY: Record<string, string> = (() => {
  const map: Record<string, string> = {};
  for (const c of CURRENCIES) {
    for (const country of c.countries) {
      const key = country.toLowerCase();
      if (!(key in map)) map[key] = c.code;
    }
  }
  return map;
})();

/** Best-guess currency for a country name (case/spacing tolerant). */
export function currencyForCountry(country: string): string {
  return COUNTRY_TO_CURRENCY[country.trim().toLowerCase()] ?? 'NGN';
}
