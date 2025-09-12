'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProcessingData {
  option: string;
  timestamp: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  restaurantName?: string;
  foodName?: string;
}

export default function MenuInput() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [restaurantName, setRestaurantName] = useState<string>('');
  const [foodName, setFoodName] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

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

  const validateAndProceed = async () => {
    setIsProcessing(true);
    setError('');

    try {
      let processingData: ProcessingData = {
        option: selectedOption,
        timestamp: new Date().toISOString()
      };

      if (selectedOption === 'picture') {
        if (!selectedFile) {
          setError('Please select or capture an image');
          setIsProcessing(false);
          return;
        }
        processingData.fileName = selectedFile.name;
        processingData.fileSize = selectedFile.size;
        processingData.fileType = selectedFile.type;
      } else if (selectedOption === 'text') {
        if (!restaurantName.trim() && !foodName.trim()) {
          setError('Please enter either a restaurant name or food name');
          setIsProcessing(false);
          return;
        }
        processingData.restaurantName = restaurantName.trim();
        processingData.foodName = foodName.trim();
      }

      console.log('Processing menu input:', processingData);

      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Navigate to results page (you can create this later)
      router.push('/results');
      
    } catch (error) {
      console.error('Processing error:', error);
      setError('An error occurred while processing your request. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Menu Analysis
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Choose how you'd like to check for allergens in your food
            </p>
          </div>

          {/* Option Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Picture Option (Camera + Upload) */}
            <div
              onClick={() => handleOptionSelect('picture')}
              className={`cursor-pointer rounded-lg border-2 p-6 text-center transition-all duration-200 ${
                selectedOption === 'picture'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-full p-4 ${
                  selectedOption === 'picture' ? 'bg-blue-500' : 'bg-gray-400'
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
              className={`cursor-pointer rounded-lg border-2 p-6 text-center transition-all duration-200 ${
                selectedOption === 'text'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-4">
                <div className={`rounded-full p-4 ${
                  selectedOption === 'text' ? 'bg-blue-500' : 'bg-gray-400'
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className={`inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white transition duration-200 ${
                    isProcessing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500'
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