import psycopg2
conn_str = "postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres"
try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = 'public' AND table_name IN ('doctors', 'chemists', 'stockists');")
    rows = cur.fetchall()
    for r in rows:
        print(f"{r[0]}: {r[1]} ({r[2]}, null: {r[3]})")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
