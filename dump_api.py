from curl_cffi import requests
import json
import sys

def main():
    try:
        res = requests.get("https://kick.com/api/v2/channels/xqc", impersonate="chrome110")
        if res.status_code == 200:
            data = res.json()
            # print pusher keys if they exist
            if "pusher_cluster" in data:
                print("pusher_cluster:", data["pusher_cluster"])
            
            with open("xqc_parsed.txt", "w", encoding="utf-8") as f:
                f.write(json.dumps(data, indent=2))
            print("Wrote to xqc_parsed.txt")
        else:
            print("Failed", res.status_code)
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
