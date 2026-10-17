import { useEffect, useState } from 'react';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
let initDone = false;
let activeCb = null;

export default function GoogleButton({ onCredential }) {
  const [devOpen, setDevOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  activeCb = onCredential;

  useEffect(() => {
    if (!CLIENT_ID || initDone) return;
    const id = 'gsi-script';
    if (!document.getElementById(id)) {
      const s = document.createElement('script');
      s.id = id;
      s.src = 'https://accounts.google.com/gsi/client';
      s.async = true;
      s.defer = true;
      document.body.appendChild(s);
    }
    const tryInit = () => {
      if (!window.google?.accounts?.id) return setTimeout(tryInit, 300);
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (res) => activeCb && activeCb({ credential: res.credential }),
      });
      initDone = true;
    };
    tryInit();
  }, []);

  const click = () => {
    if (CLIENT_ID && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      setDevOpen(true);
    }
  };

  return (
    <>
      <button type="button" onClick={click} className="btn-outline w-full">
        <svg className="h-5 w-5" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Continue with Google
      </button>
      {devOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800">Dev mode: Google login</h3>
            <p className="mt-1 text-xs text-slate-500">
              No VITE_GOOGLE_CLIENT_ID configured, so simulate the Google account that would be returned.
            </p>
            <input className="input mt-4" placeholder="Google name" value={name} onChange={(e) => setName(e.target.value)} />
            <input
              className="input mt-2"
              type="email"
              placeholder="Google email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="btn-primary flex-1 !py-2.5 text-sm"
                onClick={() => {
                  if (!email.trim()) return;
                  setDevOpen(false);
                  onCredential({ email: email.trim(), name: name.trim() || email.split('@')[0] });
                }}
              >
                Continue
              </button>
              <button type="button" className="btn-outline flex-1 !py-2.5 text-sm" onClick={() => setDevOpen(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
