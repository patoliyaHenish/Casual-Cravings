import React, { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { appStore } from './app/store.js'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from './components/loadingSpinner.jsx'
import NoInternet from './components/NoInternet.jsx'

const Custom = ({ children }) => {
  const isLoading = useSelector(state => state.loading.isLoading);
  return (
    <>
      {children}
      {isLoading && <Loader />}
    </>
  );
};

const RootWithOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOnline) {
    return <NoInternet />;
  }

  return (
    <StrictMode>
      <Provider store={appStore}>
        <Custom>
          <App />
          <ToastContainer
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            position="top-right"
            toastStyle={{
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)'
            }}
          />
        </Custom>
      </Provider>
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<RootWithOffline />)
