import { useState, useCallback } from 'react';
import { CheckIcon, XIcon, InfoIcon } from './Icons';

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return { toasts, addToast };
}

export function ToastContainer({ toasts }) {
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && <CheckIcon />}
          {t.type === 'error' && <XIcon />}
          {t.type === 'info' && <InfoIcon />}
          {t.message}
        </div>
      ))}
    </div>
  );
}
