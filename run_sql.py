import psycopg2
import os

def load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        os.environ[parts[0].strip()] = parts[1].strip()

load_env()
conn_str = os.environ.get("DATABASE_URL")
if not conn_str:
    print("Error: DATABASE_URL not found in environment.")
    exit(1)

try:
    conn = psycopg2.connect(conn_str)
    cur = conn.cursor()
    
    print("Running DDL modifications...")
    
    # 1. Update employees table
    cur.execute("""
        ALTER TABLE employees
        ADD COLUMN IF NOT EXISTS account_status text NOT NULL DEFAULT 'ACTIVE',
        ADD COLUMN IF NOT EXISTS blocked_date date,
        ADD COLUMN IF NOT EXISTS blocked_reason text;
    """)
    print("Updated employees table columns.")

    # 1b. Update reports table for Stockists support
    cur.execute("""
        ALTER TABLE reports
        ADD COLUMN IF NOT EXISTS stock_id text REFERENCES stockists(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS stock_name text,
        ADD COLUMN IF NOT EXISTS stock_area text;
    """)
    print("Updated reports table columns with stockist support.")

    # 2. Create attendance table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS attendance (
            id text PRIMARY KEY,
            employee_id text REFERENCES employees(id) ON DELETE CASCADE,
            date date NOT NULL,
            login_time text,
            attendance_status text NOT NULL,
            remarks text,
            created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
            CONSTRAINT unique_emp_date UNIQUE (employee_id, date)
        );
        ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;
    """)
    print("Created attendance table.")

    # 3. Create weekly_off_config table
    cur.execute("""
        CREATE TABLE IF NOT EXISTS weekly_off_config (
            id serial PRIMARY KEY,
            employee_id text UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
            weekday integer NOT NULL
        );
        ALTER TABLE weekly_off_config DISABLE ROW LEVEL SECURITY;
    """)
    print("Created weekly_off_config table.")
    
    # Run the original listing queries to save to db_tables.txt
    cur.execute("SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema = 'public';")
    rows = cur.fetchall()
    
    with open("db_tables.txt", "w", encoding="utf-8") as f:
        for r in rows:
            f.write(f"{r[0]}: {r[1]} ({r[2]})\n")
    
    conn.commit()
    print("DDL modifications run successfully!")
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    exit(1)
