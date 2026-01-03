import 'react-native-reanimated';
import { AppRegistry } from 'react-native';
import { getMessaging } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
import App from './App';
import { name as appName } from './app.json';
import { handleBackgroundMessage } from './src/services/NotificationService';

getMessaging(getApp()).setBackgroundMessageHandler(handleBackgroundMessage);

AppRegistry.registerComponent(appName, () => App);
