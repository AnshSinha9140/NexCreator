const WebSocket = require('ws');
const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

async function getChatroomIdFromPage(username) {
  try {
    console.log(`Fetching Kick channel page for '${username}'...`);
    const url = `https://corsproxy.io/?url=${encodeURIComponent(`https://kick.com/${username}`)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Origin': 'http://localhost:3000'
      }
    });

    if (res.ok) {
      const html = await res.text();
      // Look for "chatroom":{"id":12345 or "chatroom_id":12345
      const match1 = html.match(/"chatroom"\s*:\s*\{\s*"id"\s*:\s*(\d+)/i);
      const match2 = html.match(/"chatroom_id"\s*:\s*(\d+)/i);
      const match3 = html.match(/chatroom_id\s*=\s*['"]?(\d+)['"]?/i);

      const chatroomId = match1?.[1] || match2?.[1] || match3?.[1];
      if (chatroomId) {
        console.log(`✅ Found chatroomId for '${username}' in HTML: #${chatroomId}`);
        return chatroomId;
      } else {
        console.log(`HTML fetched (${html.length} bytes), but no chatroomId pattern matched.`);
        // Print snippet around chatroom or stream
        const idx = html.indexOf('chatroom');
        if (idx !== -1) {
          console.log('Snippet:', html.slice(Math.max(0, idx - 50), idx + 150));
        }
      }
    } else {
      console.log('Page fetch failed status:', res.status);
    }
  } catch (err) {
    console.error('Page fetch error:', err.message);
  }
  return null;
}

async function testChannel(username) {
  const chatroomId = await getChatroomIdFromPage(username);
  if (!chatroomId) {
    console.log(`Could not find chatroomId for ${username}`);
    return;
  }

  console.log(`Subscribing to chatrooms.${chatroomId}.v2...`);
  const ws = new WebSocket(KICK_PUSHER_WS_URL);
  ws.on('open', () => {
    ws.send(JSON.stringify({
      event: 'pusher:subscribe',
      data: { auth: '', channel: `chatrooms.${chatroomId}.v2` }
    }));
  });

  let count = 0;
  ws.on('message', (raw) => {
    const data = JSON.parse(raw.toString());
    console.log(`[${username}] Event:`, data.event);
    if (data.event && data.event.includes('ChatMessage')) {
      count++;
      console.log(`[${username}] 📨 Chat Message #${count}:`, data.data);
    }
  });

  setTimeout(() => {
    console.log(`Done testing ${username}. Messages received: ${count}`);
    ws.close();
  }, 10000);
}

testChannel('xqc');
