import Toast from 'react-native-toast-message';

export const showSuccessToast = (message: string, title: string = 'Berhasil') => {
  Toast.show({
    type: 'success',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 2500,
  });
};

export const showErrorToast = (message: string, title: string = 'Gagal') => {
  Toast.show({
    type: 'error',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 3000,
  });
};

export const showInfoToast = (message: string, title: string = 'Info') => {
  Toast.show({
    type: 'info',
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 2500,
  });
};