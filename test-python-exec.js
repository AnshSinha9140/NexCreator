const { execSync } = require('child_process');

function fetchChatroomIdViaPython(username) {
    const pyScript = `
import json, sys
try:
    from curl_cffi import requests
    res = requests.get(f"https://kick.com/api/v2/channels/${username}", impersonate="chrome110", timeout=15)
    data = res.json()
    print(json.dumps({"status": res.status_code, "data": data}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;
    const fs = require('fs');
    fs.writeFileSync('temp_fetch.py', pyScript);
    
    try {
        const stdout = execSync(`python temp_fetch.py`);
        const result = JSON.parse(stdout.toString());
        return result;
    } catch (e) {
        console.error(e);
        return null;
    }
}

console.log("Response for 8bit_goldy:", fetchChatroomIdViaPython('8bit_goldy'));
