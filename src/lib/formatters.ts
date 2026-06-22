// Display formatting helpers (SGD currency, percentages).

const sgdFormatter = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  maximumFractionDigits: 0,
});

const sgdPreciseFormatter = new Intl.NumberFormat("en-SG", {
  style: "currency",
  currency: "SGD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a value as whole-dollar SGD, e.g. $600,000. Non-finite values render as $0. */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return sgdFormatter.format(0);
  return sgdFormatter.format(Math.round(value));
}

/** Format a value as SGD with cents, e.g. $2,123.45 — used for monthly instalments. */
export function formatCurrencyPrecise(value: number): string {
  if (!Number.isFinite(value)) return sgdPreciseFormatter.format(0);
  return sgdPreciseFormatter.format(value);
}

/** Format a 0-100 number as a percentage string, e.g. 57.1%. */
export function formatPercent(value: number, fractionDigits = 1): string {
  if (!Number.isFinite(value)) return "0%";
  return `${value.toFixed(fractionDigits)}%`;
}
