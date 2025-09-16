'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSafeFoodsByRestaurantName } from '../modules/aiFunctions.mjs';
import { useAllergy } from '../contexts/AllergyContext';

interface ProcessingData {
  option: string;
  timestamp: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  restaurantName?: string;
  foodName?: string;
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

export default function MenuInput() {
  const router = useRouter();
  const { userProfile } = useAllergy();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  // Get allergies from context
  const userAllergies = userProfile?.allergies || [];
  
  // Redirect to allergy form if no allergies are set
  useEffect(() => {
    if (userAllergies.length === 0) {
      router.push('/allergyForm');
    }
  }, [userAllergies, router]);
  
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [foodName, setFoodName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [showResults, setShowResults] = useState<boolean>(false);
  const [expandedCategories, setExpandedCategories] = useState<{[key: string]: boolean}>({
    'More Safe': true,
    'Questionable': false,
    'Avoid': false
  });

  // Cleanup object URLs on component unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    setError('');
    // Reset other states when switching options
    setSelectedFile(null);
    
    // Revoke previous object URL to prevent memory leak
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    
    setRestaurantName('');
    setFoodName('');
  };

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
      let processingData: ProcessingData = {
        option: selectedOption,
        timestamp: new Date().toISOString()
      };

      // For now, we'll only handle the text input option with restaurant name
      if (selectedOption === 'text') {
        if (!restaurantName.trim()) {
          setError('Please enter a restaurant name to check for allergens');
          setIsProcessing(false);
          return;
        }
        
        processingData.restaurantName = restaurantName.trim();
        if (foodName.trim()) {
          processingData.foodName = foodName.trim();
        }

        console.log('Processing menu input:', processingData);
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

      } else if (selectedOption === 'picture') {
        if (!selectedFile) {
          setError('Please select or capture an image');
          setIsProcessing(false);
          return;
        }
        
        processingData.fileName = selectedFile.name;
        processingData.fileSize = selectedFile.size;
        processingData.fileType = selectedFile.type;
        
        // For picture option, show a message that this feature is coming soon
        setError('Picture analysis is coming soon. Please use the text input option for now.');
        setIsProcessing(false);
        return;
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      setError('An error occurred while analyzing the menu. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header matching dashboard style */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6 justify-center">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-2xl">🌟</span>
              <h1 className="text-2xl font-bold text-gray-800">Allergy Alert</h1>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-lg rounded-3xl p-8 border border-white/20 backdrop-blur-sm">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center">
              Menu Analysis
            </h2>
            <p className="mt-2 text-center text-gray-600">
              Choose how you'd like to check for allergens in your food
            </p>
            {userProfile && (
              <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-2xl">
                <p className="text-sm text-center text-purple-800">
                  <span className="font-medium">Hello {userProfile.name}!</span> We'll check for: {userAllergies.join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Option Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Picture Option (Camera + Upload) */}
            <div
              onClick={() => handleOptionSelect('picture')}
              className={`cursor-pointer rounded-2xl border-2 p-6 text-center transition-all duration-200 transform hover:scale-105 ${
                selectedOption === 'picture'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-full p-4 ${
                  selectedOption === 'picture' ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Take or Upload Picture</h3>
                <p className="text-sm text-gray-600">
                  Capture a photo with your camera or upload an existing image of a menu or food item
                </p>
              </div>
            </div>

            {/* Text Input Option */}
            <div
              onClick={() => handleOptionSelect('text')}
              className={`cursor-pointer rounded-2xl border-2 p-6 text-center transition-all duration-200 transform hover:scale-105 ${
                selectedOption === 'text'
                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                  : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-full p-4 ${
                  selectedOption === 'text' ? 'bg-purple-500' : 'bg-gray-400'
                }`}>
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Type Restaurant/Food</h3>
                <p className="text-sm text-gray-600">
                  Enter restaurant name or specific food item
                </p>
              </div>
            </div>
          </div>

          {/* Content Area Based on Selection */}
          {selectedOption && (
            <div className="border-t pt-8">
              {/* Picture Option (Combined Camera + Upload) */}
              {selectedOption === 'picture' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Add a Picture</h2>
                  <div className="flex flex-col items-center space-y-6">
                    {previewUrl ? (
                      <div className="relative">
                        <img
                          src={previewUrl}
                          alt="Selected menu/food"
                          className="max-w-md max-h-64 object-contain rounded-lg border"
                        />
                        <button
                          onClick={() => {
                            // Revoke object URL to prevent memory leak
                            if (previewUrl) {
                              URL.revokeObjectURL(previewUrl);
                            }
                            setSelectedFile(null);
                            setPreviewUrl('');
                          }}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div 
                        onClick={handleUploadClick}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-gray-400 transition-colors w-full max-w-md"
                      >
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-lg font-medium text-gray-900 mb-2">Add a picture</p>
                        <p className="text-sm text-gray-600 mb-4">Click here to upload or take a photo</p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                      </div>
                    )}
                    
                    <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                      <button
                        onClick={handleCameraCapture}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Take Photo
                      </button>
                      <button
                        onClick={handleUploadClick}
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload File
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Text Input Option */}
              {selectedOption === 'text' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Enter Restaurant or Food Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="restaurant" className="block text-sm font-medium text-gray-700 mb-2">
                        Restaurant Name
                      </label>
                      <input
                        type="text"
                        id="restaurant"
                        value={restaurantName}
                        onChange={(e) => handleTextInputChange('restaurant', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="e.g., McDonald's, Olive Garden"
                      />
                    </div>
                    <div>
                      <label htmlFor="food" className="block text-sm font-medium text-gray-700 mb-2">
                        Specific Food Item
                      </label>
                      <input
                        type="text"
                        id="food"
                        value={foodName}
                        onChange={(e) => handleTextInputChange('food', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200"
                        placeholder="e.g., Caesar Salad, Chicken Sandwich"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    Enter either a restaurant name or a specific food item (or both for more accurate results)
                  </p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Action Button */}
              <div className="mt-8 flex justify-center">
                <button
                  onClick={validateAndProceed}
                  disabled={isProcessing}
                  className={`inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-xl text-white transition-all duration-200 transform hover:scale-105 shadow-lg ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed scale-100'
                      : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
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
                      <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Check for Allergens
                    </>
                  )}
                </button>
              </div>

              {/* Food Safety Results Display */}
              {showResults && menuData && (
                <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <h3 className="text-lg font-medium text-blue-900 mb-3">
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
                            <div key={category} className={`border rounded-lg ${categoryColors[category]}`}>
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
                                      <div key={index} className="bg-white p-4 rounded-md border border-gray-200">
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
    </div>
  );
}