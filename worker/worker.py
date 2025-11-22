import psycopg2
import select   # needed to wait for DB notifications

print("Connecting to raw database...")

# Connect to raw_db (port = 5433)
conn = psycopg2.connect(
    dbname="raw_db",
    user="chainlytics",
    password="chainlytics",
    host="localhost",
    port=5433
)

conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()

# Tell Postgres we want to LISTEN on the channel
cursor.execute("LISTEN new_article;")
print("Listening on channel: new_article")

while True:
    # Wait for an event
    if select.select([conn], [], [], 5) == ([], [], []):
        # no events within 5 seconds
        continue
    else:
        conn.poll()
        while conn.notifies:
            notify = conn.notifies.pop(0)
            print(f"Received NOTIFY: {notify.channel} → payload={notify.payload}")
