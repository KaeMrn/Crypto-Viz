import feedparser   # library to read RSS feeds
import time         # library to pause our program
import psycopg2

# The RSS feed we want to scrape
FEED_URL = "https://cointelegraph.com/rss"

# Connect to the raw Postgres database inside Docker
conn = psycopg2.connect(
    dbname="raw_db",
    user="chainlytics",
    password="chainlytics",
    host="localhost",
    port=5433,   # raw db uses port 5433
)
conn.autocommit = True
cursor = conn.cursor()


def fetch_articles():
    """
    This function:
    - downloads the RSS feed
    - extracts the articles
    - returns them as a list of Python dictionaries
    """

    feed = feedparser.parse(FEED_URL)  # fetch + parse RSS feed
    articles = []

    for entry in feed.entries:
        article = {
            "title": entry.title,
            "source": "CoinTelegraph",
            "published_at": entry.published if "published" in entry else None
        }

        articles.append(article)

    return articles


# Run the scraper continuously
if __name__ == "__main__":
    while True:
        print("\nFetching news...\n")

        articles = fetch_articles()

        # Print the first 3 articles to test
        for article in articles[:3]:
            cursor.execute(
        """
        INSERT INTO articles (title, source, published_at)
        VALUES (%s, %s, %s)
        """,
        (article["title"], article["source"], article["published_at"])
     )
        print("Inserted:", article["title"])


        time.sleep(10)  # wait 10 seconds before scraping again
