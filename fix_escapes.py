import re

# Read the file
with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the escaped characters
content = content.replace('\\r\\n', '\r\n')

# Write back
with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed escape characters successfully!")
