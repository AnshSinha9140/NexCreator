/**
 * DIAGNOSTIC: Tests the full chat ingestion pipeline
 * This verifies:
 * 1. Kick API token works
 * 2. Channel lookup returns broadcaster_user_id
 * 3. Banner URL chatroomId extraction works
 * 4. Pusher WebSocket connects and receives real chat messages
 * 
 * Run: node test-diagnostic.js <channel_slug>
 * Example: node test-diagnostic.js 8bit_rusherwow
 */

const WebSocket = require('ws');

const KICK_PUSHER_APP_KEY = "32cbd69e4b950bf97679";
const KICK_PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${KICK_PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0&flash=false`;

const CLIENT_ID = '01KY2TYA7DWP1Q5EKDEMZZP60K';
const CLIENT_SECRET = '3d956759ab66e002f8c3e894a4b6c95ef01238f826aac1ef50e3c8b8a7ab7c20';

async function getToken() {
  const res = await fetch('https://id.kick.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET
    }).toString()
  });
  const data = await res.json();
  return data.access_token;
}

async function getChannelInfo(slug, token) {
  const res = await fetch(`https://api.kick.com/public/v1/channels?slug=${slug}`, {
    headers: { 'Authorization': 'Bearer ' + token }
  });
  const data = await res.json();
  return data.data?.[0];
}

async function getRealChatroomId(slug) {
  // Try v2 API first (real chatroom.id)
  try {
    const res = await fetch(`https://kick.com/api/v2/channels/${slug}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json'
      }
    });
    if (res.ok) {
      const d = await res.json();
      if (d.chatroom?.id) {
        return { source: 'v2_api', chatroomId: String(d.chatroom.id) };
      }
    }
  } catch (e) {}
  return null;
}

async function testLivePusher(chatroomId, channelSlug) {
  return new Promise((resolve) => {
    console.log(`\n📡 Connecting to chatrooms.${chatroomId}.v2 (Pusher)...`);
    const ws = new WebSocket(KICK_PUSHER_WS_URL);
    let msgCount = 0;
    let subscribed = false;

    ws.on('open', () => {
      console.log('✅ WebSocket OPEN. Subscribing...');
      ws.send(JSON.stringify({
        event: 'pusher:subscribe',
        data: { auth: '', channel: `chatrooms.${chatroomId}.v2` }
      }));
    });

    ws.on('message', (raw) => {
      const data = JSON.parse(raw.toString());
      if (data.event === 'pusher_internal:subscription_succeeded') {
        subscribed = true;
        console.log(`✅ Subscription CONFIRMED for chatrooms.${chatroomId}.v2`);
        console.log(`⏳ Listening for messages for 20 seconds...`);
      } else if (data.event && (data.event.includes('ChatMessage') || data.event.includes('Chat'))) {
        msgCount++;
        let payload = data.data;
        if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) {} }
        const sender = payload?.sender?.username || payload?.user?.username || 'unknown';
        const content = payload?.content || payload?.message || '';
        console.log(`  📨 [${msgCount}] ${sender}: "${content.slice(0, 80)}"`);
      }
    });

    ws.on('error', (e) => {
      console.error('❌ WS Error:', e.message);
    });

    ws.on('close', (code) => {
      console.log(`WS closed (code: ${code})`);
    });

    setTimeout(() => {
      ws.close();
      resolve(msgCount);
    }, 20000);
  });
}

async function run() {
  const slug = process.argv[2] || 'xqc';
  console.log(`\n========================================`);
  console.log(`🔍 KICK CHAT INGESTION DIAGNOSTIC`);
  console.log(`Channel: ${slug}`);
  console.log(`========================================\n`);

  // Step 1: Get OAuth token
  console.log('Step 1: Getting OAuth token...');
  const token = await getToken();
  if (!token) { console.error('❌ Failed to get token'); process.exit(1); }
  console.log('✅ Token OK');

  // Step 2: Get channel info from official API
  console.log('\nStep 2: Fetching channel info from Official API...');
  const ch = await getChannelInfo(slug, token);
  if (!ch) { console.error('❌ Channel not found'); process.exit(1); }
  console.log(`✅ Channel found: ${ch.slug}`);
  console.log(`   broadcaster_user_id: ${ch.broadcaster_user_id}`);
  console.log(`   is_live: ${ch.stream?.is_live}`);
  console.log(`   viewers: ${ch.stream?.viewer_count}`);
  console.log(`   banner: ${ch.banner_picture || '(none)'}`);

  if (!ch.stream?.is_live) {
    console.log(`\n⚠️  ${slug} is NOT currently live!`);
    console.log(`   This is why representativeMessages is empty.`);
    console.log(`   Chat ingestion only receives messages when the channel is streaming.`);
    console.log(`\n   Try: node test-diagnostic.js <live-channel>`);
    console.log(`   Find live channels: check kick.com browse page for who is currently live.`);
  }

  // Step 3: Extract chatroom ID from banner
  let bannerChatroomId = null;
  if (ch.banner_picture) {
    const m = ch.banner_picture.match(/\/images\/channel\/(\d+)\//);
    if (m) {
      bannerChatroomId = m[1];
      console.log(`\n✅ Banner URL chatroomId: ${bannerChatroomId}`);
    }
  }

  // Step 4: Try v2 API for real chatroom ID
  console.log('\nStep 3: Checking v2 API for real chatroom.id...');
  const v2Result = await getRealChatroomId(slug);
  if (v2Result) {
    console.log(`✅ v2 API chatroomId: ${v2Result.chatroomId} (${v2Result.source})`);
  } else {
    console.log(`⚠️  v2 API blocked (Cloudflare) — this is normal from server-side`);
  }

  // Step 5: Determine best chatroomId
  const chatroomId = v2Result?.chatroomId || bannerChatroomId || String(ch.broadcaster_user_id);
  const chatroomSource = v2Result ? 'v2_api' : (bannerChatroomId ? 'banner' : 'broadcaster_user_id_fallback');
  
  console.log(`\n📌 Using chatroomId: ${chatroomId} (source: ${chatroomSource})`);
  
  if (chatroomSource === 'broadcaster_user_id_fallback') {
    console.log(`\n⚠️  WARNING: Using broadcaster_user_id as chatroomId fallback.`);
    console.log(`   For ${slug}, broadcaster_user_id = ${ch.broadcaster_user_id}`);
    console.log(`   The REAL chatroom ID might be different!`);
    if (bannerChatroomId && bannerChatroomId !== String(ch.broadcaster_user_id)) {
      console.log(`   Banner suggests chatroom ID is ${bannerChatroomId}`);
    }
  }

  // Step 6: Test Pusher connection
  console.log('\nStep 4: Testing Pusher WebSocket connection...');
  const msgCount = await testLivePusher(chatroomId, slug);

  console.log(`\n========================================`);
  if (msgCount > 0) {
    console.log(`✅ SUCCESS: Received ${msgCount} chat messages!`);
    console.log(`   The pipeline is working correctly.`);
  } else if (!ch.stream?.is_live) {
    console.log(`ℹ️  EXPECTED: 0 messages (channel is offline)`);
    console.log(`   Test with a LIVE channel to confirm messages flow.`);
  } else {
    console.log(`❌ PROBLEM: Channel is live but received 0 messages!`);
    console.log(`   chatroomId ${chatroomId} may be incorrect.`);
    console.log(`   broadcaster_user_id: ${ch.broadcaster_user_id}`);
    console.log(`   banner chatroomId: ${bannerChatroomId || 'N/A'}`);
  }
  console.log(`========================================\n`);
  
  process.exit(0);
}

run().catch(e => { console.error('Fatal error:', e); process.exit(1); });
