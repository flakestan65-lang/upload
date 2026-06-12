const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Разрешаем CORS и статические файлы
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Папки для хранения
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const META_DIR = path.join(__dirname, 'meta');

// Создаём папки если их нет
[UPLOAD_DIR, META_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Настройка загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
        // Генерируем уникальное имя файла
        const uniqueName = crypto.randomBytes(16).toString('hex') + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 * 1024 } // 2GB лимит
});

// Генерация уникального ID для ссылки
function generateLinkId() {
    return crypto.randomBytes(6).toString('base64url');
}

// ========== API ==========

// Загрузка файлов
app.post('/api/upload', upload.array('files', 10), (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Файлы не загружены' });
    }

    const linkId = generateLinkId();
    const uploadTime = Date.now();
    const expireTime = uploadTime + (30 * 24 * 60 * 60 * 1000); // 30 дней

    // Сохраняем метаданные
    const fileData = {
        id: linkId,
        createdAt: uploadTime,
        expiresAt: expireTime,
        files: req.files.map(f => ({
            originalName: f.originalname,
            storedName: f.filename,
            size: f.size,
            mimetype: f.mimetype
        }))
    };

    fs.writeFileSync(
        path.join(META_DIR, `${linkId}.json`),
        JSON.stringify(fileData, null, 2)
    );

    res.json({
        success: true,
        linkId: linkId,
        url: `http://localhost:${PORT}/d/${linkId}`,
        expiresAt: new Date(expireTime).toISOString()
    });
});

// Страница скачивания
app.get('/d/:id', (req, res) => {
    const metaPath = path.join(META_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(metaPath)) {
        return res.status(404).send('<h1>Ссылка не найдена или истекла</h1>');
    }

    const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    
    // Проверяем срок действия
    if (Date.now() > data.expiresAt) {
        // Удаляем просроченные файлы
        data.files.forEach(f => {
            const filePath = path.join(UPLOAD_DIR, f.storedName);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        });
        fs.unlinkSync(metaPath);
        return res.status(410).send('<h1>Ссылка истекла</h1>');
    }

    // HTML страница скачивания
    const filesList = data.files.map(f => `
        <div class="file-item">
            <span class="file-icon">${getIcon(f.mimetype)}</span>
            <div class="file-info">
                <div class="file-name">${f.originalName}</div>
                <div class="file-size">${formatSize(f.size)}</div>
            </div>
            <a href="/api/download/${req.params.id}/${f.storedName}" class="download-btn" download="${f.originalName}">
                ⬇️ Скачать
            </a>
        </div>
    `).join('');

    res.send(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Скачивание файлов</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                .container {
                    background: rgba(255,255,255,0.95);
                    border-radius: 24px;
                    padding: 40px;
                    max-width: 600px;
                    width: 100%;
                    box-shadow: 0 25px 50px rgba(0,0,0,0.3);
                }
                h1 { color: #333; margin-bottom: 10px; font-size: 1.8rem; }
                .subtitle { color: #666; margin-bottom: 30px; }
                .file-item {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 15px;
                    background: #f7fafc;
                    border-radius: 12px;
                    margin-bottom: 10px;
                    border: 1px solid #e2e8f0;
                }
                .file-icon { font-size: 2rem; }
                .file-info { flex: 1; }
                .file-name { font-weight: 600; color: #2d3748; word-break: break-all; }
                .file-size { color: #718096; font-size: 0.9rem; margin-top: 4px; }
                .download-btn {
                    background: linear-gradient(135deg, #48bb78, #38a169);
                    color: white;
                    text-decoration: none;
                    padding: 10px 20px;
                    border-radius: 10px;
                    font-weight: 600;
                    transition: transform 0.2s;
                    white-space: nowrap;
                }
                .download-btn:hover { transform: scale(1.05); }
                .expires {
                    margin-top: 20px;
                    padding: 15px;
                    background: #fff5f5;
                    border-radius: 10px;
                    color: #c53030;
                    font-size: 0.9rem;
                    text-align: center;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>📦 Ваши файлы</h1>
                <p class="subtitle">Нажмите "Скачать" для загрузки</p>
                ${filesList}
                <div class="expires">
                    ⏰ Ссылка действительна до: ${new Date(data.expiresAt).toLocaleString('ru-RU')}
                </div>
            </div>
        </body>
        </html>
    `);
});

// Скачивание файла
app.get('/api/download/:id/:filename', (req, res) => {
    const metaPath = path.join(META_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(metaPath)) {
        return res.status(404).json({ error: 'Ссылка не найдена' });
    }

    const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    const fileMeta = data.files.find(f => f.storedName === req.params.filename);
    
    if (!fileMeta) {
        return res.status(404).json({ error: 'Файл не найден' });
    }

    const filePath = path.join(UPLOAD_DIR, req.params.filename);
    
    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Файл удалён' });
    }

    res.download(filePath, fileMeta.originalName);
});

// Получение информации о ссылке (API)
app.get('/api/info/:id', (req, res) => {
    const metaPath = path.join(META_DIR, `${req.params.id}.json`);
    
    if (!fs.existsSync(metaPath)) {
        return res.status(404).json({ error: 'Ссылка не найдена' });
    }

    const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
    res.json(data);
});

// Вспомогательные функции
function getIcon(mimetype) {
    if (mimetype.startsWith('image/')) return '🖼️';
    if (mimetype.startsWith('video/')) return '🎬';
    if (mimetype.startsWith('audio/')) return '🎵';
    if (mimetype.includes('pdf')) return '📄';
    if (mimetype.includes('zip') || mimetype.includes('rar')) return '📦';
    return '📎';
}

function formatSize(bytes) {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Очистка старых файлов (каждые 24 часа)
setInterval(() => {
    const now = Date.now();
    fs.readdirSync(META_DIR).forEach(file => {
        const metaPath = path.join(META_DIR, file);
        const data = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
        
        if (now > data.expiresAt) {
            data.files.forEach(f => {
                const filePath = path.join(UPLOAD_DIR, f.storedName);
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            });
            fs.unlinkSync(metaPath);
            console.log(`Удалены просроченные файлы: ${data.id}`);
        }
    });
}, 24 * 60 * 60 * 1000);

app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
    console.log(`📁 Загруженные файлы сохраняются в: ${UPLOAD_DIR}`);
});
