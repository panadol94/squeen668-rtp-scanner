import re

with open('script.js', 'r', encoding='utf-8') as f:
    data = f.read()

# Check for any name values with unescaped single quotes inside single-quoted strings
# Pattern: { name: '...X'...Y...' where X/Y breaks the string
lines = data.split('\n')
errors = []
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith("{ name: '"):
        # Extract the name value
        # Find the pattern: name: 'VALUE', img:
        match = re.search(r"name: '(.*?)', img:", stripped)
        if match:
            name = match.group(1)
            # Check if name contains unescaped single quote
            if "'" in name and "\\'" not in name:
                errors.append(f"Line {i+1}: Unescaped apostrophe in name: {name}")
        else:
            # Maybe the regex didn't match because of broken quotes
            if "name: '" in stripped:
                errors.append(f"Line {i+1}: Possible broken string: {stripped[:100]}")

if errors:
    print(f"Found {len(errors)} issues:")
    for e in errors[:20]:
        print(f"  {e}")
else:
    print("No unescaped apostrophe issues found!")
    
# Also check for broken img URL patterns
img_errors = []
for i, line in enumerate(lines):
    if "img: '" in line:
        # Check for raw unicode chars in img URLs that would break
        match = re.search(r"img: '([^']*)'", line)
        if match:
            url = match.group(1)
            # Check for non-ASCII in URLs (these should be URL-encoded)
            non_ascii = [c for c in url if ord(c) > 127]
            if non_ascii:
                img_errors.append(f"Line {i+1}: Non-ASCII chars in URL: {''.join(non_ascii[:5])}")

if img_errors:
    print(f"\nFound {len(img_errors)} URL issues:")
    for e in img_errors[:10]:
        print(f"  {e}")
else:
    print("\nNo URL issues found!")
