import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function AllergyForm() {
  const [allergies, setAllergies] = useState(['']);
  const [errors, setErrors] = useState([]);
  const navigate = useNavigate();

  const handleAllergyChange = (index, value) => {
    // Validate that input contains only letters and spaces
    const lettersOnlyRegex = /^[a-zA-Z\s]*$/;
    
    if (lettersOnlyRegex.test(value)) {
      const newAllergies = [...allergies];
      newAllergies[index] = value;
      setAllergies(newAllergies);
      
      // Clear error for this field if it was previously invalid
      const newErrors = [...errors];
      newErrors[index] = '';
      setErrors(newErrors);
    } else {
      // Set error for this field
      const newErrors = [...errors];
      newErrors[index] = 'Only letters and spaces are allowed';
      setErrors(newErrors);
    }
  };

  const addAllergyField = () => {
    setAllergies([...allergies, '']);
    setErrors([...errors, '']);
  };

  const removeAllergyField = (index) => {
    if (allergies.length > 1) {
      const newAllergies = allergies.filter((_, i) => i !== index);
      const newErrors = errors.filter((_, i) => i !== index);
      setAllergies(newAllergies);
      setErrors(newErrors);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Filter out empty allergies
    const validAllergies = allergies.filter(allergy => allergy.trim() !== '');
    
    if (validAllergies.length === 0) {
      alert('Please enter at least one food allergy.');
      return;
    }

    // Check if there are any validation errors
    const hasErrors = errors.some(error => error !== '');
    if (hasErrors) {
      alert('Please fix the validation errors before continuing.');
      return;
    }

    // Store allergies in localStorage or state management
    localStorage.setItem('userAllergies', JSON.stringify(validAllergies));
    
    // Navigate to options page
    navigate('/options');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Food Allergy Alert</h1>
      <p>Please enter the foods you are allergic to. Only letters and spaces are allowed.</p>
      
      <form onSubmit={handleSubmit}>
        {allergies.map((allergy, index) => (
          <div key={index} style={{ marginBottom: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <input
                type="text"
                value={allergy}
                onChange={(e) => handleAllergyChange(index, e.target.value)}
                placeholder={`Food allergy ${index + 1}`}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: errors[index] ? '2px solid red' : '2px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
              />
              {allergies.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAllergyField(index)}
                  style={{
                    padding: '10px 15px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove
                </button>
              )}
            </div>
            {errors[index] && (
              <div style={{ color: 'red', fontSize: '14px', marginTop: '5px' }}>
                {errors[index]}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ marginBottom: '20px' }}>
          <button
            type="button"
            onClick={addAllergyField}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginRight: '10px'
            }}
          >
            Add Another Allergy
          </button>
        </div>
        
        <button
          type="submit"
          style={{
            padding: '15px 30px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Continue to Options
        </button>
      </form>
    </div>
  );
}

export default AllergyForm;