import { getOfficialKickChannelInfo } from "./src/lib/kick";
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function run() {
    const res = await getOfficialKickChannelInfo('xqc');
    console.log(res);
}
run();
