'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
  username: string;
}

const ProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/auth/sign-in');
        return;
      }

      try {
        const response = await fetch('http://localhost:8080/api/auth/me', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('access_token');
            router.push('/sign-in');
            return;
          }
          throw new Error('Failed to fetch user data');
        }

        const data = await response.json();
        setUserData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    router.push('/sign-in');
  };

  useEffect(() => {
      const accessToken = localStorage.getItem('access_token');
      console.log("Access Token:", accessToken); 
      if (!accessToken) {
        router.push('/auth/sign-in');
      }
    }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[80vh]">
        <div className="bg-red-50 p-4 rounded-md text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">User Profile</h1>
        
        {userData && (
          <div className="space-y-4">
            <div className="border-b pb-4">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
              <p className="mt-1 text-sm text-gray-600">Email: {userData.username}</p>
            </div>
            
            <div className="pt-4">
              <button
                onClick={handleLogout}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;