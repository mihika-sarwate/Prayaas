const fetch = require('node-fetch'); // wait, I don't need node-fetch in node 18+. I can just use global fetch.

async function run() {
  const url = "https://mmxdvruucggeixjqwsqr.supabase.co/rest/v1/reports?limit=1";
  const res = await fetch(url, {
    headers: {
      "apikey": "sb_publishable_2jy3q9qK_wkcnFAmPHe8dA_NEGZsRpl", // I don't have this. Let me use anon key. Oh wait, the anon key is in index.html, but I can just grep it or read it.
      "Authorization": "Bearer sb_publishable_2jy3q9qK_wkcnFAmPHe8dA_NEGZsRpl" 
    }
  });
  const data = await res.json();
  console.log(data);
}
run().catch(console.error);
