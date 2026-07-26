async function testResolution(slug) {
  const tokenRes = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: '01KY2TYA7DWP1Q5EKDEMZZP60K',
      client_secret: '3d956759ab66e002f8c3e894a4b6c95ef01238f826aac1ef50e3c8b8a7ab7c20'
    }).toString()
  });
  const tokenData = await tokenRes.json();
  const res = await fetch('https://api.kick.com/public/v1/channels?slug=' + slug, {
    headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
  });
  const data = await res.json();
  const ch = data.data?.[0];
  if (!ch) return null;

  let chatroomId = null;

  // Method 1: Extract chatroomId from banner_picture URL if present
  if (ch.banner_picture) {
    const bannerMatch = ch.banner_picture.match(/\/images\/channel\/(\d+)\//);
    if (bannerMatch && bannerMatch[1]) {
      chatroomId = bannerMatch[1];
      console.log(`[Method 1: Banner] '${slug}' chatroomId -> #${chatroomId}`);
    }
  }

  // Method 2: Public v2 API lookup
  if (!chatroomId) {
    try {
      const v2Res = await fetch(`https://kick.com/api/v2/channels/${slug.toLowerCase()}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });
      if (v2Res.ok) {
        const v2Data = await v2Res.json();
        if (v2Data.chatroom?.id) {
          chatroomId = String(v2Data.chatroom.id);
          console.log(`[Method 2: v2 API] '${slug}' chatroomId -> #${chatroomId}`);
        }
      }
    } catch (e) {}
  }

  // Method 3: Fallback to broadcaster_user_id
  if (!chatroomId && ch.broadcaster_user_id) {
    chatroomId = String(ch.broadcaster_user_id);
    console.log(`[Method 3: Fallback UserID] '${slug}' chatroomId -> #${chatroomId}`);
  }

  return {
    slug,
    broadcaster_user_id: ch.broadcaster_user_id,
    chatroomId,
  };
}

async function run() {
  await testResolution('xqc');
  await testResolution('roshtein');
  await testResolution('adinross');
  await testResolution('trainwreckstv');
  await testResolution('8bit_rusherwow');
}

run();
