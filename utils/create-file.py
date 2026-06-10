import os

project_structure = {
    "app/(dashboard)": ["layout.tsx"],
    "app/(dashboard)/account": ["page.tsx"],
    "app/(dashboard)/my-orders": ["layout.tsx"],
    "app/(dashboard)/add-address": ["page.tsx"],
}

def create_project_structure(base_path="."):
    for folder, files in project_structure.items():
        folder_path = os.path.join(base_path, folder)
        os.makedirs(folder_path, exist_ok=True)
        print(f"Created folder: {folder_path}")

        for file in files:
            file_path = os.path.join(folder_path, file)
            os.makedirs(os.path.dirname(file_path), exist_ok=True)
            if not os.path.exists(file_path):
                with open(file_path, "w") as f:
                    f.write("")
                print(f"  Created file: {file_path}")
            else:                                          # ← moved inside the for loop
                print(f"  File already exists: {file_path}")

if __name__ == "__main__":
    create_project_structure(".")
    print("Project structure created!")