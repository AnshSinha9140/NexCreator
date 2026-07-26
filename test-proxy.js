async function run() {
    const res = await fetch("https://corsproxy.io/?url=https://kick.com/api/v2/channels/myzothehero");
    console.log(res.status);
}
run();
