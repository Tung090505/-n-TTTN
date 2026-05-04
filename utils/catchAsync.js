// Wrapper function để bắt lỗi async/await
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
