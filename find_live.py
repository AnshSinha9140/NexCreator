from curl_cffi import requests
import time
import json

def get_channel(slug):
    try:
        res = requests.get(f"https://kick.com/api/v2/channels/{slug}", impersonate="chrome110")
        if res.status_code == 200:
            data = res.json()
            if data.get('livestream'):
                viewers = data['livestream'].get('viewer_count', 0)
                chatroom_id = data['chatroom']['id']
                print(f"LIVE: {slug} | Viewers: {viewers} | Chatroom: {chatroom_id}")
                return chatroom_id
            else:
                print(f"OFFLINE: {slug}")
        else:
            print(f"Failed {slug}: {res.status_code}")
    except Exception as e:
        pass
    return None

def main():
    streamers = ["adinross", "trainwreckstv", "roshtein", "n3on", "ac7ionman", "heelmike", "iceposeidon"]
    live_chatrooms = []
    
    for s in streamers:
        cid = get_channel(s)
        if cid:
            live_chatrooms.append(cid)
        time.sleep(1)
        
    print("LIVE CHATROOMS:", live_chatrooms)
    with open("live_rooms.json", "w") as f:
        json.dump(live_chatrooms, f)

if __name__ == "__main__":
    main()
