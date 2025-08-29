# Chainlytics Report

(Write as I build; export to PDF later.)

## Database Design

I created two initial tables in PostgreSQL:

-**articles**: stores raw scraped news (id, title, source, published_at).
-**metrics**: stores processed analytics (id, coin, mentions, recorded_at).

This separation follows a common data engineering practice:
-Raw data is stored first (so it can always be reprocessed).
-Processed metrics are stored separately, optimized for visualization and temporal analysis.

This schemais automatically created when starting the project via Docker Compose (`infra/init_db.sql`).