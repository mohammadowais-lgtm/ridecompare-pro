import { AnimatePresence, motion } from "framer-motion";

export interface ToastData {
  id: number;
  title: string;
  url: string;
}

export function Toast({ toast }: { toast: ToastData | null }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-[480px] rounded-lg bg-foreground px-4 py-3 text-card"
          >
            <p className="text-sm font-medium">{toast.title}</p>
            <p className="mt-1 truncate font-mono text-[11px] opacity-70">{toast.url}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
