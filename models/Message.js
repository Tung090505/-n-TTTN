const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    senderRole: {
        type: String,
        enum: ['customer', 'staff', 'admin'],
        required: true
    },
    receiverRole: {
        type: String,
        enum: ['customer', 'staff', 'admin']
    },
    content: {
        type: String,
        required: [true, 'Nội dung tin nhắn không được để trống']
    },
    room: {
        type: String,
        required: true // Thường là ID của Customer
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index để tìm kiếm tin nhắn theo phòng nhanh hơn
MessageSchema.index({ room: 1, createdAt: 1 });

module.exports = mongoose.model('Message', MessageSchema);
