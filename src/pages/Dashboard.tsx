import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, History, Settings, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const Dashboard = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [activeTab, setActiveTab] = useState("readings");

  // Mock data for readings history
  const readingsHistory = [
    {
      id: "1",
      date: "June 15, 2023",
      type: "Premium Reading",
      status: "Completed",
    },
    {
      id: "2",
      date: "May 3, 2023",
      type: "Basic Reading",
      status: "Completed",
    },
  ];

  const handleNewReading = () => {
    navigate("/upload-palm");
  };

  const handleLogout = async () => {
    await signOut();
  };

  const userName = user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || 'user@example.com';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow pt-24 pb-16 px-4 bg-palm-light">
        <div className="container mx-auto">
          <div className="bg-white rounded-2xl shadow-soft overflow-hidden">
            <div className="md:flex">
              {/* Sidebar */}
              <div className="bg-gray-50 md:w-64 p-6 border-r border-gray-100">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="w-12 h-12 rounded-full bg-palm-purple text-white flex items-center justify-center">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="font-medium">{userName}</h3>
                    <p className="text-sm text-gray-500">Premium Member</p>
                  </div>
                </div>

                <nav>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => setActiveTab("readings")}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          activeTab === "readings"
                            ? "bg-palm-purple text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <History size={18} />
                        <span>My Readings</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("profile")}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          activeTab === "profile"
                            ? "bg-palm-purple text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <User size={18} />
                        <span>Profile</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                          activeTab === "settings"
                            ? "bg-palm-purple text-white"
                            : "hover:bg-gray-100"
                        }`}
                      >
                        <Settings size={18} />
                        <span>Settings</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* Main content */}
              <div className="flex-1 p-6">
                {activeTab === "readings" && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h2 className="text-2xl font-bold">My Palm Readings</h2>
                      <button
                        onClick={handleNewReading}
                        className="bg-palm-purple text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-palm-purple/90 transition-colors"
                      >
                        <Upload size={18} />
                        <span>New Reading</span>
                      </button>
                    </div>

                    {readingsHistory.length > 0 ? (
                      <div className="bg-white rounded-lg border border-gray-100">
                        <div className="hidden md:grid grid-cols-4 p-4 font-medium border-b border-gray-100">
                          <div>ID</div>
                          <div>Date</div>
                          <div>Type</div>
                          <div>Status</div>
                        </div>

                        {readingsHistory.map((reading) => (
                          <div
                            key={reading.id}
                            className="grid grid-cols-1 md:grid-cols-4 p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                            onClick={() => navigate(`/reading-results/${reading.id}`)}
                          >
                            <div className="md:hidden font-medium mb-1">ID:</div>
                            <div>#{reading.id}</div>
                            
                            <div className="md:hidden font-medium mb-1 mt-2">Date:</div>
                            <div>{reading.date}</div>
                            
                            <div className="md:hidden font-medium mb-1 mt-2">Type:</div>
                            <div>{reading.type}</div>
                            
                            <div className="md:hidden font-medium mb-1 mt-2">Status:</div>
                            <div>
                              <span className="inline-block px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                {reading.status}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 mb-4">You have no readings yet</p>
                        <button
                          onClick={handleNewReading}
                          className="bg-palm-purple text-white px-4 py-2 rounded-lg inline-flex items-center space-x-2"
                        >
                          <Upload size={18} />
                          <span>Get Your First Reading</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "profile" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-8">Your Profile</h2>
                    <div className="space-y-6 max-w-lg">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={userName}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          readOnly
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Membership
                        </label>
                        <div className="flex items-center space-x-3 bg-palm-light px-4 py-3 rounded-lg">
                          <span className="font-medium">Premium</span>
                          <span className="text-xs bg-palm-purple text-white px-2 py-1 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "settings" && (
                  <div>
                    <h2 className="text-2xl font-bold mb-8">Settings</h2>
                    <div className="space-y-8 max-w-lg">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Email notifications</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-palm-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-palm-purple"></div>
                            </label>
                          </div>
                          <div className="flex items-center justify-between">
                            <span>Reading reminders</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-palm-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-palm-purple"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span>Auto-delete readings after 30 days</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-palm-purple rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-palm-purple"></div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
