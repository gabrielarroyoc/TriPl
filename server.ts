import "dotenv/config";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/weather", async (req, res) => {
    const { city } = req.query;
    if (!process.env.OPENWEATHER_API_KEY) {
      return res.json({
        weather: [{ description: 'clear sky', icon: '01d' }],
        main: { temp: 22.5 },
        name: city || 'Unknown'
      });
    }
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weather" });
    }
  });

  // Aviationstack API
  app.get("/api/flights", async (req, res) => {
    const { flight_number } = req.query;
    const access_key = process.env.AVIATIONSTACK_API_KEY;

    if (!access_key) {
      return res.json({
        data: [{
          flight_status: 'scheduled',
          airline: { name: 'Tripe Air' },
          flight: { iata: flight_number || 'TR100' },
          departure: { iata: 'JFK', airport: 'John F. Kennedy International' },
          arrival: { iata: 'HND', airport: 'Haneda Airport' }
        }]
      });
    }

    try {
      const response = await axios.get(
        `http://api.aviationstack.com/v1/flights`,
        {
          params: {
            access_key,
            flight_iata: flight_number,
          },
        }
      );
      res.json(response.data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch flight data" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
