import { Link, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import ViewPickers from './ViewPickers.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useLang } from '../context/LangContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Logo />
        <nav className="flex items-center gap-2 sm:gap-3">
          <span className="hidden sm:block">
            <ViewPickers />
          </span>
          {user ? (
            <>
              <Link to="/profile" className="text-xs font-semibold text-slate-600 hover:text-primary sm:text-sm">
                {t('My Profile')}
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-xs font-semibold text-slate-600 hover:text-primary sm:text-sm">
                  {t('Admin')}
                </Link>
              )}
              <button
                className="btn-outline !px-3 !py-2 text-xs sm:!px-5 sm:!py-2 sm:text-sm"
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
                {t('Log Out')}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-outline !whitespace-nowrap !px-3 !py-2 text-xs sm:!px-7 sm:!py-2.5 sm:text-sm">
                {t('Log In')}
              </Link>
              <Link to="/signup" className="btn-primary !whitespace-nowrap !px-3 !py-2 text-xs sm:!px-7 sm:!py-2.5 sm:text-sm">
                {t('Sign Up')}
              </Link>
            </>
          )}
        </nav>
      </div>
      {/* Below sm the header keeps one line for the logo and the account buttons, so the two
          pickers get a second row instead of squeezing the buttons. */}
      <div className="px-4 pb-2 sm:hidden">
        <ViewPickers />
      </div>
    </header>
  );
}
