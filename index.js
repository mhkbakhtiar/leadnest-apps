import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';

// Handler notif saat app di background/killed
messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Notif diterima di background:', remoteMessage);
});

AppRegistry.registerComponent(appName, () => App);