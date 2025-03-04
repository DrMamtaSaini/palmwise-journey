
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white pt-16 border-t border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <Link to="/" className="flex items-center">
              <span className="text-2xl font-bold font-serif">Palm<span className="text-palm-purple">Insight</span></span>
            </Link>
            <p className="text-gray-500 mt-4 max-w-xs">
              Discover the secrets hidden in your palm and unlock insights about your past, present, and future.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-semibold text-lg mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-500 hover:text-palm-purple transition-colors">Home</Link></li>
                <li><Link to="/#features" className="text-gray-500 hover:text-palm-purple transition-colors">Features</Link></li>
                <li><Link to="/#testimonials" className="text-gray-500 hover:text-palm-purple transition-colors">Testimonials</Link></li>
                <li><Link to="/#pricing" className="text-gray-500 hover:text-palm-purple transition-colors">Pricing</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link to="/privacy-policy" className="text-gray-500 hover:text-palm-purple transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms-of-service" className="text-gray-500 hover:text-palm-purple transition-colors">Terms of Service</Link></li>
                <li><Link to="/about" className="text-gray-500 hover:text-palm-purple transition-colors">About</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-4">Account</h3>
              <ul className="space-y-2">
                <li><Link to="/login" className="text-gray-500 hover:text-palm-purple transition-colors">Login</Link></li>
                <li><Link to="/signup" className="text-gray-500 hover:text-palm-purple transition-colors">Sign Up</Link></li>
                <li><Link to="/dashboard" className="text-gray-500 hover:text-palm-purple transition-colors">Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 py-6 text-center text-gray-500 text-sm">
          <p>© {currentYear} PalmInsight. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
