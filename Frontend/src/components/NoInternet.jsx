import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { MdWifiOff } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';

const NoInternet = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOffline(!navigator.onLine);

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-orange-50 text-amber-700 text-center px-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 10 }}
          className="mb-6"
        >
          <MdWifiOff size={100} className="text-amber-700" />
        </motion.div>

        <motion.h1
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold mb-3"
        >
          No Internet Connection
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-lg max-w-md mb-6"
        >
          You're offline. Please check your internet connection and try again.
        </motion.p>

        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={() => window.location.reload()}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              paddingX: 4,
              paddingY: 1.2,
            }}
          >
            Retry
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoInternet;
