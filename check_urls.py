import json
from curl_cffi import requests

def get_channel(slug):
    try:
        res = requests.get(f"https://kick.com/api/v2/channels/{slug}", impersonate="chrome110")
        if res.status_code == 200:
            data = res.json()
            channel_id = data.get('id', data.get('channel', {}).get('id'))
            chatroom_id = data.get('chatroom', {}).get('id')
            user_id = data.get('user', {}).get('id')
            banner_picture = data.get('banner_image', {}).get('url') if data.get('banner_image') else None
            
            print(f"SLUG: {slug}")
            print(f"Channel ID: {channel_id}")
            print(f"Chatroom ID: {chatroom_id}")
            print(f"User ID: {user_id}")
            print(f"Banner URL: {banner_picture}")
            print("---")
    except Exception as e:
        print(f"Error {slug}: {e}")

get_channel('fang')
get_channel('myzothehero')
get_channel('xqc')
