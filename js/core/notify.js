// 右上角消息提示。样式只注入一次，主应用与对战页共用
const MESSAGE_STYLES = `
.message {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    font-size: 16px;
    font-weight: bold;
    z-index: 1000;
    animation: slideIn 0.3s ease;
    max-width: 300px;
    word-wrap: break-word;
}

.message.success {
    background: #27ae60;
    color: white;
    box-shadow: 0 4px 12px rgba(39, 174, 96, 0.3);
}

.message.error {
    background: #e74c3c;
    color: white;
    box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.message.warning {
    background: #f39c12;
    color: white;
    box-shadow: 0 4px 12px rgba(243, 156, 18, 0.3);
}

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = MESSAGE_STYLES;
document.head.appendChild(styleSheet);

export function notify(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);
    setTimeout(() => messageElement.remove(), 3000);
}
