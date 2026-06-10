import os

# ================================================================
#  GEN-PAGE — Drop at your Triviora project root
#  Generates a server page.tsx + named client component export
#  Matches your exact habits / dashboard patterns
# ================================================================

MAIN_GROUP = "app/(main)"

# ================================================================
#  TEMPLATES
# ================================================================

def page_template(
    route: str,
    component_name: str,
    client_import_path: str,
    needs_db: bool,
) -> str:
    db_import      = '\nimport { prisma } from "@/lib/prisma";' if needs_db else ""
    dynamic_export = '\nexport const dynamic = "force-dynamic"; // always fresh data\n' if needs_db else ""
    user_id_line   = "\n  const userId = session.user.id;\n" if needs_db else ""

    db_fetch_block = """
  // ── Fetch data ────────────────────────────────────────────
  // TODO: add your prisma queries here, e.g.
  // const items = await prisma.yourModel.findMany({
  //   where: { userId },
  //   orderBy: { createdAt: "asc" },
  // });
""" if needs_db else ""

    props_comment = (
        "      // initialItems={items}  // TODO: uncomment when ready"
        if needs_db else ""
    )

    return f"""// {MAIN_GROUP}/{route}/page.tsx
// Server component — fetches initial data server-side for fast first paint,
// then passes to {component_name}Client for all interactive behaviour.

import {{ redirect }} from "next/navigation";
import {{ getServerSession }} from "@/lib/get-session";{db_import}
import {{ {component_name}Client }} from "@/components/{client_import_path}";
{dynamic_export}
export default async function {component_name}Page() {{
  const session = await getServerSession();

  if (!session?.user) redirect("/auth/sign-in");
{user_id_line}{db_fetch_block}
  const userName = session.user.name ?? session.user.email ?? "Friend";

  return (
    <{component_name}Client
      userName={{userName}}
{props_comment}
    />
  );
}}
"""


def client_template(component_name: str) -> str:
    return f""""use client";

import {{ useState }} from "react";
import {{ motion, AnimatePresence }} from "framer-motion";

// ----------------------------------------------------------------
//  Types
// ----------------------------------------------------------------

interface {component_name}ClientProps {{
  userName: string;
  // initialItems: YourType[];  // TODO: uncomment and type when ready
}}

// ----------------------------------------------------------------
//  Component
// ----------------------------------------------------------------

export function {component_name}Client({{
  userName,
  // initialItems,
}}: {component_name}ClientProps) {{
  const firstName = userName.split(" ")[0];
  const [apiError, setApiError] = useState<string | null>(null);

  // TODO: add your state here
  // const [items, setItems] = useState(initialItems);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {{/* Header */}}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Good day, {{firstName}}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {{new Date().toLocaleDateString("en-US", {{
                weekday: "long",
                month: "long",
                day: "numeric",
              }})}}
            </p>
          </div>
        </div>

        {{/* Error banner */}}
        <AnimatePresence>
          {{apiError && (
            <motion.div
              initial={{{{ opacity: 0, height: 0 }}}}
              animate={{{{ opacity: 1, height: "auto" }}}}
              exit={{{{ opacity: 0, height: 0 }}}}
              className="flex items-center justify-between rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium"
            >
              <p>⚠ {{apiError}}</p>
              <button
                onClick={{() => setApiError(null)}}
                className="underline text-xs ml-4"
              >
                Dismiss
              </button>
            </motion.div>
          )}}
        </AnimatePresence>

        {{/* TODO: build your UI here */}}
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            {component_name} — start building here.
          </p>
        </div>

      </div>
    </div>
  );
}}
"""


# ================================================================
#  HELPERS
# ================================================================

def to_pascal_case(text: str) -> str:
    """'mind/daily-notes' → 'MindDailyNotes'"""
    return "".join(
        p.capitalize()
        for p in text.replace("/", "-").replace("_", "-").split("-")
        if p
    )

def create_file(path: str, content: str, label: str) -> bool:
    if os.path.exists(path):
        print(f"  ⚠️  Already exists — skipped : {label}")
        return False
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✅ Created : {label}")
    return True

def prompt_yes_no(question: str, default: bool = True) -> bool:
    hint = "[Y/n]" if default else "[y/N]"
    raw  = input(f"  {question} {hint}: ").strip().lower()
    return default if not raw else raw in ("y", "yes")


# ================================================================
#  MAIN
# ================================================================

def main():
    root = os.path.dirname(os.path.abspath(__file__))

    print("\n🚀  Triviora — Page Generator")
    print("─" * 44)
    print(f"  Routes land in : {MAIN_GROUP}/")
    print("  Examples       : dashboard | mind/focus | spirit/journal")
    print("─" * 44)

    raw = input("\n  Route path: ").strip().strip("/")
    if not raw:
        print("\n  ❌  No route entered. Exiting.\n")
        return

    component_name  = to_pascal_case(raw)
    folder_slug     = raw.replace("_", "-")
    component_slug  = raw.replace("/", "-").replace("_", "-").lower()
    client_import   = f"{component_slug}/{component_slug}-client"

    page_path   = os.path.join(root, MAIN_GROUP, folder_slug, "page.tsx")
    client_path = os.path.join(root, "components", component_slug, f"{component_slug}-client.tsx")

    print(f"\n  📄  Page      : {MAIN_GROUP}/{folder_slug}/page.tsx")
    print(f"  🧩  Component : components/{client_import}.tsx")
    print()

    needs_db = prompt_yes_no("Include Prisma data fetching in the server page?")
    print()
    confirm  = prompt_yes_no("Generate these files?")
    if not confirm:
        print("\n  Cancelled.\n")
        return

    print()
    created  = create_file(page_path,   page_template(folder_slug, component_name, client_import, needs_db), f"{MAIN_GROUP}/{folder_slug}/page.tsx")
    created += create_file(client_path, client_template(component_name), f"components/{client_import}.tsx")

    if created:
        print(f"\n✨  Done! New route ready at /{folder_slug}\n")
    else:
        print("\n  Nothing new was created (all files already exist).\n")


if __name__ == "__main__":
    main()