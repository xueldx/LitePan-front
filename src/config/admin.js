
export const ADMIN_IDS = import.meta.env.VITE_ADMIN_IDS?.split(',') || [];

// 判断是否是管理员的工具函数
export const isAdmin = (userId) => {
    return ADMIN_IDS.includes(userId);
};