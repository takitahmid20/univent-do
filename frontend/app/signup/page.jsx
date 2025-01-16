// app/signup/page.jsx
"use client";
import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaGoogle, FaFacebook, FaEnvelope, FaLock, FaUser, FaRegEye, FaRegEyeSlash } from 'react-icons/fa';

const validationSchema = Yup.object({
  userName: Yup.string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
  userType: Yup.string()
    .required('Please select a user type'),
});

const SignUpPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Add a small delay to ensure localStorage is ready
        await new Promise(resolve => setTimeout(resolve, 100));

        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');

        if (token && userStr) {
          const user = JSON.parse(userStr);
          // Redirect to appropriate dashboard based on user type
          const dashboardUrl = user.userType === 'organizer' ? '/dashboard/organizer' : '/dashboard/attendee';
          router.replace(dashboardUrl);
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#f6405f]"></div>
      </div>
    );
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    try {
      setApiError('');
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      // If signup was successful, redirect to signin page
      router.push('/signin?message=Account created successfully! Please sign in.');
    } catch (error) {
      console.error('Signup error:', error);
      setApiError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full grid md:grid-cols-2 bg-white rounded-2xl overflow-hidden shadow-xl">
        {/* Left Side - Form */}
        <div className="p-8 lg:p-12">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h1>
            <p className="text-gray-600">Join our community and start creating amazing events!</p>
          </div>

          <Formik
            initialValues={{
              userName: '',
              email: '',
              password: '',
              confirmPassword: '',
              userType: 'attendee', // Set a default value that matches backend expectations
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, handleChange, handleBlur, values, isSubmitting }) => (
              <Form className="space-y-6">
                {/* Social Sign Up Buttons */}
                <div className="space-y-3">
                  <button 
                    type="button"
                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaGoogle className="text-[#DB4437]" />
                    <span className="font-medium text-gray-700">Continue with Google</span>
                  </button>
                  <button 
                    type="button"
                    className="w-full flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <FaFacebook className="text-[#4267B2]" />
                    <span className="font-medium text-gray-700">Continue with Facebook</span>
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500">or sign up with email</span>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  {/* Username Field */}
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="userName"
                        name="userName"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.userName}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.userName && touched.userName ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent`}
                        placeholder="Enter your username"
                      />
                    </div>
                    {errors.userName && touched.userName && (
                      <p className="mt-1 text-sm text-red-500">{errors.userName}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.email}
                        className={`block w-full pl-10 pr-3 py-2.5 border ${
                          errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {errors.email && touched.email && (
                      <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.password}
                        className={`block w-full pl-10 pr-10 py-2.5 border ${
                          errors.password && touched.password ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <FaRegEyeSlash className="text-gray-400 hover:text-gray-600" />
                        ) : (
                          <FaRegEye className="text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.password && touched.password && (
                      <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password Field */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock className="text-gray-400" />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        name="confirmPassword"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        value={values.confirmPassword}
                        className={`block w-full pl-10 pr-10 py-2.5 border ${
                          errors.confirmPassword && touched.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent`}
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={toggleConfirmPasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <FaRegEyeSlash className="text-gray-400 hover:text-gray-600" />
                        ) : (
                          <FaRegEye className="text-gray-400 hover:text-gray-600" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.confirmPassword && (
                      <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* User Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      I want to
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        values.userType === 'organizer' 
                          ? 'border-[#f6405f] bg-[#fff1f3]' 
                          : 'border-gray-200 hover:border-[#f6405f]'
                      }`}>
                        <input
                          type="radio"
                          name="userType"
                          value="organizer"
                          onChange={handleChange}
                          checked={values.userType === 'organizer'}
                          className="absolute opacity-0"
                        />
                        <div className="text-center">
                          <div className={`font-medium ${values.userType === 'organizer' ? 'text-[#f6405f]' : 'text-gray-700'}`}>
                            Organize Events
                          </div>
                          <div className="text-sm text-gray-500">Create and manage events</div>
                        </div>
                      </label>
                      <label className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                        values.userType === 'attendee' 
                          ? 'border-[#f6405f] bg-[#fff1f3]' 
                          : 'border-gray-200 hover:border-[#f6405f]'
                      }`}>
                        <input
                          type="radio"
                          name="userType"
                          value="attendee"
                          onChange={handleChange}
                          checked={values.userType === 'attendee'}
                          className="absolute opacity-0"
                        />
                        <div className="text-center">
                          <div className={`font-medium ${values.userType === 'attendee' ? 'text-[#f6405f]' : 'text-gray-700'}`}>
                            Attend Events
                          </div>
                          <div className="text-sm text-gray-500">Discover and join events</div>
                        </div>
                      </label>
                    </div>
                    {errors.userType && touched.userType && (
                      <p className="mt-1 text-sm text-red-500">{errors.userType}</p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#f6405f] text-white py-3 rounded-lg font-medium hover:bg-[#d63850] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:ring-offset-2"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>

                {/* Error Message */}
                {apiError && (
                  <div className="text-red-500 text-sm text-center">{apiError}</div>
                )}

                {/* Sign In Link */}
                <p className="text-center text-gray-600">
                  Already have an account?{' '}
                  <Link href="/signin" className="text-[#f6405f] font-medium hover:text-[#d63850]">
                    Sign In
                  </Link>
                </p>
              </Form>
            )}
          </Formik>
        </div>

        {/* Right Side - Image/Welcome */}
        <div className="hidden md:block relative bg-[#f6405f] p-12">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10 h-full flex flex-col justify-center">
            <h2 className="text-4xl font-bold text-white mb-6">
              Welcome to Our Community
            </h2>
            <p className="text-white/90 text-lg mb-8">
              Join thousands of event organizers and attendees. Create, discover, and participate in amazing events.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/90">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Create and manage events easily</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connect with other event enthusiasts</span>
              </div>
              <div className="flex items-center gap-3 text-white/90">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Discover events that match your interests</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;