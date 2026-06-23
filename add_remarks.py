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
    cur.execute("ALTER TABLE reports ADD COLUMN IF NOT EXISTS jfw_remarks text;")
    conn.commit()
    cur.close()
    conn.close()
    print("Column jfw_remarks added successfully.")
except Exception as e:
    print(f"Error: {e}")
