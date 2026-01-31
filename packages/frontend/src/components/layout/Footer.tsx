import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-navy-800 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-gold-500 flex items-center justify-center">
                <span className="text-navy-800 font-display text-xl font-bold">S</span>
              </div>
              <span className="font-display text-xl font-semibold">Spanish Class</span>
            </Link>
            <p className="mt-4 text-navy-200 max-w-md">
              Learn Spanish online with experienced native teachers. Book individual or group
              sessions and start your language journey today.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-navy-200 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/offerings" className="text-navy-200 hover:text-white transition-colors">
                  Our Classes
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-navy-200 hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-navy-200">
              <li>professor@spanishclass.com</li>
              <li>Madrid, Spain</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-navy-700 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-navy-300 text-sm">
            &copy; {new Date().getFullYear()} Spanish Class. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-navy-300 hover:text-white text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link to="#" className="text-navy-300 hover:text-white text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
