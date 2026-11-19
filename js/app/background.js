// 背景图片与界面透明度的读取、应用和本地保存
export default {
    // 初始化背景设置
    initializeBackgroundSettings() {
        const backgroundSelector = document.getElementById('background-selector');
        const transparencySlider = document.getElementById('container-transparency');
        const transparencyValue = document.getElementById('transparency-value');
        
        if (backgroundSelector) {
            backgroundSelector.addEventListener('change', (e) => {
                this.changeBackground(e.target.value);
            });
        }
        
        if (transparencySlider && transparencyValue) {
            transparencySlider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                const percentage = Math.round(value * 100);
                transparencyValue.textContent = `${percentage}%`;
                this.updateContainerTransparency(value);
                
                // 保存透明度设置
                localStorage.setItem('quizContainerTransparency', value);
            });
        }
        
        // 加载保存的背景设置
        const savedBackground = localStorage.getItem('quizBackground');
        const savedTransparency = localStorage.getItem('quizContainerTransparency');
        
        if (savedBackground) {
            backgroundSelector.value = savedBackground;
            this.changeBackground(savedBackground);
        }
        
        if (savedTransparency) {
            const transparency = parseFloat(savedTransparency);
            transparencySlider.value = transparency;
            transparencyValue.textContent = `${Math.round(transparency * 100)}%`;
            this.updateContainerTransparency(transparency);
        } else {
            // 默认透明度为100%
            transparencySlider.value = 1.0;
            transparencyValue.textContent = '100%';
            this.updateContainerTransparency(1.0);
        }
    },

    // 更改背景图片
    changeBackground(imagePath) {
        const body = document.body;
        
        if (imagePath && imagePath !== 'none') {
            // 设置背景图片
            body.style.backgroundImage = `url('${imagePath}')`;
            body.classList.add('has-background');
            
            // 保存设置到本地存储
            localStorage.setItem('quizBackground', imagePath);
        } else {
            // 移除背景图片
            body.style.backgroundImage = '';
            body.classList.remove('has-background');
            
            // 从本地存储移除设置
            localStorage.removeItem('quizBackground');
        }
    },

    // 更新主界面透明度（只调节背景颜色透明度）
    updateContainerTransparency(opacity) {
        const container = document.querySelector('.container');
        if (container) {
            // 获取原始背景颜色（白色）并转换为RGBA格式
            const baseColor = '255, 255, 255'; // 白色的RGB值
            container.style.backgroundColor = `rgba(${baseColor}, ${opacity})`;
            container.style.transition = 'background-color 0.3s ease';
        }
    },
};
