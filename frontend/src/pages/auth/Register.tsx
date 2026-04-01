import { Link } from 'react-router-dom';

export const Register = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 bg-[url('https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-fixed">
      <div className="max-w-4xl w-full space-y-12 bg-white/90 backdrop-blur-md p-12 rounded-3xl shadow-2xl border border-white">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight sm:text-5xl">
            Join <span className="text-primary-600">RealFast</span>
          </h1>
          <p className="text-lg text-gray-600 font-medium max-w-2xl mx-auto">
            Choose your account type to get started with the next generation of health insurance processing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Member Card */}
          <Link 
            to="/register/member"
            className="group relative flex flex-col p-8 bg-white rounded-3xl border-2 border-transparent hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-100 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-primary-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary-600 group-hover:rotate-6 transition-all duration-300">
                <svg className="h-8 w-8 text-primary-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Policy Member</h3>
              <p className="text-gray-500 leading-relaxed">
                Individual or family policyholder. Track claims, manage dependents, and access digital health cards.
              </p>
              <div className="mt-8 flex items-center text-primary-600 font-bold group-hover:translate-x-2 transition-transform">
                Sign up as Member
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Provider Card */}
          <Link 
            to="/register/provider"
            className="group relative flex flex-col p-8 bg-white rounded-3xl border-2 border-transparent hover:border-indigo-500 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 bg-indigo-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative z-10">
              <div className="h-16 w-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:-rotate-6 transition-all duration-300">
                <svg className="h-8 w-8 text-indigo-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m5-10h1m-1 4h1m-1 4h1" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Network Provider</h3>
              <p className="text-gray-500 leading-relaxed">
                Hospitals, clinics, and diagnostic centers. Direct cashless settlement and real-time eligibility checks.
              </p>
              <div className="mt-8 flex items-center text-indigo-600 font-bold group-hover:translate-x-2 transition-transform">
                Join our Network
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center pt-6">
          <p className="text-gray-500 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-bold underline underline-offset-4 decoration-2">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

