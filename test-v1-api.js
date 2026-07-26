async function run() {
    try {
        const res = await fetch("https://kick.com/api/v1/channels/fang");
        console.log(res.status);
        console.log(await res.text());
    } catch(e) {
        console.error(e);
    }
}
run();
