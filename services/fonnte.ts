type SendParams = { target: string; message: string }

const BASE_URL = "https://api.fonnte.com/send"

export async function sendFonnte(params: SendParams) {
  const token = process.env.FONNTE_API_TOKEN
  if (!token) {
    throw new Error("FONNTE_API_TOKEN not configured")
  }

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Fonnte error: ${text}`)
  }
  return res.json()
}
