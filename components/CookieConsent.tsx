'use client';

import { useEffect, useState } from 'react';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('pp_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem('pp_cookie_consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('pp_cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-black/10 bg-white/95 p-5 backdrop-blur-md dark:border-white/10 dark:bg-pulse-charcoal/95">
      <div className="container-max flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
        <p className="text-sm text-black/70 dark:text-white/70">
          We use cookies to improve your experience on this site. By continuing to browse, you agree to
          our use of cookies.
        </p>
        <div className="flex flex-shrink-0 gap-3">
          <button onClick={decline} className="rounded-full border border-black/15 px-5 py-2 text-sm font-medium dark:border-white/20">
            Decline
          </button>
          <button onClick={accept} className="rounded-full bg-pulse-red px-5 py-2 text-sm font-semibold text-white">
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
