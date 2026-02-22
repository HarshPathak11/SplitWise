import { User, Group, Expense, FriendRequest, LabelCategory } from "../models/schema.js";

// Helper for error handling
const handleError = (res, error, message) => {
    console.error(message, error);
    res.status(500).json({ error: message, details: error.message });
};

// 1. Dashboard Overview Cards
export const getDashboardStats = async (req, res) => {
    try {
        const totalUsersPromise = User.countDocuments({});
        const totalGroupsPromise = Group.countDocuments({});
        const totalExpensesPromise = Expense.countDocuments({});

        // Aggregation for total volume
        const totalVolumePromise = Expense.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        // Aggregation for total AI usage
        const totalAiUsagePromise = User.aggregate([
            { $group: { _id: null, totalUsage: { $sum: "$aiChatUsage.count" } } }
        ]);

        const [
            totalUsers,
            totalGroups,
            totalExpenses,
            totalVolumeResult,
            totalAiUsageResult
        ] = await Promise.all([
            totalUsersPromise,
            totalGroupsPromise,
            totalExpensesPromise,
            totalVolumePromise,
            totalAiUsagePromise
        ]);

        const totalVolume = totalVolumeResult.length > 0 ? totalVolumeResult[0].totalAmount : 0;
        const totalAiUsage = totalAiUsageResult.length > 0 ? totalAiUsageResult[0].totalUsage : 0;

        res.status(200).json({
            totalUsers,
            totalGroups,
            totalExpenses,
            totalVolume,
            totalAiUsage
        });
    } catch (error) {
        handleError(res, error, "Failed to fetch dashboard stats");
    }
};

// 2. User Growth Analytics (Time Series)
export const getUserGrowthStats = async (req, res) => {
    try {
        // Group by date (returning last 30 days usually, or just all time grouped by month/day)
        // For this example, let's return count of users created per day for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({ userGrowth });
    } catch (error) {
        handleError(res, error, "Failed to fetch user growth stats");
    }
};

// 3. Activity Stats (Top Users & Groups)
export const getActivityStats = async (req, res) => {
    try {
        // Top 5 Active Users (by number of expenses paid)
        const topUsersByExpensesPaid = await Expense.aggregate([
            {
                $group: {
                    _id: "$paidBy",
                    count: { $sum: 1 },
                    totalPaid: { $sum: "$amount" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            { $unwind: "$userDetails" },
            {
                $project: {
                    username: "$userDetails.username",
                    email: "$userDetails.email",
                    count: 1,
                    totalPaid: 1
                }
            }
        ]);

        // Top 5 Groups (by total spending)
        const topGroupsBySpending = await Group.aggregate([
            { $sort: { tripTotal: -1 } },
            { $limit: 5 },
            {
                $project: {
                    name: 1,
                    tripTotal: 1,
                    memberCount: { $size: "$members" }
                }
            }
        ]);

        res.status(200).json({
            topUsersByExpensesPaid,
            topGroupsBySpending
        });
    } catch (error) {
        handleError(res, error, "Failed to fetch activity stats");
    }
};

// 4. Financial Analytics (Categories & Trends)
export const getFinancialStats = async (req, res) => {
    try {
        // Spending by Category
        const categoryDistribution = await Expense.aggregate([
            {
                $group: {
                    _id: "$category",
                    count: { $sum: 1 },
                    totalAmount: { $sum: "$amount" }
                }
            },
            { $sort: { totalAmount: -1 } }
        ]);

        // Transaction Volume Trend (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const volumeTrend = await Expense.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    dailyTotal: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        res.status(200).json({
            categoryDistribution,
            volumeTrend
        });
    } catch (error) {
        handleError(res, error, "Failed to fetch financial stats");
    }
};

// 5. AI Usage Stats
export const getAiUsageStats = async (req, res) => {
    try {
        const topAiUsers = await User.find({ "aiChatUsage.count": { $gt: 0 } })
            .sort({ "aiChatUsage.count": -1 })
            .limit(10)
            .select("username email aiChatUsage");

        res.status(200).json({ topAiUsers });
    } catch (error) {
        handleError(res, error, "Failed to fetch AI usage stats");
    }
};
