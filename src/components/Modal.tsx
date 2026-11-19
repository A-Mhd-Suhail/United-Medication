import { useEffect } from 'react';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';

/* Dialog shell */
export default function Modal({
  title, icon, onClose, children, footer, wide, small,
}: {
  title: string;
  icon?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  wide?: boolean;
  small?: boolean;
}) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const maxWidthClass = small ? 'max-w-[480px]' : wide ? 'max-w-[840px]' : 'max-w-[620px]';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 bg-black/55 backdrop-blur-[3px] flex items-center justify-center p-4 z-50 animate-in fade-in duration-200"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`pop-in bg-surface rounded-xl border border-line shadow-2xl w-full ${maxWidthClass} flex flex-col max-h-[90vh] overflow-hidden`}>
        <div className="p-4 sm:p-5 border-b border-line flex items-center justify-between shrink-0 bg-surface">
          <div className="flex items-center gap-3">
            {icon && <div className="p-2 rounded-lg bg-black text-champagne">{icon}</div>}
            <h3 className="font-display text-[19px] font-medium text-heading">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-muted hover:bg-app hover:text-ink transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="p-5 sm:p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
        {footer && <div className="p-4 border-t border-line bg-stripe flex justify-end gap-3 shrink-0">{footer}</div>}
      </div>
    </div>
  );
}

