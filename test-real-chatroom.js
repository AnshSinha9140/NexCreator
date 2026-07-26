const WebSocket = require('ws');
const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

const realChatroomId = "668"; // xqc's REAL chatroom ID

console.log(`Connecting WebSocket to chatrooms.${realChatroomId}.v2...`);
const ws = new WebSocket(KICK_PUSHER_WS_URL);

ws.on('open', () => {
  console.log('WS Open. Subscribing...');
  ws.send(JSON.stringify({
    event: 'pusher:subscribe',
    data: { auth: '', channel: `chatrooms.${realChatroomId}.v2` }
  }));
});

let msgCount = 0;
ws.on('message', (raw) => {
  const parsed = JSON.parse(raw.toString());
  if (parsed.event && parsed.event.includes('ChatMessage')) {
    msgCount++;
    let data = parsed.data;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch (e) {}
    }
    console.log(`[xqc] 📨 Message #${msgCount} from '${data.sender?.username}': "${data.content}"`);
  }
});

setTimeout(() => {
  console.log(`Test completed. Total messages received: ${msgCount}`);
  ws.close();
  process.exit(0);
}, 12000);
