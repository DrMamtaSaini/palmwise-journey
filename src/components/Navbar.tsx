
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const closeMenu = () => setIsOpen(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold font-serif">Palm<span className="text-palm-purple">Insight</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <NavLinks location={location} onClick={() => {}} />
            
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md transition-colors hover:text-palm-purple"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-palm-purple text-white px-4 py-2 rounded-md hover:bg-palm-purple/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white">
          <div className="px-6 py-4 space-y-4">
            <NavLinks location={location} onClick={closeMenu} />
            
            <div className="flex flex-col space-y-3 pt-4 border-t">
              <Link
                to="/login"
                className="px-4 py-2 rounded-md text-center hover:bg-gray-100"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-palm-purple text-white px-4 py-2 rounded-md text-center"
                onClick={closeMenu}
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

const NavLinks = ({ location, onClick }: { location: any; onClick: () => void }) => {
  const navItems = [
    { name: "Home", path: "/" },
    { name: "Features", path: "/#features" },
    { name: "Testimonials", path: "/#testimonials" },
    { name: "Pricing", path: "/#pricing" },
  ];

  return (
    <>
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`transition-colors hover:text-palm-purple ${
            location.pathname === item.path ? "font-medium text-palm-purple" : ""
          }`}
          onClick={onClick}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
};

export default Navbar;
