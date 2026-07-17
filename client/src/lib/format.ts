/** Formats integer cents as a localized currency string (INR). */
export const formatPrice = (cents: number): string =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(cents / 100);

/** Extracts a user-facing message from an Axios-style error. */
export const errorMessage = (err: unknown, fallback = 'Something went wrong'): string => {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const resp = (err as { response?: { data?: { error?: string } } }).response;
    if (resp?.data?.error) return resp.data.error;
  }
  return fallback;
};
