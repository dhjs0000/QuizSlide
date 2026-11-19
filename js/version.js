// 版本记录页：读取 json/versions.json，按文件中的顺序展示
const FALLBACK_VERSIONS = [
    {
        version: '1.3.0',
        date: '2026-01-04',
        features: ['feat: 添加了双人对战模式'],
    },
];

async function loadVersions() {
    try {
        const response = await fetch('json/versions.json');
        if (!response.ok) {
            throw new Error('无法加载版本信息');
        }
        const data = await response.json();
        renderVersions(data.versions);
    } catch (error) {
        console.warn('无法加载版本记录，使用内置数据:', error.message);
        renderVersions(FALLBACK_VERSIONS);
    }
}

function renderVersions(versions) {
    const versionList = document.getElementById('version-list');

    if (!versions || versions.length === 0) {
        versionList.innerHTML = '<div class="error">暂无版本信息</div>';
        return;
    }

    versionList.innerHTML = versions.map(version => {
        const featuresHTML = (version.features || [])
            .map(feature => `<li>${feature}</li>`)
            .join('');

        let gitInfoHTML = '';
        if (version.gitTag || version.gitCommit) {
            const tagHTML = version.gitTag
                ? `<div><strong>Tag(git)：</strong>${version.gitTag}</div>`
                : '';
            const commitHTML = version.gitCommit
                ? `<div><strong>commit SHA256(git)：</strong><code style="background: #e9ecef; padding: 2px 6px; border-radius: 3px; font-family: monospace;">${version.gitCommit}</code></div>`
                : '';
            gitInfoHTML = `
                <div class="git-info" style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 6px; font-size: 14px;">
                    ${tagHTML}
                    ${commitHTML}
                </div>
            `;
        }

        return `
            <div class="version-item">
                <div class="version-header-info">
                    <div class="version-number">版本 ${version.version}</div>
                    <div class="version-date">📅 ${formatDate(version.date)}</div>
                </div>
                <ul class="version-features">
                    ${featuresHTML}
                </ul>
                ${gitInfoHTML}
            </div>
        `;
    }).join('');
}

// 手动解析 YYYY-M-D，避免各浏览器对非补零日期的解析差异
function formatDate(dateString) {
    const [year, month, day] = String(dateString).split('-').map(Number);
    if (!year || !month || !day) {
        return dateString;
    }
    return `${year}年${month}月${day}日`;
}

document.addEventListener('DOMContentLoaded', loadVersions);
