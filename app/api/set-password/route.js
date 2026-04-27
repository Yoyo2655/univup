import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(request) {
  try {
    const { token, password } = await request.json()

    const { data: userData, error: otpError } = await supabaseAdmin.auth.verifyOtp({
      token_hash: token,
      type: 'invite'
    })

    if (otpError) return NextResponse.json({ error: otpError.message }, { status: 400 })
    if (!userData?.user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 400 })

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userData.user.id,
      { password }
    )

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 })

    return NextResponse.json({ success: true, email: userData.user.email })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}