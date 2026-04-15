import os
from datetime import datetime

# ================================================================
#  CONTEXT BUILDER — Drop at your Next.js project root
#  Bundles selected files + folder structure into one AI-ready file
# ================================================================

OUTPUT_FILE = "ai-context.txt"   # The file you'll paste into Claude / ChatGPT / etc.

# ----------------------------------------------------------------
#  STEP 1 — Pick the files whose FULL CONTENT you want included
#  Paths are relative to this script (your project root)
# ----------------------------------------------------------------
FILES_TO_INCLUDE = [
    "app/(main)/dashboard/page.tsx",
    "app/(main)/habits/page.tsx",
    "components/habits/HabitsClient.tsx",
    "lib/auth.ts",
    "lib/prisma.ts",

    # "prisma/schema.prisma",
    # "app/api/habits/route.ts",
    # "app/(main)/spirit/journal/page.tsx",
]

# ----------------------------------------------------------------
#  STEP 2 — Pick folders whose TREE STRUCTURE you want included
#  (no file contents, just the visual tree — good for giving AI
#   a map of the project without overwhelming it)
# ----------------------------------------------------------------
FOLDERS_TO_MAP = [
    "app",
    "components",
    "lib",

    # Add or remove folders below as needed:
    # "prisma",
    # "types",
    # "utils",
]

# ----------------------------------------------------------------
#  STEP 3 — Optional: add a plain-text note at the top of the
#  output to give the AI context about what you need help with
# ----------------------------------------------------------------
YOUR_REQUEST = """
I need help with the dashboard page and habits page, go through them
"""

# ================================================================
#  CORE LOGIC — No need to edit below this line
# ================================================================

EXCLUDED_DIRS = {
    "node_modules", ".next", ".git", ".turbo", "dist",
    "build", "out", ".cache", ".vercel", "__pycache__",
}

def build_tree(root_path: str, prefix: str = "") -> list[str]:
    lines = []
    try:
        entries = sorted(os.listdir(root_path))
    except PermissionError:
        return [prefix + "[permission denied]"]

    dirs  = [e for e in entries if os.path.isdir(os.path.join(root_path, e))  and e not in EXCLUDED_DIRS and not e.startswith(".")]
    files = [e for e in entries if os.path.isfile(os.path.join(root_path, e))]

    all_entries = files + dirs
    for i, entry in enumerate(all_entries):
        is_last   = i == len(all_entries) - 1
        connector = "└── " if is_last else "├── "
        lines.append(prefix + connector + entry)
        if os.path.isdir(os.path.join(root_path, entry)):
            extension = "    " if is_last else "│   "
            lines.extend(build_tree(os.path.join(root_path, entry), prefix + extension))

    return lines

def read_file(path: str) -> str:
    try:
        with open(path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return f"[ERROR] File not found: {path}"
    except Exception as e:
        return f"[ERROR] Could not read file: {e}"

def get_extension(path: str) -> str:
    ext = os.path.splitext(path)[1].lstrip(".")
    mapping = {
        "ts": "typescript", "tsx": "typescriptreact",
        "js": "javascript",  "jsx": "javascriptreact",
        "py": "python",      "prisma": "prisma",
        "css": "css",        "json": "json",
        "md": "markdown",    "sh": "bash",
        "sql": "sql",        "env": "bash",
    }
    return mapping.get(ext, ext or "text")

def divider(char="=", width=64):
    return char * width

def main():
    root = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(root, OUTPUT_FILE)
    lines = []

    # ── Header ────────────────────────────────────────────────
    lines.append(divider())
    lines.append("  AI CONTEXT SNAPSHOT")
    lines.append(f"  Project : {os.path.basename(root)}")
    lines.append(f"  Built   : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(divider())
    lines.append("")

    # ── Your request / question ────────────────────────────────
    if YOUR_REQUEST.strip():
        lines.append("── YOUR REQUEST " + "─" * 49)
        lines.append(YOUR_REQUEST.strip())
        lines.append("")

    # ── Folder trees ──────────────────────────────────────────
    if FOLDERS_TO_MAP:
        lines.append("── FOLDER STRUCTURE " + "─" * 45)
        lines.append("")
        for folder in FOLDERS_TO_MAP:
            folder_path = os.path.join(root, folder)
            if os.path.isdir(folder_path):
                lines.append(f"{folder}/")
                lines.extend(build_tree(folder_path))
                lines.append("")
            else:
                lines.append(f"[WARNING] Folder not found: {folder}")
                lines.append("")

    # ── File contents ─────────────────────────────────────────
    if FILES_TO_INCLUDE:
        lines.append("── FILE CONTENTS " + "─" * 48)
        lines.append("")
        for rel_path in FILES_TO_INCLUDE:
            abs_path = os.path.join(root, rel_path)
            lang     = get_extension(rel_path)
            content  = read_file(abs_path)

            lines.append(f"### {rel_path}")
            lines.append(f"```{lang}")
            lines.append(content)
            lines.append("```")
            lines.append("")

    # ── Footer ────────────────────────────────────────────────
    lines.append(divider())
    lines.append(f"  {len(FILES_TO_INCLUDE)} file(s) included  |  {len(FOLDERS_TO_MAP)} folder tree(s) included")
    lines.append(divider())

    # ── Write output ──────────────────────────────────────────
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))

    print(f"\n✅ Context file built!")
    print(f"   📄 Output : {OUTPUT_FILE}")
    print(f"   📂 Folders: {len(FOLDERS_TO_MAP)} tree(s) mapped")
    print(f"   🗒  Files  : {len(FILES_TO_INCLUDE)} file(s) included")
    print(f"\n   👉 Open '{OUTPUT_FILE}' and paste its contents into your AI chat.\n")

if __name__ == "__main__":
    main()