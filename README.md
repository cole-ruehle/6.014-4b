# Route Planner - Vue.js Frontend

A reactive Vue.js application for planning and navigating hiking routes with transit options.

## Features

- **Route Search**: Search for routes by location, duration, and trail preferences
- **Route Discovery**: Browse and filter available routes with detailed information
- **Route Details**: View comprehensive route information including images, directions, and similar routes
- **Navigation**: Real-time navigation with turn-by-turn directions and emergency features
- **Saved Routes**: Save and manage favorite routes
- **Status Updates**: Real-time status updates and notifications

## Components

### RouteSearch
- Location and duration input
- Optional hiking trail specification
- Saved routes display
- Search functionality

### RouteList
- Grid display of available routes
- Filtering by difficulty and transport modes
- Route cards with transit and hike information
- Pagination support

### RouteDetail
- Comprehensive route information
- Image gallery
- Interactive map with route visualization
- Step-by-step instructions
- Similar routes recommendations
- Save/unsave functionality

### Navigation
- Real-time navigation interface
- Map view with route visualization
- Turn-by-turn directions
- Status updates panel
- Route modification options
- Emergency functionality

## State Management

The application uses Pinia for state management with three main stores:

- **RouteStore**: Manages route data, search parameters, and saved routes
- **NavigationStore**: Handles navigation state, location updates, and emergency features
- **StatusStore**: Manages status updates and notifications

## API Integration

The frontend connects to a backend API running at `http://localhost:8000/api` with the following endpoints:

- Route search and discovery
- Route details and management
- Navigation and directions
- Status updates
- Emergency routing

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The application will be available at `http://localhost:3000`

## Backend Requirements

Ensure your backend API is running at `http://localhost:8000/api` with the endpoints defined in `src/api/api-spec.js`.

## Project Structure

```
src/
├── api/
│   └── api-spec.js          # API specification and helper functions
├── components/
│   ├── RouteSearch.vue      # Route search interface
│   ├── RouteList.vue        # Route listing and filtering
│   ├── RouteDetail.vue      # Detailed route view
│   └── Navigation.vue       # Navigation interface
├── stores/
│   ├── routeStore.js        # Route state management
│   ├── navigationStore.js   # Navigation state management
│   └── statusStore.js       # Status updates state management
├── App.vue                  # Main application component
└── main.js                  # Application entry point
```
