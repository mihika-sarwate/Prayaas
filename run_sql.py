import psycopg2

conn_str = "postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres"

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public';")
    tables = [row[0] for row in cur.fetchall()]
    
    with open("db_tables.txt", "w") as f:
        f.write("Tables in public schema:\n")
        for t in tables:
            f.write(f"- {t}\n")
            
    cur.close()
    conn.close()
    print("Wrote tables list to db_tables.txt successfully!")
except Exception as e:
    with open("db_tables.txt", "w") as f:
        f.write(f"Error: {e}\n")
