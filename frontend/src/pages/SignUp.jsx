import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, MessageSquare } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';

function SignUp() {
  const { signup, isSigningUp } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid) {
      await signup(formData);
    } else{
      return;
    }
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!formData.password.trim()) {
      toast.error("Password is required");
      return false;
    }
    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return false;
    }
    return true;
  };

  return (
    <div className='min-h-screen bg-gray-50 flex flex-col justify-center py-6 px-4 sm:py-12 sm:px-6 lg:px-8'>
      <div className='w-full max-w-sm sm:max-w-md mx-auto'>
        <div className="flex justify-center mb-6">
          <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <MessageSquare className='h-5 w-5 sm:h-7 sm:w-7 text-white' />
          </div>
        </div>
        <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Create your account
        </h2>
        <p className='text-center text-xs sm:text-sm text-gray-600 mb-8'>
          Already have an account?{' '}
          <Link
            className="font-semibold text-blue-600 hover:text-blue-500 transition-colors duration-200"
            to="/login"
          >
            Sign in
          </Link>
        </p>
      </div>

      <div className='w-full max-w-sm sm:max-w-md mx-auto'>
        <div className='bg-white py-6 px-4 sm:py-8 sm:px-6 lg:px-10 shadow-xl rounded-2xl border border-gray-200'>
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <div>
              <label htmlFor='fullName' className='block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2'>
                Full Name
              </label>
              <div className='relative'>
                <input
                  id='fullName'
                  type='text'
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className='w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-sm sm:text-base'
                  placeholder='Enter your full name'
                  disabled={isSigningUp}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className='block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2'>
                Email Address
              </label>
              <div className='relative'>
                <input
                  id='email'
                  type='email'
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className='w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-sm sm:text-base'
                  placeholder='you@example.com'
                  disabled={isSigningUp}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className='block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2'>
                Password
              </label>
              <div className='relative'>
                <input
                  id='password'
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className='w-full px-3 py-2.5 pr-10 sm:px-4 sm:py-3 sm:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 hover:bg-white placeholder-gray-400 text-sm sm:text-base'
                  placeholder='Create a strong password'
                  disabled={isSigningUp}
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200'
                  disabled={isSigningUp}
                >
                  {showPassword ? (
                    <EyeOff className='h-4 w-4 sm:h-5 sm:w-5' />
                  ) : (
                    <Eye className='h-4 w-4 sm:h-5 sm:w-5' />
                  )}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type='submit'
                className='w-full flex justify-center items-center gap-2 py-2.5 px-4 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base'
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <>
                    <Loader2 className='animate-spin h-4 w-4 sm:h-5 sm:w-5' />
                    <span className="hidden sm:inline">Creating account...</span>
                    <span className="sm:hidden">Creating...</span>
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Additional spacing for mobile keyboards */}
      <div className="h-16 sm:h-0"></div>
    </div>
  );
}

export default SignUp;