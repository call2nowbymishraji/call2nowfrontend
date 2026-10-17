import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Footer() {
  const { user } = useAuth();
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <img src="/logo.png" alt="call2now" className="block h-8 w-auto brightness-110" />
          <p className="mt-4 max-w-xs text-left text-sm leading-6 text-slate-400">
            Register your business profile and get discovered by your city.
          </p>
        </div>
        <div>
          <div className="mb-5 flex flex-wrap gap-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="rounded-full border border-slate-600 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-white hover:text-white"
                >
                  My Profile
                </Link>
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90"
                  >
                    Admin dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border border-slate-600 px-4 py-2 text-xs font-bold text-slate-200 transition hover:border-white hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-primary/90"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Contact Us</h4>
          <ul className="space-y-2 text-sm">
            <li>call2nowbymishraji@gmail.com</li>
            <li>+91 9305035828</li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Our Offices</h4>
          <ul className="space-y-3 text-sm">
            <li>
              <p className="font-semibold text-slate-200">Head office</p>
              <p className="mt-0.5 text-left leading-6 text-slate-400">
                554, Rani Path, Parswanath Colony, Rani Sati Nagar, Nirman Nagar, Brijlalpura, Jaipur, Jaipur Nagar Nigam
                Area, Rajasthan 302019, India
              </p>
            </li>
            <li>
              <p className="font-semibold text-slate-200">Branch office</p>
              <p className="mt-0.5 text-left leading-6 text-slate-400">Raipur Pandit, Uttar Pradesh 273309</p>
              <a
                href="https://maps.app.goo.gl/NVcbgdpkiQec8Uhx8?g_st=awb"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-xs font-semibold text-gblue hover:underline"
              >
                View on Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-2 px-4 pt-4 text-xs text-slate-400">
          <Link to="/privacy" className="font-semibold hover:text-white hover:underline">
            Privacy Policy
          </Link>
          <span>·</span>
          <Link to="/terms" className="font-semibold hover:text-white hover:underline">
            Terms of Service
          </Link>
        </div>
        <div className="px-4 py-4 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Call2Now. All rights reserved. · Created by Vaibhav
        </div>
      </div>
    </footer>
  );
}
