import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo.jsx';
import OtpModal from '../components/OtpModal.jsx';
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

export default function Signup() {
  const [mode, setMode] = useState('email'); // 'email' | 'phone'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [phoneForm, setPhoneForm] = useState({ name: '', phone: '', password: '', dob: EMPTY_DOB });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [otp, setOtp] = useState(null); // { email, devCode }
  const { startSession, googleLogin } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setPhone = (k) => (e) =>
    setPhoneForm((f) => ({ ...f, [k]: k === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value }));

  const validate = () => {
    const e = {};
    if (form.name.trim().length < 2) e.name = 'Name is required';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = 'Valid email is required';
    if (form.password.length < 6) e.password = 'Minimum 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    try {
      const res = await authService.signup(form);
      setOtp({ email: form.email, devCode: res.devCode });
      toast('OTP sent to your email', 'info');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const validatePhone = () => {
    const e = {};
    if (phoneForm.name.trim().length < 2) e.name = 'Name is required';
    if (phoneForm.phone.length !== 10) e.phone = '10-digit mobile number required';
    if (phoneForm.password.length < 6) e.password = 'Minimum 6 characters';
    const { day, month, year } = phoneForm.dob;
    if (!day || !month || !year) e.dob = 'Select day, month and year';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const submitPhone = async (ev) => {
    ev.preventDefault();
    if (!validatePhone()) return;
    setBusy(true);
    try {
      const { name, phone, password, dob } = phoneForm;
      const data = await authService.signupPhone({ name, phone, password, dob });
      startSession(data);
      toast('Account created! Now create your business profile.');
      navigate(data.hasProfile ? '/profile' : '/create-profile');
    } catch (e) {
      toast(errMsg(e), 'error');
    } finally {
      setBusy(false);
    }
  };

  const verify = async (code) => {
    const data = await authService.verifySignup({ email: form.email, code });
    startSession(data);
    toast('Account verified! Now create your business profile.');
    navigate('/create-profile');
  };

  const onGoogle = async (payload) => {
    try {
      const data = await googleLogin(payload);
      toast(`Welcome, ${data.user.name}`);
      navigate(data.hasProfile ? '/profile' : '/create-profile');
    } catch (e) {
      toast(errMsg(e), 'error');
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
  };

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <Seo {...privateScreenSeo('/signup')} />
      <div className="card w-full max-w-md p-8">
        <div className="text-center">
          <Logo to="/" className="mx-auto h-12 w-auto" />
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Sign Up</h1>
          <p className="mt-1 text-sm text-slate-500">Create your account to register your business</p>
        </div>
        <div className="mt-6">
          <ModeTabs
            value={mode}
            onChange={switchMode}
            options={[
              { id: 'email', label: 'Sign up with Email' },
              { id: 'phone', label: 'Sign up with Phone' },
            ]}
          />
        </div>

        {mode === 'email' ? (
          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            <div>
              <input aria-label="Your name" className="input" placeholder="Name" value={form.name} onChange={set('name')} />
              {errors.name && <p className="err">{errors.name}</p>}
            </div>
            <div>
              <input aria-label="Email address" className="input" type="email" placeholder="Email Address" value={form.email} onChange={set('email')} />
              {errors.email && <p className="err">{errors.email}</p>}
            </div>
            <div className="relative">
              <input
                aria-label="Password"
                className="input pr-12"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={set('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
              {errors.password && <p className="err">{errors.password}</p>}
            </div>
            <p className="text-xs text-slate-500">We send a one time code to this email to confirm it is yours.</p>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Sending OTP...' : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={submitPhone} className="mt-6 space-y-4" noValidate>
            <div>
              <input aria-label="Your name" className="input" placeholder="Name" value={phoneForm.name} onChange={setPhone('name')} />
              {errors.name && <p className="err">{errors.name}</p>}
            </div>
            <div>
              <input
                aria-label="Mobile number"
                className="input"
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={phoneForm.phone}
                onChange={setPhone('phone')}
              />
              {errors.phone && <p className="err">{errors.phone}</p>}
            </div>
            <div className="relative">
              <input
                aria-label="Password"
                className="input pr-12"
                type={showPass ? 'text' : 'password'}
                placeholder="Password"
                value={phoneForm.password}
                onChange={setPhone('password')}
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
              {errors.password && <p className="err">{errors.password}</p>}
            </div>
            <div>
              <DobSelects
                value={phoneForm.dob}
                onChange={(dob) => setPhoneForm((f) => ({ ...f, dob }))}
                label="Date of birth"
              />
              {errors.dob && <p className="err">{errors.dob}</p>}
            </div>
            <p className="text-xs text-slate-500">
              Your date of birth is also your backup sign in, so keep it real. No email verification needed.
            </p>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
          <span className="h-px flex-1 bg-slate-200" /> OR <span className="h-px flex-1 bg-slate-200" />
        </div>
        <GoogleButton onCredential={onGoogle} />
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Log In
          </Link>
        </p>
      </div>
      <OtpModal
        open={Boolean(otp)}
        title="Verify your email"
        subtitle="We sent a 6-digit code to"
        email={otp?.email}
        devCode={otp?.devCode}
        onVerify={verify}
        onResend={async () => {
          try {
            const res = await authService.resendOtp({ email: form.email, purpose: 'signup' });
            setOtp((o) => ({ ...o, devCode: res.devCode }));
            toast('New OTP sent', 'info');
          } catch (e) {
            toast(errMsg(e), 'error');
          }
        }}
        onClose={() => setOtp(null)}
      />
    </div>
  );
}
