import psycopg2

conn_str = "postgresql://postgres:Prayaas_Adonis@db.ajifnoazcvxvpyzlusuy.supabase.co:5432/postgres"

sql = """
create table if not exists stockists (
  id text primary key,
  name text not null,
  area text,
  assign_to text references employees(id)
);

alter table stockists disable row level security;
"""

try:
    print("Connecting to Supabase PostgreSQL database via IPv6 (from GitHub Actions)...")
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    print("Running DDL query to create 'stockists' table...")
    cur.execute(sql)
    conn.commit()
    cur.close()
    conn.close()
    print("Successfully created 'stockists' table and disabled Row Level Security!")
except Exception as e:
    print("Error occurred while creating the table:")
    print(e)
