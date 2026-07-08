export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    const { nickname, phone_number } = await request.json();
    
    if (!nickname || !phone_number) {
      return new Response(
        JSON.stringify({ error: 'Nickname and Phone Number are required.' }), 
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Query the bound D1 database (DB)
    // Perform a case-insensitive comparison on the nickname
    const { results } = await env.DB.prepare(
      'SELECT pdf_url FROM pdf_records WHERE LOWER(nickname) = LOWER(?) AND phone_number = ?'
    )
    .bind(nickname.trim(), phone_number.trim())
    .all();

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No matching record found. Please verify your Nickname and Phone Number.' }), 
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const rawUrl = results[0].pdf_url;
    const directDownloadUrl = convertGDriveUrl(rawUrl);

    return new Response(
      JSON.stringify({ success: true, downloadUrl: directDownloadUrl }), 
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Parses Google Drive links and converts them to direct download links.
 */
function convertGDriveUrl(url) {
  if (!url) return '';
  url = url.trim();
  
  // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
  const fileDMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${fileDMatch[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id=FILE_ID
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
  }

  // Case 3: If they entered just the ID directly
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(url)) {
    return `https://drive.google.com/uc?export=download&id=${url}`;
  }

  // Fallback: Return original URL if unrecognized format
  return url;
}
