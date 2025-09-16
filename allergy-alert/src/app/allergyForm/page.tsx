'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAllergy } from '../contexts/AllergyContext';

interface AllergyField {
  id: string;
  value: string;
  error: string;
}

interface FormData {
  name: string;
  email: string;
  emergencyContact: string;
}

interface FormErrors {
  name: string;
  email: string;
  emergencyContact: string;
  allergies: string;
}

export default function AllergyForm() {
  const router = useRouter();
  const { setUserProfile, userProfile } = useAllergy();
  
  const [formData, setFormData] = useState<FormData>({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
    emergencyContact: userProfile?.emergencyContact || ''
  });

  const [allergyFields, setAllergyFields] = useState<AllergyField[]>(() => {
    if (userProfile?.allergies && userProfile.allergies.length > 0) {
      return userProfile.allergies.map((allergy, index) => ({
        id: `${index + 1}`,
        value: allergy,
        error: ''
      }));
    }
    return [{ id: '1', value: '', error: '' }];
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: '',
    email: '',
    emergencyContact: '',
    allergies: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation function for letters and spaces only
  const validateAllergyInput = (value: string): string => {
    if (!value.trim()) {
      return 'This field is required';
    }
    const lettersAndSpacesOnly = /^[a-zA-Z\s]+$/;
    if (!lettersAndSpacesOnly.test(value)) {
      return 'Only letters and spaces are allowed';
    }
    if (value.length < 2) {
      return 'Allergy name must be at least 2 characters long';
    }
    return '';
  };

  // Validation function for name
  const validateName = (value: string): string => {
    if (!value.trim()) {
      return 'Name is required';
    }
    const lettersAndSpacesOnly = /^[a-zA-Z\s]+$/;
    if (!lettersAndSpacesOnly.test(value)) {
      return 'Only letters and spaces are allowed';
    }
    return '';
  };

  // Validation function for email
  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation
    let error = '';
    if (name === 'name') {
      error = validateName(value);
    } else if (name === 'email') {
      error = validateEmail(value);
    }

    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleAllergyChange = (id: string, value: string) => {
    const error = validateAllergyInput(value);
    
    setAllergyFields(prev => 
      prev.map(field => 
        field.id === id 
          ? { ...field, value, error }
          : field
      )
    );
  };

  const addAllergyField = () => {
    const newId = crypto.randomUUID();
    setAllergyFields(prev => [...prev, { id: newId, value: '', error: '' }]);
  };

  const removeAllergyField = (id: string) => {
    if (allergyFields.length > 1) {
      setAllergyFields(prev => prev.filter(field => field.id !== id));
    }
  };

  const validateAllFields = (): boolean => {
    let isValid = true;
    const newFormErrors: FormErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      emergencyContact: '',
      allergies: ''
    };

    // Validate all allergy fields
    const updatedAllergyFields = allergyFields.map(field => {
      const error = validateAllergyInput(field.value);
      if (error) isValid = false;
      return { ...field, error };
    });

    // Check if at least one allergy is provided
    const hasValidAllergy = updatedAllergyFields.some(field => field.value.trim() && !field.error);
    if (!hasValidAllergy) {
      newFormErrors.allergies = 'At least one allergy must be provided';
      isValid = false;
    }

    setAllergyFields(updatedAllergyFields);
    setFormErrors(newFormErrors);

    // Check form data errors
    if (newFormErrors.name || newFormErrors.email) {
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateAllFields()) {
      setIsSubmitting(false);
      return;
    }

    try {
      // Prepare submission data
      const validAllergies = allergyFields
        .filter(field => field.value.trim() && !field.error)
        .map(field => field.value.trim());

      const submissionData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        emergencyContact: formData.emergencyContact.trim(),
        allergies: validAllergies,
        submittedAt: new Date().toISOString()
      };

      console.log('Form submitted:', submissionData);
      
      // Save to context instead of URL params
      setUserProfile(submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to menuInput without query params
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Submission error:', error);
      // Handle submission error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header matching dashboard style */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-purple-600 text-2xl">🌟</span>
              <h1 className="text-2xl font-bold text-gray-800">Allergy Alert</h1>
            </div>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-xl shadow-2xl rounded-3xl p-8 border border-white/30 transform transition-all duration-500 ease-out relative overflow-hidden">
          {/* Gradient background overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white/20 to-cyan-50/50 rounded-3xl"></div>
          
          <div className="relative z-10">
            {/* Header */}
            <div className="mb-8 text-center transform transition-all duration-700 ease-out animate-in slide-in-from-top-2 fade-in-0 delay-150">
              <div className="flex items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Food Allergy Information
              </h2>
              <p className="text-sm text-gray-600">
                Help us keep you safe by sharing your allergy information
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 transform transition-all duration-700 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-300">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group transform transition-all duration-500 ease-out animate-in slide-in-from-left-2 fade-in-0 delay-500">
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="h-4 w-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Full Name *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleFormDataChange}
                      className={`w-full px-4 py-4 pl-12 bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02] group-hover:shadow-md ${
                        formErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Enter your full name"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="group transform transition-all duration-500 ease-out animate-in slide-in-from-right-2 fade-in-0 delay-700">
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <svg className="h-4 w-4 mr-2 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleFormDataChange}
                      className={`w-full px-4 py-4 pl-12 bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02] group-hover:shadow-md ${
                        formErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-200'
                      }`}
                      placeholder="Enter your email address"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formErrors.email}
                    </p>
                  )}
                </div>
              </div>

              {/* Dynamic Allergy Fields */}
              <div className="space-y-6 transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-900">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-semibold text-gray-800 flex items-center">
                    <svg className="h-4 w-4 mr-2 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Food Allergies *
                  </label>
                  <button
                    type="button"
                    onClick={addAllergyField}
                    className="group inline-flex items-center px-4 py-2 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <svg className="h-4 w-4 mr-2 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Allergy
                  </button>
                </div>

                <div className="space-y-4">
                  {allergyFields.map((field, index) => (
                    <div key={field.id} className="group flex items-start space-x-4 transform transition-all duration-300 ease-out animate-in slide-in-from-left-2 fade-in-0" style={{animationDelay: `${index * 100}ms`}}>
                      <div className="flex-1">
                        <div className="relative">
                          <input
                            type="text"
                            value={field.value}
                            onChange={(e) => handleAllergyChange(field.id, e.target.value)}
                            className={`w-full px-4 py-4 pl-12 bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02] group-hover:shadow-md ${
                              field.error ? 'border-red-500 bg-red-50' : 'border-gray-200'
                            }`}
                            placeholder={`Food allergy ${index + 1} (e.g., peanuts, shellfish, dairy)`}
                          />
                          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                          </div>
                        </div>
                        {field.error && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {field.error}
                          </p>
                        )}
                      </div>
                      {allergyFields.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeAllergyField(field.id)}
                          className="group mt-4 inline-flex items-center p-3 border border-transparent rounded-xl text-red-600 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-300 transform hover:scale-110 shadow-sm hover:shadow-md"
                        >
                          <svg className="h-4 w-4 transition-transform duration-200 group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                
                {formErrors.allergies && (
                  <p className="text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-xl border border-red-200">
                    <svg className="h-4 w-4 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {formErrors.allergies}
                  </p>
                )}
                
                <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-4 border border-red-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-red-800 mb-1">Allergy Guidelines</h3>
                      <p className="text-xs text-red-700">Only letters and spaces are allowed. Each allergy must be at least 2 characters long.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="group transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-1100">
                <label htmlFor="emergencyContact" className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <svg className="h-4 w-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Emergency Contact (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="emergencyContact"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleFormDataChange}
                    className="w-full px-4 py-4 pl-12 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 transform focus:scale-[1.02] group-hover:shadow-md"
                    placeholder="Name and phone number of emergency contact"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6 transform transition-all duration-600 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-1300">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group w-full inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-2xl text-white transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl ${
                    isSubmitting
                      ? 'bg-gray-400 cursor-not-allowed scale-100'
                      : 'bg-gradient-to-r from-blue-600 via-blue-700 to-cyan-800 hover:from-blue-700 hover:via-blue-800 hover:to-cyan-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <svg className="h-5 w-5 mr-3 transition-transform duration-200 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Submit Allergy Information
                      <svg className="h-4 w-4 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Additional Information */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl transform transition-all duration-500 ease-out animate-in slide-in-from-bottom-2 fade-in-0 delay-1500">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-800 mb-2">
                    Privacy & Safety Information
                  </h3>
                  <div className="text-sm text-blue-700 space-y-2">
                    <div className="flex items-start space-x-2">
                      <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Use the "Add Allergy" button to include multiple food allergies</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>All information will be kept confidential and secure</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <svg className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>This information helps us provide better allergy safety recommendations</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}