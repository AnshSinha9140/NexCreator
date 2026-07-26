const WebSocket = require('ws');

const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

const rooms = ["58686", "16783"]; // myzothehero, fang

const ws = new WebSocket(KICK_PUSHER_WS_URL);

ws.on('open', () => {
    console.log("✅ WebSocket opened");
    rooms.forEach(room => {
        ws.send(JSON.stringify({
            event: "pusher:subscribe",
            data: { auth: "", channel: `chatrooms.${room}.v2` }
        }));
    });
});

ws.on('message', (data) => {
    const raw = data.toString();
    const parsed = JSON.parse(raw);
    
    console.log(`[RAW WS] ${parsed.channel || 'global'} | ${parsed.event}`);
    if (parsed.event !== 'pusher_internal:subscription_succeeded' && parsed.event !== 'pusher:connection_established') {
        console.log("PAYLOAD:", raw.substring(0, 300));
    }
});

ws.on('error', (err) => console.error("WS Error:", err));
