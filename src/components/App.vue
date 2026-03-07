<template>
  <div class="container">
    <header>
      <h1>
        <span class="icon">⚡</span>
        XKeen Config Generator
      </h1>
      <button
        id="theme-toggle"
        @click="handleThemeToggle"
        :title="isDark ? 'Switch to light' : 'Switch to dark'"
      >
        🌓
      </button>
    </header>

    <main>
      <div class="main-card">
        <div class="form-group">
          <label for="url">Proxy URL</label>
          <input
            type="text"
            id="url"
            v-model="url"
            @keyup.enter="handleGenerate"
            placeholder="vless://, vmess://, trojan://, ss://"
          >
        </div>

        <div class="button-group">
          <button id="generate-btn" @click="handleGenerate">
            <span class="icon">🔧</span>
            Сгенерировать конфиг
          </button>
          <button id="save-btn" @click="handleSave" :disabled="!configService.hasConfig()">
            <span class="icon">💾</span>
            Сохранить в файл
          </button>
        </div>

        <div v-if="warnings.length > 0" id="warnings">
          <div v-for="(warning, index) in warnings" :key="index">
            ⚠️ {{ warning }}
          </div>
        </div>

        <div v-if="status.text" class="status-indicator">
          <span class="status-dot" :class="status.type"></span>
          <span>{{ status.text }}</span>
        </div>
      </div>

      <div class="main-card output-container">
        <div class="output-header">
          <span class="output-label">JSON Output</span>
          <button class="copy-btn" @click="handleCopy">
            <span class="icon">📋</span>
            Копировать
          </button>
        </div>
        <pre v-if="output">{{ output }}</pre>
        <pre v-else>Здесь появится конфигурация...</pre>
      </div>
    </main>

    <div v-if="toast.show" class="toast" :class="toast.type">
      {{ toast.message }}
    </div>
  </div>
</template>

<script>
import { ConfigService } from '../services/ConfigService.js';
import { ThemeService } from '../services/ThemeService.js';
import { NotificationService, NotificationType } from '../services/NotificationService.js';

export default {
  name: 'App',

  /**
   * Component data
   */
  data() {
    return {
      url: '',
      output: '',
      warnings: [],
      status: {
        text: '',
        type: ''
      },
      toast: {
        show: false,
        message: '',
        type: 'success'
      },
      isDark: true,
      // Services (dependency injection)
      themeService: null,
      configService: null,
      notificationService: null
    };
  },

  /**
   * Initialize services on component creation
   */
  created() {
    this.themeService = ThemeService.getInstance();
    this.notificationService = new NotificationService();
    this.configService = new ConfigService({
      notificationService: this.notificationService
    });

    // Subscribe to theme changes
    this.themeService.subscribe((theme) => {
      this.isDark = theme === 'dark';
    });

    // Subscribe to notifications
    this.notificationService.subscribe(({ type, message }) => {
      this.showToast(message, type);
    });
  },

  /**
   * Initialize theme on mount
   */
  mounted() {
    const theme = this.themeService.init();
    this.isDark = theme === 'dark';
  },

  methods: {
    /**
     * Handle config generation
     */
    handleGenerate() {
      if (!this.url.trim()) {
        this.setStatus('error', 'Введите ссылку');
        this.output = '';
        this.warnings = [];
        return;
      }

      this.configService.generate(this.url);

      this.output = this.configService.currentOutput;
      this.warnings = this.configService.currentWarnings;

      if (this.configService.hasConfig()) {
        this.setStatus('success', 'Конфигурация сгенерирована');
      } else {
        this.setStatus('error', 'Ошибка генерации');
        this.output = '';
        this.warnings = [];
      }
    },

    /**
     * Handle save to file
     */
    handleSave() {
      this.configService.saveToFile();
    },

    /**
     * Handle copy to clipboard
     */
    async handleCopy() {
      await this.configService.copyToClipboard();
    },

    /**
     * Handle theme toggle
     */
    handleThemeToggle() {
      this.themeService.toggle();
    },

    /**
     * Set status indicator
     * @param {string} type - Status type
     * @param {string} text - Status text
     */
    setStatus(type, text) {
      this.status = { type, text };
    },

    /**
     * Show toast notification
     * @param {string} message - Message
     * @param {NotificationType} type - Notification type
     */
    showToast(message, type = NotificationType.INFO) {
      this.toast = { show: true, message, type };
      setTimeout(() => {
        this.toast.show = false;
      }, 3000);
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

h1 .icon {
  font-size: 2rem;
}

#theme-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1.25rem;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
}

#theme-toggle:hover {
  background: var(--bg-tertiary);
  transform: rotate(15deg);
}

.main-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow);
}

.form-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

input[type="text"] {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
  transition: var(--transition);
}

input[type="text"]:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.2);
}

input[type="text"]::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.button-group {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

button {
  padding: 0.75rem 1.25rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

button .icon {
  font-size: 1.1rem;
}

#generate-btn {
  background: var(--accent-primary);
  color: white;
}

#generate-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

#save-btn {
  background: var(--success);
  color: white;
}

#save-btn:hover {
  background: #2ea043;
  transform: translateY(-1px);
}

#save-btn:disabled {
  background: var(--text-secondary);
  cursor: not-allowed;
  transform: none;
}

#warnings {
  background: rgba(210, 153, 34, 0.15);
  border: 1px solid var(--warning);
  border-radius: 8px;
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: var(--warning);
}

.output-container {
  position: relative;
}

.output-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.output-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.copy-btn {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  border-radius: 6px;
}

.copy-btn:hover {
  background: var(--border-color);
}

pre {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 1rem;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 0.8125rem;
  line-height: 1.5;
  color: var(--text-primary);
  max-height: 400px;
  overflow-y: auto;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-secondary);
}

.status-dot.success {
  background: var(--success);
}

.status-dot.error {
  background: var(--error);
}

.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  box-shadow: var(--shadow);
  font-size: 0.875rem;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

.toast.success {
  background: var(--success);
}

.toast.error {
  background: var(--error);
}

.toast.warning {
  background: var(--warning);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 600px) {
  .container {
    padding: 1rem;
  }

  header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  #theme-toggle {
    position: static;
    width: 44px;
    height: 44px;
  }

  h1 {
    font-size: 1.5rem;
  }

  .button-group {
    flex-direction: column;
  }

  button {
    width: 100%;
    justify-content: center;
  }
}
</style>
