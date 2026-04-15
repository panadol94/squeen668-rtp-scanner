import re

with open('script.js', 'r', encoding='utf-8') as f:
    data = f.read()

print(f'File length: {len(data)} chars')

# Find double-escaped apostrophes like \\' that should be just \'
bad_apos = data.count("\\\\\\'")
print(f"Double-escaped apostrophes (backslash-backslash-quote): {bad_apos}")

# Find double-escaped unicode like \\u2122 that should be \u2122 or the actual char
bad_uni = len(re.findall(r'\\\\u[0-9a-fA-F]{4}', data))
print(f"Double-escaped unicode sequences: {bad_uni}")

# Show first few problematic lines
lines = data.split('\n')
for i, line in enumerate(lines):
    if "\\\\\\" in line or "\\\\u" in line:
        if i < 100:  # Only show first 100 lines worth
            print(f"Line {i+1}: {line[:120]}")
