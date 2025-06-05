/**
 * Utility functions for validating processing requests
 */

const COOLDOWN_PERIOD = 24 * 60 * 60; // 24 hours in seconds

/**
 * Check if a new processing request can be made for a batch
 * @param {Object} request - The existing processing request
 * @returns {Object} - { canRequest: boolean, reason: string }
 */
export const canRequestProcessing = (request) => {
  if (!request || !request.traderAddress) {
    return { canRequest: true, reason: null };
  }

  if (request.isApproved) {
    return { 
      canRequest: false, 
      reason: 'This batch has already been approved for processing' 
    };
  }

  if (request.isRejected) {
    const timeSinceRejection = Math.floor(Date.now() / 1000) - request.requestTimestamp;
    if (timeSinceRejection < COOLDOWN_PERIOD) {
      const hoursRemaining = Math.ceil((COOLDOWN_PERIOD - timeSinceRejection) / 3600);
      return { 
        canRequest: false, 
        reason: `Please wait ${hoursRemaining} more hour(s) before making a new request` 
      };
    }
    return { canRequest: true, reason: null };
  }

  return { 
    canRequest: false, 
    reason: 'A processing request is already pending for this batch' 
  };
};

/**
 * Format the remaining cooldown time
 * @param {number} timestamp - The rejection timestamp
 * @returns {string} - Formatted time remaining
 */
export const formatCooldownTime = (timestamp) => {
  const timeSinceRejection = Math.floor(Date.now() / 1000) - timestamp;
  const remainingTime = COOLDOWN_PERIOD - timeSinceRejection;
  
  if (remainingTime <= 0) return 'Ready to request';
  
  const hours = Math.floor(remainingTime / 3600);
  const minutes = Math.floor((remainingTime % 3600) / 60);
  
  return `${hours}h ${minutes}m remaining`;
}; 