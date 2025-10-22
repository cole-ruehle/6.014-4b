# Testing Guide - Route Planner Application

## Quick Start Testing

### 1. Start the Application
```bash
npm run dev
```
- Application will be available at: http://localhost:3000
- Should see the RouteSearch component with a clean interface

### 2. Basic Functionality Test
1. **Search Form**: 
   - Enter "Cambridge, MA" in location field
   - Select "3hr" from duration dropdown
   - Optionally enter "Middlesex Fells" in hiking trail field
   - Click "Find Routes"

2. **Expected Results**:
   - Button shows "Searching..." briefly
   - RouteList component appears with route cards
   - Each card shows transit time, hike time, difficulty, and transport icons

### 3. Route Interaction Test
1. **Filtering**:
   - Click "Filters" button
   - Select "Medium" difficulty
   - Choose transport modes (bus, walk)
   - Click "Apply Filters"

2. **Route Selection**:
   - Click on any route card
   - Should see RouteDetail component with:
     - Route header and save button
     - Picture gallery (placeholder images)
     - Map visualization
     - Instructions panel
     - Similar routes section

### 4. Navigation Test
1. **Start Navigation**:
   - Click "Start Navigation" button
   - Should see Navigation component with:
     - Map view with route path
     - Next direction instructions
     - Control buttons at bottom

2. **Navigation Features**:
   - Click "Status Updates" - panel should open
   - Click "Modify Route" - panel should open
   - Click "Suggested Modifications" - panel should open
   - Click "Emergency" - should activate emergency mode (red styling)

### 5. Save Functionality Test
1. **Save Route**:
   - In RouteDetail, click the save button (heart icon)
   - Heart should fill and button should show "Saved"
   - Go back to search and check "Saved Routes" section

## Backend Testing

### Without Backend (UI Only)
- Application will work with mock data
- All components will render properly
- State management will function
- User interactions will work

### With Backend (Full Functionality)
- Ensure backend is running at: http://localhost:8000/api
- API calls will be made to real endpoints
- Data will be fetched from backend
- Full functionality will be available

## Common Issues & Solutions

### Issue: "Cannot find module" errors
**Solution**: Run `npm install` to ensure all dependencies are installed

### Issue: Application won't start
**Solution**: Check that port 3000 is available, or change port in vite.config.js

### Issue: API calls failing
**Solution**: 
- Check if backend is running at localhost:8000
- Check browser console for CORS errors
- Verify API endpoints match the specification

### Issue: Components not rendering
**Solution**: 
- Check browser console for Vue errors
- Ensure all component files are in correct locations
- Verify import paths in App.vue

## Performance Testing

### Load Time
- Application should load within 2-3 seconds
- Components should render smoothly
- No significant delays in user interactions

### Responsiveness
- Test on different screen sizes
- Mobile layout should work properly
- Touch interactions should be smooth

## Browser Compatibility
- Test in Chrome, Firefox, Safari
- Ensure all features work across browsers
- Check for any browser-specific issues

## Video Recording Preparation

### Before Recording
1. Clear browser cache
2. Close unnecessary tabs
3. Ensure stable internet connection
4. Test all features work smoothly
5. Prepare demo data (locations, routes)

### During Recording
1. Speak clearly and explain each step
2. Show smooth transitions between components
3. Highlight reactive nature (no page refreshes)
4. Demonstrate state management features
5. Show error handling if applicable

### After Recording
1. Review video for clarity
2. Ensure all key features are demonstrated
3. Check audio quality
4. Verify video shows complete user flow
