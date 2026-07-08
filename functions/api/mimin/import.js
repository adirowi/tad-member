export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { records } = await request.json();

    if (!records || !Array.isArray(records)) {
      return new Response(
        JSON.stringify({ error: 'Invalid payload format. Expected an array of records.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (records.length === 0) {
      return new Response(
        JSON.stringify({ success: true, count: 0 }), 
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    const statements = [];
    // SQL statement for upserting each row
    const query = `
      INSERT INTO pdf_records (nickname, phone_number, pdf_url) 
      VALUES (?, ?, ?)
      ON CONFLICT(nickname, phone_number) 
      DO UPDATE SET pdf_url = excluded.pdf_url
    `;
    const stmt = env.DB.prepare(query);

    for (const rec of records) {
      const nick = (rec.nickname || '').trim();
      const phone = (rec.phone_number || '').trim();
      const url = (rec.pdf_url || '').trim();

      if (nick && phone && url) {
        statements.push(stmt.bind(nick, phone, url));
      }
    }

    if (statements.length > 0) {
      // D1 .batch() executes all bound statements inside a single transaction
      await env.DB.batch(statements);
    }

    return new Response(
      JSON.stringify({ success: true, count: statements.length }), 
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
