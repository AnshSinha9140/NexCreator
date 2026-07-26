import os
import re

d = r'C:\Users\anshs\.gemini\antigravity-ide\scratch\creator-manager\src\app\admin'

# Matches `const m = data?.metrics || { ... };`
# We look for `|| {` followed by anything until `};`
# and `|| [` followed by anything until `];`
# To avoid matching too much, we match non-greedily `.*?`

pattern_obj = re.compile(r'(\|\|\s*\{.*?\};)', re.DOTALL)
pattern_arr = re.compile(r'(\|\|\s*\[.*?\];)', re.DOTALL)

for root, dirs, files in os.walk(d):
    for file in files:
        if file.endswith('.tsx'):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            orig = content
            
            # For each file, we only want to replace the top-level fallbacks after data?.
            # Let's be more specific:
            # `const (\w+) = (data\??\.[a-zA-Z0-9_\.\?]*) \|\| \{.*?\};`
            content = re.sub(r'(const \w+\s*=\s*data.*?\s*\|\|\s*)\{.*?\};', r'\1{};', content, flags=re.DOTALL)
            content = re.sub(r'(const \w+\s*=\s*data.*?\s*\|\|\s*)\[.*?\];', r'\1[];', content, flags=re.DOTALL)
            
            if content != orig:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {path}")
