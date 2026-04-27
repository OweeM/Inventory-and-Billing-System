const Customer = require('../models/Customers');
const Reward = require('../models/Reward');

// Fetch Reward Points for a Customer
const getCustomerRewards = async (req, res) => {
    try {
        const { memberId } = req.params;

        // Fetch customer based on memberId
        const customer = await Customer.findOne({ memberId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        // Structure response to include all necessary fields
        res.json({
            name: customer.name,
            email: customer.email,
            rewardPoints: customer.rewardPoints,
            rewardHistory: customer.rewardHistory
        });
    } catch (error) {
        console.error("Error fetching customer rewards:", error);
        res.status(500).json({ message: 'Error fetching customer rewards.', error });
    }
};

// Credit Rewards for a Transaction
const creditRewards = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { transactionAmount } = req.body;

        // Validate transaction amount
        if (!transactionAmount || isNaN(transactionAmount)) {
            return res.status(400).json({ message: "Invalid transactionAmount provided." });
        }

        const pointsToCredit = Math.floor(transactionAmount / 100);

        // Find and update the customer
        const customer = await Customer.findOneAndUpdate(
            { memberId: memberId.trim() }, // Match the customer by memberId
            {
                $inc: { rewardPoints: pointsToCredit }, // Increment reward points
                $push: { rewardHistory: { type: 'Credit', points: pointsToCredit, date: new Date() } } // Append to reward history
            },
            { new: true } // Return the updated customer document
        );

        if (!customer) {
            return res.status(404).json({ message: "Customer not found." });
        }

        // Respond with the updated details
        res.json({ 
            message: "Rewards credited successfully.", 
            rewardPoints: customer.rewardPoints, 
            rewardHistory: customer.rewardHistory 
        });
    } catch (error) {
        console.error("Error during creditRewards:", error);
        res.status(500).json({ message: "Error crediting rewards.", error: error.message || "Unknown error" });
    }
};

// Redeem Rewards
const redeemRewards = async (req, res) => {
    try {
        const { memberId } = req.params;
        const { pointsToRedeem } = req.body;

        // Validate pointsToRedeem
        if (!pointsToRedeem || isNaN(pointsToRedeem) || pointsToRedeem <= 0) {
            return res.status(400).json({ message: 'Invalid pointsToRedeem value.' });
        }

        // Find the customer by memberId
        const customer = await Customer.findOne({ memberId });
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }

        console.log('Before Redeeming:', customer.rewardPoints); // Debugging log

        // Check if customer has enough points to redeem
        if (customer.rewardPoints < pointsToRedeem) {
            return res.status(400).json({ message: 'Insufficient points to redeem.' });
        }

        // Deduct points and update reward history
        customer.rewardPoints -= pointsToRedeem;
        customer.rewardHistory.push({
            type: 'Redeem',
            points: pointsToRedeem,
            date: new Date(),
        });

        // Save changes
        await customer.save();
        console.log('After Redeeming:', customer.rewardPoints); // Debugging log

        // Respond with success message and updated data
        res.json({
            message: 'Rewards redeemed successfully.',
            points: customer.rewardPoints,
            rewardHistory: customer.rewardHistory,
        });
    } catch (error) {
        console.error('Error during redeemRewards:', error);
        res.status(500).json({
            message: 'Error redeeming rewards.',
            error: error.message || 'Unknown error',
        });
    }
};

// Fetch All Referrals for a Customer
const getReferrals = async (req, res) => {
    try {
        const { memberId } = req.params;
        const customer = await Customer.findOne({ memberId }).populate('referrals');
        if (!customer) {
            return res.status(404).json({ message: 'Customer not found.' });
        }
        res.json({ referrals: customer.referrals });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching referrals.', error });
    }
};

// Handling Referrals
const handleReferral = async (req, res) => {
    try {
        const { memberId } = req.params; // The new customer's memberId (the one being referred)
        const { referralId } = req.body; // The referring customer's memberId

        // Find the referring customer and the new customer
        const referredByCustomer = await Customer.findOne({ memberId: referralId });
        const newCustomer = await Customer.findOne({ memberId });

        // Check if both customers exist
        if (!referredByCustomer || !newCustomer) {
            return res.status(404).json({ message: 'Referring or referred customer not found.' });
        }

        // Check if the new customer is already referred by someone else
        const alreadyReferred = await Customer.findOne({ 'referrals.memberId': newCustomer.memberId });
        if (alreadyReferred) {
            return res.status(400).json({ message: 'This customer has already been referred by someone else.' });
        }

        // Add referral points to the referring customer and update reward history
        referredByCustomer.rewardPoints += 3; // Referral bonus
        referredByCustomer.rewardHistory.push({ type: 'Referral Bonus', points: 3, date: new Date() });

        // Add registration points to the new customer and update reward history
        newCustomer.rewardPoints += 5; // Registration bonus
        newCustomer.rewardHistory.push({ type: 'Registration Bonus', points: 5, date: new Date() });

        // Add the new customer's details (memberId, name, email) to the referring customer's referrals
        referredByCustomer.referrals.push({
            memberId: newCustomer.memberId,
            name: newCustomer.name,
            email: newCustomer.email
        });

        // Save both customers
        await referredByCustomer.save();
        await newCustomer.save();

        res.json({ message: 'Referral points and referral information updated successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error handling referral.', error });
    }
};

// ***** NEW FUNCTION: Fetch Rewards Statistics *****
// This function fetches the total distributed points and total redeemed points from the Rewards collection.
const getRewardsStats = async (req, res) => {
    try {
        const rewards = await Reward.findOne();
        if (!rewards) {
            return res.status(404).json({ message: 'Rewards stats not found.' });
        }
        res.json({
            totalPointsDistributed: rewards.totalPointsDistributed,
            totalPointsRedeemed: rewards.totalPointsRedeemed,
            totalReferrals: rewards.totalReferrals
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching rewards stats.', error: error.message });
    }
};

// Export all functions
module.exports = {
    getCustomerRewards,
    creditRewards,
    redeemRewards,
    getReferrals,
    handleReferral,
    getRewardsStats // <-- Export the new function
};
