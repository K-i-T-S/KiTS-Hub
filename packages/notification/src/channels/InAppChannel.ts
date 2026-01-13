import { Notification, NotificationDeliveryResult, NotificationChannel } from '../types/index.js';

export interface InAppChannelConfig {
  maxVisible: number;
  autoHideDelay: number;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  allowHtml: boolean;
  showProgress: boolean;
  soundEnabled: boolean;
  groupingEnabled: boolean;
}

export class InAppChannel {
  private config: InAppChannelConfig;
  private visibleNotifications: Map<string, HTMLElement> = new Map();
  private container: HTMLElement | null = null;
  private soundCache: Map<string, HTMLAudioElement> = new Map();

  constructor(config: Partial<InAppChannelConfig> = {}) {
    this.config = {
      maxVisible: 5,
      autoHideDelay: 5000,
      position: 'top-right',
      allowHtml: false,
      showProgress: true,
      soundEnabled: true,
      groupingEnabled: true,
      ...config
    };

    this.initializeContainer();
    this.preloadSounds();
  }

  /**
   * Send notification to in-app channel
   */
  async send(notification: Notification): Promise<NotificationDeliveryResult> {
    try {
      const element = this.createNotificationElement(notification);
      this.showNotification(notification, element);
      
      // Play sound if enabled
      if (this.config.soundEnabled) {
        this.playSound(notification.type);
      }

      // Auto-hide if configured
      if (this.config.autoHideDelay > 0) {
        setTimeout(() => {
          this.hideNotification(notification.id);
        }, this.config.autoHideDelay);
      }

      return {
        success: true,
        channel: NotificationChannel.IN_APP,
        notificationId: notification.id,
        timestamp: new Date()
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.IN_APP,
        notificationId: notification.id,
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Hide specific notification
   */
  hideNotification(notificationId: string): void {
    const element = this.visibleNotifications.get(notificationId);
    if (element) {
      element.classList.add('notification-hiding');
      setTimeout(() => {
        element.remove();
        this.visibleNotifications.delete(notificationId);
      }, 300);
    }
  }

  /**
   * Hide all notifications
   */
  hideAllNotifications(): void {
    this.visibleNotifications.forEach((_, id) => {
      this.hideNotification(id);
    });
  }

  /**
   * Get visible notifications count
   */
  getVisibleCount(): number {
    return this.visibleNotifications.size;
  }

  /**
   * Check if notification is visible
   */
  isVisible(notificationId: string): boolean {
    return this.visibleNotifications.has(notificationId);
  }

  /**
   * Initialize notification container
   */
  private initializeContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'kits-notification-container';
    this.container.className = `notification-container ${this.config.position}`;
    
    // Add styles
    this.addStyles();
    
    document.body.appendChild(this.container);
  }

  /**
   * Create notification element
   */
  private createNotificationElement(notification: Notification): HTMLElement {
    const element = document.createElement('div');
    element.className = `notification notification-${notification.type} notification-${notification.priority}`;
    element.setAttribute('data-notification-id', notification.id);

    const content = this.config.allowHtml ? notification.message : this.escapeHtml(notification.message);
    
    element.innerHTML = `
      <div class="notification-header">
        <div class="notification-title">${this.escapeHtml(notification.title)}</div>
        <button class="notification-close" aria-label="Close notification">×</button>
      </div>
      <div class="notification-content">
        <div class="notification-message">${content}</div>
        ${notification.attachments.length > 0 ? this.createAttachmentsHtml(notification.attachments) : ''}
      </div>
      ${notification.actions.length > 0 ? this.createActionsHtml(notification.actions) : ''}
      ${this.config.showProgress ? '<div class="notification-progress"></div>' : ''}
    `;

    // Add event listeners
    this.addEventListeners(element, notification);

    return element;
  }

  /**
   * Show notification in container
   */
  private showNotification(notification: Notification, element: HTMLElement): void {
    if (!this.container) return;

    // Check max visible limit
    if (this.visibleNotifications.size >= this.config.maxVisible) {
      const oldestId = this.visibleNotifications.keys().next().value;
      this.hideNotification(oldestId);
    }

    // Add to container
    this.container.appendChild(element);
    this.visibleNotifications.set(notification.id, element);

    // Trigger animation
    setTimeout(() => {
      element.classList.add('notification-visible');
    }, 10);
  }

  /**
   * Add event listeners to notification element
   */
  private addEventListeners(element: HTMLElement, notification: Notification): void {
    // Close button
    const closeBtn = element.querySelector('.notification-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hideNotification(notification.id);
      });
    }

    // Action buttons
    notification.actions.forEach(action => {
      const button = element.querySelector(`[data-action-id="${action.id}"]`);
      if (button) {
        button.addEventListener('click', async () => {
          try {
            await action.action();
            this.hideNotification(notification.id);
          } catch (error) {
            console.error('Notification action failed:', error);
          }
        });
      }
    });

    // Click to dismiss (optional)
    element.addEventListener('click', (e) => {
      if (e.target === element || e.target === element.querySelector('.notification-content')) {
        this.hideNotification(notification.id);
      }
    });
  }

  /**
   * Create attachments HTML
   */
  private createAttachmentsHtml(attachments: any[]): string {
    return `
      <div class="notification-attachments">
        ${attachments.map(attachment => `
          <div class="notification-attachment">
            <a href="${attachment.url}" target="_blank" rel="noopener noreferrer">
              ${this.escapeHtml(attachment.name)}
            </a>
          </div>
        `).join('')}
      </div>
    `;
  }

  /**
   * Create actions HTML
   */
  private createActionsHtml(actions: any[]): string {
    return `
      <div class="notification-actions">
        ${actions.map(action => `
          <button 
            class="notification-action ${action.variant || 'secondary'}"
            data-action-id="${action.id}"
          >
            ${action.icon ? `<span class="action-icon">${action.icon}</span>` : ''}
            ${this.escapeHtml(action.label)}
          </button>
        `).join('')}
      </div>
    `;
  }

  /**
   * Play notification sound
   */
  private playSound(type: string): void {
    const soundKey = `notification-${type}`;
    let audio = this.soundCache.get(soundKey);

    if (!audio) {
      // Create sound using Web Audio API as fallback
      audio = this.createBeepSound(type);
      this.soundCache.set(soundKey, audio);
    }

    audio.play().catch(() => {
      // Ignore autoplay policy violations
    });
  }

  /**
   * Create beep sound using Web Audio API
   */
  private createBeepSound(type: string): HTMLAudioElement {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different types
    const frequencies = {
      info: 800,
      success: 600,
      warning: 400,
      error: 300,
      system: 500
    };

    oscillator.frequency.value = frequencies[type as keyof typeof frequencies] || 500;
    gainNode.gain.value = 0.1;

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.1);

    // Return a dummy audio element
    const audio = new Audio();
    audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
    return audio;
  }

  /**
   * Preload notification sounds
   */
  private preloadSounds(): void {
    if (!this.config.soundEnabled) return;

    const types = ['info', 'success', 'warning', 'error', 'system'];
    types.forEach(type => {
      const audio = new Audio();
      audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT';
      this.soundCache.set(`notification-${type}`, audio);
    });
  }

  /**
   * Add CSS styles
   */
  private addStyles(): void {
    if (document.getElementById('kits-notification-styles')) return;

    const style = document.createElement('style');
    style.id = 'kits-notification-styles';
    style.textContent = `
      .notification-container {
        position: fixed;
        z-index: 9999;
        pointer-events: none;
        max-width: 400px;
        width: 100%;
      }

      .notification-container.top-right {
        top: 20px;
        right: 20px;
      }

      .notification-container.top-left {
        top: 20px;
        left: 20px;
      }

      .notification-container.bottom-right {
        bottom: 20px;
        right: 20px;
      }

      .notification-container.bottom-left {
        bottom: 20px;
        left: 20px;
      }

      .notification {
        background: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        margin-bottom: 10px;
        pointer-events: auto;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        overflow: hidden;
      }

      .notification.notification-visible {
        transform: translateX(0);
        opacity: 1;
      }

      .notification.notification-hiding {
        transform: translateX(100%);
        opacity: 0;
      }

      .notification.info {
        border-left: 4px solid #2196F3;
      }

      .notification.success {
        border-left: 4px solid #4CAF50;
      }

      .notification.warning {
        border-left: 4px solid #FF9800;
      }

      .notification.error {
        border-left: 4px solid #F44336;
      }

      .notification.system {
        border-left: 4px solid #9C27B0;
      }

      .notification-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 16px 8px;
        border-bottom: 1px solid #f0f0f0;
      }

      .notification-title {
        font-weight: 600;
        font-size: 14px;
        color: #333;
      }

      .notification-close {
        background: none;
        border: none;
        font-size: 18px;
        cursor: pointer;
        color: #666;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .notification-close:hover {
        background-color: #f0f0f0;
      }

      .notification-content {
        padding: 8px 16px 12px;
      }

      .notification-message {
        font-size: 14px;
        color: #666;
        line-height: 1.4;
      }

      .notification-attachments {
        margin-top: 8px;
      }

      .notification-attachment {
        display: inline-block;
        margin-right: 8px;
        margin-bottom: 4px;
      }

      .notification-attachment a {
        font-size: 12px;
        color: #2196F3;
        text-decoration: none;
        padding: 4px 8px;
        background: #f5f5f5;
        border-radius: 4px;
        transition: background-color 0.2s;
      }

      .notification-attachment a:hover {
        background-color: #e0e0e0;
      }

      .notification-actions {
        padding: 8px 16px 12px;
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .notification-action {
        padding: 6px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s;
      }

      .notification-action.primary {
        background: #2196F3;
        color: white;
        border-color: #2196F3;
      }

      .notification-action.danger {
        background: #F44336;
        color: white;
        border-color: #F44336;
      }

      .notification-action:hover {
        opacity: 0.8;
      }

      .notification-progress {
        height: 3px;
        background: #f0f0f0;
        position: relative;
        overflow: hidden;
      }

      .notification-progress::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        background: #2196F3;
        animation: progress ${this.config.autoHideDelay}ms linear;
      }

      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }

      .action-icon {
        margin-right: 4px;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.hideAllNotifications();
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.soundCache.clear();
  }
}
