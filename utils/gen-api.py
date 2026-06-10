import os

# ================================================================
#  GEN-API — Drop at your Triviora project root
#  Scaffolds fully typed API routes matched to your habits pattern:
#  - getServerSession + session.user guard
#  - prisma ownership checks (userId)
#  - proper error handling + JSON parse guard
#  - async params unwrapping (Next.js 15 pattern)
# ================================================================

API_BASE = "app/api"

# ================================================================
#  TEMPLATES
# ================================================================

def collection_route_template(resource: str, model: str, has_groq: bool) -> str:
    groq_import = (
        '\nimport { fetchMotivationalContent, formatMotivational } from "@/lib/groq";'
        if has_groq else ""
    )
    groq_block = """
  // ── Optional: Groq enrichment on create ───────────────────
  // let initialContent: string[] = [];
  // try {{
  //   const results = await Promise.all([
  //     fetchMotivationalContent(name.trim(), "bible_verse"),
  //     fetchMotivationalContent(name.trim(), "bible_verse"),
  //     fetchMotivationalContent(name.trim(), "bible_verse"),
  //   ]);
  //   initialContent = results.map((r) => formatMotivational(r));
  // }} catch (err) {{
  //   console.error("Groq enrichment failed:", err);
  // }}
""" if has_groq else ""

    return f"""// {API_BASE}/{resource}/route.ts
// GET  /api/{{resource}}  — list all {{model}} records for the authenticated user
// POST /api/{{resource}}  — create a new {{model}}

import {{ NextRequest, NextResponse }} from "next/server";
import {{ getServerSession }} from "@/lib/get-session";
import {{ prisma }} from "@/lib/prisma";{groq_import}

// ── GET ──────────────────────────────────────────────────────
export async function GET(_req: NextRequest) {{
  const session = await getServerSession();
  if (!session?.user) {{
    return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
  }}

  try {{
    const items = await prisma.{model}.findMany({{
      where: {{ userId: session.user.id }},
      orderBy: {{ createdAt: "asc" }},
    }});

    return NextResponse.json(items);
  }} catch (err) {{
    console.error("[{resource.upper().replace("/", "_")}_GET]", err);
    return NextResponse.json({{ error: "Internal server error" }}, {{ status: 500 }});
  }}
}}

// ── POST ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {{
  const session = await getServerSession();
  if (!session?.user) {{
    return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
  }}

  let body: Record<string, unknown>;
  try {{
    body = await req.json();
  }} catch {{
    return NextResponse.json({{ error: "Invalid JSON body" }}, {{ status: 400 }});
  }}

  // TODO: validate with your zod schema, e.g.
  // const parsed = yourSchema.safeParse(body);
  // if (!parsed.success) return NextResponse.json({{ error: parsed.error.flatten() }}, {{ status: 422 }});

  const {{ name, description }} = body as {{ name?: string; description?: string }};

  if (!name?.trim()) {{
    return NextResponse.json({{ error: "Name is required" }}, {{ status: 400 }});
  }}
{groq_block}
  try {{
    const item = await prisma.{model}.create({{
      data: {{
        userId: session.user.id,
        name: name.trim(),
        description: description?.trim() ?? null,
        // TODO: add remaining fields from your schema
      }},
    }});

    return NextResponse.json(item, {{ status: 201 }});
  }} catch (err) {{
    console.error("[{resource.upper().replace("/", "_")}_POST]", err);
    return NextResponse.json({{ error: "Internal server error" }}, {{ status: 500 }});
  }}
}}
"""


def single_route_template(resource: str, model: str) -> str:
    return f"""// {API_BASE}/{resource}/[id]/route.ts
// GET    /api/{{resource}}/[id]  — fetch a single {{model}}
// PUT    /api/{{resource}}/[id]  — update a {{model}}'s fields
// DELETE /api/{{resource}}/[id]  — delete a {{model}}

import {{ NextRequest, NextResponse }} from "next/server";
import {{ getServerSession }} from "@/lib/get-session";
import {{ prisma }} from "@/lib/prisma";

type Params = {{ params: Promise<{{ id: string }}> }};

// ── GET ───────────────────────────────────────────────────────
export async function GET(_req: NextRequest, {{ params }}: Params) {{
  const {{ id }} = await params;
  const session  = await getServerSession();

  if (!session?.user) {{
    return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
  }}

  try {{
    const item = await prisma.{model}.findFirst({{
      where: {{ id, userId: session.user.id }},
    }});

    if (!item) {{
      return NextResponse.json({{ error: "{model} not found" }}, {{ status: 404 }});
    }}

    return NextResponse.json(item);
  }} catch (err) {{
    console.error("[{resource.upper().replace("/", "_")}_GET_ID]", err);
    return NextResponse.json({{ error: "Internal server error" }}, {{ status: 500 }});
  }}
}}

// ── PUT ───────────────────────────────────────────────────────
export async function PUT(req: NextRequest, {{ params }}: Params) {{
  const {{ id }} = await params;
  const session  = await getServerSession();

  if (!session?.user) {{
    return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
  }}

  // Verify ownership before touching data
  const existing = await prisma.{model}.findFirst({{
    where: {{ id, userId: session.user.id }},
  }});

  if (!existing) {{
    return NextResponse.json({{ error: "{model} not found" }}, {{ status: 404 }});
  }}

  let body: Record<string, unknown>;
  try {{
    body = await req.json();
  }} catch {{
    return NextResponse.json({{ error: "Invalid JSON body" }}, {{ status: 400 }});
  }}

  // TODO: validate with your zod schema

  const {{ name, description }} = body as {{ name?: string; description?: string }};

  try {{
    const updated = await prisma.{model}.update({{
      where: {{ id }},
      data: {{
        ...(name?.trim()           && {{ name: name.trim() }}),
        ...(description !== undefined && {{ description: description?.trim() ?? null }}),
        // TODO: spread remaining updatable fields
      }},
    }});

    return NextResponse.json(updated);
  }} catch (err) {{
    console.error("[{resource.upper().replace("/", "_")}_PUT]", err);
    return NextResponse.json({{ error: "Internal server error" }}, {{ status: 500 }});
  }}
}}

// ── DELETE ────────────────────────────────────────────────────
export async function DELETE(_req: NextRequest, {{ params }}: Params) {{
  const {{ id }} = await params;
  const session  = await getServerSession();

  if (!session?.user) {{
    return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
  }}

  // Verify ownership before deleting
  const existing = await prisma.{model}.findFirst({{
    where: {{ id, userId: session.user.id }},
  }});

  if (!existing) {{
    return NextResponse.json({{ error: "{model} not found" }}, {{ status: 404 }});
  }}

  try {{
    // Cascade deletes are handled by your Prisma schema relations
    await prisma.{model}.delete({{ where: {{ id }} }});

    return NextResponse.json({{ success: true }});
  }} catch (err) {{
    console.error("[{resource.upper().replace("/", "_")}_DELETE]", err);
    return NextResponse.json({{ error: "Internal server error" }}, {{ status: 500 }});
  }}
}}
"""


# ================================================================
#  HELPERS
# ================================================================

def to_camel_case(text: str) -> str:
    """'daily-notes' → 'dailyNotes'"""
    parts = text.replace("-", "_").split("_")
    return parts[0].lower() + "".join(p.capitalize() for p in parts[1:])

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

    print("\n⚡  Triviora — API Route Generator")
    print("─" * 44)
    print("  Examples : journal | daily-notes | body/workouts")
    print("─" * 44)

    raw_resource = input("\n  API resource name: ").strip().strip("/").lower()
    if not raw_resource:
        print("\n  ❌  No resource entered. Exiting.\n")
        return

    last_segment  = raw_resource.split("/")[-1]
    default_model = to_camel_case(last_segment)

    model_input  = input(f"\n  Prisma model name [{default_model}]: ").strip()
    prisma_model = model_input if model_input else default_model

    print("\n  Which routes do you want?")
    print("  [1] Collection only  — GET all + POST           (route.ts)")
    print("  [2] Single only      — GET + PUT + DELETE       ([id]/route.ts)")
    print("  [3] Both             — Full CRUD                (default)")
    choice = input("\n  Choice [1/2/3]: ").strip() or "3"

    if choice not in ("1", "2", "3"):
        print("\n  ❌  Invalid choice. Exiting.\n")
        return

    has_groq = False
    if choice in ("1", "3"):
        has_groq = prompt_yes_no("\n  Add Groq enrichment scaffold to POST?", default=False)

    collection_path = os.path.join(root, API_BASE, raw_resource, "route.ts")
    single_path     = os.path.join(root, API_BASE, raw_resource, "[id]", "route.ts")

    print(f"\n  📁  Base     : {API_BASE}/{raw_resource}/")
    print(f"  🔷  Model    : prisma.{prisma_model}")
    if choice in ("1", "3"):
        print(f"  📄  Collection : route.ts")
        print(f"      GET  /api/{raw_resource}")
        print(f"      POST /api/{raw_resource}")
    if choice in ("2", "3"):
        print(f"  📄  Single     : [id]/route.ts")
        print(f"      GET · PUT · DELETE /api/{raw_resource}/[id]")
    print()

    confirm = prompt_yes_no("Generate these files?")
    if not confirm:
        print("\n  Cancelled.\n")
        return

    print()
    created = 0

    if choice in ("1", "3"):
        created += create_file(
            collection_path,
            collection_route_template(raw_resource, prisma_model, has_groq),
            f"{API_BASE}/{raw_resource}/route.ts",
        )

    if choice in ("2", "3"):
        created += create_file(
            single_path,
            single_route_template(raw_resource, prisma_model),
            f"{API_BASE}/{raw_resource}/[id]/route.ts",
        )

    if created:
        print(f"\n✨  Done! API routes ready at /api/{raw_resource}\n")
    else:
        print("\n  Nothing new was created (all files already exist).\n")


if __name__ == "__main__":
    main()