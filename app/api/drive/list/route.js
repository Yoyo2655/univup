import { getDriveClient } from '../../../../lib/google'
import { NextResponse } from 'next/server'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')
    const search = searchParams.get('search')

    const drive = getDriveClient()

    let query
    if (search) {
      query = `name contains '${search}' and trashed = false and mimeType != 'application/vnd.google-apps.folder'`
    } else if (folderId) {
      query = `'${folderId}' in parents and trashed = false`
    } else {
      query = `trashed = false`
    }

    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, size, modifiedTime, parents)',
      orderBy: 'modifiedTime desc',
      pageSize: 100,
    })

    return NextResponse.json({ files: response.data.files })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}