#!/usr/bin/env python3
"""
Auto-fix common TypeScript/Next.js errors in a VoraCart project.
Run this script from the project root.

Fixes:
1. Missing React import in .tsx files with JSX
2. Replace : JSX.Element return type with React.JSX.Element or remove it
3. Add missing 'useCallback' import in React components that use it
4. Convert API route params to Next.js 15+ Promise signature
5. Change ZodError .errors to .issues
6. Fix Prisma product selection (sellerId -> seller: { select: { id } })
7. Add missing Prisma import in API routes
8. Add optional chaining for stats?.pendingApplications etc.
"""

import os
import re
import shutil
from pathlib import Path
from typing import List, Tuple

# Configuration
PROJECT_ROOT = Path.cwd()
BACKUP_SUFFIX = ".backup"

# Patterns and replacements
FIXES = []

# Fix 1: Add React import if missing and file contains JSX
FIXES.append({
    "name": "Add React import",
    "file_pattern": r".*\.tsx$",
    "condition": lambda content: "import React" not in content and re.search(r"<[A-Za-z][^>]*>", content),
    "apply": lambda content: "import React from 'react';\n" + content,
})

# Fix 2: Replace : JSX.Element return type with nothing (or React.JSX.Element)
FIXES.append({
    "name": "Fix JSX.Element return type",
    "file_pattern": r".*\.tsx$",
    "condition": lambda content: ": JSX.Element" in content,
    "apply": lambda content: re.sub(r":\s*JSX\.Element", "", content),  # remove annotation
})

# Fix 3: Add useCallback import
FIXES.append({
    "name": "Add useCallback import",
    "file_pattern": r".*\.tsx$",
    "condition": lambda content: "useCallback(" in content and "useCallback" not in content,
    "apply": lambda content: content.replace(
        "import { ", "import { useCallback, "
    ).replace(
        "import React, { ", "import React, { useCallback, "
    ),
})

# Fix 4: API route params to Promise
FIXES.append({
    "name": "Fix API route params (Next.js 15+)",
    "file_pattern": r"app/api/.*/route\.ts$",
    "condition": lambda content: re.search(r"{\s*params\s*}\s*:\s*{\s*params\s*:\s*{\s*\w+\s*:\s*string\s*}\s*}", content),
    "apply": lambda content: re.sub(
        r"{\s*params\s*}\s*:\s*{\s*params\s*:\s*{\s*(\w+)\s*:\s*string\s*}\s*}",
        r"{ params }: { params: Promise<{ \1: string }> }",
        content
    ),
})

# Fix 5: ZodError .errors -> .issues
FIXES.append({
    "name": "Fix ZodError property",
    "file_pattern": r".*\.ts$",
    "condition": lambda content: "error.errors[0]" in content,
    "apply": lambda content: content.replace("error.errors[0]", "error.issues[0]"),
})

# Fix 6: Fix Prisma select for sellerId
FIXES.append({
    "name": "Fix Prisma sellerId selection",
    "file_pattern": r".*\.ts$",
    "condition": lambda content: "sellerId: true" in content,
    "apply": lambda content: re.sub(
        r"select:\s*\{\s*name:\s*true,\s*image:\s*true,\s*sellerId:\s*true\s*\}",
        "select: { name: true, image: true, seller: { select: { id: true } } }",
        content
    ),
})

# Fix 7: Add Prisma import
FIXES.append({
    "name": "Add Prisma import",
    "file_pattern": r"app/api/.*\.ts$",
    "condition": lambda content: "Prisma." in content and "from '@prisma/client'" not in content,
    "apply": lambda content: "import { Prisma } from '@prisma/client';\n" + content,
})

# Fix 8: Add optional chaining for stats properties (admin page)
FIXES.append({
    "name": "Fix stats optional chaining",
    "file_pattern": r"app/\(admin\)/admin/page\.tsx$",
    "condition": lambda content: "stats.pendingApplications" in content and "stats?.pendingApplications" not in content,
    "apply": lambda content: content.replace("stats.pendingApplications", "stats?.pendingApplications").replace("stats.pendingOrders", "stats?.pendingOrders"),
})

def backup_file(file_path: Path) -> None:
    """Create a backup of the file."""
    backup_path = file_path.with_suffix(file_path.suffix + BACKUP_SUFFIX)
    shutil.copy2(file_path, backup_path)
    print(f"  Backup created: {backup_path}")

def apply_fix(file_path: Path, fix: dict) -> bool:
    """Apply a fix to a file, return True if changed."""
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            original = f.read()
        if not fix["condition"](original):
            return False
        new_content = fix["apply"](original)
        if new_content == original:
            return False
        backup_file(file_path)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(new_content)
        print(f"  ✓ Applied fix: {fix['name']} in {file_path}")
        return True
    except Exception as e:
        print(f"  ✗ Failed to apply {fix['name']} to {file_path}: {e}")
        return False

def main():
    print("🔧 Starting VoraCart auto-fixer...")
    print(f"Project root: {PROJECT_ROOT}\n")
    files_processed = 0
    fixes_applied = 0

    # Walk through all .ts and .tsx files
    for ext in ["*.tsx", "*.ts"]:
        for file_path in PROJECT_ROOT.rglob(ext):
            # Skip node_modules, .next, build folders
            if any(part in file_path.parts for part in ["node_modules", ".next", "out", "build"]):
                continue
            files_processed += 1
            for fix in FIXES:
                if re.match(fix["file_pattern"], str(file_path.relative_to(PROJECT_ROOT))):
                    if apply_fix(file_path, fix):
                        fixes_applied += 1

    print(f"\n✅ Done! Processed {files_processed} files, applied {fixes_applied} fixes.")
    print("⚠️ Please review changes and run `npm run build` to verify.")

if __name__ == "__main__":
    main()