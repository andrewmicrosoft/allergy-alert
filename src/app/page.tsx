import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image/Visual Section */}
      <div className="flex-1 bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-white rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-white rounded-full blur-xl"></div>
        </div>
        
        {/* Central Visual Element */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Pill-shaped container with images */}
            <div className="w-80 h-96 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 shadow-2xl">
              <div className="w-72 h-88 bg-gradient-to-b from-sky-200 to-sky-400 rounded-full overflow-hidden border-4 border-white shadow-xl">
                {/* Food safety illustration placeholder */}
                <div className="w-full h-full flex items-center justify-center text-6xl">
                  🍽️🛡️
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-8 -right-8 w-16 h-16 bg-white/30 rounded-full flex items-center justify-center text-2xl animate-bounce">
              ⚠️
            </div>
            <div className="absolute -bottom-6 -left-6 w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-xl animate-pulse">
              ✅
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Content Section */}
      <div className="flex-1 bg-gradient-to-br from-red-400 via-red-500 to-red-600 flex items-center justify-center p-8 lg:p-16">
        <div className="max-w-lg w-full text-center">
          {/* Brand */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <span className="text-white text-2xl">🌟</span>
              <span className="text-white text-lg font-medium tracking-wider">Allergy Alert</span>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-8">
            <h1 className="text-white text-6xl lg:text-7xl font-bold leading-tight mb-4">
              Stay
              <br />
              <span className="relative">
                safe
                <div className="absolute bottom-2 left-0 right-0 h-3 bg-white/30 rounded-full transform -skew-x-12"></div>
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-white/90 text-xl lg:text-2xl font-light mt-6 leading-relaxed">
              Smart allergy predictions, personalized for you
            </p>
          </div>

          {/* Call to Action Button */}
          <div className="mb-8">
            <Link
              href="/allergyForm"
              className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full text-red-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-3xl min-w-[200px]"
            >
              <span className="mr-3">Get Protected</span>
              <svg className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>

          {/* Features */}
          <div className="space-y-4 text-white/80">
            <div className="flex items-center justify-center space-x-3">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Instant restaurant safety checks</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>AI-powered menu analysis</span>
            </div>
            <div className="flex items-center justify-center space-x-3">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Personalized recommendations</span>
            </div>
          </div>

          {/* Trust indicator */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">
              Trusted by thousands of people with food allergies
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
