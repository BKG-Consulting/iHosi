'use client';

import { Shield, Award, Mail, Globe } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export function LandingFooter() {
  const solutions = [
    { name: 'Patient Management', href: '#features' },
    { name: 'Clinical Operations', href: '#features' },
    { name: 'Business Intelligence', href: '#features' },
    { name: 'Security & Compliance', href: '#features' },
  ];

  const company = [
    { name: 'About Us', href: '#about' },
    { name: 'Sign In', href: '/sign-in' },
    { name: 'Contact', href: '#contact' },
    { name: 'Privacy Policy', href: '#' },
  ];

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          {/* Brand Section */}
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="iHosi Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-black">iHosi</span>
                <p className="text-gray-600 text-sm">Healthcare Management</p>
              </div>
            </div>
            <p className="text-gray-700 text-lg leading-relaxed mb-8">
              Transforming healthcare delivery through intelligent technology. 
              Where innovation meets healthcare excellence.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="h-5 w-5 text-brand-cyan-600" />
                <span>services@bkgconsultants.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Globe className="h-5 w-5 text-brand-amber-600" />
                <span>www.ihosi.com</span>
              </div>
            </div>
          </div>

          {/* Solutions */}
          <div className="md:col-span-3">
            <h3 className="text-black font-bold text-lg mb-6">Solutions</h3>
            <ul className="space-y-4">
              {solutions.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-700 hover:text-black transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="md:col-span-4">
            <h3 className="text-black font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-4">
              {company.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-700 hover:text-black transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-center md:text-left">
              &copy; 2025 iHosi Healthcare Management System. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2 text-gray-600">
                <Shield className="h-4 w-4 text-brand-amber-600" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Award className="h-4 w-4 text-brand-cyan-600" />
                <span className="text-sm">SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
