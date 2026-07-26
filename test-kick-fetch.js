const username = "8bit_rusherwow";

async function testFetch() {
  console.log("1. Testing official API (if token exists, skipping for now)");

  // Test direct
  const url = `https://kick.com/api/v2/channels/${username}`;
  console.log("2. Direct fetch to:", url);
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Accept: "application/json",
      }
    });
    console.log("Direct status:", res.status);
  } catch(e) {
    console.error("Direct fetch error:", e.message);
  }

  // Test corsproxy
  console.log("3. Testing corsproxy...");
  try {
    const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(url)}`);
    console.log("Corsproxy status:", res.status);
    if(res.ok) console.log(await res.json());
  } catch(e) {
    console.error("Corsproxy error:", e.message);
  }

  // Test allorigins
  console.log("4. Testing allorigins...");
  try {
    const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
    console.log("Allorigins status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Allorigins data:", data.contents.substring(0, 100));
    }
  } catch(e) {
    console.error("Allorigins error:", e.message);
  }
}

testFetch();
