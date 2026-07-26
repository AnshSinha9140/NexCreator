from curl_cffi import requests

def main():
    try:
        res = requests.get("https://kick.com/api/v2/channels/fang", impersonate="chrome110")
        if res.status_code == 200:
            data = res.json()
            print(f"FANG CHATROOM ID: {data['chatroom']['id']}")
        else:
            print("Failed", res.status_code)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
