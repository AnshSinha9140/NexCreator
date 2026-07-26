// Verify broadcaster_user_id == chatroom ID by connecting to Pusher WebSocket
const WebSocket = require('ws');
const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

const chatroomId = "106775256"; // broadcaster_user_id from official API

console.log(`[Test] Connecting to Pusher WS for chatroom #${chatroomId}...`);
const ws = new WebSocket(KICK_PUSHER_WS_URL);

ws.on('open', () => {
  console.log('[Test] ✅ WebSocket opened');
  ws.send(JSON.stringify({
    event: "pusher:subscribe",
    data: { auth: "", channel: `chatrooms.${chatroomId}.v2` }
  }));
  console.log(`[Test] Subscribed to chatrooms.${chatroomId}.v2`);
  setTimeout(() => {
    console.log('[Test] Done waiting. Closing.');
    ws.close();
    process.exit(0);
  }, 8000);
});

ws.on('message', (raw) => {
  const msg = JSON.parse(raw.toString());
  if (msg.event === 'pusher:connection_established') {
    console.log('[Test] ✅ Connection established');
  } else if (msg.event === 'pusher_internal:subscription_succeeded') {
    console.log('[Test] ✅ Subscription succeeded!');
  } else if (msg.event?.includes('ChatMessage')) {
    console.log('[Test] 📨 Chat message received:', msg.data);
  } else {
    console.log('[Test] Event:', msg.event);
  }
});

ws.on('error', (err) => {
  console.error('[Test] ❌ WebSocket error:', err.message);
});
