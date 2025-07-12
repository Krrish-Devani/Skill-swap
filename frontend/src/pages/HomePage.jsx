import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { RefreshCw, Users, Star, ArrowRight, MessageSquare } from 'lucide-react';

function HomePage() {
  const { authUser } = useAuthStore();

  return (
    <div className="min-h-full bg-gradient-to-b from-gray-50 to-gray-100" style={{ paddingTop: '69px' }}>
      {/* Hero Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 py-16 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center">
              <RefreshCw className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-blue-600">SkillSwap</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            {authUser 
              ? `Welcome back, ${authUser.fullName}! Ready to discover new skills and share your expertise?`
              : "Exchange skills with others in your community. Learn something new while sharing what you know best."
            }
          </p>
          
          {authUser && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/browse"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                Browse Users
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/skill-matches"
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center"
              >
                Skill Matches
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link 
                to="/profile"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center"
              >
                Update Profile
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4">
        <div className="max-w-screen-xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How SkillSwap Works
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Find Skills</h3>
              <p className="text-gray-600">
                Browse through a community of skilled individuals ready to share their expertise.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Connect & Swap</h3>
              <p className="text-gray-600">
                Reach out to others and propose skill exchanges that benefit both parties.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Learn & Grow</h3>
              <p className="text-gray-600">
                Expand your skillset while helping others learn from your experience.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      {!authUser && (
        <div className="bg-blue-600 py-16 px-4">
          <div className="max-w-screen-xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
              Join our community of learners and teachers. Share your skills and discover new ones today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/signup"
                className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                Get Started
              </a>
              <a 
                href="/login"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
              >
                Sign In
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HomePage;