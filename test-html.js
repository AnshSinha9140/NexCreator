async function run() {
    const res = await fetch("https://kick.com/myzothehero", {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Upgrade-Insecure-Requests": "1"
        }
    });
    console.log(res.status);
    if(res.ok) {
        const text = await res.text();
        console.log("Includes chatroom_id 58686?", text.includes("58686"));
    }
}
run();
