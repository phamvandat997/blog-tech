import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer border-t border-slate-200 dark:border-slate-800/80 py-8 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md mt-auto">
      <div className="footer-inner w-full lg:w-[60%] lg:max-w-[60%] mx-auto px-4 text-center">
        <p className="footer-copyright text-sm text-slate-500 dark:text-slate-400 m-0">
          &copy; {new Date().getFullYear()} <strong className="font-bold text-slate-800 dark:text-slate-200">TechMentor Pro</strong>. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
