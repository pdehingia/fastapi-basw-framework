#!/usr/bin/env python3
"""
Constants Migration Scanner
Scans the codebase for hardcoded values that should be replaced with constants.
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Set

class ConstantsMigrationScanner:
    def __init__(self, root_path: str):
        self.root_path = Path(root_path)
        self.results = {
            'http_status_codes': [],
            'hardcoded_messages': [],
            'hardcoded_tags': [],
            'hardcoded_prefixes': [],
            'files_to_migrate': set()
        }
        
        # Patterns to search for
        self.patterns = {
            'status_codes': [
                r'status_code\s*=\s*(\d{3})',  # status_code=404
                r'HTTPException\([^)]*status_code\s*=\s*(\d{3})',  # HTTPException(..., status_code=404)
                r'Response\([^)]*status_code\s*=\s*(\d{3})',  # Response(..., status_code=201)
            ],
            'error_messages': [
                r'detail\s*=\s*["\']([^"\']+)["\']',  # detail="Error message"
                r'message\s*=\s*["\']([^"\']+)["\']',  # message="Error message"
                r'raise\s+\w+Exception\s*\(\s*["\']([^"\']+)["\']',  # raise ValueError("message")
            ],
            'api_tags': [
                r'tags\s*=\s*\[\s*["\']([^"\']+)["\']',  # tags=["Marketing"]
                r'@router\.[^(]*\([^)]*tags\s*=\s*\[\s*["\']([^"\']+)["\']',
            ],
            'api_prefixes': [
                r'prefix\s*=\s*["\']([^"\']+)["\']',  # prefix="/v1/marketing"
                r'@app\.include_router\([^)]*prefix\s*=\s*["\']([^"\']+)["\']',
            ]
        }
        
        # Common hardcoded values we want to replace
        self.target_status_codes = {'200', '201', '202', '204', '400', '401', '403', '404', '409', '422', '500', '503'}
        self.target_messages = {
            'database error occurred', 'invalid credentials', 'access denied',
            'not found', 'already exists', 'invalid input', 'unauthorized',
            'forbidden', 'internal server error', 'validation failed'
        }

    def should_scan_file(self, file_path: Path) -> bool:
        """Check if file should be scanned."""
        if not file_path.suffix == '.py':
            return False
        
        # Skip certain directories
        skip_dirs = {'__pycache__', '.git', 'venv', 'env', 'node_modules', 'migrations', 'alembic'}
        if any(part in skip_dirs for part in file_path.parts):
            return False
            
        # Skip test files and migration files for now
        if any(keyword in file_path.name for keyword in ['test_', '_test', 'migration', 'alembic']):
            return False
            
        return True

    def scan_file(self, file_path: Path) -> Dict:
        """Scan a single file for hardcoded values."""
        file_results = {
            'path': str(file_path.relative_to(self.root_path)),
            'issues': [],
            'line_count': 0
        }
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                file_results['line_count'] = len(lines)
                
            # Check for status codes
            for pattern in self.patterns['status_codes']:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    status_code = match.group(1)
                    if status_code in self.target_status_codes:
                        line_no = content[:match.start()].count('\n') + 1
                        file_results['issues'].append({
                            'type': 'status_code',
                            'value': status_code,
                            'line': line_no,
                            'context': lines[line_no - 1].strip() if line_no <= len(lines) else ''
                        })
                        
            # Check for hardcoded messages
            for pattern in self.patterns['error_messages']:
                matches = re.finditer(pattern, content, re.IGNORECASE)
                for match in matches:
                    message = match.group(1).lower()
                    if any(target in message for target in self.target_messages):
                        line_no = content[:match.start()].count('\n') + 1
                        file_results['issues'].append({
                            'type': 'error_message',
                            'value': match.group(1),
                            'line': line_no,
                            'context': lines[line_no - 1].strip() if line_no <= len(lines) else ''
                        })
                        
            # Check for API tags
            for pattern in self.patterns['api_tags']:
                matches = re.finditer(pattern, content)
                for match in matches:
                    line_no = content[:match.start()].count('\n') + 1
                    file_results['issues'].append({
                        'type': 'api_tag',
                        'value': match.group(1),
                        'line': line_no,
                        'context': lines[line_no - 1].strip() if line_no <= len(lines) else ''
                    })
                    
            # Check for API prefixes
            for pattern in self.patterns['api_prefixes']:
                matches = re.finditer(pattern, content)
                for match in matches:
                    prefix = match.group(1)
                    if prefix.startswith('/v') or 'api' in prefix.lower():
                        line_no = content[:match.start()].count('\n') + 1
                        file_results['issues'].append({
                            'type': 'api_prefix',
                            'value': prefix,
                            'line': line_no,
                            'context': lines[line_no - 1].strip() if line_no <= len(lines) else ''
                        })
                        
        except Exception as e:
            file_results['error'] = str(e)
            
        return file_results

    def scan_directory(self) -> Dict:
        """Scan entire directory tree."""
        print(f"🔍 Scanning {self.root_path} for hardcoded values...")
        
        scanned_files = 0
        files_with_issues = 0
        total_issues = 0
        
        for file_path in self.root_path.rglob('*.py'):
            if not self.should_scan_file(file_path):
                continue
                
            scanned_files += 1
            file_results = self.scan_file(file_path)
            
            if file_results['issues']:
                files_with_issues += 1
                total_issues += len(file_results['issues'])
                self.results['files_to_migrate'].add(file_results['path'])
                
                # Categorize issues
                for issue in file_results['issues']:
                    if issue['type'] == 'status_code':
                        self.results['http_status_codes'].append({
                            'file': file_results['path'],
                            'line': issue['line'],
                            'value': issue['value'],
                            'context': issue['context']
                        })
                    elif issue['type'] == 'error_message':
                        self.results['hardcoded_messages'].append({
                            'file': file_results['path'],
                            'line': issue['line'],
                            'value': issue['value'],
                            'context': issue['context']
                        })
                    elif issue['type'] == 'api_tag':
                        self.results['hardcoded_tags'].append({
                            'file': file_results['path'],
                            'line': issue['line'],
                            'value': issue['value'],
                            'context': issue['context']
                        })
                    elif issue['type'] == 'api_prefix':
                        self.results['hardcoded_prefixes'].append({
                            'file': file_results['path'],
                            'line': issue['line'],
                            'value': issue['value'],
                            'context': issue['context']
                        })
        
        print(f"✅ Scan complete!")
        print(f"📁 Files scanned: {scanned_files}")
        print(f"⚠️  Files with issues: {files_with_issues}")
        print(f"🔧 Total issues found: {total_issues}")
        
        return self.results

    def generate_report(self) -> str:
        """Generate a detailed migration report."""
        report = ["# Constants Migration Report\n"]
        
        # Summary
        report.append("## Summary")
        report.append(f"- **Files requiring migration**: {len(self.results['files_to_migrate'])}")
        report.append(f"- **HTTP Status Codes**: {len(self.results['http_status_codes'])} occurrences")
        report.append(f"- **Hardcoded Messages**: {len(self.results['hardcoded_messages'])} occurrences")
        report.append(f"- **API Tags**: {len(self.results['hardcoded_tags'])} occurrences")
        report.append(f"- **API Prefixes**: {len(self.results['hardcoded_prefixes'])} occurrences\n")
        
        # Files to migrate
        if self.results['files_to_migrate']:
            report.append("## Files Requiring Migration")
            for file_path in sorted(self.results['files_to_migrate']):
                report.append(f"- [ ] `{file_path}`")
            report.append("")
        
        # HTTP Status Codes
        if self.results['http_status_codes']:
            report.append("## HTTP Status Codes to Replace")
            status_counts = {}
            for item in self.results['http_status_codes']:
                status_counts[item['value']] = status_counts.get(item['value'], 0) + 1
            
            for status, count in sorted(status_counts.items()):
                replacement = self._get_status_replacement(status)
                report.append(f"- **{status}** ({count} occurrences) → `{replacement}`")
            
            report.append("\n### Details:")
            for item in self.results['http_status_codes'][:20]:  # Limit to first 20
                report.append(f"- `{item['file']}:{item['line']}` - `{item['context'][:80]}...`")
            if len(self.results['http_status_codes']) > 20:
                report.append(f"- ... and {len(self.results['http_status_codes']) - 20} more")
            report.append("")
        
        # Error Messages
        if self.results['hardcoded_messages']:
            report.append("## Error Messages to Replace")
            report.append("Common patterns found:")
            message_counts = {}
            for item in self.results['hardcoded_messages']:
                msg_lower = item['value'].lower()
                key = self._categorize_message(msg_lower)
                message_counts[key] = message_counts.get(key, 0) + 1
            
            for category, count in sorted(message_counts.items()):
                replacement = self._get_message_replacement(category)
                report.append(f"- **{category}** ({count} occurrences) → `{replacement}`")
            
            report.append("\n### Details:")
            for item in self.results['hardcoded_messages'][:15]:  # Limit to first 15
                report.append(f"- `{item['file']}:{item['line']}` - \"{item['value']}\"")
            if len(self.results['hardcoded_messages']) > 15:
                report.append(f"- ... and {len(self.results['hardcoded_messages']) - 15} more")
            report.append("")
        
        # API Tags
        if self.results['hardcoded_tags']:
            report.append("## API Tags to Replace")
            unique_tags = set(item['value'] for item in self.results['hardcoded_tags'])
            for tag in sorted(unique_tags):
                replacement = self._get_tag_replacement(tag)
                report.append(f"- `\"{tag}\"` → `{replacement}`")
            report.append("")
        
        # API Prefixes
        if self.results['hardcoded_prefixes']:
            report.append("## API Prefixes to Replace")
            unique_prefixes = set(item['value'] for item in self.results['hardcoded_prefixes'])
            for prefix in sorted(unique_prefixes):
                replacement = self._get_prefix_replacement(prefix)
                report.append(f"- `\"{prefix}\"` → `{replacement}`")
            report.append("")
        
        # Migration priority
        report.append("## Migration Priority")
        report.append("1. **High Priority** (API endpoints):")
        high_priority = [f for f in self.results['files_to_migrate'] if '/api.py' in f]
        for file_path in sorted(high_priority)[:10]:
            report.append(f"   - `{file_path}`")
        
        report.append("\n2. **Medium Priority** (Services and models):")
        medium_priority = [f for f in self.results['files_to_migrate'] 
                          if any(keyword in f for keyword in ['/service', '/model', '/schema']) 
                          and '/api.py' not in f]
        for file_path in sorted(medium_priority)[:10]:
            report.append(f"   - `{file_path}`")
        
        report.append("\n3. **Lower Priority** (Other files):")
        other_files = [f for f in self.results['files_to_migrate'] 
                      if f not in high_priority and f not in medium_priority]
        for file_path in sorted(other_files)[:10]:
            report.append(f"   - `{file_path}`")
        
        if len(other_files) > 10:
            report.append(f"   - ... and {len(other_files) - 10} more files")
        
        report.append("\n## Next Steps")
        report.append("1. Start with high-priority API files")
        report.append("2. Import constants: `from app.shared.constants import HTTP_STATUS_CODES, ERROR_MESSAGES, API_TAGS`")
        report.append("3. Replace hardcoded values systematically")
        report.append("4. Test each file after migration")
        report.append("5. Update related tests if needed")
        
        return "\n".join(report)

    def _get_status_replacement(self, status: str) -> str:
        """Get the constant replacement for a status code."""
        replacements = {
            '200': 'HTTP_STATUS_CODES.OK',
            '201': 'HTTP_STATUS_CODES.CREATED',
            '202': 'HTTP_STATUS_CODES.ACCEPTED',
            '204': 'HTTP_STATUS_CODES.NO_CONTENT',
            '400': 'HTTP_STATUS_CODES.BAD_REQUEST',
            '401': 'HTTP_STATUS_CODES.UNAUTHORIZED',
            '403': 'HTTP_STATUS_CODES.FORBIDDEN',
            '404': 'HTTP_STATUS_CODES.NOT_FOUND',
            '409': 'HTTP_STATUS_CODES.CONFLICT',
            '422': 'HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY',
            '500': 'HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR',
            '503': 'HTTP_STATUS_CODES.SERVICE_UNAVAILABLE'
        }
        return replacements.get(status, f'HTTP_STATUS_CODES.STATUS_{status}')

    def _categorize_message(self, message: str) -> str:
        """Categorize error message for replacement."""
        if 'database' in message and 'error' in message:
            return 'database_error'
        elif 'not found' in message:
            return 'not_found'
        elif 'invalid' in message and 'credential' in message:
            return 'invalid_credentials'
        elif 'access denied' in message or 'forbidden' in message:
            return 'access_denied'
        elif 'unauthorized' in message:
            return 'unauthorized'
        elif 'already exists' in message:
            return 'already_exists'
        elif 'invalid' in message:
            return 'invalid_input'
        elif 'validation' in message and 'failed' in message:
            return 'validation_failed'
        else:
            return 'generic_error'

    def _get_message_replacement(self, category: str) -> str:
        """Get the constant replacement for a message category."""
        replacements = {
            'database_error': 'ERROR_MESSAGES.DATABASE_ERROR',
            'not_found': 'ERROR_MESSAGES.RESOURCE_NOT_FOUND',
            'invalid_credentials': 'ERROR_MESSAGES.INVALID_CREDENTIALS',
            'access_denied': 'ERROR_MESSAGES.ACCESS_DENIED',
            'unauthorized': 'ERROR_MESSAGES.UNAUTHORIZED',
            'already_exists': 'ERROR_MESSAGES.ALREADY_EXISTS',
            'invalid_input': 'ERROR_MESSAGES.INVALID_INPUT',
            'validation_failed': 'ERROR_MESSAGES.VALIDATION_FAILED',
            'generic_error': 'ERROR_MESSAGES.INTERNAL_ERROR'
        }
        return replacements.get(category, 'ERROR_MESSAGES.INTERNAL_ERROR')

    def _get_tag_replacement(self, tag: str) -> str:
        """Get the constant replacement for an API tag."""
        tag_lower = tag.lower().replace(' ', '_').replace('-', '_')
        if 'marketing' in tag_lower:
            return 'API_TAGS.MARKETING'
        elif 'business' in tag_lower:
            return 'API_TAGS.BUSINESS'
        elif 'financial' in tag_lower or 'finance' in tag_lower:
            return 'API_TAGS.FINANCIAL'
        elif 'user' in tag_lower:
            return 'API_TAGS.USER_MANAGEMENT'
        elif 'provider' in tag_lower:
            return 'API_TAGS.PROVIDER_MANAGEMENT'
        elif 'admin' in tag_lower:
            return 'API_TAGS.ADMIN'
        else:
            return f'API_TAGS.{tag_lower.upper()}'

    def _get_prefix_replacement(self, prefix: str) -> str:
        """Get the constant replacement for an API prefix."""
        if prefix.startswith('/v1'):
            return 'API_PREFIXES.V1 + "' + prefix[3:] + '"'
        elif prefix.startswith('/api/v1'):
            return 'API_PREFIXES.API_V1 + "' + prefix[7:] + '"'
        elif '/admin' in prefix:
            return 'API_PREFIXES.ADMIN + "' + prefix.replace('/admin', '') + '"'
        else:
            return f'"{prefix}"  # TODO: Add to API_PREFIXES'


def main():
    """Main function to run the scanner."""
    if len(sys.argv) > 1:
        root_path = sys.argv[1]
    else:
        # Default to current directory or backend directory
        root_path = os.getcwd()
        if 'backend' not in root_path:
            backend_path = os.path.join(root_path, 'backend')
            if os.path.exists(backend_path):
                root_path = backend_path
    
    scanner = ConstantsMigrationScanner(root_path)
    results = scanner.scan_directory()
    
    # Generate and save report
    report = scanner.generate_report()
    
    report_file = os.path.join(root_path, 'CONSTANTS_MIGRATION_SCAN.md')
    with open(report_file, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"📋 Report saved to: {report_file}")
    
    # Also print summary to console
    print("\n" + "="*50)
    print("CONSTANTS MIGRATION SUMMARY")
    print("="*50)
    if results['files_to_migrate']:
        print(f"📁 Files needing migration: {len(results['files_to_migrate'])}")
        print(f"🔧 HTTP Status Codes: {len(results['http_status_codes'])}")
        print(f"💬 Error Messages: {len(results['hardcoded_messages'])}")
        print(f"🏷️  API Tags: {len(results['hardcoded_tags'])}")
        print(f"🔗 API Prefixes: {len(results['hardcoded_prefixes'])}")
        print(f"\n📋 Full report available at: {report_file}")
    else:
        print("✅ No hardcoded values found! All files appear to be using constants.")


if __name__ == "__main__":
    main()