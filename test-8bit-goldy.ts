import { KickChatCollector } from "./src/lib/ingestion/kickCollector";
import { getKickChatroomId } from "./src/lib/kick";

// Inject env vars manually for test
process.env.KICK_CLIENT_ID = "01J28TV7D79WFFD467RSYNDR8B";
process.env.KICK_CLIENT_SECRET = "Dk61jU.8L+45f*n)3ZfE41Xo3G#86c!k";

async function runTest() {
    const username = "8bit_goldy";
    console.log(`[Test] Fetching chatroomId for ${username}...`);
    
    const kickMeta = await getKickChatroomId(username);

    if (!kickMeta || !kickMeta.chatroomId) {
        console.error(`[Test] Failed to get chatroomId for ${username}`);
        return;
    }
    
    console.log(`[Test] Chatroom ID resolved: ${kickMeta.chatroomId}`);
    console.log(`[Test] Instantiating KickChatCollector...`);
    
    const sessionId = "test-session-" + Date.now();
    const collector = new KickChatCollector(sessionId, { 
        channelHandle: username,
        chatroomId: kickMeta.chatroomId
    });
    
    let messageCount = 0;
    
    collector.onMessage((msg: any) => {
        messageCount++;
        console.log(`[Test] 💬 RECEIVED CHAT MESSAGE (${messageCount}):`, msg.content || msg.message, `from: ${msg.sender?.username || msg.sender}`);
    });
    
    await collector.connect();
    
    console.log(`[Test] Connected. Listening for 20 seconds...`);
    setTimeout(() => {
        console.log(`[Test] Test complete. Total messages received: ${messageCount}`);
        process.exit(0);
    }, 20000);
}

runTest();
