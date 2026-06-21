import psycopg2
conn_str = "postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres"
try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    cur.execute("ALTER TABLE reports ADD COLUMN IF NOT EXISTS jfw_remarks text;")
    conn.commit()
    cur.close()
    conn.close()
    print("Column jfw_remarks added successfully.")
except Exception as e:
    print(f"Error: {e}")
