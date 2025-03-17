
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthTokensOnLoad } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const processAuthRedirect = async () => {
      console.log('AuthCallback: Processing authentication redirect');
      try {
        const result = await handleAuthTokensOnLoad();
        
        if (result.success) {
          console.log('AuthCallback: Authentication successful, redirecting to dashboard');
          toast.success('Successfully signed in!');
          navigate('/dashboard');
        } else {
          console.error('AuthCallback: Authentication failed', result.message);
          setError(result.message || 'Authentication failed');
          // Wait a bit before redirecting on error
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (err) {
        console.error('AuthCallback: Error processing auth redirect', err);
        setError('An unexpected error occurred during authentication');
        // Wait a bit before redirecting on error
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    processAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-palm-light p-4">
      <div className="bg-white rounded-2xl shadow-soft p-8 w-full max-w-md text-center">
        {loading ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Completing Sign In...</h2>
            <p className="text-gray-600 mb-6">
              Please wait while we complete the authentication process.
            </p>
            <div className="mt-4 w-10 h-10 border-4 border-palm-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          </>
        ) : error ? (
          <>
            <h2 className="text-2xl font-bold mb-4 text-red-600">Authentication Error</h2>
            <p className="text-gray-700 mb-6">{error}</p>
            <p className="text-gray-600">Redirecting you to the login page...</p>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-4 text-green-600">Successfully Signed In!</h2>
            <p className="text-gray-600 mb-6">
              You are now being redirected to your dashboard.
            </p>
            <div className="mt-4 w-10 h-10 border-4 border-palm-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthCallback;
