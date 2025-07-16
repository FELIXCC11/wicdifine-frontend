import { motion } from 'framer-motion';
import { WICFINAvatarLogo, WICFINLogo } from './icons';

export const Greeting = () => {
  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-16 px-8 size-full flex flex-col justify-center items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <WICFINLogo size={64} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-semibold text-center"
      >
        Welcome to WICFIN Loan Assistant
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-xl text-zinc-500 text-center mt-2"
      >
        How can I help with your loan needs today?
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.7 }}
        className="text-md text-zinc-400 text-center mt-6 max-w-lg"
      >
        Ask me about loan types, interest rates, application requirements, or blockchain verification for your loans.
      </motion.div>
    </div>
  );
};