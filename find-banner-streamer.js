async function findStreamerWithBanner() {
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
  const res = await fetch('https://api.kick.com/public/v1/livestreams?page=1', {
    headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
  });
  const d = await res.json();
  
  for (const s of d.data) {
    const slug = s.slug || s.channel?.slug;
    if (!slug) continue;
    const chRes = await fetch('https://api.kick.com/public/v1/channels?slug=' + slug, {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });
    const chData = await chRes.json();
    const c = chData.data?.[0];
    if (c?.banner_picture) {
      const bannerMatch = c.banner_picture.match(/\/images\/channel\/(\d+)\//);
      if (bannerMatch) {
        console.log('FOUND streamer with banner:', slug, 'chatroom_id:', bannerMatch[1], 'viewers:', s.viewer_count);
        return slug;
      }
    }
  }
  console.log('None of top page streamers had banner');
}
findStreamerWithBanner();
