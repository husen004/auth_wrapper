'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginSchema, LoginFormValues } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from '../../../utils/auth';

const LoginPage = () => {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setGeneralError(null);

    try {
      // Show loading state
      setLoading(true);

      // Call login API
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: data.email, password: data.password }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage;
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          errorMessage = errorData.message || 'Login failed';
        } else {
          errorMessage = await response.text();
        }
        
        throw new Error(errorMessage);
      }

      const responseData = await response.json();
      
      login(responseData.access_token, responseData.refresh_token);
      
      // Redirect to profile page
      router.push('/user/profile');
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const accessToken = localStorage.getItem('access_token');
    console.log("Access Token:", accessToken); 
    if (accessToken) {
      // User is already logged in, redirect to profile page
      router.push('/user/profile');
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Welcome back</h1>
        
        {generalError && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
            {generalError}
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email address
            </label>
            <input
              id="email"
              {...register("email")}
              type="email"
              autoComplete="email"
              className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              {...register("password")}
              type="password"
              autoComplete="current-password"
              className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            
            <Link href="/auth/forgot-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </Link>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don&#39;t have an account?{' '}
            <Link href="/auth/sign-up" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
