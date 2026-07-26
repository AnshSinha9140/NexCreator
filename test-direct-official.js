async function run() {
    const res = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: "01J28TV7D79WFFD467RSYNDR8B", // From .env
        client_secret: "Dk61jU.8L+45f*n)3ZfE41Xo3G#86c!k" // From .env
      }).toString()
    });
    const tokenData = await res.json();
    const token = tokenData.access_token;
    
    const channelRes = await fetch("https://api.kick.com/public/v1/channels?slug=myzothehero", {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
        }
    });
    const channelData = await channelRes.json();
    console.log(JSON.stringify(channelData, null, 2));
}
run();
