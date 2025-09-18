// Service Worker registration and management utilities

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onOfflineReady?: () => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;

  async register(config: ServiceWorkerConfig = {}): Promise<void> {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      // Register the service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle successful registration
      if (config.onSuccess) {
        config.onSuccess(this.registration);
      }

      // Listen for updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (!newWorker) return;

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content is available
              if (config.onUpdate) {
                config.onUpdate(this.registration!);
              }
            } else {
              // Content is cached for offline use
              if (config.onOfflineReady) {
                config.onOfflineReady();
              }
            }
          }
        });
      });

      // Handle controller change (when new service worker takes control)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  async clearCache(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      // Send message to service worker to clear cache
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEAR_CACHE',
        });
      }
      console.log('Cache clear message sent to Service Worker');
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      return;
    }

    try {
      await this.registration.update();
      console.log('Service Worker update requested');
    } catch (error) {
      console.error('Service Worker update failed:', error);
    }
  }

  isRegistered(): boolean {
    return this.registration !== null;
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }
}

// Create singleton instance
const serviceWorkerManager = new ServiceWorkerManager();

// Default configuration for the app
export const registerServiceWorker = (): void => {
  serviceWorkerManager.register({
    onSuccess: () => {
      console.log('✅ Service Worker registered successfully');
      console.log('📦 Caching external resources for better performance');
    },
    onUpdate: (registration) => {
      console.log('🔄 New Service Worker available');
      // You can show a notification to the user here
      if (
        confirm('새로운 버전이 사용 가능합니다. 지금 업데이트하시겠습니까?')
      ) {
        // Send message to skip waiting
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
      }
    },
    onOfflineReady: () => {
      console.log('📱 App is ready for offline use');
      // You can show a notification to the user here
    },
  });
};

// Export the manager for advanced usage
export { serviceWorkerManager };

// Utility functions
export const clearServiceWorkerCache = (): Promise<void> => {
  return serviceWorkerManager.clearCache();
};

export const updateServiceWorker = (): Promise<void> => {
  return serviceWorkerManager.updateServiceWorker();
};

export const unregisterServiceWorker = (): Promise<boolean> => {
  return serviceWorkerManager.unregister();
};
