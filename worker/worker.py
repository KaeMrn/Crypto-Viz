import psycopg2
import select

# (NEW)
COINS = ["BTC", "BITCOIN", "ETH", "ETHER", "SOL", "XRP", "ADA", "DOGE"]

print("Connecting to raw database...")

conn = psycopg2.connect(
    dbname="raw_db",
    user="chainlytics",
    password="chainlytics",
    host="localhost",
    port=5433
)

conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()

cursor.execute("LISTEN new_article;")
print("Listening on channel: new_article")

# (NEW) Connect to analytics database
print("Connecting to analytics database...")

analytics_conn = psycopg2.connect(
    dbname="analytics_db",
    user="chainlytics",
    password="chainlytics",
    host="localhost",
    port=5434
)

analytics_conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
analytics_cur = analytics_conn.cursor()


while True:
    if select.select([conn], [], [], 5) == ([], [], []):
        continue
    else:
        conn.poll()
        while conn.notifies:
            notify = conn.notifies.pop(0)
            print(f"\nReceived NOTIFY: new_article → payload={notify.payload}")

            article_id = int(notify.payload)

            cursor.execute(
                "SELECT title, source, published_at FROM articles WHERE id = %s;",
                (article_id,)
            )
            row = cursor.fetchone()

            # (CHANGED: guard clause for error)
            if not row:
                print(f"Article ID {article_id} not found!")
                continue

            # (SAME as before, just moved up)
            title, source, published_at = row
            print(f"Fetched article #{article_id}:")
            print(f"  Title: {title}")
            print(f"  Source: {source}")
            print(f"  Published At: {published_at}")

            # (NEW) Coin detection
            upper_title = title.upper()
            coin_counts = {}

            for coin in COINS:
                if coin in upper_title:
                    coin_counts[coin] = upper_title.count(coin)

            if coin_counts:
                print(f"Detected coins: {coin_counts}")
                for coin, mentions in coin_counts.items():
                    analytics_cur.execute(
                        """
                        INSERT INTO metrics (coin, mentions, recorded_at)
                        VALUES (%s, %s, NOW())
                        """,
                        (coin, mentions)
                    )
                    print(f"Inserted metric: coin={coin}, mentions={mentions}")

            else:
                print("No coins detected.")
