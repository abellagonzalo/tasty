# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Tasty is an options trading P&L tracker built with React (frontend) and Node.js/Express (backend), both using TypeScript. The application tracks options positions and supports importing trades from Interactive Brokers (IBKR) Activity Flex Query CSV files.

## Development Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
npm run dev          # Start development server with hot reload (port 3001)
npm run build        # Compile TypeScript to JavaScript
npm start            # Run production server
npm test             # Run tests (Jest)
```

### Frontend
```bash
cd frontend
npm install          # Install dependencies
npm start            # Start development server (port 3000)
npm run build        # Build for production
npm test             # Run tests (React Testing Library + Jest)
npm test -- ibkrService.test.ts  # Run specific test file
```

## Architecture

### Backend Structure

The backend follows a three-layer architecture:

- **Models** (`backend/src/models/`): Type definitions and interfaces
  - `Position.ts`: Core `Position` interface with enums (`OptionType`, `PositionSide`) and `CreatePositionDTO`

- **Services** (`backend/src/services/`): Business logic layer
  - `positionService.ts`: In-memory position storage and management
  - No database currently - data is stored in memory and resets on server restart
  - Includes `createPositions()` method for batch operations

- **Controllers** (`backend/src/controllers/`): Request handlers
  - `positionController.ts`: HTTP request validation and response handling
  - Includes validation for both single and batch position creation

- **Routes** (`backend/src/routes/`): Express route definitions
  - Maps HTTP endpoints to controller methods

Entry point: `backend/src/index.ts` (Express server with CORS enabled on port 3001)

### Frontend Structure

React application with service layer pattern:

- **Components** (`frontend/src/components/`): React UI components
  - `PositionForm.tsx`: Manual position entry form
  - `PositionsList.tsx`: Display and manage positions
  - `IBKRImport.tsx`: CSV file upload and import workflow

- **Services** (`frontend/src/services/`): Business logic and API communication
  - `api.ts`: Axios-based API client for backend communication
  - `ibkrService.ts`: CSV parsing and IBKR trade data processing using PapaParse
  - `ibkrService.test.ts`: Unit tests for ibkrService (21 tests covering validation and parsing)
  - `positionService.ts`: Converts IBKR trades to positions and validates position data

- **Types** (`frontend/src/types/`): TypeScript interfaces
  - `Position.ts`: Mirrors backend position types
  - `ibkr.ts`: IBKR-specific data structures (`IBKRTrade`, `IBKRCSVRow`, etc.)

### Type System

Both frontend and backend share the same core types:

```typescript
enum OptionType { CALL, PUT }
enum PositionSide { LONG, SHORT }

interface Position {
  id: string;
  symbol: string;
  optionType: OptionType;
  strikePrice: number;
  expirationDate: string;  // ISO date
  positionSide: PositionSide;
  quantity: number;
  entryPrice: number;
  entryDate: string;        // ISO date
  createdAt: string;        // ISO date
  updatedAt: string;        // ISO date
}
```

Ensure type consistency when making changes to position-related code.

### IBKR Import Flow

The IBKR import feature processes Activity Flex Query CSV files:

1. **Upload**: User drops CSV file in `IBKRImport.tsx` (using react-dropzone)
2. **Parse**: `ibkrService.ts` parses CSV with PapaParse
3. **Filter**: Filters for option trades with `TransactionType === 'ExchTrade'` and `Open/CloseIndicator === 'O'`
4. **Convert**: `positionService.ts` converts `IBKRTrade` objects to `CreatePositionDTO` format
5. **Validate**: Validates each position before submission
6. **Create**: Sends batch request to `POST /api/positions/batch`

When modifying import logic, ensure changes are made in both `ibkrService.ts` (parsing) and `positionService.ts` (conversion).

## API Endpoints

All endpoints are prefixed with `/api/positions`:

- `POST /api/positions` - Create single position
- `POST /api/positions/batch` - Create multiple positions (validates all before creation)
- `GET /api/positions` - Get all positions
- `GET /api/positions/:id` - Get specific position
- `PUT /api/positions/:id` - Update position
- `DELETE /api/positions/:id` - Delete position

## Testing

### Frontend Tests
- **Framework**: Jest + React Testing Library
- **Location**: `frontend/src/**/*.test.ts(x)`
- **Run all tests**: `cd frontend && npm test`
- **Run specific test**: `cd frontend && npm test -- ibkrService.test.ts`

#### IBKRService Tests (`ibkrService.test.ts`)
Comprehensive test coverage for CSV parsing and trade validation:
- **validateTrade()**: 11 tests covering valid/invalid trade prices, quantities, strikes, and expiry dates
- **parseCSV()**: 10 tests covering CSV parsing, filtering, error handling, and data transformation
- **Mocked dependencies**: PapaParse is mocked for isolated unit testing

When adding new features to `ibkrService.ts`, ensure corresponding tests are added to maintain coverage.

### Backend Tests
- **Framework**: Jest
- **Location**: `backend/src/**/*.test.ts`
- **Run all tests**: `cd backend && npm test`

Currently, backend tests are not yet implemented. When adding backend tests, follow the same patterns as frontend tests.

## Key Technologies

- **Frontend**: React 18, Material-UI (MUI), Axios, PapaParse, react-dropzone, Jest, React Testing Library
- **Backend**: Express 5, TypeScript, uuid (for ID generation), Jest
- **Shared**: TypeScript across both frontend and backend

## Important Notes

- **No persistence**: Backend uses in-memory storage. All data is lost on server restart.
- **Type sharing**: Position types are duplicated in frontend and backend - keep them in sync.
- **Date formats**: All dates are stored as ISO strings. Use `.toISOString()` for consistency.
- **Batch operations**: When creating multiple positions, use the `/batch` endpoint for consistent timestamps.
