
import React from 'react';
import { motion } from 'framer-motion';
import { Bell } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = "No new alerts at the moment"
}) => {
  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-20 px-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="bg-muted flex items-center justify-center w-16 h-16 rounded-full mb-4">
        <Bell className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-lg text-center mb-2">All caught up!</h3>
      <p className="text-muted-foreground text-center max-w-md">
        {message}
      </p>
    </motion.div>
  );
};

export default EmptyState;
