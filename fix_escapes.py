import re

with open('script.js', 'r', encoding='utf-8') as f:
    data = f.read()

print(f"Before fix: {len(data)} chars")

# Fix 1: Replace double-escaped unicode \\uXXXX with actual Unicode characters
# \\u2122 -> ™, \\u2019 -> ', \\u2013 -> –, etc.
def replace_unicode(match):
    code = match.group(1)
    try:
        return chr(int(code, 16))
    except:
        return match.group(0)

# Fix \\\\uXXXX -> actual char  
data = re.sub(r'\\\\u([0-9a-fA-F]{4})', replace_unicode, data)

# Fix 2: Replace double-escaped apostrophes \\\\' -> '
# In JS string context: \\\' should become just ' (since we're inside single-quoted strings, 
# we need to use the actual apostrophe or proper escape)
# The pattern in the file is: name: 'Loki\\\\\'s Riches' which is broken
# Should be: name: "Loki's Riches"  or  name: 'Loki\\'s Riches' 
# Best approach: replace the game names containing apostrophes to use escaped apostrophe
data = data.replace("\\\\\\'", "\\'")

# Fix 3: Fix img URLs that have \\' in them (should be %27)
# e.g., img: '...Loki\\%27s...' -> leave as is, those are fine as URL encoding

# Fix 4: Remove remaining problematic characters from game names in URLs
# Some URLs have raw unicode chars which need URL encoding
# e.g., ™ in URLs should be %E2%84%A2

print(f"After fix: {len(data)} chars")

# Verify: count remaining issues
bad_apos = data.count("\\\\\\'")
bad_uni = len(re.findall(r'\\\\u[0-9a-fA-F]{4}', data))
print(f"Remaining double-escaped apostrophes: {bad_apos}")
print(f"Remaining double-escaped unicode: {bad_uni}")

with open('script.js', 'w', encoding='utf-8') as f:
    f.write(data)

print("Fixed script.js saved!")
