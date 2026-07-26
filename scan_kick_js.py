from curl_cffi import requests
import re
import urllib.parse

def main():
    try:
        print("Fetching Kick.com...")
        res = requests.get("https://kick.com", impersonate="chrome110")
        if res.status_code != 200:
            print("Failed to fetch Kick.com:", res.status_code)
            return

        html = res.text
        
        # Find all script src
        scripts = re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', html)
        print(f"Found {len(scripts)} scripts. Searching them...")
        
        for script in scripts:
            url = urllib.parse.urljoin("https://kick.com", script)
            # print("Fetching", url)
            try:
                js_res = requests.get(url, impersonate="chrome110")
                if js_res.status_code == 200:
                    js = js_res.text
                    # Search for pusher key
                    if "32cbd69e4b950bf97679" in js:
                        print(f"FOUND OLD APP KEY IN: {url}")
                    
                    # Search for 'chatrooms.' pattern
                    chatrooms_matches = set(re.findall(r'["\']chatrooms\.\$\{?[a-zA-Z0-9_]+\}?(?:\.v\d+)?["\']|["\']chatrooms\.["\']\s*\+', js))
                    if chatrooms_matches:
                        print(f"FOUND CHANNEL FORMAT IN {url}: {chatrooms_matches}")
                        
                    # Find alternative pusher app keys
                    keys = set(re.findall(r'pusher[a-zA-Z0-9_]*Key["\']?\s*:\s*["\']([a-f0-9]{20})["\']', js, re.IGNORECASE))
                    if keys:
                        print(f"FOUND POTENTIAL NEW APP KEYS IN {url}: {keys}")
                        
                    # Find pusher clusters
                    clusters = set(re.findall(r'pusher[a-zA-Z0-9_]*Cluster["\']?\s*:\s*["\']([a-zA-Z0-9\-]+)["\']', js, re.IGNORECASE))
                    if clusters:
                        print(f"FOUND POTENTIAL CLUSTERS IN {url}: {clusters}")
                        
            except Exception as e:
                print(f"Error fetching {url}: {e}")
                
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    main()
