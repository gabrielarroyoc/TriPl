import { AnimatePresence, motion } from 'motion/react'
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react'
import { useToastStore } from '../store/useToastStore'

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex min-w-[300px] items-center gap-3 rounded-lg border px-4 py-3 shadow-2xl backdrop-blur-md
              ${toast.type === 'success' ? 'bg-primary text-white border-primary' : ''}
              ${toast.type === 'error' ? 'bg-red-500/90 text-white border-red-500/20' : ''}
              ${toast.type === 'info' ? 'bg-on-primary-container text-white border-on-primary-container' : ''}
            `}
          >
            {toast.type === 'success' && <CheckCircle size={18} />}
            {toast.type === 'error' && <AlertCircle size={18} />}
            {toast.type === 'info' && <Info size={18} />}
            
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            
            <button 
              onClick={() => removeToast(toast.id)}
              className="opacity-70 hover:opacity-100 transition-opacity"
            >
              <X size={16} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
