import { getDriveClient } from '../../../../lib/google'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')

    if (!fileId) return NextResponse.json({ error: 'fileId requis' }, { status: 400 })

    const drive = getDriveClient()

    // Récupère les métadonnées
    const meta = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
    })

    // Récupère le contenu en base64
    const response = await drive.files.get(
      { fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    )

    const buffer = Buffer.from(response.data)
    const base64 = buffer.toString('base64')

    return NextResponse.json({
      name: meta.data.name,
      mimeType: meta.data.mimeType,
      data: base64,
    })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}