import { ElMessage } from "element-plus";

const showMessage = (message, callback, type) => {
    ElMessage({
        message,
        type,
        duration: 2000,
        onClose: () => {
            callback && callback();
        },
    });
};

const message = {
    success: (message, callback) => {
        showMessage(message, callback, "success");
    },
    error: (message, callback) => {
        showMessage(message, callback, "error");
    },
    warning: (message, callback) => {
        showMessage(message, callback, "warning");
    },
    info: (message, callback) => {
        showMessage(message, callback, "info");
    },
};

export default message;


