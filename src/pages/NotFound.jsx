import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Seo from '../seo/Seo.jsx';
import { notFoundSeo } from '../seo/pages.js';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Seo {...notFoundSeo()} />
      <Navbar />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="card w-full max-w-md p-10 text-center">
          <p className="text-6xl font-extrabold text-primary">404</p>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900">Page not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            The page you are looking for was moved, removed or never existed. Let us get you back to discovering
            businesses near you.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link to="/" className="btn-primary">
              Go to home page
            </Link>
            <Link to="/search" className="btn-outline">
              Browse all businesses
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
