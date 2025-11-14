/**
 * LoginPage component
 * Complete login page with layout and form
 */

import React from 'react';
import { Heading, Text } from '@/components/atoms';
import LoginForm from '@/components/organisms/LoginForm';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 opacity-50" />
      
      {/* Content */}
      <div className="relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <Heading as="h1" size="4xl" className="mb-2">Maya Admin</Heading>
          <Text variant="lead" color="muted">Booking Management Platform</Text>
        </div>

        {/* Login Form */}
        <LoginForm />

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <Text variant="small" color="muted">&copy; 2025 Maya Platform. All rights reserved.</Text>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;