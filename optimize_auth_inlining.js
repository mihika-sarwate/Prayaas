const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.mmxdvruucggeixjqwsqr:Adonisgroma%402026@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres"
});

async function run() {
  await client.connect();

  const queries = [
    // Rewrite auth_employee_id as PL/pgSQL to prevent inlining
    `
    CREATE OR REPLACE FUNCTION auth_employee_id() RETURNS text AS $$
    DECLARE
      v_headers text;
      v_id text;
    BEGIN
      v_headers := current_setting('request.headers', true);
      IF v_headers IS NULL OR v_headers = '' THEN
        RETURN '';
      END IF;
      BEGIN
        v_id := v_headers::json->>'x-employee-id';
      EXCEPTION WHEN OTHERS THEN
        v_id := '';
      END;
      RETURN COALESCE(v_id, '');
    END;
    $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    `,
    // Rewrite auth_employee_pwd as PL/pgSQL to prevent inlining
    `
    CREATE OR REPLACE FUNCTION auth_employee_pwd() RETURNS text AS $$
    DECLARE
      v_headers text;
      v_pwd text;
    BEGIN
      v_headers := current_setting('request.headers', true);
      IF v_headers IS NULL OR v_headers = '' THEN
        RETURN '';
      END IF;
      BEGIN
        v_pwd := v_headers::json->>'x-employee-password';
      EXCEPTION WHEN OTHERS THEN
        v_pwd := '';
      END;
      RETURN COALESCE(v_pwd, '');
    END;
    $$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
    `
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log("Successfully updated function to prevent inlining!");
    } catch (e) {
      console.error("Failed to update function:", e.message);
    }
  }

  await client.end();
}

run().catch(console.error);
