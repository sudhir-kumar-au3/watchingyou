import { Link } from 'react-router-dom';

export const NotFoundPage = () => (
  <div className="flex flex-col items-center gap-4 py-24 text-center">
    <span className="font-mono text-6xl font-bold text-cyan neon-text">404</span>
    <p className="text-haze">That visualization drifted off the timeline.</p>
    <Link
      to="/"
      className="rounded-xl glass px-5 py-2.5 text-sm text-mist transition hover:text-cyan"
    >
      Back to gallery
    </Link>
  </div>
);
