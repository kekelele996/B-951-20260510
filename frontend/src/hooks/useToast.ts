import { useState, useCallback } from 'react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  action?: ToastAction;
}

type ToastOptions = {
  action?: ToastAction;
  duration?: number;
};

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: Toast['type'] = 'info', options: ToastOptions = {}) => {
    const id = Date.now().toString();
    const duration = options.duration ?? 3000;

    setToasts(prev => [...prev, { id, message, type, action: options.action }]);
    
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, options?: ToastOptions) => addToast(message, 'success', options), [addToast]);
  const error = useCallback((message: string, options?: ToastOptions) => addToast(message, 'error', options), [addToast]);
  const info = useCallback((message: string, options?: ToastOptions) => addToast(message, 'info', options), [addToast]);
  const warning = useCallback((message: string, options?: ToastOptions) => addToast(message, 'warning', options), [addToast]);

  return { toasts, addToast, removeToast, success, error, info, warning };
}

export type { Toast };
