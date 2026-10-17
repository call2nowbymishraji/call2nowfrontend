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
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <img src="/logo.png" alt="call2now" className="h-8 w-auto brightness-110" />
          <p className="mt-3 text-sm text-slate-400">Register your business profile and get discovered by your city.</p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-white">Contact Us</h4>
          <ul className="space-y-2 text-sm">
            <li>call2nowbymishraji@gmail.com</li>
            <li>+91 9305035828</li>
            <li>Indore, Madhya Pradesh, India</li>
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
        © {new Date().getFullYear()} Call2Now. All rights reserved. · Created by Vaibhav
      </div>
    </footer>
  );
}
