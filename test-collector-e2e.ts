import { KickChatCollector } from "./src/lib/ingestion/kickCollector";
import { RollingSessionBuffer } from "./src/lib/ingestion/buffer";

async function run() {
  const chatroomId = "104279691"; 
  console.log(`Starting collector test for chatroomId ${chatroomId}...`);
  const collector = new KickChatCollector("test-session", { chatroomId });
  const buffer = new RollingSessionBuffer("test-session");

  collector.onMessage((msg) => {
    buffer.add(msg);
  });

  await collector.connect();
  
  // Inject Mock Protocol Changes
  setTimeout(() => {
     console.log("\\n--- INJECTING MOCK EVENTS ---");
     const mockEvent1 = JSON.stringify({
         event: "chat.message",
         channel: "chatrooms.104279691.v2",
         data: JSON.stringify({
             id: "msg-1234",
             chatroom_id: 104279691,
             content: "Hello from Kick ChatCollector Audit!",
             type: "message",
             created_at: new Date().toISOString(),
             sender: {
                 id: 999,
                 username: "test_user",
                 slug: "test_user",
                 identity: { color: "#ff0000", badges: [] }
             }
         })
     });
     
     // @ts-ignore
     collector.handleRawMessage(Buffer.from(mockEvent1));
  }, 3000);
  
  // Wait 30 seconds to gather events
  await new Promise(resolve => setTimeout(resolve, 30000));
  
  await collector.disconnect();
}

run().catch(console.error);
