import os
import re

def scan_file_for_constants(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Skip if file already imports from shared.constants
        if 'from app.shared.constants import' in content:
            return None
            
        hardcoded_patterns = [
            (r'status_code=\s*(\d+)', 'HTTP status codes'),
            (r'HTTPException\([^)]*status_code\s*=\s*(\d+)', 'HTTPException status codes'),
            (r'"[A-Z][A-Z_]*"', 'Potential constants'),
            (r"'[A-Z][A-Z_]*'", 'Potential constants'),
        ]
        
        issues = []
        for pattern, desc in hardcoded_patterns:
            matches = re.findall(pattern, content)
            if matches:
                issues.append(f'{desc}: {len(matches)} instances')
        
        if issues:
            return issues
        return None
            
    except Exception as e:
        return None

# Scan API files
api_dirs = [
    'app/domains/admin/features/v1',
    'app/domains/provider/features/v1', 
    'app/domains/web/features/v1'
]

files_to_migrate = []
for api_dir in api_dirs:
    if os.path.exists(api_dir):
        for root, dirs, files in os.walk(api_dir):
            for file in files:
                if file == 'api.py':
                    file_path = os.path.join(root, file)
                    relative_path = file_path.replace('app/', '')
                    issues = scan_file_for_constants(file_path)
                    if issues:
                        files_to_migrate.append((relative_path, issues))

print('Files still needing migration:')
for file_path, issues in files_to_migrate:
    print(f'\n{file_path}:')
    for issue in issues:
        print(f'  - {issue}')

print(f'\nTotal files remaining: {len(files_to_migrate)}')