// Lưu trữ các mảng dữ liệu trong RAM thay vì dùng Mongoose
const data = {
    categories: [
        { _id: '65e215400000000000000001', name: 'Điện thoại', images: ['img1.png'] }
    ],
    products: [],
    inventories: []
};

function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

module.exports = { data, generateId };