'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/AuthProvider';
import { usePathname } from 'next/navigation';
import {
    Home,
    MessageCircle,
    Target,
    User,
    Plus,
    LogOut,
    Menu,
    X
} from 'lucide-react';

export default function Navbar() {
    const { user, signOut } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
    const closeMobileMenu = () => setIsMobileMenuOpen(false);
    const isActive = (path: string) => pathname === path;

    return (
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'py-2' : 'py-4'}`}>
            <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 ${scrolled ? '' : 'sm:px-0'}`}>
                <div className={`
                    glass rounded-2xl px-6 h-16 flex items-center justify-between
                    transition-all duration-300
                    ${scrolled ? 'shadow-md bg-white/90' : 'bg-white/70'}
                `}>

                    {/* Logo */}
                    <Link href="/" className="text-xl font-bold font-display text-teal-600 flex items-center gap-2" onClick={closeMobileMenu}>
                        <span className="text-2xl">🤝</span>
                        <span className="hidden sm:inline">HandtoHand</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        {user ? (
                            <>
                                <NavLink href="/matches" icon={<Target size={20} />} label="Matches" active={isActive('/matches')} />
                                <NavLink href="/messages" icon={<MessageCircle size={20} />} label="Messages" active={isActive('/messages')} />
                                <NavLink href="/profile" icon={<User size={20} />} label="Profile" active={isActive('/profile')} />

                                <div className="h-6 w-px bg-gray-200 mx-3"></div>

                                <Link
                                    href="/wishes/create"
                                    className="p-2 text-teal-600 hover:bg-teal-50 rounded-full transition-colors tooltip-trigger relative group"
                                >
                                    <Plus size={24} />
                                    <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        New Wish
                                    </span>
                                </Link>

                                <Link
                                    href="/offers/create"
                                    className="px-4 py-2 bg-teal-500 text-white rounded-full text-sm font-medium hover:bg-teal-600 transition-all shadow-md hover:shadow-lg flex items-center gap-2 ml-2"
                                >
                                    <Plus size={16} />
                                    <span>Offer</span>
                                </Link>

                                <button
                                    onClick={() => signOut()}
                                    className="ml-4 p-2 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Sign Out"
                                >
                                    <LogOut size={20} />
                                </button>
                            </>
                        ) : (
                            <Link
                                href="/auth/login"
                                className="px-5 py-2.5 bg-teal-600 text-white rounded-full text-sm font-bold hover:bg-teal-700 transition-colors shadow-sm"
                            >
                                Sign In
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="absolute top-20 left-4 right-4 glass rounded-2xl p-4 md:hidden animate-fade-in origin-top">
                    {user ? (
                        <div className="flex flex-col gap-2">
                            <MobileNavLink href="/" icon={<Home size={18} />} label="Home" onClick={closeMobileMenu} active={isActive('/')} />
                            <MobileNavLink href="/matches" icon={<Target size={18} />} label="Matches" onClick={closeMobileMenu} active={isActive('/matches')} />
                            <MobileNavLink href="/messages" icon={<MessageCircle size={18} />} label="Messages" onClick={closeMobileMenu} active={isActive('/messages')} />
                            <MobileNavLink href="/profile" icon={<User size={18} />} label="Profile" onClick={closeMobileMenu} active={isActive('/profile')} />
                            <div className="h-px bg-gray-100 my-2"></div>
                            <Link
                                href="/wishes/create"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 px-4 py-3 bg-teal-50 text-teal-700 rounded-xl font-medium"
                            >
                                <Plus size={18} /> Post a Wish
                            </Link>
                            <Link
                                href="/offers/create"
                                onClick={closeMobileMenu}
                                className="flex items-center gap-3 px-4 py-3 bg-teal-500 text-white rounded-xl font-medium shadow-sm"
                            >
                                <Plus size={18} /> Post an Offer
                            </Link>
                            <button
                                onClick={() => { signOut(); closeMobileMenu(); }}
                                className="flex items-center gap-3 px-4 py-3 text-red-500 font-medium mt-2"
                            >
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    ) : (
                        <Link
                            href="/auth/login"
                            onClick={closeMobileMenu}
                            className="block w-full text-center px-4 py-3 bg-teal-600 text-white rounded-xl font-bold"
                        >
                            Sign In
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}

function NavLink({ href, icon, label, active }: { href: string; icon: React.ReactNode; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`
                p-2 rounded-xl transition-all duration-200 group relative
                ${active ? 'text-teal-600 bg-teal-50' : 'text-gray-500 hover:text-teal-500 hover:bg-gray-50'}
            `}
            title={label}
        >
            {icon}
            {active && <span className="absolute bottom-1 left-1/2 w-1 h-1 bg-teal-500 rounded-full -translate-x-1/2"></span>}
        </Link>
    );
}

function MobileNavLink({ href, icon, label, onClick, active }: any) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors
                ${active ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-50'}
            `}
        >
            {icon}
            <span>{label}</span>
        </Link>
    );
}
