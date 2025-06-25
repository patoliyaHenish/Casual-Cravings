import React from 'react';
import { motion } from 'framer-motion';

const Error404 = () => {
  return (
    <motion.div
      className="min-h-screen flex flex-col items-center justify-center font-montserrat overflow-hidden px-4"
      style={{ background: "#FFF8ED", color: "#3B2200" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div
        className="font-bold tracking-widest drop-shadow-lg
          text-[4rem] sm:text-[6rem] md:text-[8rem] lg:text-[10rem]"
        style={{ color: "#F97C1B", textShadow: "2px 2px 0 #3B2200" }}
        animate={{ y: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        404
      </motion.div>
      <motion.div
        className="mb-6 text-xl sm:text-2xl md:text-3xl text-center"
        style={{ color: "#3B2200" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        Oops! Page Not Found
      </motion.div>
      <motion.div
        className="mb-8 opacity-85 text-base sm:text-lg md:text-xl text-center"
        style={{ color: "#F97C1B" }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        The page you are looking for doesn&apos;t exist.
      </motion.div>
      <motion.a
        href="/"
        className="px-6 py-3 sm:px-8 sm:py-4 rounded-full font-bold tracking-wide shadow-lg transition text-base sm:text-lg"
        style={{
          background: "#F97C1B",
          color: "#FFF8ED",
          boxShadow: "0 4px 24px #3B220055"
        }}
        whileHover={{ scale: 1.08, backgroundColor: "#FFB15E" }}
        whileTap={{ scale: 0.98 }}
      >
        Go Home
      </motion.a>
    </motion.div>
  );
}

export default Error404;