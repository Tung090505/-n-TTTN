const Message = require('../models/Message');

// Lấy lịch sử chat của một phòng (room)
exports.getChatHistory = async (req, res, next) => {
    try {
        const { room } = req.params;
        const messages = await Message.find({ room })
            .sort({ createdAt: 1 })
            .limit(100);

        res.json({
            success: true,
            messages
        });
    } catch (error) {
        next(error);
    }
};

// Lấy danh sách khách hàng đang chat (dành cho nhân viên)
exports.getCustomerChatList = async (req, res, next) => {
    try {
        // Lấy tất cả các room duy nhất và tin nhắn mới nhất của mỗi room
        const customerList = await Message.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: "$room",
                    lastMessage: { $first: "$content" },
                    lastSender: { $first: "$senderRole" },
                    lastTime: { $first: "$createdAt" },
                    isRead: { $first: "$isRead" }
                }
            },
            { $addFields: { customerObjId: { $toObjectId: "$_id" } } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'customerObjId',
                    foreignField: '_id',
                    as: 'customerInfo'
                }
            },
            { $unwind: "$customerInfo" },
            { $sort: { lastTime: -1 } }
        ]);

        res.json({
            success: true,
            customerList
        });
    } catch (error) {
        next(error);
    }
};

// Đánh dấu tin nhắn đã đọc
exports.markAsRead = async (req, res, next) => {
    try {
        const { room } = req.params;
        await Message.updateMany(
            { room, isRead: false, senderRole: 'customer' },
            { $set: { isRead: true } }
        );
        res.json({ success: true });
    } catch (error) {
        next(error);
    }
};
