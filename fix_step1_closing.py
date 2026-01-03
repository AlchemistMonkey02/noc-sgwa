# Fix missing closing parenthesis for Step 1
with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and replace - add the missing closing paren for Step 1's conditional
old_text = """                                    </div>
                                )}
                            </div>

                        {/* Step 2: Project & Location Details */}"""

new_text = """                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 2: Project & Location Details */}"""

if old_text in content:
    content = content.replace(old_text, new_text, 1)
    
    with open(r'c:\Users\DELL\Desktop\SGWA\src\modules\noc\NOCApplication.jsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print("Fixed missing closing parenthesis for Step 1!")
else:
    print("Pattern not found. Checking manually...")
    lines = content.split('\n')
    for i in range(618, 628):
        if i < len(lines):
            print(f"{i+1}: {lines[i]}")
