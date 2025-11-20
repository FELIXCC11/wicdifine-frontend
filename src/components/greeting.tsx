import { motion } from 'framer-motion';

interface GreetingProps {
  pulseKey: number;
  isThinking: boolean;
}

export const Greeting = ({ pulseKey, isThinking }: GreetingProps) => {
  return (
    <div className="flex flex-col items-center text-center gap-5 py-14 px-6">
      <motion.div
        key={pulseKey}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{
          opacity: 1,
          scale: isThinking ? 1.08 : 1,
          rotate: isThinking ? 6 : 0,
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 12, duration: 0.5 }}
        className="relative flex h-24 w-24 items-center justify-center"
      >
        <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_90deg,_#71c6ff,_#9f5bff,_#0dd3b2,_#71c6ff)] blur-3xl opacity-60" />
        <span className="relative h-20 w-20 rounded-full bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.95),_rgba(15,23,42,0.9))] shadow-[0_25px_60px_rgba(20,158,137,0.35)]" />
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="text-[0.65rem] tracking-[0.55em] text-emerald-100/70 uppercase"
      >
        WICFIN Copilot
      </motion.p>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-3xl font-semibold text-white"
      >
        Good Evening, borrower.
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-white/70"
      >
        Can I help you with anything?
      </motion.p>
    </div>
  );
};
