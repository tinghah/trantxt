import { Link } from 'react-router-dom';

export const Sidebar = () => {
  return (
    <aside className="hidden md:block w-64 bg-neutral-900 text-white h-screen fixed left-0 top-16 border-r border-neutral-800">
      <nav className="p-4 space-y-2">
        <Link to="/dashboard" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
          Dashboard
        </Link>
        <Link to="/upload" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
          Upload Document
        </Link>
        <Link to="/history" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
          Translation History
        </Link>
        <Link to="/profile" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
          Profile
        </Link>
      </nav>
    </aside>
  );
};
