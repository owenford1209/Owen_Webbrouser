import React, { useState } from 'react';
// import { useAuth } from './AuthContext';
import InteractiveMap from './InteractiveMap';
import ActivityFeed from './ActivityFeed';
import HouseSearch from './HouseSearch';
import { 
  HomeIcon, 
  MapIcon, 
  ChatBubbleLeftRightIcon, 
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const Sidebar = ({ activeTab, setActiveTab, isMobile, isOpen, setIsOpen }) => {
  // const { user, logout } = useAuth();

  const navigation = [
    { name: 'Overview', icon: HomeIcon, id: 'overview' },
    { name: 'House Search', icon: MagnifyingGlassIcon, id: 'search' },
    { name: 'House Prices Map', icon: MapIcon, id: 'map' },
    { name: 'Activity Feed', icon: ChatBubbleLeftRightIcon, id: 'feed' },
    { name: 'Profile', icon: UserCircleIcon, id: 'profile' },
  ];

  const sidebarClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`
    : 'w-64 bg-white shadow-lg';

  return (
    <>
      {isMobile && isOpen && (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-25" onClick={() => setIsOpen(false)} />
      )}
      
      <div className={sidebarClasses}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">IA</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900">Iowa Dashboard</span>
            </div>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            )}
          </div>
          
          <div className="flex-1 px-4 py-6">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (isMobile) setIsOpen(false);
                    }}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActive
                        ? 'bg-indigo-100 text-indigo-700 border-r-2 border-indigo-700'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center mb-4">
              {/* {user.profile_image ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={user.profile_image}
                  alt={user.name}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center">
                  <span className="text-white font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )} */}
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">Welcome, User</p>
                <p className="text-xs text-gray-500">user@example.com</p>
              </div>
            </div>
            {/* <button
              onClick={logout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Sign out
            </button> */}
          </div>
        </div>
      </div>
    </>
  );
};

const Overview = () => {
  return (
    <div className="space-y-6">
      {/* Hero Section with Background Image */}
      <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg shadow-lg overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-40"></div>
        <div className="relative p-8 text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Iowa Dashboard</h2>
          <p className="text-xl mb-6 opacity-90">
            Discover Iowa's finest properties and connect with the community through our interactive platform.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🏠 1,000+ Properties</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">🗺️ 30+ Cities</span>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg px-4 py-2">
              <span className="text-sm font-medium">💰 Best Prices</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards with Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
            <div className="text-center text-white">
              <MagnifyingGlassIcon className="h-16 w-16 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">House Search</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Find your perfect home by price, location, and features with our advanced search tools.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="h-48 bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <div className="text-center text-white">
              <MapIcon className="h-16 w-16 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Interactive Map</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Explore house prices across Iowa cities with our interactive map visualization.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
            <div className="text-center text-white">
              <ChatBubbleLeftRightIcon className="h-16 w-16 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Activity Feed</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Share and discover community insights about neighborhoods and properties.</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
          <div className="h-48 bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <div className="text-center text-white">
              <UserCircleIcon className="h-16 w-16 mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Profile</h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm">Manage your account settings and track your property preferences.</p>
          </div>
        </div>
      </div>

      {/* Photo Gallery Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Iowa Real Estate Data Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img 
                src="/images/heat-map.png" 
                alt="Heat Map of House Prices" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-4">
                <div className="text-4xl mb-2">🔥</div>
                <h4 className="text-lg font-semibold text-gray-900">Heat Map</h4>
                <p className="text-gray-600 text-sm">Price distribution across Iowa</p>
              </div>
            </div>
            <div className="p-4 bg-white">
              <h4 className="text-lg font-semibold text-gray-900">Price Heat Map</h4>
              <p className="text-gray-600 text-sm">Visual representation of house price distribution across Iowa neighborhoods</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img 
                src="/images/lotshape-analysis.png" 
                alt="Lot Shape vs Sale Price Analysis" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-4">
                <div className="text-4xl mb-2">📊</div>
                <h4 className="text-lg font-semibold text-blue-900">Lot Shape Analysis</h4>
                <p className="text-blue-700 text-sm">Lot shape vs sale price correlation</p>
              </div>
            </div>
            <div className="p-4 bg-white">
              <h4 className="text-lg font-semibold text-gray-900">Lot Shape Impact</h4>
              <p className="text-gray-600 text-sm">How lot shape affects property values in different neighborhoods</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img 
                src="/images/Yearly Sale price .png" 
                alt="Yearly Sale Price" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-4">
                <div className="text-4xl mb-2">📈</div>
                <h4 className="text-lg font-semibold text-green-900">Yearly Sale Price</h4>
                <p className="text-green-700 text-sm">Trends in sale prices over the years</p>
              </div>
            </div>
            <div className="p-4 bg-white">
              <h4 className="text-lg font-semibold text-gray-900">Yearly Sale Price</h4>
              <p className="text-gray-600 text-sm">How house prices have changed year by year in Iowa</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow">
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              <img 
                src="/images/Sale Price Quality .png" 
                alt="Sale Price Quality" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="hidden flex-col items-center justify-center text-center p-4">
                <div className="text-4xl mb-2">⭐</div>
                <h4 className="text-lg font-semibold text-purple-900">Sale Price Quality</h4>
                <p className="text-purple-700 text-sm">Quality impact on sale price</p>
              </div>
            </div>
            <div className="p-4 bg-white">
              <h4 className="text-lg font-semibold text-gray-900">Sale Price Quality</h4>
              <p className="text-gray-600 text-sm">Relationship between property quality and sale prices</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Average House Price</span>
              <span className="text-lg font-semibold text-green-600">$135,000</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Cities Covered</span>
              <span className="text-lg font-semibold text-blue-600">30+</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Price Range</span>
              <span className="text-lg font-semibold text-purple-600">$72K - $195K</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-800">New data available for Des Moines</p>
                <p className="text-xs text-gray-500">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-800">Map view updated with latest prices</p>
                <p className="text-xs text-gray-500">5 hours ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
              <div>
                <p className="text-sm text-gray-800">Community post from Cedar Rapids</p>
                <p className="text-xs text-gray-500">1 day ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-center text-white">
        <h3 className="text-2xl font-bold mb-4">Ready to Find Your Dream Home?</h3>
        <p className="text-lg mb-6 opacity-90">
          Start exploring Iowa's real estate market today with our powerful search tools and interactive map.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Start House Search
          </button>
          <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors">
            View Map
          </button>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  // const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
        
        <div className="flex items-center space-x-6 mb-8">
          {/* {user.profile_image ? (
            <img
              className="h-24 w-24 rounded-full object-cover"
              src={user.profile_image}
              alt={user.name}
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-indigo-500 flex items-center justify-center">
              <span className="text-white font-semibold text-3xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )} */}
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium text-gray-900">Welcome, User</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              value="John Doe"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value="john.doe@example.com"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <input
              type="tel"
              value="(123) 456-7890"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account ID
            </label>
            <input
              type="text"
              value="123456789"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-xs"
            />
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Profile editing will be available in a future update. For now, you can view your account information here.
          </p>
        </div>
        
        <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h4 className="text-sm font-semibold text-indigo-900">Built with Emergent</h4>
              <p className="text-xs text-indigo-700">This dashboard was created using the Emergent platform</p>
            </div>
            <div className="ml-4">
              <a
                href="https://app.emergent.sh/register?ref=owen380333"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
              >
                Try Emergent
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview />;
      case 'search':
        return <HouseSearch />;
      case 'map':
        return <InteractiveMap />;
      case 'feed':
        return <ActivityFeed />;
      case 'profile':
        return <Profile />;
      default:
        return <Overview />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        isMobile={isMobile}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />
      
      <div className="flex-1 flex flex-col">
        {isMobile && (
          <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">IA</span>
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Iowa Dashboard</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}
        
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;