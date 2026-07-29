'use client'

import React, { useState } from 'react'
import { Card, CardBody, Table, Button, Spinner, Badge, Modal, Form, Row, Col, Toast, ToastContainer } from 'react-bootstrap'
import Image from 'next/image'
import {
  useGetChannelsQuery,
  useCreateChannelMutation,
  useUpdateChannelMutation,
  useDeleteChannelMutation,
} from '@/store/watchVideosApi'
import { useUploadSingleMutation } from '@/store/uploadApi'
import { FaEdit, FaTrash, FaPlus, FaCheck, FaUsers, FaEye } from 'react-icons/fa'

type ChannelFormState = {
  name: string
  description: string
  isVerified: boolean
  isActive: boolean
  logoUrl: string
  bannerUrl: string
}

const emptyForm = (): ChannelFormState => ({
  name: '',
  description: '',
  isVerified: false,
  isActive: true,
  logoUrl: '',
  bannerUrl: '',
})

const ChannelsList = () => {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [deleteModal, setDeleteModal] = useState({ show: false, id: '', name: '' })
  const [createModal, setCreateModal] = useState(false)
  const [editModal, setEditModal] = useState<{ show: boolean; id: string }>({ show: false, id: '' })
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [toastVariant, setToastVariant] = useState<'success' | 'danger'>('success')

  const [form, setForm] = useState<ChannelFormState>(emptyForm())
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [bannerFile, setBannerFile] = useState<File | null>(null)

  const { data, isLoading, refetch } = useGetChannelsQuery({ page, limit: 10, search })
  const channels = data?.data || []
  const meta = data?.meta || { total: 0, totalPages: 1 }

  const [createChannel, { isLoading: isCreating }] = useCreateChannelMutation()
  const [updateChannel, { isLoading: isUpdating }] = useUpdateChannelMutation()
  const [deleteChannel, { isLoading: isDeleting }] = useDeleteChannelMutation()
  const [uploadSingle] = useUploadSingleMutation()

  const showMessage = (msg: string, type: 'success' | 'danger' = 'success') => {
    setToastMessage(msg)
    setToastVariant(type)
    setShowToast(true)
  }

  const resetFormFiles = () => {
    setLogoFile(null)
    setBannerFile(null)
  }

  const openCreate = () => {
    setForm(emptyForm())
    resetFormFiles()
    setCreateModal(true)
  }

  const openEdit = (channel: any) => {
    setForm({
      name: channel.name || '',
      description: channel.description || '',
      isVerified: !!channel.isVerified,
      isActive: channel.isActive !== false,
      logoUrl: channel.logoUrl || '',
      bannerUrl: channel.bannerUrl || '',
    })
    resetFormFiles()
    setEditModal({ show: true, id: channel._id })
  }

  const resolveUploads = async () => {
    let logoUrl = form.logoUrl
    let bannerUrl = form.bannerUrl

    if (logoFile) {
      try {
        logoUrl = await uploadSingle(logoFile).unwrap()
      } catch {
        logoUrl = URL.createObjectURL(logoFile)
      }
    }
    if (bannerFile) {
      try {
        bannerUrl = await uploadSingle(bannerFile).unwrap()
      } catch {
        bannerUrl = URL.createObjectURL(bannerFile)
      }
    }

    return { logoUrl, bannerUrl }
  }

  const handleDelete = async () => {
    try {
      await deleteChannel(deleteModal.id).unwrap()
      setDeleteModal({ show: false, id: '', name: '' })
      showMessage('Channel deleted successfully!')
      refetch()
    } catch (error: any) {
      showMessage(error?.data?.message || 'Failed to delete channel', 'danger')
    }
  }

  const handleCreate = async () => {
    try {
      const { logoUrl, bannerUrl } = await resolveUploads()

      await createChannel({
        name: form.name,
        description: form.description,
        isVerified: form.isVerified,
        isActive: form.isActive,
        logoUrl,
        bannerUrl,
      }).unwrap()

      setCreateModal(false)
      setForm(emptyForm())
      resetFormFiles()
      showMessage('Channel created successfully!')
      refetch()
    } catch (error: any) {
      showMessage(error?.data?.message || 'Failed to create channel', 'danger')
    }
  }

  const handleUpdate = async () => {
    try {
      const { logoUrl, bannerUrl } = await resolveUploads()

      await updateChannel({
        id: editModal.id,
        data: {
          name: form.name,
          description: form.description,
          isVerified: form.isVerified,
          isActive: form.isActive,
          logoUrl,
          bannerUrl,
        },
      }).unwrap()

      setEditModal({ show: false, id: '' })
      setForm(emptyForm())
      resetFormFiles()
      showMessage('Channel updated successfully!')
      refetch()
    } catch (error: any) {
      showMessage(error?.data?.message || 'Failed to update channel', 'danger')
    }
  }

  const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || '{}') : {}
  const isAdmin = user?.role === 'admin'

  const renderChannelFormFields = () => (
    <Row className="g-3">
      <Col md={12}>
        <Form.Group>
          <Form.Label>Channel Name *</Form.Label>
          <Form.Control
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Enter channel name"
          />
        </Form.Group>
      </Col>
      <Col md={12}>
        <Form.Group>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Channel description"
          />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Channel Logo</Form.Label>
          {form.logoUrl && !logoFile && (
            <div className="mb-2">
              <Image src={form.logoUrl} alt="logo" width={60} height={60} className="rounded object-fit-cover" />
            </div>
          )}
          <Form.Control type="file" accept="image/*" onChange={(e: any) => setLogoFile(e.target.files?.[0] || null)} />
        </Form.Group>
      </Col>
      <Col md={6}>
        <Form.Group>
          <Form.Label>Channel Banner</Form.Label>
          {form.bannerUrl && !bannerFile && (
            <div className="mb-2">
              <Image src={form.bannerUrl} alt="banner" width={120} height={40} className="rounded object-fit-cover" />
            </div>
          )}
          <Form.Control type="file" accept="image/*" onChange={(e: any) => setBannerFile(e.target.files?.[0] || null)} />
        </Form.Group>
      </Col>
      <Col md={6}>
        {isAdmin ? (
          <Form.Check
            type="switch"
            label="Verified Channel"
            checked={form.isVerified}
            onChange={(e) => setForm({ ...form, isVerified: e.target.checked })}
          />
        ) : null}
      </Col>
      <Col md={6}>
        <Form.Check
          type="switch"
          label="Active"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
      </Col>
    </Row>
  )

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading channels...</p>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      <ToastContainer position="top-end" className="p-3">
        <Toast show={showToast} onClose={() => setShowToast(false)} delay={3000} autohide bg={toastVariant}>
          <Toast.Body className="text-white">{toastMessage}</Toast.Body>
        </Toast>
      </ToastContainer>

      <Card>
        <CardBody>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="mb-0">Video Channels ({meta.total})</h4>
            <Button variant="primary" onClick={openCreate}>
              <FaPlus className="me-2" /> Create Channel
            </Button>
          </div>

          <Row className="mb-4">
            <Col md={4}>
              <Form.Control
                type="text"
                placeholder="Search channels..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setPage(1)
                }}
              />
            </Col>
          </Row>

          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '60px' }}>Logo</th>
                  <th>Name</th>
                  <th>Owner</th>
                  <th>Subscribers</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th style={{ width: '120px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {channels.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No channels found
                    </td>
                  </tr>
                ) : (
                  channels.map((channel: any) => (
                    <tr key={channel._id}>
                      <td>
                        {channel.logoUrl ? (
                          <Image
                            src={channel.logoUrl}
                            alt={channel.name}
                            width={50}
                            height={50}
                            className="rounded-circle object-fit-cover"
                          />
                        ) : (
                          <div
                            className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: 50, height: 50 }}
                          >
                            <span className="text-white">{channel.name?.charAt(0)}</span>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1">
                          <span className="fw-medium">{channel.name}</span>
                          {channel.isVerified && <FaCheck className="text-primary" title="Verified" />}
                        </div>
                        <small className="text-muted">{channel.description?.substring(0, 50)}...</small>
                      </td>
                      <td>
                        <Badge bg={channel.ownerType === 'admin' ? 'info' : 'secondary'}>{channel.ownerType}</Badge>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1">
                          <FaUsers className="text-muted" />
                          {channel.subscriberCount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td>
                        <span className="d-flex align-items-center gap-1">
                          <FaEye className="text-muted" />
                          {channel.totalViews?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td>
                        <Badge bg={channel.isActive ? 'success' : 'secondary'}>
                          {channel.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button size="sm" variant="outline-primary" onClick={() => openEdit(channel)}>
                            <FaEdit />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                              setDeleteModal({ show: true, id: channel._id, name: channel.name })
                            }
                          >
                            <FaTrash />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {meta.totalPages > 1 && (
            <div className="d-flex justify-content-between align-items-center mt-4">
              <span className="text-muted">
                Page {page} of {meta.totalPages}
              </span>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  disabled={page === meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Create Channel Modal */}
      <Modal show={createModal} onHide={() => setCreateModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderChannelFormFields()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={isCreating || !form.name.trim()}>
            {isCreating ? <Spinner size="sm" /> : 'Create Channel'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Channel Modal */}
      <Modal show={editModal.show} onHide={() => setEditModal({ show: false, id: '' })} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Channel</Modal.Title>
        </Modal.Header>
        <Modal.Body>{renderChannelFormFields()}</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditModal({ show: false, id: '' })}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdate} disabled={isUpdating || !form.name.trim()}>
            {isUpdating ? <Spinner size="sm" /> : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={deleteModal.show} onHide={() => setDeleteModal({ show: false, id: '', name: '' })}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteModal({ show: false, id: '', name: '' })}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
            {isDeleting ? <Spinner size="sm" /> : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default ChannelsList
