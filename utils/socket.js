const socketio = require('socket.io');
const Message = require('../models/Message');

const initSocket = (server) => {
    const io = socketio(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {

        // Người dùng tham gia vào phòng chat riêng (room name là userId)
        socket.on('join', (userId) => {
            socket.join(userId);
        });

        // Nhân viên tham gia vào hàng chờ hỗ trợ
        socket.on('join_staff', () => {
            socket.join('staff_room');
        });

        // Lắng nghe tin nhắn từ khách hàng
        socket.on('customer_send_message', async (data) => {
            try {
                const { senderId, content, room } = data;
                
                // Lưu vào database
                const newMessage = await Message.create({
                    sender: senderId,
                    senderRole: 'customer',
                    content: content,
                    room: room // Thường là ID của khách hàng
                });

                // Gửi tin nhắn cho chính khách hàng đó (để cập nhật UI)
                // và gửi cho tất cả nhân viên trong staff_room
                io.to(room).emit('new_message', newMessage);
                io.to('staff_room').emit('admin_new_message', {
                    message: newMessage,
                    customerId: room
                });
            } catch (error) {
                console.error('Lỗi khi gửi tin nhắn khách hàng:', error);
            }
        });

        // Lắng nghe tin nhắn từ nhân viên/admin
        socket.on('staff_send_message', async (data) => {
            try {
                const { senderId, receiverId, content, room, senderRole } = data;

                // Lưu vào database
                const newMessage = await Message.create({
                    sender: senderId,
                    receiver: receiverId,
                    senderRole: senderRole || 'staff',
                    receiverRole: 'customer',
                    content: content,
                    room: room
                });

                // Gửi tin nhắn về phòng của khách hàng
                io.to(room).emit('new_message', newMessage);
                // Ghi nhận tin nhắn mới cho phía staff để cập nhật giao diện real-time
                io.to('staff_room').emit('admin_new_message', {
                    message: newMessage,
                    customerId: room
                });
            } catch (error) {
                console.error('Lỗi khi gửi tin nhắn nhân viên:', error);
            }
        });

        socket.on('disconnect', () => {
        });
    });

    return io;
};

module.exports = initSocket;
