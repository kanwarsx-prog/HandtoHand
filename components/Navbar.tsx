'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const isActive = (path: string) => pathname === path;

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="text-2xl font-bold text-indigo-600 flex items-center gap-2" onClick={closeMobileMenu}>
                            <span>🤝</span> HandtoHand
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {user ? (
                            <>
                                <Link
                                    href="/matches"
                                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 rounded-md ${isActive('/matches') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}
                                >
                                    🎯 Matches
                                </Link>
                                <Link
                                    href="/messages"
                                    className={`px-3 py-2 text-sm font-medium transition-colors flex items-center gap-1 rounded-md ${isActive('/messages') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}
                                >
                                    💬 Messages
                                </Link>
                                <Link
                                    href="/profile"
                                    className={`px-3 py-2 text-sm font-medium transition-colors rounded-md ${isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600'}`}
                                >
                                    Profile
                                </Link>
                                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                                <Link
                                    href="/wishes/create"
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
                                >
                                    + Wish
                                </Link>
                                <Link
                                    href="/offers/create"
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                >
                                    + Offer
                                </Link>
                                <div className="ml-2 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium border border-indigo-200 cursor-default" title={user.email || 'User'}>
                                    {user.email?.[0].toUpperCase()}
                                </div>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                            aria-controls="mobile-menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {!isMobileMenuOpen ? (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            ) : (
                                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full" id="mobile-menu">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        {user ? (
                            <>
                                <div className="px-3 py-3 border-b border-gray-100 mb-2 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-900 truncate">{user.user_metadata?.display_name || 'User'}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                                <Link
                                    href="/"
                                    onClick={closeMobileMenu}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}
                                >
                                    🏠 Home
                                </Link>
                                <Link
                                    href="/matches"
                                    onClick={closeMobileMenu}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/matches') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}
                                >
                                    🎯 Matches
                                </Link>
                                <Link
                                    href="/messages"
                                    onClick={closeMobileMenu}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/messages') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}
                                >
                                    💬 Messages
                                </Link>
                                <Link
                                    href="/profile"
                                    onClick={closeMobileMenu}
                                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/profile') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}
                                >
                                    👤 Profile
                                </Link>
                                <div className="grid grid-cols-2 gap-3 p-3 mt-2 border-t border-gray-100">
                                    <Link
                                        href="/wishes/create"
                                        onClick={closeMobileMenu}
                                        className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg text-sm font-bold shadow-sm"
                                    >
                                        + Post Wish
                                    </Link>
                                    <Link
                                        href="/offers/create"
                                        onClick={closeMobileMenu}
                                        className="flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm"
                                    >
                                        + Post Offer
                                    </Link>
                                </div>
                                <button
                                    onClick={() => {
                                        signOut();
                                        closeMobileMenu();
                                    }}
                                    className="w-full text-left block px-3 py-2 mt-1 rounded-md text-base font-medium text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                onClick={closeMobileMenu}
                                className="block w-full text-center px-4 py-3 bg-indigo-600 text-white rounded-lg font-bold"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
