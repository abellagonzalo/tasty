# Tasty - Options Trading P&L Tracker

A web application for tracking options trading positions and their P&L, including adjustments and rolls. Built with React and Node.js using TypeScript.

## Project Structure

```
tasty/
├── frontend/             # React TypeScript frontend application
│   ├── public/          # Static files
│   └── src/             # Source code
│       ├── components/  # React components
│       │   ├── IBKRImport.tsx       # IBKR CSV import component
│       │   ├── PositionForm.tsx     # Manual position entry form
│       │   └── PositionsList.tsx    # Positions display component
│       ├── services/    # API and service functions
│       │   ├── api.ts              # Backend API client
│       │   ├── ibkrService.ts      # IBKR CSV processing service
│       │   └── positionService.ts  # Position conversion and validation
│       ├── types/       # TypeScript interfaces and types
│       │   ├── Position.ts         # Position-related types
│       │   └── ibkr.ts            # IBKR data structure types
│       └── utils/       # Utility functions
│
├── backend/             # Node.js TypeScript backend application
│   ├── src/            # Source code
│   │   ├── controllers/  # Request handlers
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   └── services/    # Business logic
│   ├── package.json    # Backend dependencies
│   └── tsconfig.json   # TypeScript configuration
│
└── README.md           # Project documentation
```

## Prerequisites

- Node.js (LTS version recommended, 14.x or higher)
- npm (comes with Node.js)
- A code editor (VS Code recommended)

## Development Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```
The backend will start on http://localhost:3001

### Frontend Setup
```bash
cd frontend
npm install
npm start
```
The frontend will start on http://localhost:3000

## Technology Stack

### Frontend
- React 18
- TypeScript
- Material-UI (MUI) for components
- Axios for API calls
- PapaParse for CSV parsing
- React-Dropzone for file uploads

### Backend
- Node.js
- Express
- TypeScript
- cors for CORS support

## Features

Current:
- Basic application structure
- Development environment setup
- Manual position entry
- Position listing and management
- IBKR Activity Flex Query CSV import with automatic position creation
- Batch position creation

Planned:
- User authentication
- P&L calculation and monitoring
- Trade adjustment recording
- Position roll tracking
- Performance reporting
- Data export capabilities

## API Endpoints

### Positions

#### Single Position Operations
- `POST /api/positions` - Create a single position
- `GET /api/positions` - Get all positions
- `GET /api/positions/:id` - Get a specific position
- `PUT /api/positions/:id` - Update a position
- `DELETE /api/positions/:id` - Delete a position

#### Batch Operations
- `POST /api/positions/batch` - Create multiple positions
  - Request body: Array of position objects
  - Validates all positions before creation
  - Creates all positions with consistent timestamps
  - Returns array of created positions
  - Provides detailed validation errors if any position is invalid

## Data Import Support

### IBKR Activity Flex Query Import
The application supports importing trading data from Interactive Brokers Activity Flex Query reports in CSV format. The import feature supports:

- Drag-and-drop file upload
- CSV parsing and validation
- Trade data preview
- Error handling and validation feedback
- Automatic position creation from trades

#### Import Process
1. File Upload
   - Accepts CSV files from IBKR Activity Flex Query
   - Validates file format and content
   - Shows upload progress

2. Trade Processing
   - Filters for option trades only
   - Processes opening trades
   - Converts IBKR trade format to position format
   - Validates position data
   - Shows preview of detected trades

3. Position Creation
   - Creates positions in batch
   - Handles duplicate detection
   - Updates existing positions if necessary
   - Refreshes position list automatically

#### Required CSV Columns
- DateTime: Trade execution date and time
- Symbol: Trading symbol
- Description: Full contract description
- TradePrice: Execution price
- Quantity: Number of contracts
- Put/Call: Option type
- Strike: Strike price
- Expiry: Contract expiration date
- TransactionType: Type of transaction
- Buy/Sell: Trade direction
- IBCommission: Commission paid
- NetCash: Net cash impact
- Open/CloseIndicator: Whether opening or closing position
- FifoPnlRealized: Realized P&L for closed positions
- MtmPnl: Mark-to-market P&L

## Development

### Available Scripts

Frontend:
- `npm start` - Runs the app in development mode
- `npm test` - Runs the test suite
- `npm run build` - Builds the app for production

Backend:
- `npm run dev` - Runs the server in development mode with hot reload
- `npm start` - Runs the production server
- `npm run build` - Compiles TypeScript to JavaScript

## Contributing

This is a personal project for tracking options trading P&L. If you'd like to contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is private and not licensed for public use.

## Contact

Project Owner - [Your Name]

## Acknowledgments

- Interactive Brokers API
- Tasty Trade mechanics for options trading