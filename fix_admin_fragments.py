import os
import re

admin_dir = r"C:\Users\anshs\.gemini\antigravity-ide\scratch\creator-manager\src\app\admin"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content
    
    # We want to replace:
    # return (
    #   <AdminHeader
    # with
    # return (
    #   <>
    #     <AdminHeader
    
    # And at the end, replace:
    #   </div>
    # );
    # with
    #   </div>
    #   </>
    # );
    
    # Check if we already have <> in the return
    if "return (\n    <>" in content or "return (\n      <>" in content or "return (\n  <>" in content or "return (<>" in content:
        return
        
    # Find the start
    content = re.sub(r'return\s*\(\s*<AdminHeader', r'return (\n    <>\n      <AdminHeader', content)
    
    # Find the end: basically the last </div> before );
    # But some might not have </div> as the last thing.
    # We can just match the end of the return block:
    # We know the file ends with some combination of </div>\n  );\n}
    content = re.sub(r'(</div>\s*)\);\s*}', r'\1  </>\n  );\n}', content)
    
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Fixed {filepath}")
        
    # Also fix creators/[creatorId]/page.tsx since it had a slightly different structure:
    # return (
    #   <AdminHeader ...>
    #     <div ...>
    #   </div>
    if 'creators\\[creatorId]\\page.tsx' in filepath:
        # let's just do a manual fix if it's still broken
        pass

for root, dirs, files in os.walk(admin_dir):
    for name in files:
        if name.endswith('page.tsx'):
            filepath = os.path.join(root, name)
            if 'admin\\page.tsx' not in filepath:
                process_file(filepath)

print("Done")
