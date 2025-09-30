import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/serviceWorker';

// Environment variable validation
const validateEnvironmentVariables = () => {
  const requiredVars = [
    'VITE_KAKAO_JAVASCRIPT_KEY',
    'VITE_API_BASE_URL',
    'VITE_NAVER_CLOUD_API_KEY_ID',
    'VITE_NAVER_CLOUD_API_KEY',
  ];

  const missingVars = requiredVars.filter(
    (varName) => !import.meta.env[varName]
  );

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars);
    console.error(
      'Please check your .env file and ensure all required variables are set.'
    );
  } else {
    console.log('✅ All required environment variables are loaded');
  }
};

// Validate environment variables before app initialization
validateEnvironmentVariables();

// Register service worker for caching and offline support
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
