import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { Audio } from 'expo-av';

// Request audio permissions
Audio.requestPermissionsAsync();

export default function App() {
  return (
    <SafeAreaProvider>
      {/* Lưu ý: Bạn đã cài đặt react-native-paper ở bước trước.
        Nếu bạn chưa dùng đến nó, bạn có thể tạm thời comment <PaperProvider> lại
        để tránh lỗi nếu nó chưa được cấu hình.
      */}
      {/* <PaperProvider> */}
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      {/* </PaperProvider> */}
    </SafeAreaProvider>
  );
}