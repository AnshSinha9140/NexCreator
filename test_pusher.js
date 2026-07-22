const WebSocket = require('ws');

// First get the chatroom ID via the local Next.js API
async function test() {
  console.log("Step 1: Resolving chatroom ID for regaltos via local API...");
  
  let chatroomId = null;
  
  try {
    const res = await fetch('http://localhost:3000/api/analysis?kickChannel=regaltos');
    const data = await res.json();
    console.log("API Response:", JSON.stringify(data));
    chatroomId = data.chatroomId;
  } catch (e) {
    console.error("Failed to resolve via API:", e.message);
  }

  if (!chatroomId) {
    console.error("Could not resolve chatroom ID. Exiting.");
    process.exit(1);
  }

  console.log(`\nStep 2: Connecting to Pusher WS for chatrooms.${chatroomId}.v2 ...`);

  const wsUrl = `wss://ws-us2.pusher.com/app/32cbd69e4b950bf97679?protocol=7&client=js&version=7.4.0&flash=false`;
  const ws = new WebSocket(wsUrl);

  ws.on('open', () => {
    console.log("WS connected! Subscribing...");
    ws.send(JSON.stringify({
      event: "pusher:subscribe",
      data: { auth: "", channel: `chatrooms.${chatroomId}.v2` }
    }));
  });

  let msgCount = 0;
  ws.on('message', (data) => {
    const msg = JSON.parse(data.toString());
    if (msg.event && !msg.event.includes('pusher')) {
      msgCount++;
      let chatData = null;
      try { chatData = JSON.parse(msg.data); } catch(e) { chatData = msg.data; }
      const text = chatData?.content || chatData?.message || "";
      const sender = chatData?.sender?.username || "?";
      console.log(`[MSG #${msgCount}] EVENT: ${msg.event} | ${sender}: ${text.substring(0,80)}`);
    } else {
      console.log(`[SYSTEM] ${msg.event}`);
    }
  });

  ws.on('error', (err) => console.error("WS Error:", err.message));
  ws.on('close', () => console.log("WS closed."));

  setTimeout(() => {
    console.log(`\n=== RESULT: ${msgCount} chat messages received in 20 seconds ===`);
    ws.close();
    process.exit(0);
  }, 20000);
}

test();
