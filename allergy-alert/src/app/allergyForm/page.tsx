'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    emergencyContact: ''
  });

  const [allergyFields, setAllergyFields] = useState<AllergyField[]>([
    { id: '1', value: '', error: '' }
  ]);

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
        ...formData,
        allergies: validAllergies,
        submittedAt: new Date().toISOString()
      };

      console.log('Form submitted:', submissionData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Navigate to next page (you can change this route as needed)
      router.push('/menuInput'); // or wherever you want to navigate
      
    } catch (error) {
      console.error('Submission error:', error);
      // Handle submission error
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 text-center">
              Food Allergy Information Form
            </h1>
            <p className="mt-2 text-center text-gray-600">
              Please provide your food allergies for our records
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormDataChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your full name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleFormDataChange}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    formErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                  }`}
                  placeholder="Enter your email"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
            </div>

            {/* Dynamic Allergy Fields */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Food Allergies *
                </label>
                <button
                  type="button"
                  onClick={addAllergyField}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Allergy
                </button>
              </div>

              <div className="space-y-3">
                {allergyFields.map((field, index) => (
                  <div key={field.id} className="flex items-start space-x-3">
                    <div className="flex-1">
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleAllergyChange(field.id, e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          field.error ? 'border-red-500' : 'border-gray-300 focus:border-blue-500'
                        }`}
                        placeholder={`Food allergy ${index + 1} (e.g., peanuts, shellfish, dairy)`}
                      />
                      {field.error && (
                        <p className="mt-1 text-sm text-red-600">{field.error}</p>
                      )}
                    </div>
                    {allergyFields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAllergyField(field.id)}
                        className="mt-2 inline-flex items-center p-1 border border-transparent rounded-full text-red-600 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {formErrors.allergies && (
                <p className="mt-2 text-sm text-red-600">{formErrors.allergies}</p>
              )}
              
              <p className="mt-2 text-xs text-gray-500">
                Only letters and spaces are allowed. Each allergy must be at least 2 characters long.
              </p>
            </div>

            {/* Emergency Contact */}
            <div>
              <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-2">
                Emergency Contact (Optional)
              </label>
              <input
                type="text"
                id="emergencyContact"
                name="emergencyContact"
                value={formData.emergencyContact}
                onChange={handleFormDataChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Name and phone number of emergency contact"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-200 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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
                  'Submit Allergy Information'
                )}
              </button>
            </div>
          </form>

          {/* Additional Information */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Form Guidelines
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use the "Add Allergy" button to include multiple food allergies</li>
                    <li>Only letters and spaces are allowed in allergy fields</li>
                    <li>All information will be kept confidential and secure</li>
                    <li>This information may be shared with medical professionals in emergencies</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}