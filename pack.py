import os
import zipfile

# Files/folders to include
include = [
    "src", "public",
    "README.md", ".env.example",
    "package.json", "package-lock.json",
    "vite.config.ts", "tailwind.config.ts",
    "tsconfig.json", "drizzle.config.ts"
]

# Folders to ignore
exclude = {"node_modules", ".git", "dist", "__pycache__"}

with zipfile.ZipFile("UserAuthSystem-Gumroad-v1.0.0.zip", "w", zipfile.ZIP_DEFLATED) as zipf:
    for item in include:
        if os.path.isdir(item):
            for root, dirs, files in os.walk(item):
                dirs[:] = [d for d in dirs if d not in exclude]
                for file in files:
                    filepath = os.path.join(root, file)
                    arcname = os.path.relpath(filepath, ".")
                    zipf.write(filepath, arcname)
        elif os.path.isfile(item):
            zipf.write(item)

print("✅ Packaging complete: UserAuthSystem-Gumroad-v1.0.0.zip")
