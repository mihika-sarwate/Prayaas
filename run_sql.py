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
