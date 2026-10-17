import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

function Section({ title, children }) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-2 space-y-2 text-sm leading-6 text-slate-600">{children}</div>
    </section>
  );
}

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Privacy Policy</h1>
        <p className="mt-2 text-sm text-slate-500">Effective date: 17 October 2026</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          Call2Now operates a free public directory of local businesses. This policy explains what information we
          collect, why we collect it and the choices you have. By using Call2Now you agree to this policy.
        </p>

        <Section title="Information we collect">
          <p>Account information: your name, email address and phone number when you sign up, plus a hashed password if you create one.</p>
          <p>Business profile information: shop name, category, address and city, contact numbers, WhatsApp number, email, photos, product lists, social media links and the year your business started, exactly as you submit them.</p>
          <p>Verification and support information: messages you send us on WhatsApp or email when you ask for profile verification or help.</p>
          <p>Usage information: basic technical logs such as pages visited and errors, used only to keep the service running.</p>
        </Section>

        <Section title="How we use your information">
          <p>To publish and display your business profile and products in search results, on the home page and on your public profile page.</p>
          <p>To send one time passwords and account related emails.</p>
          <p>To review verification requests, manage promotions and subscriptions, and respond to support messages.</p>
          <p>To remove unlawful or misleading content and protect the platform from abuse.</p>
        </Section>

        <Section title="What is public">
          <p>
            A business profile on Call2Now is public by design. Shop name, category, city, photos, products and the
            contact details you provide can be seen by any visitor and may appear in search engines. Do not submit
            personal information you do not want published, such as a home address or a private phone number.
          </p>
        </Section>

        <Section title="How we share information">
          <p>We do not sell your information and we do not show third party tracking advertisements.</p>
          <p>We share data only with the service providers that run the platform: hosting for the website and API, the database that stores records, email delivery for one time passwords and image storage for uploaded photos. Each provider processes data only to deliver its service.</p>
          <p>We may disclose information when required by Indian law, a court order or a government authority.</p>
        </Section>

        <Section title="Data storage and security">
          <p>Passwords are stored only in hashed form. Traffic between your browser and our servers is encrypted.</p>
          <p>Records are stored on cloud infrastructure in India and abroad, including managed database and image hosting services.</p>
          <p>No method of transmission or storage is completely secure. We apply reasonable technical and organisational measures to protect your data.</p>
        </Section>

        <Section title="Retention and deletion">
          <p>We keep your account and profile while you use Call2Now. You can ask us to delete your profile and account at any time by emailing us from your registered address.</p>
          <p>Call2Now administrators may also hide or delete profiles that violate the Terms of Service or contain unlawful content.</p>
        </Section>

        <Section title="Your rights">
          <p>You may request a copy of your information, correction of wrong details, or deletion of your profile and account. We respond to genuine requests from the registered email address within a reasonable time.</p>
          <p>Users in India additionally have rights under the Information Technology Act 2000 and the Digital Personal Data Protection Act 2023.</p>
        </Section>

        <Section title="Children">
          <p>Call2Now is intended for business owners and customers aged 18 and above. We do not knowingly collect information from children.</p>
        </Section>

        <Section title="Changes to this policy">
          <p>We may update this policy as the platform grows. The effective date at the top will change with any update, and continued use of the site means you accept the revised policy.</p>
        </Section>

        <Section title="Contact us">
          <p>Email: call2nowbymishraji@gmail.com</p>
          <p>Phone and WhatsApp: +91 9305035828</p>
          <p>Head office: 554, Rani Path, Parswanath Colony, Rani Sati Nagar, Nirman Nagar, Brijlalpura, Jaipur, Rajasthan 302019, India</p>
          <p>Branch office: Raipur, Uttar Pradesh 273309</p>
        </Section>
      </main>
      <Footer />
    </div>
  );
}
