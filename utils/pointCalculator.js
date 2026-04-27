/**
 * Calculate reward points based on the amount spent
 * @param {number} totalAmount - The total amount spent in rupees
 * @returns {number} - The reward points earned (5 points for every 20 Rs)
 */
function calculateRewardPoints(totalAmount) {
  return Math.floor(totalAmount / 20) * 5;
}

/**
 * Calculate discount value based on reward points
 * @param {number} rewardPoints - The number of reward points to convert to discount
 * @returns {number} - The discount value in rupees
 */
function calculateDiscountFromPoints(rewardPoints) {
  // 1 reward point = 0.2 rupees (5 points = 1 rupee)
  return (rewardPoints * 0.2).toFixed(2);
}

module.exports = { 
  calculateRewardPoints,
  calculateDiscountFromPoints
};
