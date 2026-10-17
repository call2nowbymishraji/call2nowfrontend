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

export default function TermsOfService() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Terms of Service</h1>
        <p className="mt-2 text-sm text-slate-500">Effective date: 17 October 2026</p>
        <p className="mt-4 text-sm leading-6 text-slate-600">
          These terms govern your use of Call2Now, a free online directory that helps local businesses get discovered
          by customers nearby. Creating an account or a business profile means you accept these terms.
        </p>

        <Section title="About the service">
          <p>Call2Now lets business owners create a public profile with photos, products and contact details, and lets customers search and browse those profiles.</p>
          <p>Call2Now is a discovery platform only. We are not a party to any sale, agreement or dispute between a customer and a business listed on the site.</p>
        </Section>

        <Section title="Accounts and eligibility">
          <p>You must be 18 years or older and provide accurate information to create an account.</p>
          <p>Signup and login are verified with a one time password sent to your email, or with your Google account. You are responsible for keeping access to your email secure.</p>
          <p>One profile per business. The profile must belong to a real business you are authorised to represent.</p>
        </Section>

        <Section title="Your content">
          <p>You keep ownership of the photos, text and product details you submit. You grant Call2Now a free, worldwide licence to display, reproduce and distribute that content on the platform and in its promotion, for as long as the profile is live.</p>
          <p>You promise that your content is truthful, that you own it or have permission to use it, and that it does not violate any law or the rights of any third party.</p>
        </Section>

        <Section title="Prohibited content and conduct">
          <p>No illegal goods or services, including banned substances, unlicensed medicine sales, gambling without licence, or anything prohibited under Indian law.</p>
          <p>No impersonation of another business, no fake addresses, no stolen photos and no misleading claims.</p>
          <p>No spam, scraping, malware, or attempts to break or overload the platform.</p>
          <p>No offensive, hateful or adult content in photos, names or descriptions.</p>
        </Section>

        <Section title="Verification, promotions and subscriptions">
          <p>Verification is granted at the sole discretion of Call2Now administrators after a genuine business checks in with us on WhatsApp or email. A verified badge means we believe the business is genuine, not a guarantee of quality.</p>
          <p>Free promotion periods, such as 30 or 60 days, and paid plans, such as 1 year or lifetime, are applied by administrators to individual profiles. Promotion affects visibility ordering only and does not create ownership of any placement.</p>
          <p>We may hide, reorder or remove any profile from featured sections, suggested lists or advertisements at any time.</p>
        </Section>

        <Section title="Removal and suspension">
          <p>We may suspend an account or delete a profile that violates these terms, contains unlawful content, or after a genuine legal request. Where practical we will tell you by email before removal.</p>
          <p>You may delete your own profile at any time by contacting us from your registered email address.</p>
        </Section>

        <Section title="Disclaimers">
          <p>The service is provided as is. We do not promise that listings are accurate, that search results fit any particular need, or that the site will be uninterrupted.</p>
          <p>Always verify prices, availability and legitimacy directly with the business before paying anyone. Call2Now never asks customers for payment on behalf of a listed business.</p>
        </Section>

        <Section title="Limitation of liability">
          <p>To the maximum extent permitted by law, Call2Now is not liable for indirect or consequential loss, or for any transaction, dispute or damage arising between users and listed businesses.</p>
        </Section>

        <Section title="Governing law">
          <p>These terms are governed by the laws of India. Courts at Jaipur, Rajasthan have exclusive jurisdiction over any dispute arising from these terms or the service.</p>
        </Section>

        <Section title="Changes to these terms">
          <p>We may revise these terms as the platform evolves. The effective date at the top will change with any revision, and continued use of the service means you accept the revised terms.</p>
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
