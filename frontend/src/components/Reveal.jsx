import { motion } from "framer-motion";

export const Reveal = ({ children, delay = 0, className = "", y = 32 }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    {children}
  </motion.div>
);

export const MaskedLine = ({ children, delay = 0, as: Tag = "span" }) => (
  <span className="hero-mask-line">
    <motion.span
      initial={{ y: "115%" }}
      animate={{ y: 0 }}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.span>
  </span>
);
