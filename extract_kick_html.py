from curl_cffi import requests
import re

def main():
    try:
        res = requests.get("https://kick.com/fang", impersonate="chrome110")
        if res.status_code == 200:
            html = res.text
            # Look for pusher key
            # Usually in a script tag like window.__KICK_STATE__ or just scattered
            matches = re.findall(r'pusher[a-zA-Z0-9_]*["\']?\s*:\s*["\']([^"\']+)["\']', html, re.IGNORECASE)
            print("Pusher matches:", matches)
            
            # Look for app key (usually 20 chars hex)
            keys = re.findall(r'["\']([a-f0-9]{20})["\']', html)
            print("Potential 20-char hex keys:", set(keys))
            
            # Look for cluster
            clusters = re.findall(r'["\'](us2|us3|mt1|eu|ap1|us-east-1|us-west-2)["\']', html)
            print("Potential clusters:", set(clusters))
            
            # Look for channel name format
            channels = re.findall(r'chatrooms\.\d+\.v\d+', html)
            print("Channel name formats found:", set(channels))
        else:
            print("Failed to fetch", res.status_code)
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
