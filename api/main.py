from fastapi import FastAPI
from db import get_analytics_conn

app = FastAPI()

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
