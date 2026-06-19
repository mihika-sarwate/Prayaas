import psycopg2

conn_str = "postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
    tables = [row[0] for row in cur.fetchall()]
    print("Tables in public schema:")
    for t in tables:
        print("-", t)
    cur.close()
    conn.close()
except Exception as e:
    print("Error:", e)
