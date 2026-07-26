from curl_cffi import requests
import json
import sys

def main():
    streamers = ["xqc", "roshtein", "trainwreckstv", "adinross", "iceposeidon", "n3on", "fousey"]
    
    # Or fetch front page and parse it!
    # Kick has a popular livestream API
    try:
        res = requests.get("https://kick.com/api/v2/channels/xqc", impersonate="chrome110")
        if res.status_code == 200:
            data = res.json()
            print(f"XQC API Response: {json.dumps(data, indent=2)}")
        
        # Or better, fetch top livestreams
        res2 = requests.get("https://kick.com/stream/livestreams/en?page=1&limit=5", impersonate="chrome110")
        if res2.status_code == 200:
            data = res2.json()
            if data and isinstance(data, list) and len(data) > 0:
                print(f"Top streamer: {data[0]['channel']['slug']}")
                
                # Fetch their channel to get chatroom id
                slug = data[0]['channel']['slug']
                res3 = requests.get(f"https://kick.com/api/v2/channels/{slug}", impersonate="chrome110")
                if res3.status_code == 200:
                    d = res3.json()
                    print(f"LIVE CHATROOM ID: {d['chatroom']['id']}")
            else:
                print(res2.text)
        else:
            print(f"Status: {res2.status_code}, {res2.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
