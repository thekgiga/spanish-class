import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-3 group">
              <img src="/icons/elite_logo.png" alt="Elite Spanish Class" className="h-10 w-10 rounded-xl object-contain shadow-colored-indigo group-hover:scale-105 transition-transform duration-200" />
              <span className="font-display text-xl font-semibold group-hover:text-indigo-400 transition-colors duration-200">Spanish Class</span>
            </Link>
            <p className="mt-4 text-slate-300 max-w-md leading-relaxed">
              Learn Spanish online with experienced native teachers. Book individual or group
              sessions and start your language journey today.
            </p>

            {/* Social Media */}
            <div className="mt-6">
              <h3 className="font-semibold mb-3 text-white">Follow Us</h3>
              <a
                href="https://www.instagram.com/casovi_spanskog_online/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg hover:from-pink-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-soft"
              >
                <Instagram className="h-5 w-5" />
                <span className="font-medium">@casovi_spanskog_online</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/offerings" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200">
                  Our Classes
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-slate-300 hover:text-indigo-400 transition-colors duration-200">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-white">Contact</h3>
            <ul className="space-y-2 text-slate-300">
              <li>professor@spanishclass.com</li>
              <li>Madrid, Spain</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-700/60 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} Spanish Class. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200">
              Privacy Policy
            </Link>
            <Link to="#" className="text-slate-400 hover:text-indigo-400 text-sm transition-colors duration-200">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
