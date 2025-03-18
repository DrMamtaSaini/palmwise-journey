
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { handleAuthTokensOnLoad } from '@/lib/supabase';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processAuthRedirect = async () => {
      try {
        // Process the authentication tokens in the URL
        const result = await handleAuthTokensOnLoad();
        
        if (result.success) {
          toast.success('Successfully signed in!');
          navigate('/dashboard');
        } else {
          console.error('Authentication failed', result.message);
          toast.error('Authentication failed', { 
            description: result.message || 'Please try again' 
          });
          navigate('/login');
        }
      } catch (err) {
        console.error('Error processing auth redirect', err);
        toast.error('Authentication error', {
          description: 'An unexpected error occurred during authentication'
        });
        navigate('/login');
      }
    };

    processAuthRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-palm-light p-4">
      <div className="bg-white rounded-2xl shadow-soft p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4">Processing Authentication...</h2>
        <p className="text-gray-600 mb-6">
          Please wait while we complete the sign in process.
        </p>
        <div className="mt-4 w-10 h-10 border-4 border-palm-purple border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback;
