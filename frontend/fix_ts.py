import os
import re

def fix_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # The corrupted pattern looks like:
    # {Boolean(some_var) {some_var && ({some_var && ( (
    # We want to replace it with:
    # {Boolean(some_var) && (
    
    # Pattern to match {Boolean(...) followed by anything up to a trailing '(' which precedes a newline or spaces
    # It's safer to just match {Boolean(...) and everything until the end of the line, and replace the whole line.
    lines = content.split('\n')
    for i in range(len(lines)):
        if '{Boolean(' in lines[i]:
            # extract the variable name
            match = re.search(r'\{Boolean\((.*?)\)', lines[i])
            if match:
                var = match.group(1)
                
                if '<span' in lines[i]:
                     # It's an inline span case like: {Boolean(m.lab_required) {m.lab_required && <span...
                     # We want: {Boolean(m.lab_required) && <span...
                     lines[i] = re.sub(r'\{Boolean\(.*?\).*?<span', f'{{Boolean({var}) && <span', lines[i])
                elif lines[i].strip().endswith('('):
                     # Replace the entire line from {Boolean(...) to the end with {Boolean(var) && (
                     lines[i] = re.sub(r'\{Boolean\(.*?\).*?$', f'{{Boolean({var}) && (', lines[i])

    with open(filepath, 'w') as f:
        f.write('\n'.join(lines))

for root, _, files in os.walk('./src'):
    for file in files:
        if file.endswith('.tsx'):
            fix_file(os.path.join(root, file))

