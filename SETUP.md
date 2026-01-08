# BiteBox Frontend Setup Guide

## Quick Start

1. **Navigate to Frontend directory:**
```bash
cd Frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create `.env` file:**
Create a file named `.env` in the `Frontend` directory with:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

4. **Start development server:**
```bash
npm run dev
```

The app will be available at `http://localhost:3001`

## Features Implemented

✅ **Login Page** - Beautiful login interface matching the design
✅ **Register Page** - User registration
✅ **Home Page** - Restaurant grid with hero section
✅ **Restaurant Menu** - Food items with add to cart
✅ **Cart Page** - Manage cart items and checkout
✅ **Orders Page** - View orders with real-time status updates
✅ **Navbar** - With cart count and user menu
✅ **Real-time Updates** - Socket.io integration
✅ **Responsive Design** - Works on mobile and desktop

## API Integration

All API endpoints are integrated:
- `GET /api/restaurants` - List all restaurants
- `GET /api/restaurants/:id` - Get restaurant details
- `GET /api/restaurants/:id/food-items` - Get food items
- `POST /api/orders` - Place order
- `GET /api/orders` - Get user orders
- Socket.io for real-time order updates

## Design

- **Primary Color**: #ff4d4f (Red)
- **Fonts**: Inter & Poppins
- **Theme**: Clean, modern, professional
- **Responsive**: Mobile-first design

## Deployment to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables:
   - `VITE_API_BASE_URL` - Your backend API URL
   - `VITE_SOCKET_URL` - Your Socket.io server URL
5. Deploy!

## Notes

- Cart is stored in localStorage
- JWT token is stored in localStorage
- Socket.io connects automatically on login
- All pages are responsive
- Toast notifications for user feedback
