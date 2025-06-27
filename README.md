# Warehouse Management System

A modern warehouse management system built with Nuxt 3 and Directus CMS.

## Recent Improvements

### Inventory Page Fixes:
1. **Error Handling**: Added comprehensive error handling with user-friendly messages
2. **Loading States**: Improved loading indicators and state management
3. **Empty States**: Added proper empty state when no inventory items are found
4. **Filter Performance**: Implemented debounced search to reduce API calls
5. **User Feedback**: Added last updated timestamp and auto-refresh indicators
6. **Data Safety**: Added null checks for product and location names
7. **Accessibility**: Improved form controls and loading states

### Locations Page - Archive Feature Clone:
**✅ Successfully cloned "Show Archive Items" functionality from Products to Locations page**

#### Changes Made:

**1. Updated Locations Composable (`composables/useLocations.ts`)**:
- Added `showArchived` parameter to `fetchLocations()` function
- Implemented conditional filtering logic to show/hide archived items
- Maintains backward compatibility with existing calls

**2. Updated Locations Page (`pages/locations.vue`)**:
- Added "Show Archived" toggle switch with Bootstrap styling
- Reorganized filter section layout to match Products page design
- Updated table actions to show different buttons for archived vs active items
- Added archive badge for archived locations
- Implemented restore functionality with confirmation dialog

**3. New Features Added**:
- **🔄 Archive Toggle**: Switch to show/hide archived locations
- **👁️ Visual Indicators**: Archived items show "Archived" badge
- **↪️ Restore Function**: Button to restore archived locations with confirmation
- **🎯 Conditional Actions**: Edit/Archive buttons only show for active items
- **✅ Consistent UX**: Matches the exact behavior from Products page

#### Technical Implementation:
- Cloned the exact filtering logic from Products composable
- Maintained consistent error handling and toast notifications
- Preserved all existing functionality while adding archive features
- Used same UI patterns and styling for consistency

### New Features:
- **Auto-refresh with visual indicator**: Shows when auto-refresh is active (Inventory)
- **Last updated timestamp**: Displays when data was last refreshed (Inventory)
- **Debounced search**: Reduces API calls while typing in filters (Inventory)
- **Clear filters option**: Easy way to reset search filters (Inventory)
- **Enhanced error messages**: Context-aware error messages for different scenarios (Inventory)
- **Loading state improvements**: Better loading indicators and disabled states (Inventory)
- **Archive management**: Full archive/restore functionality for locations (Locations)

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
