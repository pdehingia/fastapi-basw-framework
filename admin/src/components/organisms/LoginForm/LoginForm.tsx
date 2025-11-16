/**
 * LoginForm organism component
 * Complete login form with validation and error handling
 */

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import { useLogin } from '@/hooks/auth/useAuth';
import type { LoginCredentials } from '@/types/auth.types';

// Validation schema
const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

const LoginForm: React.FC = () => {
  const { login, isLoading, error, clearError } = useLogin();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: 'admin@maya.com', // Demo credentials
      password: 'admin123',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    // Clear any previous errors
    clearError();
    
    const credentials: LoginCredentials = {
      username: data.username,
      password: data.password,
      rememberMe: data.rememberMe,
    };
    
    await login(credentials);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to your Maya Admin account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Demo credentials notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-700">
              <span className="font-medium">Demo Mode:</span> Pre-filled with test credentials.
              <br />
              <span className="text-xs">Username: admin@maya.com | Password: admin123</span>
            </p>
          </div>

          {/* General error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Username field */}
          <Input
            {...register('username')}
            type="text"
            label="Username"
            placeholder="admin@maya.com"
            error={errors.username?.message}
            autoComplete="username"
            autoFocus
          />

          {/* Password field */}
          <Input
            {...register('password')}
            type="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            autoComplete="current-password"
            showPasswordToggle
          />

          {/* Remember me checkbox */}
          <div className="flex items-center">
            <input
              {...register('rememberMe')}
              id="remember-me"
              type="checkbox"
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Remember me for 30 days
            </label>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Protected by Maya Security. Unauthorized access is prohibited.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;