import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 shadow-sm">
      <div className="w-full mx-auto max-w-screen-xl px-4 py-6 md:flex md:items-center md:justify-between">
        <div className="flex items-center justify-center md:justify-start mb-4 md:mb-0">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600 sm:text-center">
              © 2025 
              <span className="ml-1 font-semibold text-blue-600">
                SkillSwap
              </span>
              . All Rights Reserved.
            </span>
          </div>
        </div>
        <ul className="flex flex-wrap items-center justify-center md:justify-end text-sm font-medium text-gray-600 space-x-6">
          <li>
            <Link to="#" className="hover:text-blue-600 hover:underline transition-colors duration-200">About</Link>
          </li>
          <li>
            <Link to="#" className="hover:text-blue-600 hover:underline transition-colors duration-200">Privacy Policy</Link>
          </li>
          <li>
            <Link to="#" className="hover:text-blue-600 hover:underline transition-colors duration-200">Terms of Service</Link>
          </li>
          <li>
            <Link to="#" className="hover:text-blue-600 hover:underline transition-colors duration-200">Contact</Link>
          </li>
        </ul>
      </div>
    </footer>
  );
};

export default Footer;
