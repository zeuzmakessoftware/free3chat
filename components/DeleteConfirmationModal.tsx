"use client";

import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  chatTitle: string;
  theme: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  chatTitle,
  theme,
}: DeleteConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className={`relative rounded-xl p-6 shadow-xl w-full max-w-md mx-4 ${
              theme === 'dark'
                ? 'bg-[#1C151A] text-white border border-white/10'
                : 'bg-white text-black border'
            }`}
            onClick={(e) => e.stopPropagation()} // Prevent closing modal when clicking inside
          >
            <h2 className="text-xl font-bold">Delete Thread</h2>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
              Are you sure you want to delete &quot;{chatTitle}&quot;? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-white/10 hover:bg-white/20'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}