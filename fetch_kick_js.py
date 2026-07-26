from curl_cffi import requests

def main():
    try:
        url = "https://unpkg.com/@retconned/kick-js/dist/index.js"
        print(f"Fetching {url}")
        res = requests.get(url, impersonate="chrome110")
        with open("kick_js.js", "w", encoding="utf-8") as f:
            f.write(res.text)
        print("Wrote kick_js.js")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
