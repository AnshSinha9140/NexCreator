async function run() {
    try {
        const res = await fetch("https://kick.com/api/v2/channels/xqc", {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
              Accept: "application/json",
            },
          });
        console.log(res.status);
    } catch(e) {
        console.error(e);
    }
}
run();
