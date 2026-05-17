import { useSnackbar, VariantType } from 'notistack';

export const useNotification = () => {
  const { enqueueSnackbar } = useSnackbar();

  const showNotification = (message: string, variant: VariantType = 'default') => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: 3000,
      anchorOrigin: { vertical: 'bottom', horizontal: 'center' },
    });
  };

  return {
    showSuccess: (msg: string) => showNotification(msg, 'success'),
    showError: (msg: string) => showNotification(msg, 'error'),
    showInfo: (msg: string) => showNotification(msg, 'info'),
    showWarning: (msg: string) => showNotification(msg, 'warning'),
  };
};