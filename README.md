# Tripe

A minimalist, high-contrast travel planning platform built with React, Vite, and Tailwind CSS. 

Tripe allows users to organize their itineraries, discover trending destinations, and look up real-time flight data. Built with internationalization (i18n) and responsive design in mind.

## Features
- **Smart Itineraries**: Plan your trips day by day with dynamic date selection.
- **Real-Time Integration**: Mock integrations for Flights and Weather (Aviationstack & OpenWeather).
- **Internationalization**: Seamlessly switch between English and Portuguese (PT-BR).
- **Supabase Auth**: Secure account management and session handling.
- **Guest Mode**: Try the app locally without registering.

## Tech Stack
- **Frontend**: React 19, React Router, Tailwind CSS 4, Framer Motion
- **State Management**: Zustand, React Context
- **Backend/Proxy**: Express Server for API masking and Vite middleware
- **i18n**: react-i18next

## Getting Started

### Prerequisites
- Node.js >= 22

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root based on your Supabase and API credentials:
```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENWEATHER_API_KEY=your_openweather_key
AVIATIONSTACK_API_KEY=your_aviationstack_key
```

3. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## License
MIT
