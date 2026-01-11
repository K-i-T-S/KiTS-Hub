/**
 * Test Helper Utilities for KiTS Hub
 * Provides common test patterns and utilities
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement } from 'react';

// Custom render function with providers
export const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  // Add any providers here as needed
  return render(ui, {
    ...options,
  });
};

// Re-export testing library utilities
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';

// Common test patterns
export const expectElementToBeVisible = (element: HTMLElement) => {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
};

export const expectElementToHaveText = (element: HTMLElement, text: string) => {
  expect(element).toBeInTheDocument();
  expect(element).toHaveTextContent(text);
};

export const expectButtonToBeDisabled = (button: HTMLElement) => {
  expect(button).toBeDisabled();
  expect(button).toHaveAttribute('aria-disabled', 'true');
};

export const expectButtonToBeEnabled = (button: HTMLElement) => {
  expect(button).not.toBeDisabled();
  expect(button).not.toHaveAttribute('aria-disabled');
};

// Form helpers
export const fillForm = async (user: any, form: HTMLElement, data: Record<string, string>) => {
  for (const [name, value] of Object.entries(data)) {
    const field = form.querySelector(`[name="${name}"]`) as HTMLElement;
    if (field) {
      await user.clear(field);
      await user.type(field, value);
    }
  }
};

export const submitForm = async (user: any, form: HTMLElement) => {
  const submitButton = form.querySelector('button[type="submit"]') as HTMLElement;
  if (submitButton) {
    await user.click(submitButton);
  }
};

// Async helpers
export const waitForElementToAppear = async (element: HTMLElement) => {
  // Implementation for waiting for element to appear
  return new Promise(resolve => {
    const observer = new MutationObserver(() => {
      if (document.contains(element)) {
        observer.disconnect();
        resolve(element);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

// Mock data helpers
export const createMockEvent = (type: string, properties: any = {}) => {
  return new Event(type, { bubbles: true, ...properties });
};

export const createMockDragEvent = (type: string, data: any = {}) => {
  return new DragEvent(type, { bubbles: true, ...data });
};

// Accessibility helpers
export const checkAccessibility = async (container: HTMLElement) => {
  // Basic accessibility checks
  const buttons = container.querySelectorAll('button');
  buttons.forEach(button => {
    expect(button).toHaveAttribute('type');
  });

  const inputs = container.querySelectorAll('input');
  inputs.forEach(input => {
    expect(input).toHaveAttribute('name');
  });
};

// Performance helpers
export const measureRenderTime = async (renderFn: () => void) => {
  const start = performance.now();
  renderFn();
  const end = performance.now();
  return end - start;
};

// Network helpers
export const mockNetworkResponse = (url: string, response: any) => {
  // Mock fetch response
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(response),
    } as Response)
  );
};

export const mockNetworkError = (url: string, error: string) => {
  global.fetch = jest.fn(() =>
    Promise.reject(new Error(error))
  );
};

// Local storage helpers
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Session storage helpers
export const mockSessionStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// URL helpers
export const createMockUrl = (path: string, params: Record<string, string> = {}) => {
  const url = new URL(path, 'http://localhost');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  return url;
};

// Date helpers
export const mockCurrentDate = (date: Date) => {
  jest.spyOn(Date, 'now').mockReturnValue(date.getTime());
};

export const restoreCurrentDate = () => {
  jest.restoreAllMocks();
};

// Timer helpers
export const useFakeTimers = () => {
  jest.useFakeTimers();
};

export const useRealTimers = () => {
  jest.useRealTimers();
};

export const advanceTimersByTime = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

// Intersection Observer mock
export const mockIntersectionObserver = () => {
  const mockIntersectionObserver = jest.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.IntersectionObserver = mockIntersectionObserver;
  return mockIntersectionObserver;
};

// Resize Observer mock
export const mockResizeObserver = () => {
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockReturnValue({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  });
  window.ResizeObserver = mockResizeObserver;
  return mockResizeObserver;
};

// Media Query mock
export const mockMediaQuery = (matches: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

// Scroll helpers
export const mockScrollTo = () => {
  window.scrollTo = jest.fn();
  Element.prototype.scrollIntoView = jest.fn();
};

// Geolocation mock
export const mockGeolocation = (position: GeolocationPosition) => {
  const mockGeolocation = {
    getCurrentPosition: jest.fn((success) => success(position)),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
  };
  Object.defineProperty(window.navigator, 'geolocation', {
    value: mockGeolocation,
    writable: true,
  });
  return mockGeolocation;
};

// Clipboard mock
export const mockClipboard = (text: string) => {
  const mockClipboard = {
    writeText: jest.fn(() => Promise.resolve()),
    readText: jest.fn(() => Promise.resolve(text)),
  };
  Object.defineProperty(window.navigator, 'clipboard', {
    value: mockClipboard,
    writable: true,
  });
  return mockClipboard;
};

// Notification mock
export const mockNotification = () => {
  const mockNotification = jest.fn();
  mockNotification.mockImplementation((title, options) => ({
    title,
    ...options,
    close: jest.fn(),
  }));
  Object.defineProperty(window, 'Notification', {
    value: mockNotification,
    writable: true,
  });
  return mockNotification;
};

// Service Worker mock
export const mockServiceWorker = () => {
  const mockRegistration = {
    installing: null,
    waiting: null,
    active: null,
    scope: '',
    navigationPreload: {
      enable: jest.fn(),
      disable: jest.fn(),
      getState: jest.fn(),
    },
    pushManager: {
      subscribe: jest.fn(),
      getSubscription: jest.fn(),
      permissionState: jest.fn(),
    },
    sync: {
      register: jest.fn(),
      getTags: jest.fn(),
    },
    periodicSync: {
      register: jest.fn(),
      getTags: jest.fn(),
      unregister: jest.fn(),
    },
    update: jest.fn(),
    unregister: jest.fn(),
  };

  const mockNavigator = {
    serviceWorker: {
      register: jest.fn(() => Promise.resolve(mockRegistration)),
      getRegistration: jest.fn(() => Promise.resolve(mockRegistration)),
      getRegistrations: jest.fn(() => Promise.resolve([mockRegistration])),
      startMessages: jest.fn(),
    },
  };

  Object.defineProperty(window.navigator, 'serviceWorker', {
    value: mockNavigator.serviceWorker,
    writable: true,
  });

  return { mockRegistration, mockNavigator };
};
