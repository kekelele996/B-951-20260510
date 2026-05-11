import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import { useToast } from '../hooks/useToast';
import type { Toast } from '../hooks/useToast';

interface ToastContextType {
  toasts: Toast[];
  success: (message: string, options?: { action?: { label: string; onClick: () => void }, duration?: number }) => void;
  error: (message: string, options?: { action?: { label: string; onClick: () => void }, duration?: number }) => void;
  info: (message: string, options?: { action?: { label: string; onClick: () => void }, duration?: number }) => void;
  warning: (message: string, options?: { action?: { label: string; onClick: () => void }, duration?: number }) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`
            toast-slide-in px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-[280px] max-w-md
            ${toast.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' : ''}
            ${toast.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' : ''}
            ${toast.type === 'info' ? 'bg-gray-50 border border-gray-200 text-gray-800' : ''}
            ${toast.type === 'warning' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' : ''}
          `}
        >
          <div className="flex-1 flex flex-col gap-1">
            <span className="text-sm">{toast.message}</span>
          </div>
          {toast.action && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toast.action?.onClick();
                onRemove(toast.id);
              }}
              className="px-2 py-1 text-xs font-medium bg-white/50 hover:bg-white/80 rounded transition-colors border border-black/5"
            >
              {toast.action.label}
            </button>
          )}
          <button
            onClick={() => onRemove(toast.id)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
