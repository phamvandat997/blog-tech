import { useState, useEffect } from 'react';

let toastCallback = null;

export function showToast(message) {
  if (toastCallback) toastCallback(message);
}

export function Toast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    toastCallback = (msg) => {
      setMessage(msg);
      setVisible(true);
      setTimeout(() => {
        setVisible(false);
      }, 2200);
    };
    return () => {
      toastCallback = null;
    };
  }, []);

  return (
    <div className={`site-toast ${visible ? 'visible' : ''}`} id="site-toast">
      {message}
    </div>
  );
}
