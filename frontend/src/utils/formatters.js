export const formatPrice = (price) => {
  const num = typeof price === 'number' ? price : parseFloat(price);
  if (Number.isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};

export const extractErrorMessage = (err, fallback = 'An unexpected error occurred.') => {
  const detail = err?.response?.data?.detail;
  if (typeof detail === 'string') {
    return detail;
  }
  if (Array.isArray(detail)) {
    return detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
  }
  return err?.message || fallback;
};

