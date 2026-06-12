// ═══════════════════════════════════════════════════════
// Firebase уже инициализирован в index.html
// ═══════════════════════════════════════════════════════

const storage = firebase.storage();
const database = firebase.database();

// DOM элементы
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
const uploadBtn = document.getElementById('uploadBtn');
const resultSection = document.getElementById('resultSection');
const copyBtn = document.getElementById('copyBtn');
const shareLink = document.getElementById('shareLink');
const expiresInfo = document.getElementById('expiresInfo');

let files = [];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 МБ
const STORAGE_DAYS = 30;

// Создание частиц на фоне
function createParticles() {
    const container = document.getElementById('particles');
    for (let i = 0; i < 25; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (10 + Math.random() * 10) + 's';
        container.appendChild(particle);
    }
}
createParticles();

// ═══════════════════════════════════════════════════════
// Drag & Drop
// ═══════════════════════════════════════════════════════

dropZone.addEventListener('click', () => fileInput.click());

dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change">Загружайте файлы и делитесь ссылками мгновенно</p>
        </header>

        <div class="upload-card">
            <!-- Загрузка -->
            <div class="drop-zone" id="dropZone">
                <span class="drop-zone-icon">📁</span>
                <div class="drop-zone-text">Перетащите файлы сюда</div>
                <div class="drop-zone-hint">или нажмите для выбора файлов (до 100 МБ)</div>
                <input type="file" class="file-input" id="fileInput" multiple>
            </div>

            <!-- Список файлов -->
            <div class="file-list" id="fileList"></div>

            <button class="upload-btn" id="uploadBtn" style="display: none;">
                ⬆️ Загрузить в облако
            </button>

            <!-- Результат -->
            <div class="result-section" id="resultSection">
                <div class="result-card">
                    <div class="success-icon">✅</div>
                    <div class="result-title">Файлы в облаке!</div>
                    <div class="result-subtitle">Скопируйте ссылку и поделитесь ею</div>
                    
                    <div class="link-box">
                        <span class="link-text" id="shareLink"></span>
                        <button class="copy-btn" id="copyBtn">📋 Копировать</button>
                    </div>

                    <div class="share-buttons">
                        <button class="share-btn" onclick="shareTelegram()">📨 Telegram</button>
                        <button class="share-btn" onclick="shareWhatsApp()">💬 WhatsApp</button>
                        <button class="share-btn" onclick="shareEmail()">📧 Email</button>
                    </div>
                    
                    <div class="expires-info" id="expiresInfo"></div>
                </div>
            </div>
        </div>

        <div class="stats">
            <div class="stat-item">
                <div class="stat-number">100MB</div>
                <div class="stat-label">Макс. файл</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">30</div>
                <div class="stat-label">Дней хранения</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">0</div>
                <div class="stat-label">Регистрация</div>
            </div>
        </div>

        <footer>
            <p>🔒 Хранение в Firebase • Шифрование HTTPS • Автоудаление через 30 дней</p>
        </footer>
    </div>

    <!-- Firebase SDK -->
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-storage-compat.js"></script>
    <script src="https://www.gstatic.com/firebasejs/10.7.1/firebase-database-compat.js"></script>

    <!-- ТВОЙ КОНФИГ (вставь сюда свои данные) -->
    <script>
        // ═══════════════════════════════════════
        // ВСТАВЬ СЮДА СВОЙ firebaseConfig:
        // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDdE9yOMolFbK1ziNI_FzWk5egNqDwnQQc",
  authDomain: "password-b401a.firebaseapp.com",
  databaseURL: "https://password-b401a-default-rtdb.firebaseio.com",
  projectId: "password-b401a",
  storageBucket: "password-b401a.firebasestorage.app",
  messagingSenderId: "419285981978",
  appId: "1:419285981978:web:ea9f956fefaf66a9feeaa3",
  measurementId: "G-9GW3MVF8HL"
};
        // ═══════════════════════════════════════
        
        firebase.initializeApp(firebaseConfig);
    </script>

    <script src="js/app.js"></script>
</body>
</html>
