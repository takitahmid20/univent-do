// app/(auth)/forgot-password/page.jsx
"use client";
import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

const ForgotPasswordPage = () => {
  const [isEmailSent, setIsEmailSent] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">
        {/* Back to Login Link */}
        <Link 
          href="/signin" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-8 group"
        >
          <FaArrowLeft className="text-sm transition-transform group-hover:-translate-x-1" />
          <span>Back to login</span>
        </Link>

        <div className="bg-white rounded-2xl overflow-hidden shadow-xl p-8">
          {!isEmailSent ? (
            <>
              {/* Request Reset Form */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[#f6405f]/10 rounded-full mb-4">
                  <HiMail className="w-8 h-8 text-[#f6405f]" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">
                  Forgot Password?
                </h1>
                <p className="text-gray-600">
                  Don&apos;t worry, we&apos;ll help you reset it.
                </p>
              </div>

              <Formik
                initialValues={{ email: '' }}
                validationSchema={validationSchema}
                onSubmit={(values, { setSubmitting }) => {
                  // Here you would typically make an API call to send reset email
                  setTimeout(() => {
                    setIsEmailSent(true);
                    setSubmitting(false);
                  }, 1500);
                }}
              >
                {({ errors, touched, handleChange, handleBlur, values, isSubmitting }) => (
                  <Form className="space-y-6">
                    {/* Email Field */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <FaEnvelope className="text-gray-400" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values.email}
                          className={`block w-full pl-10 pr-3 py-3 border ${
                            errors.email && touched.email ? 'border-red-500' : 'border-gray-300'
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:border-transparent`}
                        />
                      </div>
                      {errors.email && touched.email && (
                        <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#f6405f] text-white py-3 rounded-lg font-medium hover:bg-[#d63850] transition-colors focus:outline-none focus:ring-2 focus:ring-[#f6405f] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Instructions...
                        </div>
                      ) : (
                        'Send Instructions'
                      )}
                    </button>
                  </Form>
                )}
              </Formik>
            </>
          ) : (
            // Success State
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Check Your Email
              </h2>
              <p className="text-gray-600 mb-8">
                We&apos;ve sent a password reset link to your email.
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => setIsEmailSent(false)}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Resend Email
                </button>
                <Link 
                  href="/signin"
                  className="block w-full text-center py-3 text-[#f6405f] font-medium hover:text-[#d63850]"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}

          {/* Help Text */}
          {!isEmailSent && (
            <p className="mt-8 text-center text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/signin" className="text-[#f6405f] font-medium hover:text-[#d63850]">
                Back to login
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;