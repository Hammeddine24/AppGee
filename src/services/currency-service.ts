
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
    "USD": "United States Dollar",
    "EUR": "Euro",
    "JPY": "Japanese Yen",
    "GBP": "British Pound Sterling",
    "AUD": "Australian Dollar",
    "CAD": "Canadian Dollar",
    "CHF": "Swiss Franc",
    "CNY": "Chinese Yuan",
    "SEK": "Swedish Krona",
    "NZD": "New Zealand Dollar",
    "XOF": "CFA Franc BCEAO",
    // Add more as needed, or use a comprehensive list
};


export async function getCurrencyData(): Promise<CurrencyData> {
  if (!API_KEY) {
    console.warn("ExchangeRate API key is not set. Currency conversion is disabled.");
    // Return default data so the UI doesn't break
    return {
        rates: { 'XOF': 615 }, // Provide a default to avoid breaking the UI
        names: { 'XOF': 'CFA Franc BCEAO' }
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
    const filteredRates: { [key: string]: number } = {};
    for (const code in currencyNames) {
        if(data.conversion_rates[code]) {
            filteredRates[code] = data.conversion_rates[code];
        }
    }

    cachedData = {
      rates: filteredRates,
      names: currencyNames
    };
    lastFetchTime = now;
    
    return cachedData;
  } catch (error) {
    console.error("Failed to fetch or process currency data:", error);
    // In case of an error, return the last known good data if available, otherwise throw
    if(cachedData) return cachedData;
    throw error;
  }
}
