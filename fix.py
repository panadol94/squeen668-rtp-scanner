import re

with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Add resetIdError function if not exists
if 'function resetIdError()' not in content:
    content += '\nfunction resetIdError() {\n    var el = document.getElementById("inputIdWrapper");\n    if(el) el.classList.remove("error");\n    var msg = document.getElementById("idErrorMsg");\n    if(msg) msg.style.display = "none";\n}\n'

# Fix the modal provider button img fallback
content = content.replace(
    '''onerror="this.style.display='none'"''',
    '''onerror="this.src=window.getFallbackImage('" + p.name + "')"'''
)

# Update startScan error class handling
content = content.replace(
    "input.classList.add('error');",
    "document.getElementById('inputIdWrapper').classList.add('error');"
)
content = content.replace(
    "input.classList.remove('error');",
    "document.getElementById('inputIdWrapper').classList.remove('error');"
)

# Update icon UI setter
content = content.replace(
    '''icon.innerHTML = '<img src="' + p.logo + '" style="max-width:100%;max-height:100%;object-fit:contain;" />';''',
    '''icon.innerHTML = '<img src="' + p.logo + '" onerror="this.src=window.getFallbackImage(\\'' + p.name + '\\')" style="max-width:100%;max-height:100%;object-fit:cover; border-radius: 8px;" />';'''
)

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated script.js UI logic.')
