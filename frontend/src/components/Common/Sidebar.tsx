import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="hidden md:block w-64 bg-neutral-900 text-white h-screen fixed left-0 top-16 border-r border-neutral-800">
      <nav className="p-4 space-y-1">
        <p className="px-4 py-2 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
          Workspace
        </p>
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
        <Link to="/settings" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
          Settings
        </Link>

        {user?.isAdmin && (
          <>
            <p className="px-4 py-2 mt-4 text-xs uppercase tracking-wider text-neutral-500 font-semibold">
              Admin
            </p>
            <Link to="/admin/dashboard" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
              Dashboard
            </Link>
            <Link to="/admin/users" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
              Users
            </Link>
            <Link to="/admin/groups" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
              Groups
            </Link>
            <Link to="/admin/translations" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
              Translations
            </Link>
            <Link to="/settings" className="block px-4 py-2 rounded-lg hover:bg-neutral-800 text-sm">
              Configuration
            </Link>
          </>
        )}
      </nav>
    </aside>
  );
};
