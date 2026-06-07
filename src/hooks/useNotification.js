import { useSnackbar } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (message, variant = 'default') => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 3000,
      anchorOrigin: { vertical: 'top', horizontal: 'right' },
    });
  };

  return {
    showSuccess: (msg) => showNotification(msg, 'success'),
    showError: (msg) => showNotification(msg, 'error'),
    showInfo: (msg) => showNotification(msg, 'info'),
    showWarning: (msg) => showNotification(msg, 'warning'),
  };
};