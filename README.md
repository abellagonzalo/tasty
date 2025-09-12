# Tasty - Options Trading P&L Tracker

A web application for tracking options trading positions and their P&L, including adjustments and rolls. Built with React and Node.js using TypeScript.

## Project Structure

```
tasty/
├── frontend/             # React TypeScript frontend application
│   ├── public/          # Static files
│   └── src/             # Source code
│
├── backend/             # Node.js TypeScript backend application
│   ├── src/            # Source code
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

### Backend
- Node.js
- Express
- TypeScript
- cors for CORS support

## Features

Current:
- Basic application structure
- Development environment setup

Planned:
- User authentication
- Options position tracking
- P&L calculation and monitoring
- Trade adjustment recording
- Position roll tracking
- Performance reporting
- Data export capabilities

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