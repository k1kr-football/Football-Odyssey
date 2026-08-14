import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    original = content

    # Simplify backgrounds
    content = re.sub(r'bg-\[\#121212\](?:/\d+)?', 'bg-[#050505]', content)
    content = re.sub(r'bg-neutral-900(?:/\d+)?', 'bg-[#0a0a0a]', content)
    content = re.sub(r'bg-neutral-950(?:/\d+)?', 'bg-black', content)
    content = re.sub(r'bg-\[\#1A1A1A\]', 'bg-[#0f0f0f]', content)
    content = re.sub(r'bg-\[\#080A09\]', 'bg-black', content)
    content = re.sub(r'bg-\[\#0E0E0E\]', 'bg-black', content)

    # Remove gradients entirely
    content = re.sub(r'bg-gradient-to-[a-z]+\s*', '', content)
    content = re.sub(r'from-\[[^\]]+\]\s*', '', content)
    content = re.sub(r'to-\[[^\]]+\]\s*', '', content)
    content = re.sub(r'via-\[[^\]]+\]\s*', '', content)
    content = re.sub(r'from-[a-z]+-\d+(?:/\d+)?\s*', '', content)
    content = re.sub(r'to-[a-z]+-\d+(?:/\d+)?\s*', '', content)
    content = re.sub(r'via-[a-z]+-\d+(?:/\d+)?\s*', '', content)

    # Make borders cleaner
    content = re.sub(r'border-white/10', 'border-[#222]', content)
    content = re.sub(r'border-white/20', 'border-[#333]', content)
    content = re.sub(r'border-white/5', 'border-[#111]', content)
    content = re.sub(r'border-\[\#252525\]', 'border-[#222]', content)

    # Remove extreme border radiuses (keep simple ones or none)
    content = re.sub(r'rounded-2xl\s*', '', content)
    content = re.sub(r'rounded-3xl\s*', '', content)
    content = re.sub(r'rounded-xl\s*', '', content)
    content = re.sub(r'rounded-lg\s*', '', content)
    content = re.sub(r'rounded-md\s*', '', content)
    # We will let small radiuses stay, but the global CSS `button { border-radius: 0 !important; }` handles buttons.
    # For layout containers, let's just make sure they are square.

    # Remove shadows
    content = re.sub(r'shadow-2xl\s*', '', content)
    content = re.sub(r'shadow-xl\s*', '', content)
    content = re.sub(r'shadow-lg\s*', '', content)
    content = re.sub(r'shadow-md\s*', '', content)
    content = re.sub(r'shadow-[a-z]+-\d+(?:/\d+)?\s*', '', content)
    
    # Remove blurs
    content = re.sub(r'backdrop-blur-[a-z]+\s*', '', content)
    content = re.sub(r'backdrop-blur\s*', '', content)

    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        return True
    return False

modified_count = 0
for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith('.tsx'):
            filepath = os.path.join(root, file)
            if process_file(filepath):
                modified_count += 1

print(f"Modified {modified_count} files.")
