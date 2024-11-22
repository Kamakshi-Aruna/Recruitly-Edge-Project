# Recruitly Edge Project

## Overview

This project is designed to streamline both local development and production builds.

Use `App.jsx` to test components locally, and `RecruitlyEdge.jsx` for production-ready UMD builds.

- **`App.jsx`**: For local development. Add components to the menu here for testing.
- **`RecruitlyEdge.jsx`**: For the production build. Components are bundled as UMD and accessible via the `window` object.

---

## Development Workflow

### 1. Local Development

To run and test your components locally, follow these steps:

1. **Clone the Repository**:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**:
   Make sure all required dependencies are installed:

   ```bash
   npm install
   ```

3. **Run the Development Server**:
   Use the following command to start the local development server:

   ```bash
   npm run dev
   ```

4. **Add Your Component to `App.jsx`**:

   - Open `src/App.jsx`.
   - Add your component to the menu for local testing.
   - Example:

     ```jsx
     import MyComponent from "./components/MyComponent";

     // Add MyComponent to the menu and routes
     ```

5. **Test Locally**:
   Navigate to `http://localhost:3000` in your browser to test the changes.

---

### 2. Production Build (UMD)

To prepare your component for production as a UMD build:

1. **Add Your Component to `RecruitlyEdge.jsx`**:

   - Open `src/RecruitlyEdge.jsx`.
   - Export your component to the global `window` object for the UMD build.
   - Example:

     ```jsx
     import MyComponent from "./components/MyComponent";

     window.MyComponent = MyComponent;
     ```

2. **Run the Production Build**:
   Run the following command to create the UMD build:

   ```bash
   npm run build
   ```

3. **Access the UMD Build**:
   The output will be in the `dist/` folder. You can include the UMD file in any HTML file, and your components will be available globally via `window.<ComponentName>`.

---

## Commands Summary

- **Run Local Development**: `npm run dev`
- **Build for Production**: `npm run build`

---

## Notes

- **Local Development**: Always add components to `App.jsx` for testing.
- **UMD Build**: Ensure your components are correctly exported in `RecruitlyEdge.jsx`.
