import * as React from 'react';
import { cn } from '@/lib/utils';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

function DialogBox({ open, onClose, title, description, children, className }: DialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      {open && (
        <>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm dark:bg-black/80" />
          <Transition
            show={open}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-4 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-4 sm:scale-95"
          >
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <Dialog.Panel className={cn(
                  'w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left text-navy-900 shadow-xl transition-all dark:border dark:bg-navy-800 dark:text-white',
                  className
                )}
                >
                  <div className="flex items-center justify-between mb-4">
                    {title && (
                      <>
                        <Dialog.Title className="text-lg font-semibold leading-6">{title}</Dialog.Title>
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                      </>
                    )}
                    <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:text-navy-900 dark:hover:text-white transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div>{children}</div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition>
        </>
      )}
    </Dialog>
  );
}

export default DialogBox;
