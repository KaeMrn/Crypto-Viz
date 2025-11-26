from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db import get_analytics_conn

app = FastAPI()

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Chainlytics API is running"}


# -------------------------------------------------
# NEW ENDPOINT: /metrics/latest
# -------------------------------------------------
@app.get("/metrics/latest")
def get_latest_metrics():
    conn = get_analytics_conn()
    cur = conn.cursor()

    # SQL: group by coin and sum mentions
    cur.execute("""
        SELECT coin, SUM(mentions)
        FROM metrics
        GROUP BY coin
        ORDER BY SUM(mentions) DESC;
    """)

    rows = cur.fetchall()
    conn.close()

    # convert result to JSON/dict
    result = {coin: int(total) for coin, total in rows}

    return result


# -------------------------------------------------
# ENDPOINT: /metrics/history?coin=BTC
# -------------------------------------------------
@app.get("/metrics/history")
def get_metrics_history(coin: str):
    conn = get_analytics_conn()
    cur = conn.cursor()

    # SQL: select mentions over time for that coin
    cur.execute("""
        SELECT recorded_at, mentions
        FROM metrics
        WHERE coin = %s
        ORDER BY recorded_at ASC;
    """, (coin.upper(),))

    rows = cur.fetchall()
    conn.close()

    # Format for the frontend
    history = [
        {"recorded_at": str(ts), "mentions": int(m)} 
        for ts, m in rows
    ]

    return {"coin": coin.upper(), "history": history}
