'use client'
import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { X, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api'

export function ImportModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  const [result, setResult] = useState<any>(null)

  const handleDownloadTemplate = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/v1/hr/employees/import-template`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'x-tenant-slug': localStorage.getItem('tenantSlug') || '',
      },
    })
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'employees-template.xlsx'; a.click()
  }

  const onDrop = useCallback(async (files: File[]) => {
    if (!files[0]) return
    setStatus('uploading')
    const formData = new FormData()
    formData.append('file', files[0])
    try {
      const res: any = await api.post('/v1/hr/employees/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(res.data)
      setStatus('done')
    } catch {
      setStatus('error')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
    maxFiles: 1,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold">ייבוא עובדים מ-Excel</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-4">
          <button onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-primary/40 text-primary rounded-xl hover:bg-primary/5 text-sm font-medium transition">
            <FileSpreadsheet className="w-4 h-4" /> הורד קובץ תבנית
          </button>

          {status === 'idle' && (
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-600">גרור קובץ Excel לכאן</p>
              <p className="text-xs text-gray-400 mt-1">או לחץ לבחירת קובץ</p>
            </div>
          )}

          {status === 'uploading' && (
            <div className="text-center py-8">
              <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-600">מעבד את הקובץ...</p>
            </div>
          )}

          {status === 'done' && result && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-3">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">יובאו {result.success} עובדים בהצלחה</span>
              </div>
              {result.failed > 0 && (
                <div className="bg-red-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-600 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">{result.failed} שורות נכשלו</span>
                  </div>
                  {result.errors.map((e: any, i: number) => (
                    <p key={i} className="text-xs text-red-500">{e.email}: {e.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-lg p-3">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">אירעה שגיאה בעיבוד הקובץ</span>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 p-5 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">סגור</button>
          {status === 'done' && (
            <button onClick={onSuccess} className="px-5 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90">סיים</button>
          )}
        </div>
      </div>
    </div>
  )
}
