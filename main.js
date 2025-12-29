// 统一的JS文件 - 根据页面自动判断版本并显示相应元素

// 版本检测模块
class VersionManager {
    constructor() {
        this.isPreviewVersion = this.detectVersion();
        this.initVersionElements();
    }
    
    // 检测当前是否为预览版
    detectVersion() {
        const currentPage = window.location.pathname.split('/').pop();
        return currentPage === 'Snapshot_html.html';
    }
    
    // 初始化版本相关元素
    initVersionElements() {
        // 显示/隐藏预览版切换按钮
        this.togglePreviewButton();
        
        // 显示/隐藏预览版警告
        this.togglePreviewWarning();
        
        // 更新版本信息
        this.updateVersionInfo();
    }
    
    // 切换预览版按钮显示
    togglePreviewButton() {
        const previewBtn = document.getElementById('preview-mode');
        const previewSwitch = document.querySelector('.preview-switch');
        
        if (this.isPreviewVersion) {
            // 当前是预览版，显示"切换到正式版"按钮
            if (previewBtn) {
                previewBtn.textContent = '切换到正式版';
                previewBtn.onclick = () => {
                    window.location.href = 'index.html';
                };
            }
            
            // 显示预览版警告
            this.showPreviewWarning();
        } else {
            // 当前是正式版，显示"切换到预览版"按钮
            if (previewBtn) {
                previewBtn.textContent = '切换到预览版';
                previewBtn.onclick = () => {
                    window.location.href = 'Snapshot_html.html';
                };
            }
            
            // 隐藏预览版警告
            this.hidePreviewWarning();
        }
    }
    
    // 显示预览版警告
    showPreviewWarning() {
        // 检查是否已存在警告元素
        let warningElement = document.getElementById('preview-warning');
        
        if (!warningElement) {
            warningElement = document.createElement('div');
            warningElement.id = 'preview-warning';
            warningElement.className = 'preview-warning';
            warningElement.innerHTML = `
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">当前为预览版，功能可能不稳定</span>
                    <button class="warning-close" onclick="this.parentElement.parentElement.remove()">×</button>
                </div>
            `;
            
            // 添加到页面顶部
            document.body.insertBefore(warningElement, document.body.firstChild);
        }
    }
    
    // 隐藏预览版警告
    hidePreviewWarning() {
        const warningElement = document.getElementById('preview-warning');
        if (warningElement) {
            warningElement.remove();
        }
    }
    
    // 切换预览版警告显示
    togglePreviewWarning() {
        if (this.isPreviewVersion) {
            this.showPreviewWarning();
        } else {
            this.hidePreviewWarning();
        }
    }
    
    // 更新版本信息
    updateVersionInfo() {
        const versionText = document.querySelector('.version-text a');
        if (versionText) {
            const baseVersion = versionText.textContent.replace('版本: ', '');
            if (this.isPreviewVersion) {
                versionText.textContent = `版本: ${baseVersion} (预览版)`;
            } else {
                versionText.textContent = `版本: ${baseVersion}`;
            }
        }
    }
}

// 添加预览版警告样式
const previewWarningStyles = `
.preview-warning {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #ff6b6b, #ffa500);
    color: white;
    padding: 12px 20px;
    z-index: 10000;
    box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    animation: slideDown 0.3s ease;
}

.warning-content {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
    position: relative;
}

.warning-icon {
    font-size: 20px;
    margin-right: 10px;
    animation: pulse 1.5s infinite;
}

.warning-text {
    font-size: 14px;
    font-weight: 500;
}

.warning-close {
    position: absolute;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    padding: 0;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.warning-close:hover {
    background-color: rgba(255,255,255,0.2);
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
    }
    50% {
        transform: scale(1.1);
    }
}

/* 为警告栏预留空间 */
body.has-preview-warning {
    padding-top: 50px;
}

/* 预览版按钮样式 */
.preview-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.preview-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.preview-switch {
    margin-left: 15px;
}
`;

// 注入样式
const previewStyleSheet = document.createElement('style');
previewStyleSheet.textContent = previewWarningStyles;
document.head.appendChild(previewStyleSheet);

// 页面加载完成后初始化版本管理
let versionManager;
document.addEventListener('DOMContentLoaded', function() {
    versionManager = new VersionManager();
    
    // 如果显示警告，添加body类
    if (versionManager.isPreviewVersion) {
        document.body.classList.add('has-preview-warning');
    }
});

// 导出版本管理器供其他脚本使用
window.VersionManager = VersionManager;