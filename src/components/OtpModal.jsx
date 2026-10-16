import { useState } from 'react';

export default function OtpModal({ open, title, subtitle, email, devCode, onVerify, onResend, onClose }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) return setError('Enter the 6-digit code');
    setBusy(true);
    setError('');
    try {
      await onVerify(code);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Verification failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true">
      <div className="card w-full max-w-sm p-6">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-blue-50 text-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.66 0 3-1.34 3-3V6a3 3 0 10-6 0v2c0 1.66 1.34 3 3 3zm5 1v9H7v-9" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">
            {subtitle} {email && <span className="font-semibold text-slate-700">{email}</span>}
          </p>
        </div>
        <form onSubmit={submit}>
          <input
            autoFocus
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="------"
            className="input text-center text-2xl font-bold tracking-[0.5em]"
          />
          {error && <p className="err text-center">{error}</p>}
          {devCode && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-700">
              Dev mode — your OTP is {devCode}
            </p>
          )}
          <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
            {busy ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>
        <div className="mt-3 flex items-center justify-between text-xs font-semibold">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={async () => {
              setError('');
              await onResend?.();
            }}
          >
            Resend code
          </button>
          <button type="button" className="text-slate-400 hover:text-slate-600" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
