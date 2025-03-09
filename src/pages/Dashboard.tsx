
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Calendar, Clock, BarChart2, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PalmAnalysisService from '../services/PalmAnalysisService';

// Dashboard component
const Dashboard = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [readings, setReadings] = useState([]);
  const [loadingReadings, setLoadingReadings] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If user is not authenticated and not loading, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);
  
  useEffect(() => {
    // Fetch user readings when authenticated
    const fetchReadings = async () => {
      if (user && isAuthenticated) {
        try {
          setLoadingReadings(true);
          const userReadings = await PalmAnalysisService.getPalmReadings(user.id);
          setReadings(userReadings);
        } catch (error) {
          console.error('Error fetching readings:', error);
          toast.error('Failed to load your palm readings', {
            description: 'Please try again later.'
          });
        } finally {
          setLoadingReadings(false);
        }
      }
    };
    
    fetchReadings();
  }, [user, isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 w-full max-w-md bg-gray-200 rounded"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow bg-palm-light py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome, {user?.name || 'Friend'}
            </h1>
            <p className="text-gray-600">
              Explore your palm readings and discover your destiny
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-soft col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Your Palm Readings</h2>
                <Link 
                  to="/upload-palm" 
                  className="text-palm-purple hover:underline flex items-center text-sm font-medium"
                >
                  New Reading <ChevronRight size={16} />
                </Link>
              </div>
              
              {loadingReadings ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse bg-gray-100 p-4 rounded-lg">
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : readings.length > 0 ? (
                <div className="space-y-4">
                  {readings.map((reading) => (
                    <div key={reading.id} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
                      <Link to={`/reading-results/${reading.id}`} className="block">
                        <div className="flex justify-between">
                          <div>
                            <h3 className="font-medium text-gray-900">{reading.readingName || 'Palm Reading'}</h3>
                            <p className="text-sm text-gray-600 flex items-center mt-1">
                              <Calendar size={14} className="mr-1" /> 
                              {new Date(reading.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <ChevronRight className="text-gray-400" />
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-palm-purple mb-2">
                    <Camera size={40} className="mx-auto" />
                  </div>
                  <h3 className="font-medium text-gray-900 mb-1">No palm readings yet</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Upload a photo of your palm to get your first reading
                  </p>
                  <Link 
                    to="/upload-palm" 
                    className="inline-block bg-palm-purple text-white px-4 py-2 rounded-lg hover:bg-palm-purple/90 transition-colors"
                  >
                    Upload Palm Photo
                  </Link>
                </div>
              )}
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-soft space-y-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link 
                    to="/upload-palm" 
                    className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <div className="bg-palm-purple/10 p-2 rounded-full mr-3">
                        <Camera size={18} className="text-palm-purple" />
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">New Reading</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Stats</h2>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <BarChart2 size={16} className="text-palm-purple mr-1" />
                      <span className="text-sm font-medium text-gray-900">Readings</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{readings.length}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center mb-1">
                      <Clock size={16} className="text-palm-purple mr-1" />
                      <span className="text-sm font-medium text-gray-900">Latest</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {readings.length > 0 
                        ? new Date(readings[0].createdAt).toLocaleDateString() 
                        : 'None'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
