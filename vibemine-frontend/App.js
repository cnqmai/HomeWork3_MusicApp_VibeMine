import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';
import { PlayerProvider } from './src/context/PlayerContext'; // Import

export default function App() {
  return (
    <AuthProvider>
      <PlayerProvider> {/* Thêm PlayerProvider */}
        <AppNavigator />
      </PlayerProvider>
    </AuthProvider>
  );
}