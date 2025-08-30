# InfluxDB No-Code Interface

A user-friendly, no-code web interface for InfluxDB that simplifies querying and trending data without programming expertise.

## Current Status: Phase 1 - Authentication Module ✅

This project is currently in development. **Phase 1 (Login/Authentication)** has been completed and is ready for testing.


## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Modern web browser

### Installation & Testing

```bash
# Clone the repository
git clone https://github.com/INFLUX-PG-6/influxdb-nocode-interface.git
cd influxdb-nocode-interface

# Install dependencies
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173/` in your browser.

### Testing the Login Interface

You can test all functionality without a running InfluxDB instance:

**Test Cases:**
1. **Empty fields** - Click connect without filling fields
2. **Invalid URL** - Enter `abc` as URL to test validation
3. **Short token** - Enter token shorter than 10 characters  
4. **Valid format** - Use `http://localhost:8086`, any org name, 10+ char token

**Expected Results:**
- All validation shows clear English error messages
- Interface is fully responsive and professional looking
- Connection attempts show appropriate error messages (normal without real InfluxDB)

## Technology Stack

- **Frontend**: React 19 with Vite
- **UI Framework**: Material-UI (MUI) 
- **Database Client**: @influxdata/influxdb-client
- **Routing**: React Router DOM
- **State Management**: React Context API

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run lint     # Run ESLint
```

## Project Structure

```
src/
├── components/
│   ├── LoginForm.jsx       # Main authentication interface
│   ├── Dashboard.jsx       # Post-login dashboard (basic)
│   └── ProtectedRoute.jsx  # Route protection
├── contexts/
│   └── AuthContext.jsx     # Authentication state management
├── hooks/
│   └── useAuth.js          # Authentication hook
└── App.jsx                 # Main application component
```

---

**Note**: This is Phase 1 of the project. Additional features will be added in subsequent development phases.