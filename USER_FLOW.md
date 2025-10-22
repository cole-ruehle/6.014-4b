# Route Planner - User Flow Documentation

## Overview
This document outlines the complete user flow for the Route Planner application, designed for the milestone video demonstration.

## User Flow Steps

### 1. Application Launch
- **Action**: Open the application in browser (http://localhost:3000)
- **Expected Result**: 
  - Clean, modern interface loads
  - RouteSearch component is displayed
  - Header shows "Route Planner" title
- **Visual Elements**:
  - Search form with location input
  - Duration dropdown (1hr, 2hr, 3hr, etc.)
  - Optional hiking trail input
  - "Find Routes" button
  - Saved Routes section (initially empty)

### 2. Route Search
- **Action**: Enter search parameters
  - Location: "Cambridge, MA"
  - Duration: "3hr"
  - Hiking Trail: "Middlesex Fells" (optional)
- **Expected Result**: 
  - Form accepts input
  - "Find Routes" button becomes active
- **Visual Elements**:
  - Input fields populate with data
  - Button shows "Find Routes" (not "Searching...")

### 3. Search Execution
- **Action**: Click "Find Routes" button
- **Expected Result**: 
  - Button shows "Searching..." state
  - Loading indicator appears
  - RouteList component loads with results
- **Visual Elements**:
  - Button becomes disabled with loading text
  - Route cards appear in grid layout
  - Each card shows: transit time, hike time, difficulty, transport icons

### 4. Route List Interaction
- **Action**: Browse and filter routes
  - Click "Filters" button
  - Apply difficulty filter (e.g., "Medium")
  - Select transport modes (e.g., "bus", "walk")
- **Expected Result**: 
  - Filter panel opens
  - Routes filter based on selections
  - Route count updates
- **Visual Elements**:
  - Filter panel slides down
  - Route cards update in real-time
  - Pagination dots at bottom

### 5. Route Selection
- **Action**: Click on a specific route card
- **Expected Result**: 
  - RouteDetail component loads
  - Detailed route information displays
  - Navigation away from route list
- **Visual Elements**:
  - Route header with name and save button
  - Picture gallery (3 placeholder images)
  - Map with route visualization
  - Instructions panel
  - Similar routes section

### 6. Route Detail Interaction
- **Action**: Interact with route details
  - Click "Save" button (heart icon)
  - View route instructions
  - Browse similar routes
- **Expected Result**: 
  - Save button toggles (heart fills/empties)
  - Instructions display step-by-step
  - Similar routes show as clickable cards
- **Visual Elements**:
  - Heart icon changes state
  - Instructions appear in left-bordered boxes
  - Similar route cards show duration and names

### 7. Navigation Start
- **Action**: Click "Start Navigation" button
- **Expected Result**: 
  - Navigation component loads
  - Map view with route path appears
  - Turn-by-turn directions display
- **Visual Elements**:
  - Map placeholder with route lines
  - Current location marker
  - Next direction cards with arrows
  - Control buttons at bottom

### 8. Navigation Controls
- **Action**: Test navigation features
  - Click "Status Updates" button
  - Click "Modify Route" button
  - Click "Suggested Modifications" button
- **Expected Result**: 
  - Each panel opens/closes independently
  - Content displays relevant information
  - Buttons show active state
- **Visual Elements**:
  - Panels slide in/out
  - Button backgrounds change color
  - Content appears in organized sections

### 9. Emergency Feature
- **Action**: Click "Emergency" button
- **Expected Result**: 
  - Emergency state activates
  - Visual changes occur (red borders, background)
  - Emergency route data loads
- **Visual Elements**:
  - Navigation component gets red border
  - Background changes to light red
  - Emergency button becomes red and active

### 10. Navigation Stop
- **Action**: Click "Stop Navigation" button
- **Expected Result**: 
  - Returns to main application state
  - Navigation component disappears
  - RouteSearch component reappears
- **Visual Elements**:
  - Smooth transition back to search interface
  - Navigation state resets

### 11. Saved Routes Access
- **Action**: Return to search and check saved routes
- **Expected Result**: 
  - Previously saved route appears in "Saved Routes" section
  - Can click to quickly search for similar routes
- **Visual Elements**:
  - Saved route shows with star icon
  - Route duration and name displayed
  - Clickable for quick access

## Technical Demonstrations

### Reactivity Showcase
- **Search Parameters**: Change inputs and see immediate UI updates
- **Filter Application**: Real-time filtering without page refresh
- **State Persistence**: Saved routes persist across navigation
- **Component Communication**: Data flows between components seamlessly

### Error Handling
- **Empty Search**: Try searching without location input
- **API Errors**: Simulate network issues (if backend not running)
- **Loading States**: Show loading indicators during API calls

### Responsive Design
- **Mobile View**: Resize browser to show mobile layout
- **Grid Adaptation**: Route cards adapt to screen size
- **Touch Interactions**: Demonstrate mobile-friendly interactions

## Video Recording Tips

### Screen Recording Setup
1. **Resolution**: Record at 1920x1080 or higher
2. **Frame Rate**: 30fps minimum for smooth transitions
3. **Audio**: Include narration explaining each step
4. **Duration**: Keep under 5 minutes for milestone

### Key Points to Highlight
1. **No Page Refreshes**: Emphasize reactive nature
2. **Component Separation**: Show how each component handles its own state
3. **State Management**: Demonstrate Pinia store integration
4. **API Integration**: Show data flowing from backend
5. **User Experience**: Smooth transitions and intuitive interface

### Script Outline
1. **Introduction** (30 seconds)
   - "This is the Route Planner Vue.js application"
   - "Built with reactive components and state management"

2. **Search Flow** (1 minute)
   - Demonstrate search functionality
   - Show filtering and route selection

3. **Route Details** (1 minute)
   - Show detailed route view
   - Demonstrate save functionality

4. **Navigation** (1.5 minutes)
   - Start navigation
   - Show all navigation features
   - Demonstrate emergency functionality

5. **Conclusion** (30 seconds)
   - Show saved routes
   - Highlight reactive nature

## Testing Checklist

Before recording, ensure:
- [ ] Application starts without errors
- [ ] All components load properly
- [ ] Search functionality works
- [ ] Route filtering works
- [ ] Save/unsave functionality works
- [ ] Navigation features work
- [ ] Emergency feature works
- [ ] Responsive design works on mobile
- [ ] No console errors
- [ ] Smooth transitions between components

## Backend Requirements

For full functionality, ensure backend is running at:
- **URL**: http://localhost:8000/api
- **Endpoints**: All endpoints defined in api-spec.js
- **CORS**: Configured to allow frontend requests
- **Data**: Mock data available for testing

## Troubleshooting

### Common Issues
1. **CORS Errors**: Backend not configured for frontend requests
2. **API Errors**: Backend not running or endpoints not implemented
3. **Component Errors**: Check browser console for Vue errors
4. **Styling Issues**: Ensure all CSS is loading properly

### Fallback Options
- Use mock data if backend not available
- Demonstrate UI/UX without API calls
- Show component structure and reactivity
- Highlight state management features
