import * as currenciesModule from "dinero.js/currencies";
import { dinero, toDecimal, type Dinero } from "dinero.js";
import countryToCurrency from "country-to-currency";

interface CurrencyObject {
  code: string;
  base: number;
  exponent: number;
}

const currencyObjects: CurrencyObject[] = (
  Object.values(currenciesModule).filter(
    (c) =>
      typeof c === "object" && c !== null && "code" in c && typeof (c as { code: unknown }).code === "string"
  ) as CurrencyObject[]
);

const codeToCurrency = new Map<string, CurrencyObject>(
  currencyObjects.map((c) => [c.code, c])
);

function getSymbol(code: string): string {
  const parts = new Intl.NumberFormat("en", { style: "currency", currency: code }).formatToParts(0);
  const part = parts.find((p) => p.type === "currency");
  return part?.value ?? code;
}

function getCurrencyName(code: string): string {
  try {
    return new Intl.DisplayNames("en", { type: "currency" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export interface CurrencyOption {
  code: string;
  currency: CurrencyObject;
  symbol: string;
  name: string;
}

export const currencyList: CurrencyOption[] = currencyObjects
  .map((currency) => ({
    code: currency.code,
    currency,
    symbol: getSymbol(currency.code),
    name: getCurrencyName(currency.code),
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

export function getCurrencyByCode(code: string): CurrencyObject | undefined {
  return codeToCurrency.get(code);
}

export function getDestinationCurrency(countryCode: string | undefined): string | undefined {
  if (!countryCode || countryCode.length !== 2) return undefined;
  const upper = countryCode.toUpperCase();
  const currency = (countryToCurrency as Record<string, string>)[upper];
  return currency && codeToCurrency.has(currency) ? currency : undefined;
}

export function formatCurrencySymbol(code: string): string {
  const opt = currencyList.find((c) => c.code === code);
  return opt?.symbol ?? code;
}

export function getCurrencyExponent(code: string): number {
  const c = codeToCurrency.get(code);
  return c?.exponent ?? 2;
}

export function formatCurrencyAmount(value: number, code: string): string {
  const exp = getCurrencyExponent(code);
  const fixed = exp === 0 ? Math.round(value).toString() : value.toFixed(exp);
  return `${formatCurrencySymbol(code)}${fixed}`;
}

export function buildCurrencyOptions(
  homeCurrencyCode: string,
  destinationCountryCode?: string
): CurrencyOption[] {
  const destCurrency = getDestinationCurrency(destinationCountryCode);
  const home = currencyList.find((c) => c.code === homeCurrencyCode);
  const dest = destCurrency ? currencyList.find((c) => c.code === destCurrency) : null;
  const rest = currencyList.filter(
    (c) => c.code !== homeCurrencyCode && c.code !== (destCurrency ?? "")
  );
  const result: CurrencyOption[] = [];
  if (home) result.push(home);
  if (dest && dest.code !== homeCurrencyCode) result.push(dest);
  result.push(...rest);
  return result;
}

export function createDineroFromDecimal(value: number, currencyCode: string): Dinero<number> | null {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return null;
  if (!Number.isFinite(value)) return null;

  const factor = Math.pow(currency.base, currency.exponent);
  const amount = Math.round(value * factor);
  return dinero({ amount, currency });
}

export function dineroToDecimal(value: Dinero<number>): number {
  const raw = toDecimal(value);
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function createZeroDinero(currencyCode: string): Dinero<number> | null {
  const currency = getCurrencyByCode(currencyCode);
  if (!currency) return null;
  return dinero({ amount: 0, currency });
}
