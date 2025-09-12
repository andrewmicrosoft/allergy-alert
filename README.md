# Food Allergy Alert Web Application

A React-based web application designed for people with food allergies. The app helps users track their allergies and provides options to check for potential allergens in restaurants, menus, and food items.

## Features

- **Dynamic Allergy Input**: Add and remove multiple food allergies with real-time validation
- **Input Validation**: Only letters and spaces are allowed in allergy fields
- **Two-Page Navigation**: Seamless flow from allergy input to action options
- **Data Persistence**: Allergies are preserved when navigating between pages
- **Multiple Alert Options**:
  - 📸 Take a picture of a restaurant
  - 🏪 Input the name of a restaurant
  - 📋 Take a picture of a menu
  - 🍽️ Input the name of a food item

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 14.0 or higher) - [Download Node.js](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

To check if you have Node.js and npm installed:
```bash
node --version
npm --version
```

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/andrewmicrosoft/allergy-alert.git
   cd allergy-alert
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```
   
   This will install all required packages including:
   - React 19.1.1
   - React DOM 19.1.1
   - React Router DOM 7.8.2
   - React Scripts 5.0.1

## Running the Application Locally

### Development Mode

To start the development server:

```bash
npm start
```

This will:
- Start the development server on `http://localhost:3000`
- Open your default browser automatically
- Enable hot-reloading (changes will appear instantly)
- Display compilation errors in the console

The application will be available at: **http://localhost:3000**

### Production Build

To create a production-ready build:

```bash
npm run build
```

This creates a `build/` folder with optimized files ready for deployment.

To serve the production build locally:

```bash
npm install -g serve
serve -s build
```

The production build will be available at: **http://localhost:3000** (or the port shown in the terminal)

## Testing the Application

### Automated Tests

Run the test suite:

```bash
npm test
```

For a single test run (without watch mode):

```bash
npm test -- --watchAll=false
```

### Manual Testing Guide

Once the application is running, follow these steps to test the functionality:

#### Page 1: Allergy Input Form

1. **Navigate to** `http://localhost:3000`
2. **Enter your first allergy** in the input field (e.g., "Peanuts")
3. **Click "Add Another Allergy"** to add more fields
4. **Test input validation**:
   - Try entering numbers (e.g., "123") - should show error
   - Try entering special characters (e.g., "Milk!") - should show error
   - Enter valid text with letters and spaces (e.g., "Dairy products") - should work
5. **Remove allergies** by clicking the "Remove" button next to any field
6. **Submit the form** by clicking "Continue to Options"

#### Page 2: Options Selection

1. **Verify your allergies** are displayed correctly at the top
2. **Test the four action buttons**:
   - 📸 Take a picture of a restaurant
   - 🏪 Input the name of a restaurant
   - 📋 Take a picture of a menu
   - 🍽️ Input the name of a food item
3. **Test navigation** by clicking "← Go Back to Edit Allergies"
4. **Verify data persistence** - your allergies should still be there

#### Browser Compatibility Testing

Test the application in different browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

#### Mobile Responsiveness Testing

1. Open browser developer tools (F12)
2. Enable device emulation
3. Test various screen sizes:
   - Mobile phones (375px width)
   - Tablets (768px width)
   - Desktop (1200px+ width)

## Project Structure

```
allergy-alert/
├── public/
│   ├── index.html          # Main HTML template
│   └── ...
├── src/
│   ├── components/
│   │   ├── AllergyForm.js  # Main allergy input form
│   │   └── OptionsPage.js  # Alert options selection page
│   ├── App.js              # Main app component with routing
│   └── index.js            # Application entry point
├── package.json            # Project configuration and dependencies
└── README.md              # This file
```

## Available Scripts

- **`npm start`** - Runs the app in development mode
- **`npm test`** - Launches the test runner
- **`npm run build`** - Builds the app for production
- **`npm run eject`** - Ejects from Create React App (irreversible)

## Troubleshooting

### Common Issues

**Port 3000 is already in use:**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
# Or specify a different port
PORT=3001 npm start
```

**Dependencies not installed:**
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Build fails:**
```bash
# Check for linting errors
npm run build
# Review error messages and fix any ESLint warnings
```

**Browser doesn't open automatically:**
- Manually navigate to `http://localhost:3000`
- Check that no firewall is blocking the port

### Getting Help

If you encounter issues:

1. Check the console for error messages
2. Ensure all prerequisites are installed correctly
3. Try clearing browser cache and cookies
4. Restart the development server
5. Check the [Create React App documentation](https://create-react-app.dev/docs/getting-started/)

## Development

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app) and uses:

- **React 19** with functional components and hooks
- **React Router DOM** for client-side navigation
- **Local Storage** for data persistence
- **CSS** for responsive styling

To learn more about React, check out the [React documentation](https://reactjs.org/).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.