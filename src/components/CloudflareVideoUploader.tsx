'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { ProgressBar, Button, Alert, Card, Spinner } from 'react-bootstrap'
import { FaCloudUploadAlt, FaPlay, FaPause, FaTimes, FaCheckCircle, FaVideo, FaRedo } from 'react-icons/fa'
// @ts-ignore - tus-js-client types
import * as tus from 'tus-js-client'

interface CloudflareVideoUploaderProps {
  onUploadComplete: (uid: string, embedUrl: string) => void
  uploadType?: 'main' | 'trailer' | 'episode'
  videoType?: 'single' | 'series'
  existingUid?: string
  maxDurationSeconds?: number
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/v1/api'

const CloudflareVideoUploader: React.FC<CloudflareVideoUploaderProps> = ({
  onUploadComplete,
  uploadType = 'main',
  videoType = 'single',
  existingUid,
  maxDurationSeconds = 7200, // 2 hours default
}) => {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'completed' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [videoUid, setVideoUid] = useState(existingUid || '')
  const [customerCode, setCustomerCode] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [uploadSpeed, setUploadSpeed] = useState<string>('')
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isDragging, setIsDragging] = useState(false)
  
  const uploadRef = useRef<tus.Upload | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const lastProgress = useRef<{ time: number; bytes: number }>({ time: 0, bytes: 0 })
  const customerCodeRef = useRef(customerCode)
  const onUploadCompleteRef = useRef(onUploadComplete)

  // Keep refs in sync so interval callbacks always see latest values
  useEffect(() => {
    customerCodeRef.current = customerCode
  }, [customerCode])

  useEffect(() => {
    onUploadCompleteRef.current = onUploadComplete
  }, [onUploadComplete])

  // Fetch Cloudflare config on mount
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/cloudflare-stream/config`)
        const data = await response.json()
        if (data.success && data.data.customerCode) {
          setCustomerCode(data.data.customerCode)
        }
      } catch (error) {
        console.error('Failed to fetch Cloudflare config:', error)
      }
    }
    fetchConfig()
  }, [])

  // Poll for video processing status
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (uploadStatus === 'processing' && videoUid) {
      interval = setInterval(async () => {
        try {
          const token = localStorage.getItem('authToken')
          const response = await fetch(`${API_BASE_URL}/cloudflare-stream/video/${videoUid}/status`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const data = await response.json()
          
          if (data.success) {
            setProcessingProgress(data.data.pctComplete || 0)
            
            if (data.data.readyToStream) {
              setUploadStatus('completed')
              const code = customerCodeRef.current
              const embedUrl = `https://customer-${code}.cloudflarestream.com/${videoUid}/iframe`
              onUploadCompleteRef.current(videoUid, embedUrl)
              clearInterval(interval)
            }
            
            if (data.data.errorReasonCode && data.data.errorReasonCode !== '') {
              setUploadStatus('error')
              setErrorMessage(data.data.errorReasonText || 'Video processing failed')
              clearInterval(interval)
            }
          }
        } catch (error) {
          console.error('Status check error:', error)
        }
      }, 3000)
    }

    return () => clearInterval(interval)
  }, [uploadStatus, videoUid])

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`
    return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
  }

  const getMaxAllowedBytes = () => {
    if (uploadType === 'trailer') return 100 * 1024 * 1024       // 100 MB
    if (uploadType === 'episode') return 500 * 1024 * 1024       // 500 MB
    return 2 * 1024 * 1024 * 1024                                 // 2 GB (main video)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const validateAndSetFile = (selectedFile: File) => {
    // Validate file type
    const validTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if (!validTypes.includes(selectedFile.type)) {
      setErrorMessage('Invalid file type. Please upload MP4, WebM, MOV, AVI, or MKV files.')
      return
    }

    // Max file size: 30GB
    if (selectedFile.size > 30 * 1024 * 1024 * 1024) {
      setErrorMessage('File too large. Maximum size is 30GB.')
      return
    }

    const maxAllowedBytes = getMaxAllowedBytes()
    if (selectedFile.size > maxAllowedBytes) {
      setErrorMessage(`File too large (${formatBytes(selectedFile.size)}). Maximum allowed size is ${formatBytes(maxAllowedBytes)}.`)
      return
    }

    setFile(selectedFile)
    setErrorMessage('')
    setUploadStatus('idle')
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      validateAndSetFile(droppedFile)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const startUpload = async () => {
    if (!file) return

    setUploadStatus('uploading')
    setUploadProgress(0)
    setErrorMessage('')
    lastProgress.current = { time: Date.now(), bytes: 0 }

    try {
      const token = localStorage.getItem('authToken')
      
      // Check if user is authenticated
      if (!token) {
        setUploadStatus('error')
        setErrorMessage('You must be logged in to upload videos. Please refresh the page and try again.')
        return
      }

      console.log('Starting upload with token:', token ? 'Token exists' : 'No token')
      console.log('File size:', formatBytes(file.size))

      // Use Basic Direct Upload API (works for files up to 200MB, no chunk issues)
      // For larger files, we'll use a different approach
      const MAX_BASIC_UPLOAD_SIZE = 200 * 1024 * 1024; // 200MB

      if (file.size <= MAX_BASIC_UPLOAD_SIZE) {
        // Use Basic Direct Upload (simpler, no TUS, no chunk size issues)
        await uploadBasic(token)
      } else {
        await uploadTus(token)
      }
    } catch (error: any) {
      setUploadStatus('error')
      setErrorMessage(error.message || 'Failed to start upload')
    }
  }

  const uploadTus = async (token: string) => {
    try {
      const urlResponse = await fetch(`${API_BASE_URL}/cloudflare-stream/tus-upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          maxDurationSeconds,
          fileName: file?.name || 'video',
          fileSize: file?.size,
          uploadType,
          videoType,
        }),
      })

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json().catch(() => null)
        throw new Error(errorData?.message || 'Failed to get TUS upload URL')
      }

      const urlData = await urlResponse.json()
      const uploadUrl = urlData.data?.uploadUrl
      const uid = urlData.data?.uid

      if (!uploadUrl || !uid) {
        throw new Error('No upload URL received from server')
      }

      setVideoUid(uid)

      const tusUpload = new tus.Upload(file as File, {
        uploadUrl,
        chunkSize: 50 * 1024 * 1024,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        onError: (error: any) => {
          console.error('TUS upload error:', error)
          setUploadStatus('error')
          setErrorMessage(error?.message || 'Upload failed')
        },
        onProgress: (bytesUploaded: number, bytesTotal: number) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100)
          setUploadProgress(percentage)

          const now = Date.now()
          const timeDiff = (now - lastProgress.current.time) / 1000
          const bytesDiff = bytesUploaded - lastProgress.current.bytes

          if (timeDiff > 0.5) {
            const speed = bytesDiff / timeDiff
            setUploadSpeed(`${formatBytes(speed)}/s`)

            const remaining = (bytesTotal - bytesUploaded) / (speed || 1)
            setTimeRemaining(formatTime(remaining))

            lastProgress.current = { time: now, bytes: bytesUploaded }
          }
        },
        onSuccess: () => {
          setUploadStatus('processing')
          setUploadProgress(100)
        },
      })

      uploadRef.current = tusUpload
      tusUpload.start()
    } catch (error: any) {
      console.error('TUS upload error:', error)
      throw error
    }
  }

  // Basic Direct Upload - works for files under 200MB
  const uploadBasic = async (token: string) => {
    try {
      // Step 1: Get direct upload URL from backend
      const urlResponse = await fetch(`${API_BASE_URL}/cloudflare-stream/upload-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          maxDurationSeconds,
          fileName: file?.name || 'video',
          fileSize: file?.size,
          uploadType,
          videoType,
        }),
      })

      if (!urlResponse.ok) {
        const errorData = await urlResponse.json()
        throw new Error(errorData.message || 'Failed to get upload URL')
      }

      const urlData = await urlResponse.json()
      const uploadURL = urlData.data?.uploadURL
      const uid = urlData.data?.uid

      if (!uploadURL || !uid) {
        throw new Error('No upload URL received from server')
      }

      console.log('Got direct upload URL:', uploadURL)
      console.log('Video UID:', uid)
      setVideoUid(uid)

      // Step 2: Upload file directly to Cloudflare using XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest()
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const percentage = Math.round((event.loaded / event.total) * 100)
          setUploadProgress(percentage)

          // Calculate upload speed and time remaining
          const now = Date.now()
          const timeDiff = (now - lastProgress.current.time) / 1000
          const bytesDiff = event.loaded - lastProgress.current.bytes

          if (timeDiff > 0.5) {
            const speed = bytesDiff / timeDiff
            setUploadSpeed(`${formatBytes(speed)}/s`)
            
            const remaining = (event.total - event.loaded) / speed
            setTimeRemaining(formatTime(remaining))
            
            lastProgress.current = { time: now, bytes: event.loaded }
          }
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log('Upload completed successfully')
          setUploadStatus('processing')
          setUploadProgress(100)
        } else {
          console.error('Upload failed:', xhr.responseText)
          setUploadStatus('error')
          setErrorMessage(`Upload failed with status ${xhr.status}`)
        }
      })

      xhr.addEventListener('error', () => {
        console.error('Upload error')
        setUploadStatus('error')
        setErrorMessage('Network error during upload. Please try again.')
      })

      xhr.addEventListener('abort', () => {
        console.log('Upload cancelled')
        setUploadStatus('idle')
      })

      // Store xhr reference for cancel functionality
      uploadRef.current = { abort: () => xhr.abort() } as any

      // Create FormData and upload
      const formData = new FormData()
      formData.append('file', file as File)

      xhr.open('POST', uploadURL)
      xhr.send(formData)

    } catch (error: any) {
      console.error('Basic upload error:', error)
      throw error
    }
  }

  const cancelUpload = () => {
    if (uploadRef.current) {
      ;(uploadRef.current as any).abort?.()
    }
    setUploadStatus('idle')
    setUploadProgress(0)
    setFile(null)
  }

  const resetUpload = () => {
    setFile(null)
    setUploadStatus('idle')
    setUploadProgress(0)
    setErrorMessage('')
    setVideoUid('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="cloudflare-video-uploader">
      {/* Drag & Drop Zone */}
      {uploadStatus === 'idle' && !file && (
        <div
          className={`upload-zone p-4 text-center border-2 border-dashed rounded-3 transition-all cursor-pointer ${
            isDragging ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo,video/x-matroska"
            hidden
          />
          <FaCloudUploadAlt size={48} className="text-muted mb-3" />
          <h5 className="mb-2">Drag & drop your video here</h5>
          <p className="text-muted small mb-0">
            or click to browse • MP4, WebM, MOV, AVI, MKV • Max {formatBytes(getMaxAllowedBytes())}
          </p>
        </div>
      )}

      {/* File Selected - Ready to Upload */}
      {uploadStatus === 'idle' && file && (
        <Card className="mb-3">
          <Card.Body className="d-flex align-items-center gap-3">
            <div className="bg-primary bg-opacity-10 rounded p-3">
              <FaVideo size={24} className="text-primary" />
            </div>
            <div className="flex-grow-1">
              <h6 className="mb-1">{file.name}</h6>
              <small className="text-muted">{formatBytes(file.size)}</small>
            </div>
            <Button variant="outline-danger" size="sm" onClick={resetUpload}>
              <FaTimes />
            </Button>
            <Button variant="primary" onClick={startUpload}>
              <FaCloudUploadAlt className="me-2" /> Start Upload
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Uploading State */}
      {uploadStatus === 'uploading' && (
        <Card className="mb-3 border-primary">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div className="d-flex align-items-center gap-2">
                <Spinner animation="border" size="sm" variant="primary" />
                <span className="fw-medium">Uploading {file?.name}</span>
              </div>
              <Button variant="outline-danger" size="sm" onClick={cancelUpload}>
                <FaTimes className="me-1" /> Cancel
              </Button>
            </div>
            
            <ProgressBar 
              now={uploadProgress} 
              variant="primary" 
              animated 
              striped 
              className="mb-2" 
              style={{ height: '12px' }}
            />
            
            <div className="d-flex justify-content-between text-muted small">
              <span>{uploadProgress}% uploaded</span>
              <span>
                {uploadSpeed && `${uploadSpeed} • `}
                {timeRemaining && `${timeRemaining} remaining`}
              </span>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Processing State */}
      {uploadStatus === 'processing' && (
        <Card className="mb-3 border-warning">
          <Card.Body>
            <div className="d-flex align-items-center gap-2 mb-2">
              <Spinner animation="border" size="sm" variant="warning" />
              <span className="fw-medium">Processing video on Cloudflare...</span>
            </div>
            
            <ProgressBar 
              now={processingProgress} 
              variant="warning" 
              animated 
              className="mb-2" 
              style={{ height: '12px' }}
            />
            
            <small className="text-muted">
              {processingProgress}% processed • This may take a few minutes for larger videos
            </small>
          </Card.Body>
        </Card>
      )}

      {/* Completed State */}
      {uploadStatus === 'completed' && (
        <Card className="mb-3 border-success">
          <Card.Body>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-2">
                <FaCheckCircle size={24} className="text-success" />
                <div>
                  <h6 className="mb-0">Upload Complete!</h6>
                  <small className="text-muted">Video ID: {videoUid}</small>
                </div>
              </div>
              <div className="d-flex gap-2">
                <Button 
                  variant="outline-primary" 
                  size="sm"
                  onClick={() => window.open(`https://customer-${customerCode}.cloudflarestream.com/${videoUid}/iframe`, '_blank')}
                >
                  <FaPlay className="me-1" /> Preview
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={resetUpload}>
                  <FaRedo className="me-1" /> Upload Another
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Error State */}
      {uploadStatus === 'error' && (
        <Alert variant="danger" className="d-flex align-items-center justify-content-between">
          <span>{errorMessage}</span>
          <Button variant="outline-danger" size="sm" onClick={resetUpload}>
            <FaRedo className="me-1" /> Try Again
          </Button>
        </Alert>
      )}

      {/* General Error Message */}
      {errorMessage && uploadStatus === 'idle' && (
        <Alert variant="danger" className="mt-2">{errorMessage}</Alert>
      )}
    </div>
  )
}

export default CloudflareVideoUploader
