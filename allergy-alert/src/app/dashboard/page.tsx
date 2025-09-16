"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAllergy } from '../contexts/AllergyContext';
import { getSafeFoodsByRestaurantName } from '../modules/aiFunctions.mjs';

interface DashboardCard {
  id: string;
  title: string;
  subtitle?: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactNode;
  href?: string;
}

interface FoodItem {
  name: string;
  safetyClassification: "More Safe" | "Questionable" | "Avoid";
  reasoning: string;
  questions: string;
}

interface MenuData {
  restaurantName: string;
  restaurantInfo: string;
  foods: FoodItem[];
}

const Dashboard = () => {
  const { userProfile } = useAllergy();
  const userAllergies = userProfile?.allergies || [];
  
  // File input refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Restaurant lookup state
  const [showRestaurantLookup, setShowRestaurantLookup] = useState(false);
  const [restaurantName, setRestaurantName] = useState('');
  const [foodName, setFoodName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    'More Safe': true,
    'Questionable': false,
    'Avoid': false
  });
  
  // Picture upload state
  const [showPictureUpload, setShowPictureUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const dashboardCards: DashboardCard[] = [
    {
      id: 'update-allergies',
      title: 'Update Allergies',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      icon: (
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-3xl font-bold">💉</span>
        </div>
      ),
      href: '/allergyForm'
    },
    {
      id: 'take-upload-picture',
      title: 'Take/Upload',
      subtitle: 'a Picture',
      bgColor: 'bg-blue-200',
      textColor: 'text-blue-900',
      icon: (
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-5xl">📷</span>
        </div>
      ),
      href: '/take-upload-picture'
    },
    {
      id: 'restaurant-lookup',
      title: 'Restaurant',
      subtitle: 'Lookup',
      bgColor: 'bg-purple-400',
      textColor: 'text-white',
      icon: (
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-5xl">🍴</span>
        </div>
      ),
      href: '/restaurant-lookup'
    },
    {
      id: 'how-to-use',
      title: 'How to Use',
      subtitle: 'Guide',
      bgColor: 'bg-amber-500',
      textColor: 'text-white',
      icon: (
        <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-5xl">🆘</span>
        </div>
      ),
      href: '/how-to-use'
    }
  ];

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Revoke previous object URL to prevent memory leak
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setSelectedFile(file);
      setError('');

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleCameraCapture = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleCardClick = (card: DashboardCard) => {
    if (card.id === 'restaurant-lookup') {
      // Check if user has allergies set up
      if (userAllergies.length === 0) {
        // Redirect to allergy form if no allergies
        window.location.href = '/allergyForm';
        return;
      }
      
      // Close picture upload interface if it's open
      if (showPictureUpload) {
        setShowPictureUpload(false);
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl('');
      }
      
      // Toggle restaurant lookup interface
      setShowRestaurantLookup(!showRestaurantLookup);
      setError('');
      setMenuData(null);
      setShowResults(false);
      // Reset form when toggling
      if (!showRestaurantLookup) {
        setRestaurantName('');
        setFoodName('');
      }
    } else if (card.id === 'take-upload-picture') {
      // Check if user has allergies set up
      if (userAllergies.length === 0) {
        // Redirect to allergy form if no allergies
        window.location.href = '/allergyForm';
        return;
      }
      
      // Close restaurant lookup interface if it's open
      if (showRestaurantLookup) {
        setShowRestaurantLookup(false);
        setRestaurantName('');
        setFoodName('');
        setMenuData(null);
        setShowResults(false);
      }
      
      // Toggle picture upload interface
      setShowPictureUpload(!showPictureUpload);
      setError('');
      // Reset form when toggling
      if (!showPictureUpload) {
        setSelectedFile(null);
        // Revoke previous object URL to prevent memory leak
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl('');
      }
    } else if (card.href) {
      // Navigate to the specified route
      window.location.href = card.href;
    }
  };

  const handleTextInputChange = (field: 'restaurant' | 'food', value: string) => {
    if (field === 'restaurant') {
      setRestaurantName(value);
    } else {
      setFoodName(value);
    }
    setError('');
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const validateAndProceed = async () => {
    setIsProcessing(true);
    setError('');
    setMenuData(null);
    setShowResults(false);

    try {
      if (!restaurantName.trim()) {
        setError('Please enter a restaurant name to check for allergens');
        setIsProcessing(false);
        return;
      }

      console.log('Processing restaurant lookup:', restaurantName.trim());
      console.log('User allergies:', userAllergies);

      // Call the AI function with restaurant name and allergies
      let aiResponse = await getSafeFoodsByRestaurantName(restaurantName.trim(), userAllergies);

      // if aiResponse is null, make it empty string.
      if (!aiResponse) {
        aiResponse = '{"restaurantName": "", "foods": []}';
      }

      try {
        const parsedData: MenuData = JSON.parse(aiResponse);
        setMenuData(parsedData);
        setShowResults(true);
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        setError('Unable to parse response from AI service. Please try again.');
      }

    } catch (error) {
      console.error('Processing error:', error);
      setError('An error occurred while analyzing the menu. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const goBackToDashboard = () => {
    setShowRestaurantLookup(false);
    setRestaurantName('');
    setFoodName('');
    setError('');
    setMenuData(null);
    setShowResults(false);
  };

  const goBackFromPictureUpload = () => {
    setShowPictureUpload(false);
    setSelectedFile(null);
    setError('');
    // Revoke previous object URL to prevent memory leak
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-2xl">🌟</span>
              <h1 className="text-2xl font-bold text-gray-800">Allergy Alert</h1>
            </div>
          </div>
          {userProfile && (
            <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl">
              <p className="text-sm text-center text-purple-800">
                <span className="font-medium">Welcome back, {userProfile.name}!</span> 
                {userAllergies.length > 0 && (
                  <span> Your allergies: {userAllergies.join(', ')}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Dashboard Grid - Always visible */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {dashboardCards.map((card) => (
            <div
              key={card.id}
              onClick={() => handleCardClick(card)}
              className={`
                ${card.bgColor} 
                ${card.textColor} 
                rounded-3xl p-6 
                cursor-pointer 
                transform transition-all duration-200 
                hover:scale-105 hover:shadow-lg
                min-h-[180px]
                flex flex-col justify-between
                relative overflow-hidden
                group
                ${card.id === 'restaurant-lookup' && showRestaurantLookup ? 'ring-2 ring-purple-400 animate-pulse' : ''}
                ${card.id === 'take-upload-picture' && showPictureUpload ? 'ring-2 ring-blue-400 animate-pulse' : ''}
              `}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
              
              {/* Content */}
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold leading-tight">
                      {card.title}
                    </h3>
                    {card.subtitle && (
                      <p className="text-lg font-semibold opacity-90">
                        {card.subtitle}
                      </p>
                    )}
                  </div>
                  <div className="ml-2">
                    {card.icon}
                  </div>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-200 rounded-3xl"></div>
            </div>
          ))}
        </div>

        {/* Restaurant Lookup Interface - Expandable below cards */}
        {showRestaurantLookup && (
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/30 transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in-0 relative overflow-hidden">
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/20 to-cyan-50/50 rounded-3xl"></div>
              
              {/* Header */}
              <div className="relative z-10 mb-8 transform transition-all duration-700 ease-out animate-in slide-in-from-top-2 fade-in-0 delay-150">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">Restaurant Lookup</h2>
                      <p className="text-sm text-gray-600">Discover safe dining options for your allergies</p>
                    </div>
                  </div>
                  <button
                    onClick={goBackToDashboard}
                    className="group inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100/80 rounded-xl hover:bg-blue-200 hover:scale-105 transition-all duration-200 transform backdrop-blur-sm"
                  >
                    <svg className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                </div>
              </div>

              {/* Restaurant lookup form */}
              <div className="relative z-10 space-y-8 transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group transform transition-all duration-500 ease-out animate-in slide-in-from-left-2 fade-in-0 delay-500">
                    <label htmlFor="restaurant" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Restaurant Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="restaurant"
                        value={restaurantName}
                        onChange={(e) => handleTextInputChange('restaurant', e.target.value)}
                        className="w-full px-4 py-4 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02] group-hover:shadow-md"
                        placeholder="e.g., McDonald's, Olive Garden"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="group transform transition-all duration-500 ease-out animate-in slide-in-from-right-2 fade-in-0 delay-700">
                    <label htmlFor="food" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                      <svg className="h-4 w-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                      </svg>
                      Specific Food Item (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="food"
                        value={foodName}
                        onChange={(e) => handleTextInputChange('food', e.target.value)}
                        className="w-full px-4 py-4 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02] group-hover:shadow-md"
                        placeholder="e.g., Caesar Salad, Chicken Sandwich"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 mb-1">How it works</h3>
                      <p className="text-sm text-blue-700">Enter a restaurant name to get personalized allergy information for their menu items based on your dietary restrictions.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative z-10 mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl transform transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in-0">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="relative z-10 mt-8 flex justify-center transform transition-all duration-600 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-1000">
                <button
                  onClick={validateAndProceed}
                  disabled={isProcessing}
                  className={`group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed scale-100'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-800 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing for Allergens...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check for Allergens
                      <svg className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>

              {/* Food Safety Results Display */}
              {showResults && menuData && (
                <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in-0">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 transform transition-all duration-400 ease-out animate-in zoom-in-0 delay-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4 flex-1 transform transition-all duration-600 ease-out animate-in slide-in-from-right-2 fade-in-0 delay-300">
                      <h3 className="text-lg font-semibold text-blue-900 mb-3">
                        Allergy Analysis Results for {menuData.restaurantName}
                      </h3>
                      {menuData.restaurantInfo && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-blue-800">Restaurant Information:</p>
                          <p className="text-sm text-blue-700">{menuData.restaurantInfo}</p>
                        </div>
                      )}
                      {userAllergies.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-blue-800">Your allergies:</p>
                          <p className="text-sm text-blue-700">{userAllergies.join(', ')}</p>
                        </div>
                      )}
                      
                      {/* Safety Classification Dropdowns */}
                      <div className="space-y-4">
                        {(['More Safe', 'Questionable', 'Avoid'] as const).map((category) => {
                          const categoryFoods = menuData.foods.filter(food => food.safetyClassification === category);
                          const categoryColors = {
                            'More Safe': 'bg-green-100 border-green-200 text-green-800',
                            'Questionable': 'bg-yellow-100 border-yellow-200 text-yellow-800',
                            'Avoid': 'bg-red-100 border-red-200 text-red-800'
                          };
                          const iconColors = {
                            'More Safe': 'text-green-600',
                            'Questionable': 'text-yellow-600',
                            'Avoid': 'text-red-600'
                          };
                          
                          if (categoryFoods.length === 0) return null;
                          
                          return (
                            <div key={category} className={`border rounded-xl ${categoryColors[category]}`}>
                              <button
                                onClick={() => toggleCategory(category)}
                                className="w-full px-4 py-3 flex items-center justify-between text-left hover:opacity-80 transition-opacity"
                              >
                                <div className="flex items-center space-x-3">
                                  <div className={`flex-shrink-0 ${iconColors[category]}`}>
                                    {category === 'More Safe' && (
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    {category === 'Questionable' && (
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                    )}
                                    {category === 'Avoid' && (
                                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                      </svg>
                                    )}
                                  </div>
                                  <span className="font-medium">{category}</span>
                                  <span className="text-sm opacity-75">({categoryFoods.length} items)</span>
                                </div>
                                <svg
                                  className={`h-5 w-5 transform transition-transform ${
                                    expandedCategories[category] ? 'rotate-180' : ''
                                  }`}
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              
                              {expandedCategories[category] && (
                                <div className="px-4 pb-4">
                                  <div className="space-y-3">
                                    {categoryFoods.map((food, index) => (
                                      <div key={index} className="bg-white p-4 rounded-xl border border-gray-200">
                                        <h4 className="font-medium text-gray-900 mb-3">{food.name}</h4>

                                        {food.reasoning && (
                                          <div className="mb-2">
                                            <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Reasoning:</p>
                                            <p className="text-sm text-gray-800">{food.reasoning}</p>
                                          </div>
                                        )}

                                        <div>
                                          <p className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-1">Question to Ask:</p>
                                          <p className="text-sm text-gray-600">{food.questions}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Picture Upload Interface - Expandable below cards */}
        {showPictureUpload && (
          <div className="mt-8 max-w-5xl mx-auto">
            <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/30 transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-4 fade-in-0 relative overflow-hidden">
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/20 to-cyan-50/50 rounded-3xl"></div>
              
              {/* Header */}
              <div className="relative z-10 mb-8 transform transition-all duration-700 ease-out animate-in slide-in-from-top-2 fade-in-0 delay-150">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-1">Take/Upload Picture</h2>
                      <p className="text-sm text-gray-600">Snap or upload a photo for instant allergy analysis</p>
                    </div>
                  </div>
                  <button
                    onClick={goBackFromPictureUpload}
                    className="group inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-100/80 rounded-xl hover:bg-blue-200 hover:scale-105 transition-all duration-200 transform backdrop-blur-sm"
                  >
                    <svg className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Close
                  </button>
                </div>
              </div>

              {/* Picture upload interface */}
              <div className="relative z-10 space-y-8 transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-300">
                <div className="flex flex-col items-center space-y-8">
                  {previewUrl ? (
                    <div className="relative transform transition-all duration-500 ease-out animate-in zoom-in-0 delay-500 group">
                      <div className="relative overflow-hidden rounded-3xl shadow-2xl border-4 border-white">
                        <img
                          src={previewUrl}
                          alt="Selected menu/food"
                          className="max-w-md max-h-80 object-contain bg-gray-50"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                      </div>
                      <button
                        onClick={() => {
                          // Revoke object URL to prevent memory leak
                          if (previewUrl) {
                            URL.revokeObjectURL(previewUrl);
                          }
                          setSelectedFile(null);
                          setPreviewUrl('');
                        }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-3 hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-xl group-hover:shadow-2xl"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600 font-medium">Image ready for analysis</p>
                        <p className="text-xs text-gray-500 mt-1">Click the button below to analyze for allergens</p>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-w-2xl">
                      <div 
                        onClick={handleUploadClick}
                        className="group relative border-2 border-dashed border-gray-300 rounded-3xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 transform hover:scale-[1.02] bg-gradient-to-br from-gray-50/50 to-white/80 backdrop-blur-sm"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-cyan-50/30 rounded-3xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="relative z-10">
                          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-3">Add your picture</h3>
                          <p className="text-gray-600 mb-6 text-lg">Click here to upload or take a photo</p>
                          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>PNG, JPG, GIF up to 10MB</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-col sm:flex-row gap-6 w-full max-w-md transform transition-all duration-600 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-900">
                    <button
                      onClick={handleCameraCapture}
                      className="group flex-1 inline-flex items-center justify-center px-6 py-4 border border-transparent text-base font-semibold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                    >
                      <svg className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Take Photo
                    </button>
                    <button
                      onClick={handleUploadClick}
                      className="group flex-1 inline-flex items-center justify-center px-6 py-4 border-2 border-gray-300 text-base font-semibold rounded-2xl text-gray-700 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <svg className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      Upload File
                    </button>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-blue-800 mb-1">Smart Analysis</h3>
                      <p className="text-sm text-blue-700">Our AI will scan your image to identify food items and check them against your allergy profile for personalized safety recommendations.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="relative z-10 mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl transform transition-all duration-300 ease-out animate-in slide-in-from-top-2 fade-in-0">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <div className="relative z-10 mt-8 flex justify-center transform transition-all duration-600 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-1000">
                <button
                  onClick={() => {
                    if (!selectedFile) {
                      setError('Please select or capture an image');
                      return;
                    }
                    // For now, show a message that this feature is coming soon
                    setError('Picture analysis is coming soon. Please use the Restaurant Lookup for now.');
                  }}
                  disabled={isProcessing}
                  className={`group inline-flex items-center px-8 py-4 text-lg font-semibold rounded-2xl text-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed scale-100'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-800 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing for Allergens...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      Analyze Picture
                      <svg className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden file inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileSelect}
          className="hidden"
        />

      </div>
    </div>
  );
};

export default Dashboard;