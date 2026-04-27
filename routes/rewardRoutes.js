// const express = require('express');
// const rewardsController = require('../controllers/rewardController');
// const authMiddleware = require('../middlewares/authMiddleware');

// const router = express.Router();

// // Manager or Cashier Access Middleware
// const { isManager, isCashier } = authMiddleware;

// // Routes for Rewards
// router.get('/customer/:memberId',isCashier,rewardsController.getCustomerRewards);
// router.post('/customer/:memberId/credit', isCashier,  rewardsController.creditRewards);
// router.post('/customer/:memberId/redeem', isCashier, rewardsController.redeemRewards);
// router.get('/customer/:memberId/referrals', isCashier, rewardsController.getReferrals);
// router.post('/customer/:memberId/referral', isCashier, rewardsController.handleReferral);

// module.exports = router;

const express = require('express');
const rewardsController = require('../controllers/rewardController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Manager or Cashier Access Middleware
const { isManager, isCashier } = authMiddleware;

// Routes for Rewards
router.get('/customer/:memberId', isCashier, rewardsController.getCustomerRewards);
router.post('/customer/:memberId/credit', isCashier, rewardsController.creditRewards);
router.post('/customer/:memberId/redeem', isCashier, rewardsController.redeemRewards);
router.get('/customer/:memberId/referrals', isCashier, rewardsController.getReferrals);
router.post('/customer/:memberId/referral', isCashier, rewardsController.handleReferral);

// ***** NEW ROUTE: Rewards Statistics *****
// This route will fetch the total distributed and redeemed points.
router.get('/stats', isCashier, rewardsController.getRewardsStats);

module.exports = router;
