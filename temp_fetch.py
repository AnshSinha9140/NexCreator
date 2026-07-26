
import json, sys
try:
    from curl_cffi import requests
    res = requests.get(f"https://kick.com/api/v2/channels/8bit_goldy", impersonate="chrome110", timeout=15)
    data = res.json()
    print(json.dumps({"status": res.status_code, "data": data}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
