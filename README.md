# InfluxDB No-Code Interface

A user-friendly, no-code web interface for InfluxDB that simplifies querying and trending data without programming expertise.

## Features

✅ **Secure Authentication** - Connect to InfluxDB with URL, organization, and API token
✅ **Modern UI** - Built with React and Material-UI for professional appearance
✅ **Protected Routes** - Automatic login/logout flow with session persistence
🚧 **Visual Query Builder** - Drag-and-drop interface for building queries (Coming Soon)
🚧 **Data Visualization** - Interactive charts and trends (Coming Soon)
🚧 **Custom Data Organization** - Hierarchical data structure beyond buckets (Coming Soon)
🚧 **Grafana Integration** - Save and edit visualizations in Grafana (Coming Soon)

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- InfluxDB 2.7+ instance running
- Valid InfluxDB API token with read permissions

### Installation

```bash
# Clone and setup
git clone https://github.com/INFLUX-PG-6/influxdb-nocode-interface.git
cd influxdb-nocode-interface
npm install

# Start development server
npm run dev
```

### Testing Without InfluxDB

You can test the interface functionality without a running InfluxDB instance:

**Form Validation Tests:**
1. **Empty fields**: Leave fields blank and submit to see validation
2. **Invalid URL**: Enter `abc` as URL to test URL validation  
3. **Short token**: Enter a token shorter than 10 characters
4. **Valid format**: Use `http://localhost:8086`, any org name, and a 10+ character token to test connection logic

**Expected Behavior:**
- Form validation shows user-friendly error messages
- Connection attempts will show appropriate error messages (normal without InfluxDB)
- Interface is fully responsive and functional

### Configuration

1. Start your InfluxDB instance (default: http://localhost:8086)
2. Create an API token in InfluxDB with appropriate permissions
3. Note your organization name
4. Open the application and enter your credentials

### Default InfluxDB Setup (for testing)

```bash
# If you need to set up InfluxDB locally:
# Download InfluxDB 2.7 from https://portal.influxdata.com/downloads/
# Or use Docker:
docker run -p 8086:8086 influxdb:2.7
```

## Project Structure

```
src/
├── components/
│   ├── LoginForm.jsx          # Main login interface
│   ├── Dashboard.jsx          # Post-login dashboard
│   └── ProtectedRoute.jsx     # Route protection component
├── contexts/
│   └── AuthContext.jsx        # Authentication state management
├── App.jsx                    # Main application component
└── main.jsx                   # Application entry point
```

## Authentication Flow

1. **Login Form**: User enters InfluxDB URL, organization, and API token
2. **Validation**: System tests connection by attempting to list buckets
3. **Session Storage**: Successful authentication is stored in localStorage
4. **Protected Access**: Dashboard is only accessible after authentication
5. **Auto-restore**: Session persists across browser refreshes

## Technology Stack

- **Frontend**: React 19, Vite
- **UI Framework**: Material-UI (MUI)
- **Routing**: React Router DOM
- **InfluxDB Client**: @influxdata/influxdb-client
- **HTTP Client**: Axios

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## Next Steps

The login module is complete and ready for submission. Future development will include:

1. Visual query builder with drag-and-drop interface
2. Real-time data visualization components
3. Custom data organization system
4. Grafana integration for advanced dashboards
5. API endpoints for programmatic access

## Troubleshooting

**Connection Issues:**
- Verify InfluxDB is running and accessible
- Check API token permissions
- Ensure organization name is correct
- Verify CORS settings if running on different ports

**Authentication Errors:**
- Confirm API token is not expired
- Check organization access permissions
- Verify InfluxDB version compatibility (2.7+ recommended)