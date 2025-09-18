import { createRoot } from 'react-dom/client';

import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './lib/serviceWorker';

// Register service worker for caching and offline support
registerServiceWorker();

createRoot(document.getElementById('root')!).render(<App />);
