import { NextRequest, NextResponse } from "next/server"
import { enforceSameOrigin } from "@/utils/csrf"

export async function POST(request: NextRequest) {
  const csrf = enforceSameOrigin(request)
  if (csrf) return csrf

  const body = await request.json()
  const { target, template, variables } = body || {}

  if (!target || !template) {
    return NextResponse.json({ ok: false, error: { code: "VALIDATION_ERROR", message: "target dan template wajib" } }, { status: 400 })
  }

  const rendered = template.replace(/\{\{(\w+)\}\}/g, (_, key) => variables?.[key] ?? "")

  return NextResponse.json({
    ok: true,
    data: {
      target,
      message: rendered,
    },
  })
}
