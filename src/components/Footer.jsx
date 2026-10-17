import { Link } from 'react-router-dom';

const SOCIALS = [
  { label: 'Facebook', href: 'https://facebook.com/call2now' },
  { label: 'Instagram', href: 'https://instagram.com/call2now' },
  { label: 'X (Twitter)', href: 'https://x.com/call2now' },
  { label: 'YouTube', href: 'https://youtube.com/@call2now' },
  { label: 'WhatsApp', href: 'https://wa.me/919305035828' },
];

export default function Footer() {
  return (
    <footer className="mt-16 bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <img src="/logo.png" alt="call2now" className="h-8 w-auto brightness-110" />
          <p className="mt-3 text-sm text-slate-400">Register your business profile and get discovered by your city.</p>
        </div>
        <div>
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
              <p className="mt-0.5 text-slate-400">
                554, Rani Path, Parswanath Colony, Rani Sati Nagar, Nirman Nagar, Brijlalpura, Jaipur, Jaipur Nagar Nigam
                Area, Rajasthan 302019, India
              </p>
            </li>
            <li>
              <p className="font-semibold text-slate-200">Branch office</p>
              <p className="mt-0.5 text-slate-400">Raipur Pandit, Uttar Pradesh 273309</p>
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
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Follow Us</h4>
          <ul className="flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-semibold transition hover:bg-primary hover:text-white"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800 py-4 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Call2Now. All rights reserved. · Created by Vaibhav ·{' '}
        <Link to="/privacy" className="font-semibold hover:text-white hover:underline">
          Privacy Policy
        </Link>{' '}
        ·{' '}
        <Link to="/terms" className="font-semibold hover:text-white hover:underline">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}
