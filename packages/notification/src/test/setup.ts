import { vi } from 'vitest';

// Mock Notification API
Object.defineProperty(global, 'Notification', {
  value: vi.fn().mockImplementation((title: string, options?: any) => ({
    title,
    ...options,
    close: vi.fn(),
    onclick: null,
    onclose: null,
    onerror: null,
    addEventListener: vi.fn()
  }))
});

// Mock Notification.requestPermission
Object.defineProperty(global.Notification, 'requestPermission', {
  value: vi.fn().mockResolvedValue('granted')
});

// Mock Notification.permission
Object.defineProperty(global.Notification, 'permission', {
  value: 'granted',
  writable: true
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock indexedDB
const indexedDBMock = {
  open: vi.fn().mockReturnValue({
    onsuccess: null,
    onerror: null,
    onupgradeneeded: null,
    result: {
      close: vi.fn(),
      transaction: vi.fn().mockReturnValue({
        objectStore: vi.fn().mockReturnValue({
          clear: vi.fn(),
          add: vi.fn(),
          getAll: vi.fn().mockReturnValue({
            onsuccess: null,
            onerror: null
          })
        })
      })
    }
  })
};

Object.defineProperty(window, 'indexedDB', {
  value: indexedDBMock
});

// Mock navigator.serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: vi.fn().mockResolvedValue({
      installing: null,
      waiting: null,
      active: null
    }),
    ready: Promise.resolve({
      pushManager: {
        getSubscription: vi.fn().mockResolvedValue(null),
        subscribe: vi.fn().mockResolvedValue({
          endpoint: 'https://push.example.com',
          keys: {
            auth: 'auth-key',
            p256dh: 'p256dh-key'
          }
        }),
        unsubscribe: vi.fn().mockResolvedValue(true)
      }
    })
  }
});

// Mock BroadcastChannel
Object.defineProperty(window, 'BroadcastChannel', {
  value: vi.fn().mockImplementation(() => ({
    postMessage: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    close: vi.fn()
  }))
});

// Mock document.createElement for audio elements
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName: string) => {
  if (tagName === 'audio') {
    return {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      load: vi.fn(),
      src: '',
      volume: 1,
      setAttribute: vi.fn(),
      setAttributeNS: vi.fn(),
      getAttribute: vi.fn(),
      getAttributeNS: vi.fn(),
      removeAttribute: vi.fn(),
      removeAttributeNS: vi.fn(),
      hasAttribute: vi.fn(),
      hasAttributeNS: vi.fn(),
      appendChild: vi.fn(),
      removeChild: vi.fn(),
      cloneNode: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn()
    } as any;
  }
  return originalCreateElement.call(document, tagName);
});

// Mock window.atob
Object.defineProperty(window, 'atob', {
  value: vi.fn().mockImplementation((str: string) => {
    // Simple mock for base64 decoding
    return Buffer.from(str, 'base64').toString('binary');
  })
});

// Mock AudioContext
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn().mockImplementation(() => ({
    createOscillator: vi.fn().mockReturnValue({
      connect: vi.fn(),
      frequency: { value: 440 },
      start: vi.fn(),
      stop: vi.fn()
    }),
    createGain: vi.fn().mockReturnValue({
      connect: vi.fn(),
      gain: { value: 0.1 }
    }),
    destination: {},
    currentTime: 0
  }))
});

Object.defineProperty(window, 'webkitAudioContext', {
  value: window.AudioContext
});
