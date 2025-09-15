import toast from 'react-hot-toast';

export function useNotifications() {
  const showSuccess = (message: string) => {
    return toast.success(message);
  };

  const showError = (message: string) => {
    return toast.error(message);
  };

  const showLoading = (message: string) => {
    return toast.loading(message);
  };

  const showInfo = (message: string) => {
    return toast(message, {
      icon: 'ℹ️',
      style: {
        background: 'rgba(59, 130, 246, 0.9)',
        color: '#fff',
        border: '1px solid rgba(59, 130, 246, 0.3)',
      },
    });
  };

  const showWarning = (message: string) => {
    return toast(message, {
      icon: '⚠️',
      style: {
        background: 'rgba(245, 158, 11, 0.9)',
        color: '#fff',
        border: '1px solid rgba(245, 158, 11, 0.3)',
      },
    });
  };

  const dismiss = (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const dismissAll = () => {
    toast.dismiss();
  };

  const updateToast = (toastId: string, message: string, type: 'success' | 'error' | 'loading' | 'info' | 'warning' = 'info') => {
    const options = {
      success: { 
        icon: '✅',
        duration: 3000,
        style: {
          background: 'rgba(16, 185, 129, 0.9)',
          color: '#fff',
          border: '1px solid rgba(16, 185, 129, 0.3)',
        },
      },
      error: { 
        icon: '❌',
        duration: 5000,
        style: {
          background: 'rgba(239, 68, 68, 0.9)',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.3)',
        },
      },
      loading: { 
        icon: '⏳',
        duration: Infinity,
        style: {
          background: 'rgba(59, 130, 246, 0.9)',
          color: '#fff',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        },
      },
      info: { 
        icon: 'ℹ️',
        duration: 4000,
        style: {
          background: 'rgba(59, 130, 246, 0.9)',
          color: '#fff',
          border: '1px solid rgba(59, 130, 246, 0.3)',
        },
      },
      warning: { 
        icon: '⚠️',
        duration: 4000,
        style: {
          background: 'rgba(245, 158, 11, 0.9)',
          color: '#fff',
          border: '1px solid rgba(245, 158, 11, 0.3)',
        },
      },
    };

    return toast(message, {
      id: toastId,
      ...options[type],
    });
  };

  return {
    showSuccess,
    showError,
    showLoading,
    showInfo,
    showWarning,
    dismiss,
    dismissAll,
    updateToast,
  };
}
