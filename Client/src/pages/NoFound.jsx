import { Home, Search, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const NoFound = () => {
  const navigate = useNavigate(); // must be inside component

  const handleNavigate = (path) => {
    if (path === -1) {
      navigate(-1)
    } else {
      navigate(path); // go to specified path
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 flex items-center justify-center px-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* Logo */}
        <div className="inline-flex items-center justify-center space-x-2 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
            <Zap className="w-7 h-7 text-white" />
          </div>
          <span className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Quiz
            </span>
            <span className="text-slate-800 italic">Sprint</span>
          </span>
        </div>

        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl md:text-[12rem] font-black text-slate-200 leading-none">
            404
          </h1>
          <div className="relative -mt-12">
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900">
              Page Not Found
            </h2>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg text-slate-600 mb-12 max-w-md mx-auto">
          Oops! Looks like this page took a wrong sprint. The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => handleNavigate(-1)}
            className="group px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-semibold hover:border-blue-300 hover:bg-blue-50 transition shadow-sm flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
          <button
            onClick={() => handleNavigate('/')} // redirect to home
            className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </button>
        </div>

        {/* Search Suggestion */}
        <div className="mt-12 p-6 bg-white/80 backdrop-blur-xl rounded-2xl border border-blue-100 shadow-md">
          <div className="flex items-center justify-center gap-3 text-slate-600">
            <Search className="w-5 h-5 text-blue-600" />
            <p className="text-sm">
              Looking for something specific? Try navigating from the{' '}
              <button
                onClick={() => handleNavigate('/')}
                className="text-blue-600 font-semibold hover:text-blue-700 transition"
              >
                home page
              </button>
            </p>
          </div>
        </div>

        {/* Fun Stats */}
        <div className="mt-12 grid grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              0
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Pages Found
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              404
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Error Code
            </div>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200">
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              ∞
            </div>
            <div className="text-xs text-slate-500 font-medium mt-1">
              Better Pages
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoFound;
