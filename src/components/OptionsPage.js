import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function OptionsPage() {
  const [allergies, setAllergies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load allergies from localStorage
    const storedAllergies = localStorage.getItem('userAllergies');
    if (storedAllergies) {
      setAllergies(JSON.parse(storedAllergies));
    } else {
      // If no allergies found, redirect back to form
      navigate('/');
    }
  }, [navigate]);

  const handleOptionClick = (option) => {
    // For now, just show an alert. In a real app, this would navigate to specific functionality
    alert(`You selected: ${option}\n\nThis feature would be implemented to help you check for your allergies:\n${allergies.join(', ')}`);
  };

  const goBack = () => {
    navigate('/');
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Allergy Alert Options</h1>
      
      {allergies.length > 0 && (
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6', 
          borderRadius: '8px', 
          padding: '15px', 
          marginBottom: '30px' 
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#495057' }}>Your Allergies:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            {allergies.map((allergy, index) => (
              <li key={index} style={{ fontSize: '16px', marginBottom: '5px' }}>
                {allergy}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p style={{ fontSize: '18px', marginBottom: '30px' }}>
        Choose one of the following options to check for potential allergens:
      </p>

      <div style={{ display: 'grid', gap: '20px' }}>
        <button
          onClick={() => handleOptionClick('Take a picture of a restaurant')}
          style={{
            padding: '20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'left',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#0056b3'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#007bff'}
        >
          📸 Take a picture of a restaurant
        </button>

        <button
          onClick={() => handleOptionClick('Input the name of a restaurant')}
          style={{
            padding: '20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'left',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#1e7e34'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
        >
          🏪 Input the name of a restaurant
        </button>

        <button
          onClick={() => handleOptionClick('Take a picture of a menu')}
          style={{
            padding: '20px',
            backgroundColor: '#fd7e14',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'left',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#e55a00'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#fd7e14'}
        >
          📋 Take a picture of a menu
        </button>

        <button
          onClick={() => handleOptionClick('Input the name of a food item')}
          style={{
            padding: '20px',
            backgroundColor: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '18px',
            fontWeight: 'bold',
            textAlign: 'left',
            transition: 'background-color 0.3s'
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = '#5a2d91'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#6f42c1'}
        >
          🍽️ Input the name of a food item
        </button>
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <button
          onClick={goBack}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          ← Go Back to Edit Allergies
        </button>
      </div>
    </div>
  );
}

export default OptionsPage;