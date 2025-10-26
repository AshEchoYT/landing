import React from 'react';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-green-500/20 py-8">
      <div className="max-w-screen-2xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold text-green-400 mb-4">Events.Echo</h3>
            <p className="text-gray-400">
              Your gateway to concerts, festivals, and experiences reimagined.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/events" className="text-gray-400 hover:text-green-400">Events</Link></li>
              <li><Link href="/organizer" className="text-gray-400 hover:text-green-400">Organize</Link></li>
              <li><Link href="/tickets" className="text-gray-400 hover:text-green-400">My Tickets</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Support</h4>
            <ul className="space-y-2">
              <li><Link href="/help" className="text-gray-400 hover:text-green-400">Help Center</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-green-400">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-green-400">Twitter</a>
              <a href="#" className="text-gray-400 hover:text-green-400">Instagram</a>
              <a href="#" className="text-gray-400 hover:text-green-400">Facebook</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">&copy; 2025 Events.Echo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;