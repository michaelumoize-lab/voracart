import os
import json
from datetime import datetime

# ============================================================
#  CONFIGURATION — Edit this section to suit your project
# ============================================================

OUTPUT_FILE = "project-structure.json"   # Output filename (use .json or .txt)

# Folders to skip entirely (won't appear in the output at all)
EXCLUDED_DIRS = {
    "node_modules",
    ".next",
    ".git",
    ".turbo",
    "dist",
    "build",
    "out",
    ".cache",
    "coverage",
    "__pycache__",
    ".vercel",
    ".husky",
}

# File extensions to skip
EXCLUDED_EXTENSIONS = {
    ".lock",     # package-lock.json, yarn.lock, etc.
    ".log",
    ".map",      # source maps
}
# Specific filenames to skip (exact match)
EXCLUDED_FILES = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
    ".env.local",
    ".env.production",
}

# ============================================================
#  CORE LOGIC — No need to edit below this line
# ============================================================

def should_exclude_dir(dirname: str) -> bool:
    return dirname in EXCLUDED_DIRS or dirname.startswith(".")

def should_exclude_file(filename: str) -> bool:
    if filename in EXCLUDED_FILES:
        return True
    _, ext = os.path.splitext(filename)
    if ext in EXCLUDED_EXTENSIONS:
        return True
    return False

def build_tree(root_path: str) -> dict:
    """Recursively builds a nested dict representing the folder structure."""
    tree = {}

    try:
        entries = sorted(os.listdir(root_path))
    except PermissionError:
        return {"__error__": "Permission denied"}

    dirs = []
    files = []

    for entry in entries:
        full_path = os.path.join(root_path, entry)
        if os.path.isdir(full_path):
            if not should_exclude_dir(entry):
                dirs.append(entry)
        elif os.path.isfile(full_path):
            if not should_exclude_file(entry):
                files.append(entry)

    # Files come first, then folders (mirrors VS Code explorer style)
    if files:
        tree["__files__"] = files

    for d in dirs:
        subtree = build_tree(os.path.join(root_path, d))
        tree[d] = subtree

    return tree

def build_flat_list(root_path: str, prefix: str = "") -> list[str]:
    """Returns a flat list of relative file paths (tree-style)."""
    lines = []

    try:
        entries = sorted(os.listdir(root_path))
    except PermissionError:
        return [prefix + "[permission denied]"]

    dirs = [e for e in entries if os.path.isdir(os.path.join(root_path, e)) and not should_exclude_dir(e)]
    files = [e for e in entries if os.path.isfile(os.path.join(root_path, e)) and not should_exclude_file(e)]

    all_entries = files + dirs  # files first
    for i, entry in enumerate(all_entries):
        is_last = i == len(all_entries) - 1
        connector = "└── " if is_last else "├── "
        lines.append(prefix + connector + entry)

        full_path = os.path.join(root_path, entry)
        if os.path.isdir(full_path):
            extension = "    " if is_last else "│   "
            lines.extend(build_flat_list(full_path, prefix + extension))

    return lines

def count_stats(tree: dict) -> tuple[int, int]:
    """Counts total files and folders in the nested tree."""
    files = len(tree.get("__files__", []))
    folders = 0
    for key, val in tree.items():
        if key != "__files__" and isinstance(val, dict):
            folders += 1
            sub_files, sub_folders = count_stats(val)
            files += sub_files
            folders += sub_folders
    return files, folders

def save_as_json(tree: dict, output_path: str, root_name: str):
    stats_files, stats_folders = count_stats(tree)
    output = {
        "meta": {
            "project": root_name,
            "generated_at": datetime.now().isoformat(timespec="seconds"),
            "total_files": stats_files,
            "total_folders": stats_folders,
            "excluded_dirs": sorted(EXCLUDED_DIRS),
            "excluded_extensions": sorted(EXCLUDED_EXTENSIONS),
            "excluded_files": sorted(EXCLUDED_FILES),
        },
        "structure": tree,
    }
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2)

def save_as_txt(flat_lines: list[str], output_path: str, root_name: str, stats_files: int, stats_folders: int):
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(f"Project Structure — {root_name}\n")
        f.write(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"Files: {stats_files}  |  Folders: {stats_folders}\n")
        f.write("=" * 60 + "\n\n")
        f.write(root_name + "/\n")
        for line in flat_lines:
            f.write(line + "\n")

def main():
    root = os.path.dirname(os.path.abspath(__file__))  # same dir as this script
    root_name = os.path.basename(root)
    output_path = os.path.join(root, OUTPUT_FILE)
    _, ext = os.path.splitext(OUTPUT_FILE)

    print(f"📁 Scanning: {root}")
    print(f"⏳ Building structure...")

    tree = build_tree(root)
    stats_files, stats_folders = count_stats(tree)

    if ext == ".json":
        save_as_json(tree, output_path, root_name)
    else:
        flat_lines = build_flat_list(root)
        save_as_txt(flat_lines, output_path, root_name, stats_files, stats_folders)

    print(f"\n✅ Done!")
    print(f"   📄 Output : {OUTPUT_FILE}")
    print(f"   📂 Folders: {stats_folders}")
    print(f"   🗒  Files  : {stats_files}")

if __name__ == "__main__":
    main()