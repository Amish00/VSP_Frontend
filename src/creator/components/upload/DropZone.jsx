import React,{useEffect,useRef,useState} from 'react'
import Button from '../ui/Button'
const DropZone = ({onFile}) => {
  const [drag,setDrag]=useState(false)
  const [uploading,setUploading]=useState(false)
  const [pct,setPct]=useState(0)
  const [currentFile,setCurrentFile]=useState(null)
  const [previewUrl,setPreviewUrl]=useState(null)
  const ref=useRef()
  const timerRef=useRef(null)

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => () => clearTimer(), [])

  const handle = f => {
    if (!f?.type?.startsWith('video/')) return

    clearTimer()
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(null)
    setCurrentFile(f)
    setUploading(true)
    setPct(0)

    const sizeMb = Math.max((f.size || 0) / (1024 * 1024), 1)
    const totalMs = Math.min(90000, Math.max(12000, Math.round(sizeMb * 2500)))
    const startedAt = Date.now()

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt
      const nextPct = Math.min(100, Math.round((elapsed / totalMs) * 100))
      setPct(nextPct)

      if (nextPct >= 100) {
        clearTimer()
        setUploading(false)
        const url = URL.createObjectURL(f)
        setPreviewUrl(url)
        onFile?.(f, url)
      }
    }, 250)

    if (ref.current) ref.current.value = ''
  }

  const busy = uploading
  return(
    <div onDragOver={e=>{e.preventDefault();if(!busy)setDrag(true)}} onDragLeave={()=>setDrag(false)}
      onDrop={e=>{e.preventDefault();setDrag(false);if(!busy)handle(e.dataTransfer.files[0])}}
      onClick={()=>{ if(!busy && !previewUrl) ref.current?.click() }}
      className={`border-2 border-dashed rounded-xl p-6 sm:p-10 text-center transition-all duration-200 ${busy || drag || previewUrl ? 'border-primary bg-primary/8' : 'border-border-light hover:border-primary/50 hover:bg-primary/4'} ${busy ? 'cursor-wait' : previewUrl ? 'cursor-default' : 'cursor-pointer'} ${drag && !busy ? 'scale-[1.01]' : ''}`}>
      <input ref={ref} type="file" accept="video/*" className="hidden" onChange={e=>handle(e.target.files?.[0])}/>
      {busy ? (
        <div>
          <div className="text-5xl mb-3" aria-hidden>📤</div>
          <p className="font-semibold text-md mb-1.5 text-text-primary">Uploading {currentFile?.name || 'video'}…</p>
          <p className="text-sm text-text-muted mb-4">Large videos can take a while to finish uploading.</p>
          <div className="max-w-md mx-auto mb-2">
            <div className="h-2 bg-bg-el rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-100" style={{width:`${pct}%`}} />
            </div>
          </div>
          <p className="text-sm text-text-muted">{pct}%</p>
        </div>
      ) : previewUrl ? (
        <div className="text-left space-y-4">
          <div className="overflow-hidden rounded-xl border border-border bg-black/20 shadow-[0_10px_30px_rgba(0,0,0,.25)]">
            <video src={previewUrl} controls className="w-full max-h-[320px] bg-black" />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold text-md text-text-primary truncate">{currentFile?.name || 'Uploaded video'}</p>
              <p className="text-sm text-text-muted">Preview ready in dropzone</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={e=>{e.stopPropagation(); if(previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); setCurrentFile(null); setPct(0); ref.current && (ref.current.value='')}}
            >
              Replace video
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-5xl mb-3" aria-hidden>🎬</div>
          <p className="font-semibold text-md mb-1.5 text-text-primary">Drag & drop your video here</p>
          <p className="text-sm text-text-muted mb-5">MP4, MOV, AVI, WEBM · up to 10 GB</p>
          <Button variant="ghost" size="sm" onClick={e=>{e.stopPropagation();ref.current?.click()}}>Browse Files</Button>
        </>
      )}
    </div>
  )
}

export default DropZone
