
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');
const sendEmail = require('../utils/sendEmail');

/**
 * Xử lý Webhook từ SePay
 * https://sepay.vn/docs/webhooks
 */
exports.sepayWebhook = async (req, res, next) => {
    try {
        const data = req.body;
        
        // Kiểm tra xác thực (SePay gửi API Key qua Header Authorization)
        const authHeader = req.headers.authorization;
        const token = authHeader ? authHeader.split(' ')[1] : null;

        if (token !== process.env.SEPAY_WEBHOOK_TOKEN) {
             console.error('SePay Webhook: Unauthorized access attempt');
             return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // Nội dung chuyển khoản thường chứa mã đơn hàng
        const paymentContent = data.content || '';
        const amount = parseFloat(data.transferAmount);

        // Tìm đơn hàng dựa theo mã đơn hàng trong nội dung chuyển khoản
        // Mã đơn hàng của chúng ta có dạng: TS[Timestamp][Random] (ví dụ: TSKU2A1B)
        // SePay có thể gửi nội dung dài, ta cần trích xuất mã đơn hàng
        const orderCodeMatch = paymentContent.match(/TS[A-Z0-9]+/);
        const orderCode = orderCodeMatch ? orderCodeMatch[0] : null;

        if (!orderCode) {
            console.log('SePay Webhook: Could not find order code in content:', paymentContent);
            return res.status(200).json({ success: true, message: 'No order code found' });
        }

        const order = await Order.findOne({ orderCode: orderCode });

        if (!order) {
            console.log('SePay Webhook: Order not found:', orderCode);
            return res.status(200).json({ success: true, message: 'Order not found' });
        }

        // Kiểm tra số tiền (Cho phép chênh lệch nhỏ nếu cần, hoặc kiểm tra chính xác)
        if (amount < order.totalAmount) {
            console.log(`SePay Webhook: Amount mismatch for ${orderCode}. Expected ${order.totalAmount}, got ${amount}`);
            // Có thể cập nhật trạng thái là "Thanh toán thiếu" nếu cần
            return res.status(200).json({ success: true, message: 'Amount mismatch' });
        }

        // Cập nhật trạng thái đơn hàng
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        order.orderStatus = 'confirmed'; // Tự động xác nhận đơn hàng khi đã thanh toán
        
        order.statusHistory.push({
            status: 'confirmed',
            note: `Thanh toán thành công qua SePay (${data.gateway}). Số tiền: ${amount.toLocaleString('vi-VN')}đ. Mã giao dịch: ${data.referenceCode}`,
        });

        await order.save();
        
        // --- 1. Thông báo Real-time qua Socket.io ---
        const io = req.app.get('io');
        if (io) {
            // Gửi thông báo đến người dùng cụ thể (room là userId)
            io.to(order.user.toString()).emit('payment_success', {
                orderCode: order.orderCode,
                message: 'Thanh toán thành công! Đơn hàng của bạn đã được xác nhận.'
            });
            console.log(`SePay Webhook: Socket notification sent to user ${order.user}`);
        }

        // --- 2. Gửi Email xác nhận cho khách hàng ---
        // Cần populate user để lấy email
        const populatedOrder = await Order.findById(order._id).populate('user');
        if (populatedOrder && populatedOrder.user && populatedOrder.user.email) {
            try {
                await sendEmail({
                    email: populatedOrder.user.email,
                    subject: `[TechStore] Xác nhận thanh toán đơn hàng ${order.orderCode}`,
                    message: `Chào ${populatedOrder.user.name},\n\nChúng tôi đã nhận được thanh toán ${amount.toLocaleString('vi-VN')}đ cho đơn hàng ${order.orderCode}.\nĐơn hàng của bạn hiện đang được xử lý.\n\nCảm ơn bạn đã mua sắm tại TechStore!`,
                    html: `
                        <div style="font-family: sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                            <h2 style="color: #2c3e50; text-align: center;">Xác nhận thanh toán thành công</h2>
                            <p>Chào <strong>${populatedOrder.user.name}</strong>,</p>
                            <p>TechStore xin thông báo chúng tôi đã nhận được thanh toán cho đơn hàng của bạn.</p>
                            <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
                                <p style="margin: 5px 0;"><strong>Mã đơn hàng:</strong> ${order.orderCode}</p>
                                <p style="margin: 5px 0;"><strong>Số tiền:</strong> <span style="color: #e74c3c; font-weight: bold;">${amount.toLocaleString('vi-VN')}đ</span></p>
                                <p style="margin: 5px 0;"><strong>Trạng thái:</strong> Đã thanh toán</p>
                            </div>
                            <p>Đơn hàng của bạn đang được chuẩn bị và sẽ sớm được giao đến bạn.</p>
                            <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                            <p style="font-size: 0.9em; color: #7f8c8d; text-align: center;">Đây là email tự động, vui lòng không phản hồi email này.</p>
                        </div>
                    `
                });
                console.log(`SePay Webhook: Confirmation email sent to ${populatedOrder.user.email}`);
            } catch (err) {
                console.error('SePay Webhook: Error sending confirmation email:', err);
            }
        }

        console.log('SePay Webhook: Order updated successfully:', orderCode);

        // Phản hồi cho SePay để họ không gửi lại webhook này nữa
        res.status(200).json({
            success: true,
            message: 'Order updated successfully'
        });

    } catch (error) {
        console.error('SePay Webhook Error:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
