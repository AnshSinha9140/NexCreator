/**
 * Tests Pusher subscription with the REAL chatroom.id for regaltos.
 * We know regaltos broadcaster_user_id = 104228942 (wrong for Pusher)
 * We need to find the real chatroom.id from kick.com/api/v2 (browser-side).
 * 
 * This script tries the Kick official API with a different approach.
 */

const WebSocket = require('ws');

const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

async function testRoom(chatroomId, label) {
  return new Promise((resolve) => {
    let count = 0;
    const ws = new WebSocket(KICK_PUSHER_WS_URL);
    
    ws.on('open', () => {
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { auth: '', channel: `chatrooms.${chatroomId}.v2` }
      }));
    });

    ws.on('message', (raw) => {
      const data = JSON.parse(raw.toString());
      if (data.event === 'pusher_internal:subscription_succeeded') {
        console.log(`[${label}] ✅ Subscribed to chatrooms.${chatroomId}.v2`);
      } else if (data.event && data.event.includes('Chat')) {
        count++;
        let payload = data.data;
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
        const sender = payload?.sender?.username || 'unknown';
        const content = payload?.content || '';
        console.log(`[${label}] 📨 Message #${count} from ${sender}: "${content.slice(0, 60)}"`);
      }
    });

    ws.on('error', (e) => { console.log(`[${label}] WS Error:`, e.message); });

    setTimeout(() => {
      ws.close();
      console.log(`[${label}] Done. Messages received: ${count}`);
      resolve(count);
    }, 8000);
  });
}

async function run() {
  console.log('Testing multiple chatroom IDs for regaltos...\n');
  
  // Test 1: broadcaster_user_id (wrong, confirmed 0 messages)
  console.log('=== Test 1: broadcaster_user_id (104228942) ===');
  await testRoom('104228942', 'wrong_id');
  
  console.log('\n=== Test 2: Need real chatroom.id from browser ===');
  console.log('To find the real chatroom ID, open browser dev tools and run:');
  console.log('  fetch("https://kick.com/api/v2/channels/regaltos").then(r=>r.json()).then(d=>console.log("chatroom.id:", d.chatroom.id))');
}

run();
