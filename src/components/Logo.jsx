import { Link } from 'react-router-dom';

export default function Logo({ className = 'h-9 w-auto', to = '/' }) {
  return (
    <Link to={to} className="inline-block shrink-0" aria-label="Call2Now home">
      <img src="/logo.png" alt="call2now" className={className} />
    </Link>
  );
}
