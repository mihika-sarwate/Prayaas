import psycopg2

conn_str = "postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres"

sql = "NOTIFY pgrst, 'reload schema';"

try:
    print("Connecting to Supabase PostgreSQL database to reload schema cache...")
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    print("Running NOTIFY command...")
    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    print("Successfully reloaded PostgREST schema cache!")
except Exception as e:
    print("Error occurred:")
    print(e)
