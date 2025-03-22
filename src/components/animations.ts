
export const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 20 
  },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    } 
  })
};

export const fadeInScale = {
  hidden: { 
    opacity: 0, 
    scale: 0.95 
  },
  visible: (i: number) => ({ 
    opacity: 1, 
    scale: 1, 
    transition: { 
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.22, 1, 0.36, 1]
    } 
  })
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
    }
  }
};
