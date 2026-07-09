
/**
 * Format a timestamp to a human-readable date
 */
export const formatDate = (timestamp: number): string => {
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const date = new Date(ms);
  return date.toLocaleString();
};

/**
 * Format a number to a human-readable number with thousands separators
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Format a number with specified decimal places
 */
export const formatDecimal = (num: number, decimals: number = 8): string => {
  return new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(num);
};

/**
 * Format an amount of PLO (or other asset) with correct decimals
 * Divides the value by 10^decimals to convert from blockchain format
 */
export const formatAmount = (amount: number, decimals: number = 8): string => {
  const value = amount / Math.pow(10, decimals);
  return formatDecimal(value, decimals);
};

/**
 * Shorten an address or hash for display
 */
export const shortenHash = (hash: string, chars: number = 6): string => {
  if (!hash || hash.length <= chars * 2) return hash;
  return `${hash.substring(0, chars)}...${hash.substring(hash.length - chars)}`;
};

/**
 * Format block time in seconds
 * This function now accepts either a Date object or a number (milliseconds)
 */
export const formatBlockTime = (time: Date | number): string => {
  // If time is a Date object, convert to seconds, otherwise assume it's already in seconds
  const seconds = time instanceof Date ? time.getTime() / 1000 : (typeof time === 'number' ? time : 0);
  return `${seconds.toFixed(1)} seconds`;
};

/**
 * Calculate time passed since timestamp
 */
export const timeSince = (timestamp: number): string => {
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const seconds = Math.floor((Date.now() - ms) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return interval === 1 ? `1 ${unit} ago` : `${interval} ${unit}s ago`;
    }
  }
  
  return "Just now";
};

/**
 * Format time ago - alias for timeSince for consistency
 */
export const formatTimeAgo = (timestamp: number): string => {
  return timeSince(timestamp);
};

/**
 * Format file size
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(i > 0 ? 2 : 0)} ${sizes[i]}`;
};

/**
 * Format a timestamp to a human-readable date
 */
export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'Unknown';
  
  const ms = timestamp < 10000000000 ? timestamp * 1000 : timestamp;
  const now = Date.now();
  const date = new Date(ms);
  const diffMs = now - ms;
  
  // Less than a minute
  if (diffMs < 60000) {
    return 'Just now';
  }
  
  // Less than an hour
  if (diffMs < 3600000) {
    const minutes = Math.floor(diffMs / 60000);
    return `${minutes} ${minutes === 1 ? 'min' : 'mins'} ago`;
  }
  
  // Less than a day
  if (diffMs < 86400000) {
    const hours = Math.floor(diffMs / 3600000);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }
  
  // Less than a week
  if (diffMs < 604800000) {
    const days = Math.floor(diffMs / 86400000);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
  
  // Format as date
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  return date.toLocaleDateString(undefined, options);
};

/**
 * Format PLO balance (dividing by 10^8)
 */
export const formatPloBalance = (balance: number): string => {
  return formatNumber(balance / Math.pow(10, 8));
};

// Alias for internal legacy compatibility
export const formatGicBalance = formatPloBalance;

/**
 * Format asset amount with appropriate decimal places
 */
export const formatAssetAmount = (amount: number, decimals: number = 8): string => {
  return formatNumber(amount / Math.pow(10, decimals));
};
