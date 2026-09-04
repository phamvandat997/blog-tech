import { useState, useEffect } from 'react';

const CIRCUMFERENCE = 125.66; // 2 * Math.PI * 20

export function BackToTop() {
  const [visible, setVisible] = useState(false);
  const [dashOffset, setDashOffset] = useState(CIRCUMFERENCE);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(scrollY > 180);

      if (maxScroll > 0) {
        const pct = Math.min(1, Math.max(0, scrollY / maxScroll));
        setDashOffset(CIRCUMFERENCE * (1 - pct));
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      className={`btn-back-to-top ${visible ? 'visible' : ''}`}
      id="btn-back-to-top"
      title="Lên đầu trang"
      aria-label="Lên đầu trang"
      onClick={scrollToTop}
    >
      <svg className="progress-ring" width="46" height="46" viewBox="0 0 46 46" aria-hidden="true">
        <circle className="progress-ring-track" cx="23" cy="23" r="20" fill="none" strokeWidth="3" />
        <circle
          className="progress-ring-indicator"
          cx="23"
          cy="23"
          r="20"
          fill="none"
          strokeWidth="3"
          strokeDasharray={CIRCUMFERENCE}
          style={{ strokeDashoffset: dashOffset }}
        />
      </svg>
      <span className="back-to-top-icon" aria-hidden="true">
        ↑
      </span>
    </button>
  );
}
