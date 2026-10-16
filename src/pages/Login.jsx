import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import authService from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../services/api.js';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(null); // { step: 'email'|'otp'|'reset', email, devCode, resetToken }
  const [forgotForm, setForgotForm] = useState({ code: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const { login, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const afterAuth = (data) => {
    toast(`Welcome back, ${data.user.name}`);
    navigate(data.hasProfile ? '/profile' : '/create-profile');
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      afterAuth(await login(form.email, form.password));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = async (payload) => {
    try {
      afterAuth(await googleLogin(payload));
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  const forgotEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await authService.forgotRequest(forgot.email);
      setForgot({ step: 'otp', email: forgot.email, devCode: res.devCode });
      toast('OTP sent to your email', 'info');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const forgotOtp = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await authService.forgotVerify(forgot.email, forgotForm.code);
      setForgot({ ...forgot, step: 'reset', resetToken: res.resetToken });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const forgotReset = async (e) => {
    e.preventDefault();
    if (forgotForm.password.length < 6) return setError('Minimum 6 characters');
    if (forgotForm.password !== forgotForm.confirm) return setError('Passwords do not match');
    setBusy(true);
    setError('');
    try {
      await authService.forgotReset(forgot.resetToken, forgotForm.password);
      setForgot(null);
      toast('Password updated. Logging you in...');
      afterAuth(await login(forgot.email, forgotForm.password));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <div className="text-center">
          <Logo to="/" className="mx-auto h-12 w-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Log In</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to access your profile</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <div className="relative">
            <input
              className="input pr-12"
              type={showPass ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
            />
            <button
              type="button"
              onClick={() => setShowPass((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Toggle password visibility"
            >
              {showPass ? '🙈' : '👁️'}
            </button>
          </div>
          <div className="text-right">
            <button
              type="button"
              className="text-sm font-semibold text-primary hover:underline"
              onClick={() => {
                setError('');
                setForgotForm({ code: '', password: '', confirm: '' });
                setForgot({ step: 'email', email: form.email });
              }}
            >
              Forgot Password?
            </button>
          </div>
          {error && <p className="err text-center">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
        </div>
        <GoogleButton onCredential={onGoogle} />
        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Sign Up
          </Link>
        </p>
      </div>

      {forgot && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 px-4" role="dialog" aria-modal="true">
          <div className="card w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-slate-800">Forgot password</h3>
            {forgot.step === 'email' && (
              <form onSubmit={forgotEmail} className="mt-4">
                <p className="mb-3 text-sm text-slate-500">Enter your registered email to receive an OTP.</p>
                <input
                  className="input"
                  type="email"
                  autoFocus
                  placeholder="Email Address"
                  value={forgot.email}
                  onChange={(e) => setForgot({ ...forgot, email: e.target.value })}
                  required
                />
                {error && <p className="err">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
                  Send OTP
                </button>
              </form>
            )}
            {forgot.step === 'otp' && (
              <form onSubmit={forgotOtp} className="mt-4">
                <p className="mb-3 text-sm text-slate-500">Enter the 6-digit code sent to {forgot.email}.</p>
                <input
                  className="input text-center text-2xl font-bold tracking-[0.5em]"
                  maxLength={6}
                  inputMode="numeric"
                  autoFocus
                  value={forgotForm.code}
                  onChange={(e) => setForgotForm((f) => ({ ...f, code: e.target.value.replace(/\D/g, '') }))}
                  placeholder="------"
                />
                {forgot.devCode && (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs font-semibold text-amber-700">
                    Dev mode — your OTP is {forgot.devCode}
                  </p>
                )}
                {error && <p className="err">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
                  Verify OTP
                </button>
              </form>
            )}
            {forgot.step === 'reset' && (
              <form onSubmit={forgotReset} className="mt-4 space-y-3">
                <p className="text-sm text-slate-500">Set your new password.</p>
                <input
                  className="input"
                  type="password"
                  placeholder="New password"
                  value={forgotForm.password}
                  onChange={(e) => setForgotForm((f) => ({ ...f, password: e.target.value }))}
                />
                <input
                  className="input"
                  type="password"
                  placeholder="Confirm new password"
                  value={forgotForm.confirm}
                  onChange={(e) => setForgotForm((f) => ({ ...f, confirm: e.target.value }))}
                />
                {error && <p className="err">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary w-full">
                  Update Password
                </button>
              </form>
            )}
            <button type="button" className="mt-3 w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600" onClick={() => setForgot(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
