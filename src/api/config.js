import { Platform } from 'react-native';

const HOST_IP = '192.168.1.3'; // PC LAN IP
export const BASE_URL = Platform.OS === 'android'
  ? `http://${HOST_IP}:8080`   // Physical device
  : 'http://10.0.2.2:8080';   // Emulator



  //step 1:- check ipconfig from command prompt
  //2-- setup that ip in config
  //3--run android again