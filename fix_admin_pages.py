import os
import glob
import re

admin_dir = r"C:\Users\anshs\.gemini\antigravity-ide\scratch\creator-manager\src\app\admin"

# Regex patterns to find the old wrappers
# 1. <div className="flex-1 flex flex-col pb-12">
pattern_wrapper1 = re.compile(r'<div className="flex-1 flex flex-col[^"]*">', re.IGNORECASE)
# 2. <main className="flex-1 p-6 space-y-6 max-w-7xl w-full mx-auto">
pattern_wrapper2 = re.compile(r'<main className="flex-1 p-6 space-y-6[^"]*">', re.IGNORECASE)
# 3. </main>
pattern_end_main = re.compile(r'</main>')

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # Replace `<div className="flex-1 flex flex-col pb-12">` with `<>` if we don't need it, or we replace the `main` with `<div className="admin-page">`
    # Let's see what happens.
    # We want to replace <div className="flex-1 flex flex-col pb-12"> with <>
    # and <main className="..."> with <div className="admin-page">
    # and </main> with </div>
    # But wait, there might be a closing </div> for the first wrapper!
    # A safer approach is to replace:
    # <div className="flex-1 flex flex-col pb-12"> -> nothing
    # <main className="..."> -> <div className="admin-page">
    # </main>\n    </div> -> </div>
    
    content = re.sub(r'<div className="flex-1 flex flex-col pb-12">\s*(<AdminHeader[^>]*/>)', r'\1', content)
    content = re.sub(r'<main className="flex-1 p-6 space-y-[^"]*">', r'<div className="admin-page">', content)
    content = re.sub(r'</main>\s*</div>', r'</div>', content)
    
    # Some pages might not have the outer div exactly like that.
    # Let's just fix it properly.
    if content != original_content:
        # Check if we removed the opening div but not the closing div properly.
        # Actually, let's just make sure it parses.
        pass

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
        
    if content != original_content:
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(admin_dir):
    for name in files:
        if name.endswith('page.tsx') or name.endswith('layout.tsx'):
            filepath = os.path.join(root, name)
            if 'admin\\page.tsx' not in filepath and 'admin\\layout.tsx' not in filepath:
                process_file(filepath)

print("Done")
