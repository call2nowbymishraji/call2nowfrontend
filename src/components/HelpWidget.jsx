import { useState } from 'react';

const WHATSAPP_URL = 'https://wa.me/message/LOPV2VBZKKF4E1';
const EMAIL_URL = 'mailto:call2nowbymishraji@gmail.com';

export default function HelpWidget() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-4 z-[70] flex flex-col items-end gap-3 sm:right-6">
      {open && (
        <div className="flex w-44 flex-col gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-card">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2.5 rounded-xl bg-ggreen px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <WhatsAppGlyph />
            WhatsApp us
          </a>
          <a
            href={EMAIL_URL}
            className="inline-flex items-center gap-2.5 rounded-xl bg-gred px-4 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
          >
            <MailGlyph />
            Email us
          </a>
        </div>
      )}
      <div className="flex items-center gap-3">
        <a
          href={WHATSAPP_URL}
          target="_blank"
          rel="noreferrer"
          aria-label="Chat with us on WhatsApp"
          title="Chat with us on WhatsApp"
          className="grid h-14 w-14 place-items-center rounded-full bg-ggreen text-white shadow-card transition hover:scale-105 hover:brightness-110"
        >
          <WhatsAppGlyph big />
        </a>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Help"
          title="Help"
          className="grid h-14 w-14 place-items-center rounded-full bg-primary text-white shadow-card transition hover:scale-105 hover:brightness-110"
        >
          <HelpGlyph />
        </button>
      </div>
    </div>
  );
}

function WhatsAppGlyph({ big = false }) {
  return (
    <svg className={big ? 'h-7 w-7' : 'h-5 w-5'} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

function MailGlyph() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4.24-8 4.76-8-4.76V6.2l8 4.76 8-4.76v2.04Z" />
    </svg>
  );
}

function HelpGlyph() {
  return (
    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm.99-6.99-.99.99h-.02l-.98-.99c0-2.48 1.49-3.49 2.48-4.16.62-.42 1.02-.7 1.02-1.35 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5H9.5A3.5 3.5 0 0 1 13 4c1.93 0 3.5 1.57 3.5 3.5 0 1.72-1.13 2.49-1.95 3.05-.81.55-1.56 1.06-1.56 2.46ZM12 16a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
    </svg>
  );
}
