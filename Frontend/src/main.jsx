import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider, useSelector } from 'react-redux'
import './index.css'
import App from './App.jsx'
import { appStore } from './app/store.js'
import { Toaster } from "sonner";
import { UserProvider } from './context/UserContext.jsx'
import Loader from './components/loadingSpinner.jsx'

const Custom = ({ children }) => {
  const isLoading = useSelector(state => state.loading.isLoading);
  return (
    <>
      {children}
      {isLoading && <Loader />}
    </>
  );
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={appStore}>
      <UserProvider>
      <Custom>
        <App />
        <Toaster richColors position='bottom-center'/>
      </Custom>
      </UserProvider>
    </Provider>
  </StrictMode>
)
