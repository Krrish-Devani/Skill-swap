import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, LogOut, Menu, X, RefreshCw, Users, Target, Link2 } from 'lucide-react';

function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { authUser, logout } = useAuthStore();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <nav className="bg-white border-b border-gray-200 shadow-sm fixed w-full top-0 z-50 backdrop-blur-lg bg-white/95">
            <div className='container mx-auto px-4 h-16'>
                <div className='flex items-center justify-between h-full'>
                    {/* Logo */}
                    <div className='flex items-center gap-8'>
                        <Link to="/" className='flex items-center gap-2 hover:opacity-80 transition-opacity group'>
                            <div className='h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105'>
                                <RefreshCw className='w-5 h-5 text-white' />
                            </div>
                            <div className='flex items-center gap-1'>
                                <h1 className='text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors'>SkillSwap</h1>
                            </div>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className='hidden md:flex items-center gap-6'>
                        {authUser ? (
                            <>
                                <Link 
                                    to="/"
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                >
                                    Home
                                </Link>
                                <Link 
                                    to="/browse"
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                >
                                    <Users className='w-4 h-4' />
                                    <span>Browse</span>
                                </Link>
                                <Link 
                                    to="/skill-matches"
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                >
                                    <Target className='w-4 h-4' />
                                    <span>Matches</span>
                                </Link>
                                <Link 
                                    to="/swaps"
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                >
                                    <Link2 className='w-4 h-4' />
                                    <span>Swaps</span>
                                </Link>
                                <Link 
                                    to="/profile"
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                >
                                    <User className='w-4 h-4' />
                                    <span>Profile</span>
                                </Link>
                                <button 
                                    onClick={handleLogout} 
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium'
                                    type='button'
                                >
                                    <LogOut className='w-4 h-4' />
                                    <span>Logout</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <Link 
                                    to="/login"
                                    className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                >
                                    Login
                                </Link>
                                <Link 
                                    to="/signup"
                                    className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 font-semibold shadow-md hover:shadow-lg'
                                >
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <button 
                        onClick={toggleMenu}
                        className="md:hidden inline-flex items-center p-2 w-10 h-10 justify-center text-gray-500 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition-all duration-200" 
                        aria-controls="navbar-mobile" 
                        aria-expanded={isMenuOpen}
                    >
                        <span className="sr-only">Open main menu</span>
                        {isMenuOpen ? (
                            <X className="w-5 h-5" />
                        ) : (
                            <Menu className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg">
                        <div className="px-4 py-2 space-y-1">
                            {authUser ? (
                                <>
                                    <Link 
                                        to="/"
                                        className='block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link 
                                        to="/browse"
                                        className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Users className='w-4 h-4' />
                                        <span>Browse</span>
                                    </Link>
                                    <Link 
                                        to="/skill-matches"
                                        className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Target className='w-4 h-4' />
                                        <span>Matches</span>
                                    </Link>
                                    <Link 
                                        to="/swaps"
                                        className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <Link2 className='w-4 h-4' />
                                        <span>Swaps</span>
                                    </Link>
                                    <Link 
                                        to="/profile"
                                        className='flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <User className='w-4 h-4' />
                                        <span>Profile</span>
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            handleLogout();
                                            setIsMenuOpen(false);
                                        }}
                                        className='flex items-center gap-2 w-full px-3 py-2 text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 font-medium text-left'
                                    >
                                        <LogOut className='w-4 h-4' />
                                        <span>Logout</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link 
                                        to="/login"
                                        className='block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 font-medium'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                    <Link 
                                        to="/signup"
                                        className='block px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all duration-200 font-semibold text-center'
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Sign Up
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;