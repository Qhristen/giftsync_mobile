/**
 * Converts common Nigerian address-book formats to a format accepted by the API.
 * Returns null when the value cannot be safely interpreted as a Nigerian number.
 */
export const normalizeNigerianPhoneNumber = (value?: string | null): string | null => {
    if (!value?.trim()) return null;

    // Strip internal spaces and other address-book formatting such as (), +, and -.
    let digits = value.replace(/\D/g, '');

    // International dialling prefix, e.g. 002348031234567.
    if (digits.startsWith('00234')) {
        digits = digits.slice(2);
    }

    if (/^234\d{10}$/.test(digits)) {
        return `+${digits}`;
    }

    if (/^0\d{10}$/.test(digits)) {
        return digits;
    }

    // Some devices store local numbers without the leading zero.
    if (/^\d{10}$/.test(digits)) {
        return `0${digits}`;
    }

    return null;
};
