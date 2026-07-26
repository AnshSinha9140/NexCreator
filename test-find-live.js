async function findLive() {
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
  const channels = ['adinross', 'westcol', 'kaicenat', 'jynxzi', 'n3on', 'xqc', 'roshtein', 'trainwreckstv', 'amouranth', 'nadia', 'stableronaldo', 'erobb', 'b0temane', 'lacy'];

  for (const s of channels) {
    const res = await fetch('https://api.kick.com/public/v1/channels?slug=' + s, {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });
    const data = await res.json();
    const c = data.data?.[0];
    if (c?.stream?.is_live) {
      const bannerMatch = c.banner_picture && c.banner_picture.match(/\/images\/channel\/(\d+)\//);
      const chatFromBanner = bannerMatch ? bannerMatch[1] : null;
      console.log(`🔴 LIVE: ${s} | broadcaster_user_id: ${c.broadcaster_user_id} | chatroom_from_banner: ${chatFromBanner || 'N/A'} | viewers: ${c.stream.viewer_count}`);
    }
  }
  console.log('Search done');
}
findLive();
