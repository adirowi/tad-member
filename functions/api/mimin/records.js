export async function onRequestGet(context) {
  const { env } = context;
  try {
    const { results } = await env.DB.prepare(
      'SELECT id, nickname, phone_number, pdf_url FROM pdf_records ORDER BY id DESC'
    ).all();

    return new Response(
      JSON.stringify({ success: true, records: results || [] }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { nickname, phone_number, pdf_url } = await request.json();

    if (!nickname || !phone_number || !pdf_url) {
      return new Response(
        JSON.stringify({ error: 'Nickname, Phone Number, and PDF URL are required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // We use SQLite's upsert clause (ON CONFLICT DO UPDATE) so that if the 
    // nickname + phone unique constraint is violated, we update the existing PDF URL.
    await env.DB.prepare(`
      INSERT INTO pdf_records (nickname, phone_number, pdf_url) 
      VALUES (?, ?, ?)
      ON CONFLICT(nickname, phone_number) 
      DO UPDATE SET pdf_url = excluded.pdf_url
    `)
    .bind(nickname.trim(), phone_number.trim(), pdf_url.trim())
    .run();

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function onRequestDelete(context) {
  const { request, env } = context;
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Record ID is required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await env.DB.prepare('DELETE FROM pdf_records WHERE id = ?')
      .bind(id)
      .run();

    return new Response(
      JSON.stringify({ success: true }), 
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
