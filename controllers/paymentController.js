
const Order = require('../models/Order');
const { AppError } = require('../middleware/errorHandler');

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
