import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <header className="border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">
              T
            </div>
            <span className="font-bold text-lg text-primary-600">TranTxt</span>
          </div>
          <div className="flex gap-4">
            <Link to="/login" className="text-neutral-600 hover:text-neutral-900 font-medium">
              Log In
            </Link>
            <Link to="/signup" className="btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6">
            Enterprise Translation Made Simple
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Upload your documents, preserve your layout, translate instantly. Secure, scalable, and built for enterprise teams.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup" className="btn-primary px-8 py-3 text-lg">
              Get Started
            </Link>
            <Link to="/login" className="btn-outline px-8 py-3 text-lg">
              Sign In
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white border-t border-neutral-200 py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-neutral-900 mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card text-center">
                <div className="text-4xl mb-4">📄</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Multiple Formats</h3>
                <p className="text-neutral-600">Support for PDF, DOCX, and images with OCR</p>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-4">🔒</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Enterprise Security</h3>
                <p className="text-neutral-600">AES-256 encryption, JWT authentication, audit logs</p>
              </div>
              <div className="card text-center">
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-lg font-bold text-neutral-900 mb-2">Fast Processing</h3>
                <p className="text-neutral-600">Instant translations with layout preservation</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Ready to get started?</h2>
          <p className="text-lg text-neutral-600 mb-8">Join teams worldwide using TranTxt for enterprise translation.</p>
          <Link to="/signup" className="btn-primary px-8 py-3 text-lg inline-block">
            Create Free Account
          </Link>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-neutral-50 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-neutral-600 text-sm">
          <p>&copy; 2026 TranTxt. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
