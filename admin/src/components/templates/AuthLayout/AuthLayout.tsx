/**
 * AuthLayout Template Component
 * Layout for authentication pages (login, register, forgot password)
 */

import { memo } from 'react';
import { Outlet } from '@tanstack/react-router';
import { shallowEqual } from '@/utils/performance';
import { Text } from '@/components/atoms';
import { Card } from '@/components/molecules';

export interface AuthLayoutProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title = 'Maya Admin',
  subtitle = 'Sign in to your account',
  showLogo = true,
  children,
  className = '',
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${className}`}>
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            {showLogo && (
              <div className="mb-8">
                <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Text className="text-2xl font-bold text-white">M</Text>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 text-center">Maya</h1>
                <p className="text-gray-600 text-center mt-2">Admin Dashboard</p>
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Powerful Admin Tools
                </h2>
                <p className="text-gray-600 mt-2">
                  Manage your platform with comprehensive analytics, user management, 
                  and booking oversight tools.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Real-time Analytics</h3>
                    <p className="text-sm text-gray-600">Monitor platform performance and user engagement</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">User Management</h3>
                    <p className="text-sm text-gray-600">Complete user lifecycle and permissions control</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Booking Oversight</h3>
                    <p className="text-sm text-gray-600">Manage bookings, payments, and provider relationships</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            {/* Mobile Logo */}
            {showLogo && (
              <div className="lg:hidden mb-8 text-center">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Text className="text-xl font-bold text-white">M</Text>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Maya Admin</h1>
              </div>
            )}

            {/* Form Header */}
            <div className="mb-6 text-center lg:text-left">
              <h2 className="text-2xl font-bold text-gray-900">
                {title}
              </h2>
              <p className="text-gray-600 mt-2">
                {subtitle}
              </p>
            </div>

            {/* Form Content */}
            <Card className="p-6 shadow-xl border-0">
              {children || <Outlet />}
            </Card>

            {/* Footer */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                © 2024 Maya Platform. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Memoize for performance
const MemoizedAuthLayout = memo(AuthLayout, (prevProps, nextProps) => {
  return shallowEqual(prevProps, nextProps);
});

MemoizedAuthLayout.displayName = 'AuthLayout';

export default MemoizedAuthLayout;