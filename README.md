**CI status:**  
[![School (kae-dev)](https://github.com/EpitechMscProPromo2026/T-DAT-901-MAR_3/actions/workflows/ci.yml/badge.svg?branch=kae-dev)](https://github.com/EpitechMscProPromo2026/T-DAT-901-MAR_3/actions/workflows/ci.yml)

<div align="center">
  <h1>🔗 Chainlytics</h1>
  <p><strong>Real-Time Cryptocurrency Mention Analytics Dashboard</strong></p>
  <p>Track, analyze, and visualize cryptocurrency mentions from live news feeds</p>
</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Configuration](#configuration)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**Chainlytics** is a real-time analytics platform that monitors cryptocurrency mentions in news articles from RSS feeds. It provides a comprehensive dashboard with temporal analytics, trend analysis, and market sentiment visualization.

The system continuously scrapes cryptocurrency news, processes the data through an event-driven pipeline, and presents actionable insights through an interactive React dashboard powered by Chart.js.

### Key Capabilities

- 📰 **Real-time News Scraping**: Automatic RSS feed monitoring from CoinTelegraph
- 🔄 **Event-Driven Processing**: PostgreSQL LISTEN/NOTIFY for instant data flow
- 📊 **Advanced Analytics**: Multi-coin tracking with historical trend analysis
- 🎨 **Interactive Dashboard**: Real-time updates with customizable refresh intervals
- 📈 **Temporal Analysis**: Track mention patterns across multiple timeframes (1D, 7D, 30D)
- 🎯 **Market Intelligence**: Volatility metrics, dominance analysis, and growth momentum

---

## ✨ Features

### Data Collection & Processing
- Automated RSS feed scraping with configurable intervals
- Multi-coin detection (BTC, ETH, SOL, XRP, ADA, DOGE)
- Event-driven architecture using PostgreSQL LISTEN/NOTIFY
- Dual-database design separating raw and processed data

### Analytics & Insights
- **Market Dominance Tracking**: Identify leading cryptocurrencies
- **Volatility Analysis**: Real-time mention volatility calculations
- **Growth Momentum**: Track coins showing above-average activity
- **Historical Trends**: Time-series data with multiple timeframe views
- **Live Activity Stream**: Real-time updates of coin mentions

### Visualization Dashboard
- **Market Sentiment Chart**: Line chart showing historical mention trends
- **Trending Coins**: Top 6 most-mentioned cryptocurrencies
- **Volume Analysis**: Bar chart comparing mention volumes
- **Mention Distribution**: Doughnut chart showing market share
- **Analytics Insights**: AI-powered business intelligence cards
- **Temporal Control Panel**: Configure refresh rates and timeframes

---

## 🏗️ Architecture

Chainlytics uses a **microservices-based event-driven architecture** with four main components:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   Scraper   │─────▶│  PostgreSQL  │─────▶│   Worker    │─────▶│  PostgreSQL  │
│ (RSS Feed)  │      │  (Raw DB)    │      │ (Processor) │      │ (Analytics)  │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                            │                                             │
                            │ NOTIFY                                      │
                            └─────────────────────────────────────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │   FastAPI    │
                                            │   REST API   │
                                            └──────────────┘
                                                    │
                                                    ▼
                                            ┌──────────────┐
                                            │ React + Vite │
                                            │  Dashboard   │
                                            └──────────────┘
```

### Component Overview

1. **Scraper Service** (`scraper/scraper.py`)
   - Fetches RSS feeds from CoinTelegraph every 10 seconds
   - Inserts raw articles into `raw_db.articles` table
   - Triggers PostgreSQL NOTIFY event on insert

2. **Worker Service** (`worker/worker.py`)
   - Listens to PostgreSQL NOTIFY channel
   - Detects cryptocurrency mentions in article titles
   - Aggregates metrics and stores in `analytics_db.metrics` table

3. **FastAPI Backend** (`api/main.py`)
   - RESTful API exposing analytics data
   - `/metrics/latest`: Current mention counts per coin
   - `/metrics/history`: Time-series data for individual coins
   - CORS-enabled for frontend communication

4. **React Frontend** (`frontend/`)
   - Modern SPA built with React 19 and Vite
   - Real-time dashboard with Chart.js visualizations
   - TailwindCSS for responsive design
   - Configurable auto-refresh (10s, 30s, 60s)

---

## 🛠️ Tech Stack

### Backend
- **Python 3.x**: Core programming language
- **FastAPI**: High-performance web framework
- **PostgreSQL 16**: Dual-database architecture
  - `raw_db`: Stores unprocessed articles
  - `analytics_db`: Stores processed metrics
- **psycopg2**: PostgreSQL adapter for Python
- **feedparser**: RSS/Atom feed parsing

### Frontend
- **React 19**: Modern UI library
- **Vite 7**: Next-generation frontend tooling
- **Chart.js 4.5**: Data visualization library
- **react-chartjs-2**: React wrapper for Chart.js
- **TailwindCSS 4**: Utility-first CSS framework
- **Axios**: HTTP client for API requests

### Infrastructure
- **Docker Compose**: Container orchestration
- **Redis 7**: Caching layer (configured for future use)
- **PostgreSQL**: Dual-database setup with custom triggers

---

## 📦 Prerequisites

Before running Chainlytics, ensure you have the following installed:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** v3.9+
- **Python 3.9+**
- **Node.js 18+** and **npm**
- **Git**

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/EpitechMscProPromo2026/T-DAT-901-MAR_3.git
cd T-DAT-901-MAR_3
```

### 2. Start Infrastructure Services

Launch PostgreSQL databases and Redis using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- `postgres_raw` on port **5433**
- `postgres_analytics` on port **5434**
- `redis` on port **6379**

### 3. Set Up Backend (API)

```bash
cd api
pip install -r requirements.txt
```

### 4. Set Up Scraper

```bash
cd ../scraper
pip install -r requirements.txt
```

### 5. Set Up Worker

```bash
cd ../worker
pip install -r requirements.txt
```

### 6. Set Up Frontend

```bash
cd ../frontend
npm install
```

---

## 🎮 Usage

### Running All Services

You need to run **4 separate terminal windows**:

#### Terminal 1: FastAPI Backend
```bash
cd api
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`

#### Terminal 2: Scraper Service
```bash
cd scraper
python scraper.py
```

Starts scraping CoinTelegraph RSS feed every 10 seconds.

#### Terminal 3: Worker Service
```bash
cd worker
python worker.py
```

Listens for new articles and processes coin mentions.

#### Terminal 4: Frontend Dashboard
```bash
cd frontend
npm run dev
```

Dashboard will be available at `http://localhost:5173`

---

## 📁 Project Structure

```
Chainlytics/
├── api/                      # FastAPI REST API
│   ├── main.py              # API endpoints
│   ├── db.py                # Database connection utilities
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React dashboard
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── AnalyticsInsights.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── LiveActivityStream.jsx
│   │   │   ├── MarketSentimentChart.jsx
│   │   │   ├── MentionDistribution.jsx
│   │   │   ├── StatsGrid.jsx
│   │   │   ├── TemporalControlPanel.jsx
│   │   │   ├── TrendingCoins.jsx
│   │   │   └── VolumeAnalysisChart.jsx
│   │   ├── pages/
│   │   │   └── Dashboard.jsx    # Main dashboard page
│   │   ├── server/
│   │   │   ├── client.js        # Axios configuration
│   │   │   └── metrics.js       # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── scraper/                 # RSS feed scraper
│   ├── scraper.py
│   └── requirements.txt
│
├── worker/                  # Event processor
│   ├── worker.py
│   └── requirements.txt
│
├── infra/                   # Database schemas
│   ├── init_db_raw.sql      # Raw database schema + triggers
│   └── init_db_analytics.sql # Analytics database schema
│
└── docker-compose.yml       # Infrastructure orchestration
```

---

## 🔌 API Endpoints

### `GET /`
**Description**: Health check endpoint  
**Response**:
```json
{
  "message": "Chainlytics API is running"
}
```

### `GET /metrics/latest`
**Description**: Get current mention counts for all tracked coins  
**Response**:
```json
{
  "BTC": 145,
  "ETH": 89,
  "SOL": 34,
  "XRP": 12,
  "ADA": 8,
  "DOGE": 5
}
```

### `GET /metrics/history?coin={COIN}`
**Description**: Get historical mention data for a specific coin  
**Parameters**:
- `coin` (string): Cryptocurrency symbol (e.g., BTC, ETH)

**Response**:
```json
{
  "coin": "BTC",
  "history": [
    {
      "recorded_at": "2025-11-28 10:30:00",
      "mentions": 12
    },
    {
      "recorded_at": "2025-11-28 10:35:00",
      "mentions": 15
    }
  ]
}
```

---

## ⚙️ Configuration

### Database Configuration

Modify `docker-compose.yml` to change database credentials:

```yaml
environment:
  POSTGRES_USER: your_user
  POSTGRES_PASSWORD: your_password
  POSTGRES_DB: your_database
```

### Refresh Intervals

Adjust scraping and dashboard refresh rates:

- **Scraper**: Edit `time.sleep(10)` in `scraper/scraper.py`
- **Dashboard**: Use the UI control panel or modify default in `Dashboard.jsx`

### Tracked Coins

Add/remove coins in `worker/worker.py`:

```python
COINS = ["BTC", "BITCOIN", "ETH", "ETHER", "SOL", "XRP", "ADA", "DOGE"]
```

### CORS Origins

Update allowed origins in `api/main.py`:

```python
allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"]
```

---

## 🔧 Development

### Running in Development Mode

All services support hot-reload:

- **FastAPI**: `--reload` flag automatically restarts on code changes
- **React**: Vite HMR updates browser instantly
- **Scraper/Worker**: Manually restart after changes

### Database Management

Access PostgreSQL directly:

```bash
# Raw database
docker exec -it chainlytics-postgres_raw-1 psql -U chainlytics -d raw_db

# Analytics database
docker exec -it chainlytics-postgres_analytics-1 psql -U chainlytics -d analytics_db
```

### Useful SQL Queries

```sql
-- Check recent articles
SELECT * FROM articles ORDER BY published_at DESC LIMIT 10;

-- View metrics for a coin
SELECT * FROM metrics WHERE coin = 'BTC' ORDER BY recorded_at DESC;

-- Total mentions per coin
SELECT coin, SUM(mentions) FROM metrics GROUP BY coin;
```

### Building for Production

```bash
cd frontend
npm run build
```

Builds optimized static files to `frontend/dist/`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---



**Project Repository**: [T-DAT-901-MAR_3](https://github.com/EpitechMscProPromo2026/T-DAT-901-MAR_3)

---

<div align="center">
  <p>Built with ❤️ by the Chainlytics Team</p>
</div>
