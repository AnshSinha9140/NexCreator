/**
 * Try to get regaltos real chatroom ID via multiple methods including
 * fetching the Kick page HTML and looking for embedded JSON data
 */

async function tryFetchViaProxy(slug) {
  // Method 1: Try via allorigins which wraps with contents field
  try {
    const url = `https://api.allorigins.win/get?url=${encodeURIComponent('https://kick.com/api/v2/channels/' + slug)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const wrapper = await res.json();
      if (wrapper.contents) {
        const data = JSON.parse(wrapper.contents);
        if (data?.chatroom?.id) return { source: 'allorigins', id: data.chatroom.id };
      }
    }
  } catch (e) { console.log('allorigins failed:', e.message); }

  // Method 2: Try via corsproxy.io
  try {
    const url = `https://corsproxy.io/?url=${encodeURIComponent('https://kick.com/api/v2/channels/' + slug)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.chatroom?.id) return { source: 'corsproxy', id: data.chatroom.id };
    }
  } catch (e) { console.log('corsproxy failed:', e.message); }

  // Method 3: Try thingproxy
  try {
    const url = `https://thingproxy.freeboard.io/fetch/https://kick.com/api/v2/channels/${slug}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.chatroom?.id) return { source: 'thingproxy', id: data.chatroom.id };
    }
  } catch (e) { console.log('thingproxy failed:', e.message); }

  return null;
}

async function run() {
  console.log('Trying to find real chatroomId for regaltos via proxies...');
  const result = await tryFetchViaProxy('regaltos');
  if (result) {
    console.log('✅ REAL chatroom.id:', result.id, 'via', result.source);
  } else {
    console.log('❌ All proxies failed - Cloudflare is blocking v2 API from server-side too');
  }
}

run();
