# BiteBox Frontend

Frontend application for BiteBox Food Ordering Platform (User Role Only).

## Tech Stack

- **React.js** - UI Framework
- **Vite** - Build Tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP Client
- **Socket.io Client** - Real-time updates
- **React Hot Toast** - Notifications

## Features

- 🏠 **Home Page** - Browse all restaurants
- 🍕 **Restaurant Menu** - View food items and add to cart
- 🛒 **Cart** - Manage cart items and checkout
- 📦 **Orders** - View orders with real-time status updates
- 🔐 **Authentication** - Login and Registration
- 🔔 **Real-time Updates** - Socket.io integration for order status

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

## Deployment (Vercel)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_API_BASE_URL` - Your backend API URL
   - `VITE_SOCKET_URL` - Your Socket.io server URL
4. Deploy!

## Project Structure

```
src/
├── components/       # Reusable components
├── pages/           # Page components
├── context/         # React Context providers
├── services/        # API and Socket services
├── utils/           # Utility functions
└── App.jsx          # Main app component
```

## API Integration

All API calls are made through services in `src/services/api.js`:
- Authentication (login, register)
- Restaurants (get all, get by ID, get food items)
- Orders (create, get user orders)
- Notifications (get, mark as read)

## Real-time Updates

Socket.io is used for real-time order status updates. The socket connection is established on login and automatically subscribes to order updates.
