'use client'

import React, { useState } from 'react'
import { Card, CardBody, Table, Button, Spinner, Badge, Form, Row, Col } from 'react-bootstrap'
import Image from 'next/image'
import { useGetVideoPurchasesQuery } from '@/store/watchVideosApi'
import { FaEye, FaDownload } from 'react-icons/fa'

const PurchasesList = () => {
  const [page, setPage] = useState(1)
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('')

  const { data, isLoading, isError, refetch } = useGetVideoPurchasesQuery({
    page,
    limit: 10,
    paymentStatus: paymentStatusFilter,
  })

  const purchases = data?.data || []
  const meta = data?.meta || { total: 0, totalPages: 1 }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge bg="success">Completed</Badge>
      case 'pending': return <Badge bg="warning">Pending</Badge>
      case 'failed': return <Badge bg="danger">Failed</Badge>
      case 'refunded': return <Badge bg="info">Refunded</Badge>
      default: return <Badge bg="secondary">{status}</Badge>
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading purchases...</p>
        </CardBody>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardBody className="text-center py-5 text-danger">
          Error loading purchases. 
          <Button variant="outline-primary" className="ms-2" onClick={() => refetch()}>Retry</Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card>
      <CardBody>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Video Purchases ({meta.total})</h4>
          <Button variant="outline-primary" onClick={() => refetch()}>
            Refresh
          </Button>
        </div>

        <Row className="mb-4">
          <Col md={3}>
            <Form.Select
              value={paymentStatusFilter}
              onChange={(e) => { setPaymentStatusFilter(e.target.value); setPage(1) }}
            >
              <option value="">All Payment Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </Form.Select>
          </Col>
        </Row>

        <div className="table-responsive">
          <Table hover className="mb-0">
            <thead className="bg-light">
              <tr>
                <th>Order ID</th>
                <th>Video</th>
                <th>User</th>
                <th>Amount</th>
                <th>Payment Status</th>
                <th>Purchase Type</th>
                <th>Date</th>
                {/* <th style={{ width: '100px' }}>Actions</th> */}
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-4">No purchases found</td></tr>
              ) : (
                purchases.map((purchase: any) => (
                  <tr key={purchase._id}>
                    <td>
                      <code className="text-primary">{purchase.orderId || purchase._id?.substring(0, 10)}</code>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {purchase.videoId?.thumbnailUrl && (
                          <Image
                            src={purchase.videoId.thumbnailUrl}
                            alt={purchase.videoId.title}
                            width={50}
                            height={30}
                            className="rounded object-fit-cover"
                          />
                        )}
                        <div>
                          <span className="fw-medium">{purchase.videoId?.title || 'N/A'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <span className="fw-medium">{purchase.userId?.name || 'N/A'}</span>
                        <small className="d-block text-muted">{purchase.userId?.email}</small>
                      </div>
                    </td>
                    <td>
                      <span className="fw-bold">{purchase.currency || 'INR'} {purchase.amount}</span>
                    </td>
                    <td>{getStatusBadge(purchase.paymentStatus)}</td>
                    <td>
                      <Badge bg={purchase.purchaseType === 'buy' ? 'primary' : 'info'}>
                        {purchase.purchaseType === 'buy' ? 'Purchase' : 'Rental'}
                      </Badge>
                    </td>
                    <td>
                      <small>{formatDate(purchase.createdAt)}</small>
                    </td>
                    {/* <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-info" title="View Details">
                          <FaEye />
                        </Button>
                        <Button size="sm" variant="outline-secondary" title="Download Invoice">
                          <FaDownload />
                        </Button>
                      </div>
                    </td> */}
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>

        {meta.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <span className="text-muted">Page {page} of {meta.totalPages}</span>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <Button variant="outline-secondary" size="sm" disabled={page === meta.totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

export default PurchasesList
