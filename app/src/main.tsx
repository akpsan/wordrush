import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app/App';
import './theme/tokens.css';
import './ui/overlays.css';
import './theme/layout.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
