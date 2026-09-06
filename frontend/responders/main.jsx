import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../src/index.css';
import './responder.css';
import ResponderApp from './ResponderApp.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResponderApp />
  </StrictMode>,
);