/**
 * Toast Notification Service
 * Centralized toast notifications using react-hot-toast
 */

import toast, { ToastOptions, Renderable } from 'react-hot-toast';
import { 
  UI_MESSAGES, 
  AUTH_MESSAGES,
  formatMessage 
} from '@/constants/messages';

// Toast service configuration
const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
  style: {
    borderRadius: '8px',
    fontSize: '14px',
    maxWidth: '400px',
  },
};

// Success toast options
const successOptions: ToastOptions = {
  ...defaultOptions,
  icon: '✅',
  style: {
    ...defaultOptions.style,
    background: '#10B981',
    color: '#FFFFFF',
  },
};

// Error toast options
const errorOptions: ToastOptions = {
  ...defaultOptions,
  duration: 6000, // Longer duration for errors
  icon: '❌',
  style: {
    ...defaultOptions.style,
    background: '#EF4444',
    color: '#FFFFFF',
  },
};

// Warning toast options
const warningOptions: ToastOptions = {
  ...defaultOptions,
  icon: '⚠️',
  style: {
    ...defaultOptions.style,
    background: '#F59E0B',
    color: '#FFFFFF',
  },
};

// Info toast options
const infoOptions: ToastOptions = {
  ...defaultOptions,
  icon: 'ℹ️',
  style: {
    ...defaultOptions.style,
    background: '#3B82F6',
    color: '#FFFFFF',
  },
};

// Loading toast options
const loadingOptions: ToastOptions = {
  ...defaultOptions,
  duration: Infinity, // Manual dismissal
  icon: '⏳',
  style: {
    ...defaultOptions.style,
    background: '#6B7280',
    color: '#FFFFFF',
  },
};

export class ToastService {
  // Success notifications
  static success(message: string, options?: ToastOptions): string {
    return toast.success(message, { ...successOptions, ...options });
  }

  // Error notifications
  static error(message: string, options?: ToastOptions): string {
    return toast.error(message, { ...errorOptions, ...options });
  }

  // Warning notifications
  static warning(message: string, options?: ToastOptions): string {
    return toast(message, { ...warningOptions, ...options });
  }

  // Info notifications
  static info(message: string, options?: ToastOptions): string {
    return toast(message, { ...infoOptions, ...options });
  }

  // Loading notifications
  static loading(message: string, options?: ToastOptions): string {
    return toast.loading(message, { ...loadingOptions, ...options });
  }

  // Promise-based notifications
  static promise<T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ): Promise<T> {
    return toast.promise(
      promise,
      { loading, success, error },
      { ...defaultOptions, ...options }
    );
  }

  // Dismiss a specific toast
  static dismiss(toastId?: string): void {
    toast.dismiss(toastId);
  }

  // Dismiss all toasts
  static dismissAll(): void {
    toast.dismiss();
  }

  // Custom toast with full control
  static custom(
    jsx: Renderable,
    options?: ToastOptions
  ): string {
    return toast.custom(jsx, { ...defaultOptions, ...options });
  }

  // Predefined common notifications
  static savedSuccessfully(item: string = 'Item'): string {
    return this.success(formatMessage('{item} saved successfully', { item }));
  }

  static createdSuccessfully(item: string = 'Item'): string {
    return this.success(formatMessage('{item} created successfully', { item }));
  }

  static updatedSuccessfully(item: string = 'Item'): string {
    return this.success(formatMessage('{item} updated successfully', { item }));
  }

  static deletedSuccessfully(item: string = 'Item'): string {
    return this.success(formatMessage('{item} deleted successfully', { item }));
  }

  static networkError(): string {
    return this.error(UI_MESSAGES.ERROR.NETWORK);
  }

  static genericError(): string {
    return this.error(UI_MESSAGES.ERROR.GENERIC);
  }

  static validationError(): string {
    return this.error(UI_MESSAGES.ERROR.VALIDATION);
  }

  static unauthorizedError(): string {
    return this.error(UI_MESSAGES.ERROR.UNAUTHORIZED);
  }

  static forbiddenError(): string {
    return this.error(UI_MESSAGES.ERROR.FORBIDDEN);
  }

  static notFoundError(): string {
    return this.error(UI_MESSAGES.ERROR.NOT_FOUND);
  }

  static serverError(): string {
    return this.error(UI_MESSAGES.ERROR.SERVER_ERROR);
  }

  // Authentication-specific notifications
  static loginSuccess(): string {
    return this.success(AUTH_MESSAGES.LOGIN.SUCCESS);
  }

  static loginError(): string {
    return this.error(AUTH_MESSAGES.LOGIN.INVALID_CREDENTIALS);
  }

  static logoutSuccess(): string {
    return this.success(AUTH_MESSAGES.LOGOUT.SUCCESS);
  }

  static sessionExpired(): string {
    return this.warning(AUTH_MESSAGES.LOGIN.SESSION_EXPIRED);
  }

  // Handle API errors automatically
  static handleApiError(error: any): string {
    if (!error) {
      return this.genericError();
    }

    // Handle different error types
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          return this.error(message || UI_MESSAGES.ERROR.VALIDATION);
        case 401:
          return this.unauthorizedError();
        case 403:
          return this.forbiddenError();
        case 404:
          return this.notFoundError();
        case 500:
        case 502:
        case 503:
        case 504:
          return this.serverError();
        default:
          return this.error(message || UI_MESSAGES.ERROR.GENERIC);
      }
    }

    if (error.request) {
      return this.networkError();
    }

    return this.error(error.message || UI_MESSAGES.ERROR.GENERIC);
  }

  // File upload specific notifications
  static fileUploadSuccess(fileName: string): string {
    return this.success(formatMessage('"{fileName}" uploaded successfully', { fileName }));
  }

  static fileUploadError(fileName: string): string {
    return this.error(formatMessage('Failed to upload "{fileName}"', { fileName }));
  }

  static fileTooLarge(): string {
    return this.error(UI_MESSAGES.ERROR.FILE_TOO_LARGE);
  }

  static invalidFileType(): string {
    return this.error(UI_MESSAGES.ERROR.INVALID_FILE_TYPE);
  }

  // Bulk operations notifications
  static bulkActionSuccess(action: string, count: number): string {
    return this.success(
      formatMessage('{action} completed for {count} items', {
        action,
        count: count.toString(),
      })
    );
  }

  static bulkActionError(action: string): string {
    return this.error(formatMessage('Failed to {action} selected items', { action }));
  }

  // Copy to clipboard notification
  static copiedToClipboard(): string {
    return this.success('Copied to clipboard');
  }

  // Form validation helper
  static formValidationError(errors: Record<string, string[]>): string {
    const firstError = Object.values(errors)[0]?.[0];
    return this.error(firstError || UI_MESSAGES.ERROR.VALIDATION);
  }
}

// Export default toast for direct usage
export { toast };
export default ToastService;