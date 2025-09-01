
'use server';

import fetch from 'node-fetch';

// IMPORTANT: To enable this feature, get a free API key from https://www.exchangerate-api.com
// and add it to a .env.local file in the root of your project:
// EXCHANGERATE_API_KEY=your_api_key_here

const API_KEY = process.env.EXCHANGERATE_API_KEY;
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/USD`;

export interface CurrencyData {
  rates: { [key: string]: number };
  names: { [key: string]: string };
}

// Cache the response to avoid hitting the API on every request
let cachedData: CurrencyData | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

const currencyNames: { [key: string]: string } = {
    "AED": "UAE Dirham",
    "AFN": "Afghan Afghani",
    "ALL": "Albanian Lek",
    "AMD": "Armenian Dram",
    "ANG": "Netherlands Antillean Guilder",
    "AOA": "Angolan Kwanza",
    "ARS": "Argentine Peso",
    "AUD": "Australian Dollar",
    "AWG": "Aruban Florin",
    "AZN": "Azerbaijani Manat",
    "BAM": "Bosnia-Herzegovina Convertible Mark",
    "BBD": "Barbadian Dollar",
    "BDT": "Bangladeshi Taka",
    "BGN": "Bulgarian Lev",
    "BHD": "Bahraini Dinar",
    "BIF": "Burundian Franc",
    "BMD": "Bermudan Dollar",
    "BND": "Brunei Dollar",
    "BOB": "Bolivian Boliviano",
    "BRL": "Brazilian Real",
    "BSD": "Bahamian Dollar",
    "BTN": "Bhutanese Ngultrum",
    "BWP": "Botswanan Pula",
    "BYN": "Belarusian Ruble",
    "BZD": "Belize Dollar",
    "CAD": "Canadian Dollar",
    "CDF": "Congolese Franc",
    "CHF": "Swiss Franc",
    "CLP": "Chilean Peso",
    "CNY": "Chinese Yuan",
    "COP": "Colombian Peso",
    "CRC": "Costa Rican Colón",
    "CUP": "Cuban Peso",
    "CVE": "Cape Verdean Escudo",
    "CZK": "Czech Koruna",
    "DJF": "Djiboutian Franc",
    "DKK": "Danish Krone",
    "DOP": "Dominican Peso",
    "DZD": "Algerian Dinar",
    "EGP": "Egyptian Pound",
    "ERN": "Eritrean Nakfa",
    "ETB": "Ethiopian Birr",
    "EUR": "Euro",
    "FJD": "Fijian Dollar",
    "FKP": "Falkland Islands Pound",
    "FOK": "Faroese Króna",
    "GBP": "British Pound Sterling",
    "GEL": "Georgian Lari",
    "GGP": "Guernsey Pound",
    "GHS": "Ghanaian Cedi",
    "GIP": "Gibraltar Pound",
    "GMD": "Gambian Dalasi",
    "GNF": "Guinean Franc",
    "GTQ": "Guatemalan Quetzal",
    "GYD": "Guyanaese Dollar",
    "HKD": "Hong Kong Dollar",
    "HNL": "Honduran Lempira",
    "HRK": "Croatian Kuna",
    "HTG": "Haitian Gourde",
    "HUF": "Hungarian Forint",
    "IDR": "Indonesian Rupiah",
    "ILS": "Israeli New Shekel",
    "IMP": "Isle of Man Pound",
    "INR": "Indian Rupee",
    "IQD": "Iraqi Dinar",
    "IRR": "Iranian Rial",
    "ISK": "Icelandic Króna",
    "JEP": "Jersey Pound",
    "JMD": "Jamaican Dollar",
    "JOD": "Jordanian Dinar",
    "JPY": "Japanese Yen",
    "KES": "Kenyan Shilling",
    "KGS": "Kyrgystani Som",
    "KHR": "Cambodian Riel",
    "KID": "Kiribati Dollar",
    "KMF": "Comorian Franc",
    "KRW": "South Korean Won",
    "KWD": "Kuwaiti Dinar",
    "KYD": "Cayman Islands Dollar",
    "KZT": "Kazakhstani Tenge",
    "LAK": "Laotian Kip",
    "LBP": "Lebanese Pound",
    "LKR": "Sri Lankan Rupee",
    "LRD": "Liberian Dollar",
    "LSL": "Lesotho Loti",
    "LYD": "Libyan Dinar",
    "MAD": "Moroccan Dirham",
    "MDL": "Moldovan Leu",
    "MGA": "Malagasy Ariary",
    "MKD": "Macedonian Denar",
    "MMK": "Myanmar Kyat",
    "MNT": "Mongolian Tugrik",
    "MOP": "Macanese Pataca",
    "MRU": "Mauritanian Ouguiya",
    "MUR": "Mauritian Rupee",
    "MVR": "Maldivian Rufiyaa",
    "MWK": "Malawian Kwacha",
    "MXN": "Mexican Peso",
    "MYR": "Malaysian Ringgit",
    "MZN": "Mozambican Metical",
    "NAD": "Namibian Dollar",
    "NGN": "Nigerian Naira",
    "NIO": "Nicaraguan Córdoba",
    "NOK": "Norwegian Krone",
    "NPR": "Nepalese Rupee",
    "NZD": "New Zealand Dollar",
    "OMR": "Omani Rial",
    "PAB": "Panamanian Balboa",
    "PEN": "Peruvian Sol",
    "PGK": "Papua New Guinean Kina",
    "PHP": "Philippine Peso",
    "PKR": "Pakistani Rupee",
    "PLN": "Polish Zloty",
    "PYG": "Paraguayan Guarani",
    "QAR": "Qatari Rial",
    "RON": "Romanian Leu",
    "RSD": "Serbian Dinar",
    "RUB": "Russian Ruble",
    "RWF": "Rwandan Franc",
    "SAR": "Saudi Riyal",
    "SBD": "Solomon Islands Dollar",
    "SCR": "Seychellois Rupee",
    "SDG": "Sudanese Pound",
    "SEK": "Swedish Krona",
    "SGD": "Singapore Dollar",
    "SHP": "Saint Helena Pound",
    "SLE": "Sierra Leonean Leone",
    "SLL": "Sierra Leonean Leone",
    "SOS": "Somali Shilling",
    "SRD": "Surinamese Dollar",
    "SSP": "South Sudanese Pound",
    "STN": "São Tomé & Príncipe Dobra",
    "SYP": "Syrian Pound",
    "SZL": "Eswatini Lilangeni",
    "THB": "Thai Baht",
    "TJS": "Tajikistani Somoni",
    "TMT": "Turkmenistani Manat",
    "TND": "Tunisian Dinar",
    "TOP": "Tongan Paʻanga",
    "TRY": "Turkish Lira",
    "TTD": "Trinidad & Tobago Dollar",
    "TVD": "Tuvaluan Dollar",
    "TWD": "New Taiwan Dollar",
    "TZS": "Tanzanian Shilling",
    "UAH": "Ukrainian Hryvnia",
    "UGX": "Ugandan Shilling",
    "USD": "United States Dollar",
    "UYU": "Uruguayan Peso",
    "UZS": "Uzbekistani Som",
    "VES": "Venezuelan Bolívar Soberano",
    "VND": "Vietnamese Dong",
    "VUV": "Vanuatu Vatu",
    "WST": "Samoan Tālā",
    "XAF": "CFA Franc BEAC",
    "XCD": "East Caribbean Dollar",
    "XDR": "Special Drawing Rights",
    "XOF": "CFA Franc BCEAO",
    "XPF": "CFP Franc",
    "YER": "Yemeni Rial",
    "ZAR": "South African Rand",
    "ZMW": "Zambian Kwacha",
    "ZWL": "Zimbabwean Dollar"
};

const requestedCurrencyCodes = [
    // Africa
    "AOA", "BIF", "CVE", "XAF", "KMF", "CDF", "DJF", "EGP", "ERN", "SZL", 
    "ETB", "XOF", "GMD", "GHS", "GNF", "KES", "LSL", "LRD", "LYD", "MGA", 
    "MWK", "MRU", "MUR", "MAD", "MZN", "NAD", "NGN", "RWF", "STN", "SCR", 
    "SLE", "SLL", "SOS", "ZAR", "SSP", "SDG", "TZS", "TND", "UGX", "ZMW", "ZWL",
    // Plus EUR and USD
    "EUR", "USD"
];

const fallbackNames: { [key: string]: string } = {};
requestedCurrencyCodes.forEach(code => {
    if (currencyNames[code]) {
        fallbackNames[code] = currencyNames[code];
    }
});

// Fallback rates based on USD, for when the API key is missing.
// These are approximate and should not be used for real financial transactions.
const fallbackRates = {
    "USD": 1,
    "EUR": 0.92,
    "AOA": 825,
    "BIF": 2850,
    "CVE": 102,
    "XAF": 605,
    "KMF": 455,
    "CDF": 2700,
    "DJF": 177,
    "EGP": 47,
    "ERN": 15,
    "SZL": 18,
    "ETB": 57,
    "XOF": 605,
    "GMD": 65,
    "GHS": 13,
    "GNF": 8600,
    "KES": 130,
    "LSL": 18,
    "LRD": 190,
    "LYD": 4.8,
    "MGA": 4500,
    "MWK": 1700,
    "MRU": 39,
    "MUR": 46,
    "MAD": 10,
    "MZN": 64,
    "NAD": 18,
    "NGN": 1400,
    "RWF": 1300,
    "STN": 22,
    "SCR": 13,
    "SLE": 22,
    "SLL": 22000,
    "SOS": 570,
    "ZAR": 18,
    "SSP": 1500,
    "SDG": 600,
    "TZS": 2600,
    "TND": 3.1,
    "UGX": 3800,
    "ZMW": 25,
    "ZWL": 13
};


export async function getCurrencyData(): Promise<CurrencyData> {
  if (!API_KEY) {
    console.warn("ExchangeRate API key is not set. Using fallback currency data.");
    return {
        rates: fallbackRates,
        names: fallbackNames
    };
  }
  
  const now = Date.now();
  if (cachedData && (now - lastFetchTime < CACHE_DURATION)) {
    return cachedData;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API call failed with status: ${response.status}`);
    }
    const data: any = await response.json();

    if (data.result !== 'success') {
      throw new Error(`API returned an error: ${data['error-type']}`);
    }
    
    // Filter rates to only include currencies we have names for
    const availableRates: { [key: string]: number } = {};
    const availableNames: { [key: string]: string } = {};

    for (const code in data.conversion_rates) {
        if(currencyNames[code]) {
            availableRates[code] = data.conversion_rates[code];
            availableNames[code] = currencyNames[code];
        }
    }

    cachedData = {
      rates: availableRates,
      names: availableNames
    };
    lastFetchTime = now;
    
    return cachedData;
  } catch (error) {
    console.error("Failed to fetch or process currency data:", error);
    // In case of an error, return the fallback data
    return {
        rates: fallbackRates,
        names: fallbackNames
    };
  }
}
