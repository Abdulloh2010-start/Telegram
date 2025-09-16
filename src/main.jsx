import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import NotificationsProvider from './contexts/NotificationsProvider';
import { UserProvider } from "./contexts/UserContext";
import { ThemeProvider } from "./components/ThemeContext";
import { registerSW } from "virtual:pwa-register";

registerSW({immediate: true});

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <NotificationsProvider>
      <ThemeProvider>
        <UserProvider>
          <App />
        </UserProvider>
      </ThemeProvider>
    </NotificationsProvider>
  </BrowserRouter>,
);