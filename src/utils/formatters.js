// Format currency in KES
export const formatKES = (amount) => {
  if (!amount && amount !== 0) return 'KES 0';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format date with time
export const formatDate = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

// Format short date (no time)
export const formatDateShort = (date) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-KE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

// Format file size
export const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  const mb = bytes / 1024 / 1024;
  if (mb < 1) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${mb.toFixed(2)} MB`;
};

// Format number with commas
export const formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toLocaleString();
};