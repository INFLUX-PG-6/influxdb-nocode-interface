# InfluxDB No-Code Interface

A user-friendly, no-code web interface for InfluxDB that simplifies querying and trending data without programming expertise.

## ✅ Current Status: Core Features Complete

**Live Demo**: https://influxdb-nocode-interface.netlify.app

### Features Available:
- ✅ **Authentication** - Connect to InfluxDB Cloud/OSS
- ✅ **Data Explorer** - Browse buckets, measurements, and fields
- ✅ **Query Execution** - Run Flux queries with results display
- 🚧 **Data Visualization** - Coming next


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

### Using the Interface

**For InfluxDB Cloud:**
1. Get your URL from InfluxDB Cloud (e.g., `https://us-east-1-1.aws.cloud2.influxdata.com`)
2. Find your Organization ID in the URL path after login
3. Create an "All Access" API token in InfluxDB Cloud
4. Connect and start exploring your data!

**For Local Testing:**
- Use demo credentials to explore the interface
- All features work without a real InfluxDB connection for UI testing

## Technology Stack

- **Frontend**: React 19 + Vite + Material-UI
- **Backend**: Node.js + Express + TypeScript  
- **Database**: InfluxDB (time-series data)
- **Deployment**: Netlify (frontend) + Railway (backend)

## Development Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run lint     # Run ESLint
```

## Project Structure

```
├── src/                    # Frontend (React)
│   ├── components/         # UI components
│   ├── contexts/          # State management
│   └── services/          # API communication
├── backend/               # Backend API (Node.js + TypeScript)
│   ├── src/controllers/   # API endpoints
│   ├── src/services/      # Business logic
│   └── src/routes/        # Route definitions
└── public/               # Static assets
```

---

**Next Phase**: Data visualization with charts and graphs for time-series analysis.