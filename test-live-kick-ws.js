const WebSocket = require('ws');
const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

// Test live stream on Kick (e.g. xqc = chatroomId 668, or hikaru = chatroomId 289419)
async function testLiveChat(channelName) {
  try {
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
    const res = await fetch(`https://api.kick.com/public/v1/channels?slug=${channelName}`, {
      headers: { 'Authorization': 'Bearer ' + tokenData.access_token }
    });
    const data = await res.json();
    const broadcasterId = data.data?.[0]?.broadcaster_user_id;
    console.log(`Channel '${channelName}' broadcaster_user_id (chatroomId):`, broadcasterId);

    if (!broadcasterId) {
      console.log("Could not resolve broadcaster_user_id");
      process.exit(1);
    }

    console.log(`Connecting WebSocket to chatrooms.${broadcasterId}.v2...`);
    const ws = new WebSocket(KICK_PUSHER_WS_URL);

    ws.on('open', () => {
      console.log('WS Open. Subscribing...');
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { auth: '', channel: `chatrooms.${broadcasterId}.v2` }
      }));
    });

    let msgCount = 0;
    ws.on('message', (raw) => {
      const parsed = JSON.parse(raw.toString());
      console.log('EVENT:', parsed.event);
      if (parsed.event && !parsed.event.includes('pusher')) {
        msgCount++;
        console.log('MESSAGE DATA RAW:', parsed.data);
      }
    });

    setTimeout(() => {
      console.log(`Test completed. Total messages received: ${msgCount}`);
      ws.close();
      process.exit(0);
    }, 15000);
  } catch (err) {
    console.error("Test Error:", err);
    process.exit(1);
  }
}

testLiveChat('xqc');
