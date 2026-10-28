import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import GoogleButton from '../components/GoogleButton.jsx';
import ModeTabs from '../components/ModeTabs.jsx';
import DobSelects from '../components/DobSelects.jsx';
import authService from '../services/authService.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../services/api.js';
import Seo from '../seo/Seo.jsx';
import { privateScreenSeo } from '../seo/pages.js';

const EMPTY_DOB = { day: '', month: '', year: '' };

export default function Login() {
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({ email: '', password: '' });
  const [phoneForm, setPhoneForm] = useState({ phone: '', password: '', dob: EMPTY_DOB });
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  // { step: 'email'|'otp'|'reset'|'phone', method: 'email'|'phone', email, phone, devCode, resetToken }
  const [forgot, setForgot] = useState(null);
  const [forgotForm, setForgotForm] = useState({ code: '', password: '', confirm: '', phone: '', dob: EMPTY_DOB });
  const [error, setError] = useState('');
  const { login, phoneLogin, googleLogin, startSession } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const digitsOnly = (v) => v.replace(/\D/g, '').slice(0, 10);

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

  const phoneDobFilled = (dob) => Boolean(dob.day && dob.month && dob.year);

  const submitPhone = async (e) => {
    e.preventDefault();
    setError('');
    if (phoneForm.phone.length !== 10) return setError('10-digit mobile number required');
    if (!phoneForm.password && !phoneDobFilled(phoneForm.dob))
      return setError('Enter your password or select your date of birth');
    setBusy(true);
    try {
      const payload = phoneForm.password
        ? { phone: phoneForm.phone, password: phoneForm.password }
        : { phone: phoneForm.phone, dob: phoneForm.dob };
      afterAuth(await phoneLogin(payload));
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

  const openForgot = () => {
    setError('');
    setForgotForm({ code: '', password: '', confirm: '', phone: '', dob: EMPTY_DOB });
    setForgot({ step: mode === 'phone' ? 'phone' : 'email', method: mode === 'phone' ? 'phone' : 'email', email: form.email });
  };

  const forgotEmail = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await authService.forgotRequest(forgot.email);
      setForgot({ ...forgot, step: 'otp', devCode: res.devCode });
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

  // No email means no OTP to send, so the number plus the registered date of birth
  // is the proof and the new password is set in the same step.
  const forgotByPhone = async (e) => {
    e.preventDefault();
    setError('');
    if (forgotForm.phone.length !== 10) return setError('10-digit mobile number required');
    if (!phoneDobFilled(forgotForm.dob)) return setError('Select your date of birth');
    if (forgotForm.password.length < 6) return setError('Minimum 6 characters');
    if (forgotForm.password !== forgotForm.confirm) return setError('Passwords do not match');
    setBusy(true);
    try {
      const data = await authService.forgotPhoneReset({
        phone: forgotForm.phone,
        dob: forgotForm.dob,
        newPassword: forgotForm.password,
      });
      setForgot(null);
      toast('Password updated. Logging you in...');
      afterAuth(startSession(data));
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const forgotTabs = [
    { id: 'email', label: 'By Email' },
    { id: 'phone', label: 'By Phone' },
  ];

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Seo {...privateScreenSeo('/login')} />
      <div className="card w-full max-w-md p-8">
        <div className="text-center">
          <Logo to="/" className="mx-auto h-12 w-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Log In</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to access your profile</p>
        </div>
        <div className="mt-6">
          <ModeTabs
            value={mode}
            onChange={(next) => {
              setMode(next);
              setError('');
            }}
            options={[
              { id: 'email', label: 'Login with Email' },
              { id: 'phone', label: 'Login with Phone' },
            ]}
          />
        </div>

        {mode === 'email' ? (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <input
              aria-label="Email address"
              className="input"
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
            />
            <div className="relative">
              <input
                aria-label="Password"
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
              <button type="button" className="text-sm font-semibold text-primary hover:underline" onClick={openForgot}>
                Forgot Password?
              </button>
            </div>
            {error && <p className="err text-center">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitPhone} className="mt-6 space-y-4" noValidate>
            <input
              aria-label="Mobile number"
              className="input"
              inputMode="numeric"
              placeholder="10-digit mobile"
              value={phoneForm.phone}
              onChange={(e) => setPhoneForm((f) => ({ ...f, phone: digitsOnly(e.target.value) }))}
            />
            <div className="relative">
              <input
                aria-label="Password"
                className="input pr-12"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={phoneForm.password}
                onChange={(e) => setPhoneForm((f) => ({ ...f, password: e.target.value }))}
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
            <div className="flex items-center gap-3 text-xs font-semibold text-slate-400">
              <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
            </div>
            <DobSelects
              value={phoneForm.dob}
              onChange={(dob) => setPhoneForm((f) => ({ ...f, dob }))}
              label="Or your date of birth"
            />
            <div className="text-right">
              <button type="button" className="text-sm font-semibold text-primary hover:underline" onClick={openForgot}>
                Forgot Password?
              </button>
            </div>
            {error && <p className="err text-center">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Logging in...' : 'Log In'}
            </button>
          </form>
        )}

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
          <div className="card max-h-[90vh] w-full max-w-sm overflow-y-auto p-6">
            <h3 className="text-lg font-bold text-slate-800">Forgot password</h3>
            <div className="mt-4">
              <ModeTabs
                value={forgot.method}
                onChange={(next) => {
                  setError('');
                  setForgot({ ...forgot, method: next, step: next === 'phone' ? 'phone' : 'email' });
                }}
                options={forgotTabs}
              />
            </div>

            {forgot.method === 'phone' && (
              <form onSubmit={forgotByPhone} className="mt-4 space-y-3" noValidate>
                <p className="text-sm text-slate-500">
                  Enter your registered number and date of birth, then set a new password.
                </p>
                <input
                  aria-label="Mobile number for password reset"
                  className="input"
                  inputMode="numeric"
                  autoFocus
                  placeholder="10-digit mobile"
                  value={forgotForm.phone}
                  onChange={(e) => setForgotForm((f) => ({ ...f, phone: digitsOnly(e.target.value) }))}
                />
                <DobSelects
                  value={forgotForm.dob}
                  onChange={(dob) => setForgotForm((f) => ({ ...f, dob }))}
                  label="Date of birth"
                />
                <input
                  aria-label="New password"
                  className="input"
                  type="password"
                  placeholder="New password"
                  value={forgotForm.password}
                  onChange={(e) => setForgotForm((f) => ({ ...f, password: e.target.value }))}
                />
                <input
                  aria-label="Confirm new password"
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

            {forgot.method === 'email' && forgot.step === 'email' && (
              <form onSubmit={forgotEmail} className="mt-4">
                <p className="mb-3 text-sm text-slate-500">Enter your registered email to receive an OTP.</p>
                <input
                  aria-label="Email address for password reset"
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
            {forgot.method === 'email' && forgot.step === 'otp' && (
              <form onSubmit={forgotOtp} className="mt-4">
                <p className="mb-3 text-sm text-slate-500">Enter the 6-digit code sent to {forgot.email}.</p>
                <input
                  aria-label="Six digit verification code"
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
                    Dev mode: your OTP is {forgot.devCode}
                  </p>
                )}
                {error && <p className="err">{error}</p>}
                <button type="submit" disabled={busy} className="btn-primary mt-4 w-full">
                  Verify OTP
                </button>
              </form>
            )}
            {forgot.method === 'email' && forgot.step === 'reset' && (
              <form onSubmit={forgotReset} className="mt-4 space-y-3">
                <p className="text-sm text-slate-500">Set your new password.</p>
                <input
                  aria-label="New password"
                  className="input"
                  type="password"
                  placeholder="New password"
                  value={forgotForm.password}
                  onChange={(e) => setForgotForm((f) => ({ ...f, password: e.target.value }))}
                />
                <input
                  aria-label="Confirm new password"
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
            <button
              type="button"
              className="mt-3 w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-600"
              onClick={() => setForgot(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
