'use client'
import { useState, useEffect } from 'react'
import { t } from '../../../lib/theme'

export default function BiblioPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState(process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID)
  const [breadcrumb, setBreadcrumb] = useState([{ id: process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID, name: 'Bibliothèque' }])
  const [viewerFile, setViewerFile] = useState(null)
  const [fileData, setFileData] = useState(null)
  const [fileMime, setFileMime] = useState(null)
  const [loadingFile, setLoadingFile] = useState(false)
  const [userName, setUserName] = useState('')
  const [canvases, setCanvases] = useState([])
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)

  useEffect(() => { fetchFolder(currentFolder) }, [currentFolder])

  useEffect(() => {
    async function getName() {
      const { supabase } = await import('../../../lib/supabase')
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase.from('users').select('full_name, email').eq('id', user.id).single()
        if (data) setUserName(`${data.full_name} · ${data.email}`)
      }
    }
    getName()
  }, [])

  async function fetchFolder(folderId) {
    setLoading(true)
    const res = await fetch(`/api/drive/list?folderId=${folderId}`)
    const data = await res.json()
    setItems(data.files || [])
    setLoading(false)
  }

  async function handleSearch(e) {
    e.preventDefault()
    if (!search.trim()) { fetchFolder(currentFolder); return }
    setLoading(true)
    setSearching(true)
    const res = await fetch(`/api/drive/list?search=${encodeURIComponent(search)}`)
    const data = await res.json()
    setItems(data.files || [])
    setLoading(false)
  }

  function clearSearch() {
    setSearch('')
    setSearching(false)
    fetchFolder(currentFolder)
  }

  function openFolder(id, name) {
    setCurrentFolder(id)
    setBreadcrumb(prev => [...prev, { id, name }])
  }

  function goToBreadcrumb(index) {
    const crumb = breadcrumb[index]
    setCurrentFolder(crumb.id)
    setBreadcrumb(prev => prev.slice(0, index + 1))
  }

  async function openFile(file) {
    setViewerFile(file)
    setLoadingFile(true)
    setFileData(null)
    setFileMime(null)
    setCanvases([])

    const res = await fetch(`/api/drive/file?fileId=${file.id}`)
    const data = await res.json()

    if (data.mimeType === 'application/pdf') {
      await renderPDF(data.data, data.mimeType)
    } else {
      setFileData(data.data)
      setFileMime(data.mimeType)
    }
    setLoadingFile(false)
  }

  async function renderPDF(base64, mime) {
    const pdfjsLib = (await import('pdfjs-dist/legacy/build/pdf.mjs')).default || await import('pdfjs-dist/legacy/build/pdf.mjs')
    pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    const pdf = await pdfjsLib.getDocument({ data: bytes }).promise
    const pages = []

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      await page.render({ canvasContext: ctx, viewport }).promise
      pages.push(canvas.toDataURL())
    }
    setCanvases(pages)
    setFileMime(mime)
  }

  function closeViewer() {
    setViewerFile(null)
    setFileData(null)
    setFileMime(null)
    setCanvases([])
  }

  function getIcon(mimeType) {
    if (mimeType === 'application/vnd.google-apps.folder') return '📁'
    if (mimeType === 'application/pdf') return '📄'
    if (mimeType?.includes('image')) return '🖼️'
    if (mimeType?.includes('video')) return '🎥'
    return '📎'
  }

  function formatSize(size) {
    if (!size) return ''
    const kb = parseInt(size) / 1024
    if (kb < 1024) return `${Math.round(kb)} Ko`
    return `${(kb / 1024).toFixed(1)} Mo`
  }

  const isImage = fileMime?.includes('image')
  const isPDF = fileMime === 'application/pdf'

  const s = {
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: `1px solid ${t.border}` },
    title: { fontSize: '18px', fontWeight: '600', color: t.text },
    content: { padding: '24px 28px' },
    card: { background: t.surface, border: `1px solid ${t.border}`, borderRadius: '12px', overflow: 'hidden' },
    item: { display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s' },
    modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', flexDirection: 'column', zIndex: 50 },
    modalHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', background: t.surface, borderBottom: `1px solid ${t.border}`, flexShrink: 0 },
  }

  return (
    <div style={{ color: t.text }}>
      <div style={s.topbar}>
        <h1 style={s.title}>Bibliothèque</h1>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un fichier…"
            style={{ padding: '7px 12px', background: t.surface2, border: `1px solid ${t.border2}`, borderRadius: '8px', color: t.text, fontSize: '13px', outline: 'none', width: '240px' }}
          />
          <button type="submit" style={{ padding: '7px 14px', background: t.purple, border: 'none', borderRadius: '8px', color: '#1a1228', fontSize: '13px', fontWeight: '500', cursor: 'pointer' }}>
            Chercher
          </button>
          {searching && (
            <button type="button" onClick={clearSearch} style={{ padding: '7px 14px', background: 'none', border: `1px solid ${t.border2}`, borderRadius: '8px', color: t.muted2, fontSize: '13px', cursor: 'pointer' }}>
              ✕ Effacer
            </button>
          )}
        </form>
      </div>

      <div style={s.content}>
        {!searching && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', fontSize: '13px' }}>
            {breadcrumb.map((crumb, i) => (
              <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {i > 0 && <span style={{ color: t.muted }}>›</span>}
                <span onClick={() => goToBreadcrumb(i)} style={{ color: i === breadcrumb.length - 1 ? t.text : t.purple, cursor: 'pointer', fontWeight: i === breadcrumb.length - 1 ? '500' : '400' }}>
                  {crumb.name}
                </span>
              </span>
            ))}
          </div>
        )}

        {searching && (
          <div style={{ fontSize: '13px', color: t.muted, marginBottom: '16px' }}>
            Résultats pour "<span style={{ color: t.text }}>{search}</span>"
          </div>
        )}

        <div style={s.card}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>Chargement…</div>
          ) : items.length === 0 ? (
            <div style={{ padding: '40px', textAlign: 'center', color: t.muted }}>
              {searching ? 'Aucun résultat.' : 'Dossier vide.'}
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                style={{ ...s.item, borderBottom: idx === items.length - 1 ? 'none' : `1px solid ${t.border}` }}
                onClick={() => item.mimeType === 'application/vnd.google-apps.folder' ? openFolder(item.id, item.name) : openFile(item)}
                onMouseEnter={e => e.currentTarget.style.background = t.surface2}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span style={{ fontSize: '20px' }}>{getIcon(item.mimeType)}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: '500', color: t.text }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: t.muted }}>
                    {new Date(item.modifiedTime).toLocaleDateString('fr-FR')}
                    {item.size && ` · ${formatSize(item.size)}`}
                  </div>
                </div>
                {item.mimeType !== 'application/vnd.google-apps.folder' && (
                  <span style={{ fontSize: '11px', color: t.purple }}>Ouvrir →</span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {viewerFile && (
        <div style={s.modal} onContextMenu={e => e.preventDefault()}>
          <div style={s.modalHeader}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: t.text }}>{viewerFile.name}</div>
            <button onClick={closeViewer} style={{ background: 'none', border: `1px solid ${t.border2}`, borderRadius: '8px', padding: '6px 12px', color: t.muted2, cursor: 'pointer', fontSize: '13px' }}>
              ✕ Fermer
            </button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px', gap: '12px', userSelect: 'none' }}>
            {loadingFile && (
              <div style={{ color: t.muted, padding: '60px' }}>Chargement du fichier…</div>
            )}

            {!loadingFile && isPDF && canvases.length > 0 && canvases.map((src, i) => (
              <div key={i} style={{ position: 'relative', maxWidth: '900px', width: '100%' }}>
                <img
                  src={src}
                  alt={`Page ${i + 1}`}
                  style={{ width: '100%', borderRadius: '6px', boxShadow: '0 4px 24px rgba(0,0,0,0.5)', display: 'block', pointerEvents: 'none' }}
                  draggable={false}
                />
              </div>
            ))}

            {!loadingFile && isPDF && canvases.length === 0 && (
              <div style={{ color: t.muted, padding: '40px' }}>Rendu en cours…</div>
            )}

            {!loadingFile && isImage && fileData && (
              <img
                src={`data:${fileMime};base64,${fileData}`}
                alt={viewerFile.name}
                style={{ maxWidth: '100%', maxHeight: '85vh', borderRadius: '8px', objectFit: 'contain', pointerEvents: 'none' }}
                draggable={false}
              />
            )}

            {!loadingFile && !isPDF && !isImage && fileData && (
              <div style={{ color: t.muted, padding: '60px', textAlign: 'center' }}>
                Ce type de fichier ne peut pas être prévisualisé.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}