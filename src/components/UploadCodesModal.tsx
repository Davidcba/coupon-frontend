import { useState, useRef, DragEvent, ChangeEvent } from 'react'
import { useFirebaseUser } from '../hooks/useFirebaseUser'

type Props = {
  couponId: string
  onClose: () => void
}

export default function UploadCodesModal({ couponId, onClose }: Props) {
  const token = useFirebaseUser()
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const f = e.dataTransfer.files?.[0]
    if (f) setFile(f)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleSubmit = async () => {
    if (!token || !file) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(
        `http://localhost:3000/coupons/${couponId}/codes/upload`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      )
      if (!res.ok) throw new Error('Upload failed')
      onClose()
    } catch (err) {
      console.error(err)
      setError('Failed to upload codes')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4">Upload Codes</h2>
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed rounded p-6 text-center mb-4 cursor-pointer"
        >
          {file ? <p>{file.name}</p> : <p>Drag & drop file here or click to select</p>}
          <input
            ref={inputRef}
            type="file"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  )
}
