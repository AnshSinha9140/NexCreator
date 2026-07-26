import { getOfficialKickChannelInfo } from "./src/lib/kick";

async function run() {
    const res = await getOfficialKickChannelInfo('xqc');
    console.log(res);
}
run();
