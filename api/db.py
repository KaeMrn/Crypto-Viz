import psycopg2

def get_analytics_conn():
    return psycopg2.connect(
        dbname="analytics_db",
        user="chainlytics",
        password="chainlytics",
        host="localhost",
        port=5434
    )