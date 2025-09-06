
SELECT version();

SELECT * FROM pg_extension;

SELECT nspname AS schema_name
FROM pg_namespace
WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema';

SELECT tablename
FROM pg_tables
WHERE schemaname = 'public';

SELECT tablename
FROM pg_tables
WHERE schemaname = 'manufacturing_db';

SELECT tablename
FROM pg_tables
WHERE schemaname = 'retail_db';

SELECT tablename
FROM pg_tables
WHERE schemaname = 'logistics_db';

SELECT * FROM customers;

SELECT id, username, org, url, permissions, customer_id FROM users;

SELECT * FROM sessions;

SELECT id, username, org, url, permissions
FROM users
WHERE username = 'admin_mfg'
  AND password_hash = crypt('MfgPass123', password_hash);

SELECT s.session_id, u.username, u.org, u.url
FROM sessions s
JOIN users u ON s.user_id = u.id
WHERE s.token = 'mfg-session-token'
  AND s.expires_at > NOW();


SELECT production_line, shift, COUNT(*) AS total
FROM manufacturing_db.machine_events
GROUP BY production_line, shift;


SELECT store_id, AVG(health_score) AS avg_health, SUM(stock_level) AS total_stock
FROM retail_db.inventory_metrics
GROUP BY store_id;

SELECT category, COUNT(*) AS total_sales
FROM retail_db.sales_events
WHERE event_type = 'Sale'
GROUP BY category;

SELECT region, COUNT(*) AS event_count
FROM logistics_db.fleet_events
GROUP BY region;

SELECT model, COUNT(*) AS total
FROM logistics_db.fleet_events
GROUP BY model;

