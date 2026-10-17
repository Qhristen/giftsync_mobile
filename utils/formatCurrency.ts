export function formatCurrency(amount: number, currencyCode: string = "NGN") {
  const sign = amount < 0 ? "-" : "";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: "compact",
    compactDisplay: "short",
  }).format(Math.abs(amount));

  return `${sign}${getCurrencySymbol(currencyCode)}${formattedAmount}`;
}

export function formatCompact(amount: number, currencyCode: string = "NGN") {
  const sign = amount < 0 ? "-" : "";
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "decimal",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    notation: "compact",
    compactDisplay: "short",
  }).format(Math.abs(amount));

  return `${sign}${getCurrencySymbol(currencyCode)}${formattedAmount}`;
}

export function getCurrencySymbol(currencyCode: string = "NGN") {
  switch (currencyCode.trim().toUpperCase()) {
    case "NGN":
      return "₦";
    case "USD":
      return "$";
    case "GBP":
      return "£";
    case "EUR":
      return "€";
    case "JPY":
    case "CNY":
      return "¥";
    case "INR":
      return "₹";
    case "GHS":
      return "₵";
    case "KES":
      return "KSh";
    case "ZAR":
      return "R";
    default:
      return currencyCode.trim().toUpperCase();
  }
}

export function formatInputNumber(value: string): string {
  if (!value) return "";

  // Remove all non-numeric except dot
  const cleaned = value.replace(/[^0-9.]/g, "");

  // Split integer and decimal parts
  const parts = cleaned.split(".");
  let integerPart = parts[0];
  const decimalPart = parts[1];

  // Add commas to integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  // Join back with dot if it was present
  if (value.includes(".")) {
    return `${integerPart}.${decimalPart ?? ""}`;
  }

  return integerPart;
}

export function parseCurrencyInput(value: string): number {
  // Remove all non-numeric characters except the decimal point
  const cleanedValue = value.replace(/[^0-9.]/g, "");
  const number = parseFloat(cleanedValue);
  return isNaN(number) ? 0 : number;
}
