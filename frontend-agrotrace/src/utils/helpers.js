/**
 * Converts a BigInt value to a string with proper formatting
 * @param {bigint} value - The BigInt value to convert
 * @returns {string} The formatted string value
 */
export const convertBigInt = (value) => {
  if (value === undefined || value === null) return '0';
  return value.toString();
};

/**
 * Formats a date timestamp to a readable string
 * @param {number} timestamp - The timestamp in seconds
 * @returns {string} The formatted date string
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

/**
 * Formats an Ethereum address to a shorter version
 * @param {string} address - The full Ethereum address
 * @returns {string} The shortened address (e.g., 0x1234...5678)
 */
export const formatAddress = (address) => {
  if (!address) return 'N/A';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Formats a price value with proper decimal places
 * @param {bigint} value - The price value in wei
 * @param {number} decimals - Number of decimal places (default: 18)
 * @returns {string} The formatted price string
 */
export const formatPrice = (value, decimals = 18) => {
  if (!value) return '0';
  const strValue = value.toString();
  const whole = strValue.slice(0, -decimals) || '0';
  const fraction = strValue.slice(-decimals).padStart(decimals, '0');
  return `${whole}.${fraction}`;
};

/**
 * Truncates a string to a specified length
 * @param {string} str - The string to truncate
 * @param {number} length - Maximum length of the string
 * @returns {string} The truncated string
 */
export const truncateString = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

/**
 * Converts a status code to a human-readable status
 * @param {number} status - The status code
 * @returns {string} The human-readable status
 */
export const getStatusText = (status) => {
  const statusMap = {
    0: 'Pending',
    1: 'Approved',
    2: 'Rejected'
  };
  return statusMap[status] || 'Unknown';
};

/**
 * Gets the appropriate color class for a status
 * @param {number} status - The status code
 * @returns {string} The Tailwind CSS color classes
 */
export const getStatusColor = (status) => {
  const colorMap = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
}; 