'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'
import { Badge } from '@/components/ui/badge'
import sellikoClient from '@/selliko-client'
import { toast } from 'react-hot-toast'
import Header from '@/components/layout/header'

export default function AdminListingDetailPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const listingId = params.id as string

  const [isAuthChecking, setIsAuthChecking] = useState(true)
  const [listing, setListing] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [rejectionMessage, setRejectionMessage] = useState('')

  // Auth and role check
  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const user = await sellikoClient.getCurrentUser()
        if (!user) {
          toast.error('Please login to continue')
          router.replace('/login')
          return
        }
        const userRole = (user.user_role || user.role || '').toLowerCase()
        if (userRole !== 'admin') {
          toast.error('Access denied. Redirecting to your dashboard.')
          router.replace(`/${userRole}`)
          return
        }
        setIsAuthChecking(false)
      } catch (error) {
        toast.error('Authentication error')
        router.replace('/login')
      }
    }
    checkAuthAndRole()
  }, [router])

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return
      setIsLoading(true)
      setError(null)
      try {
        const result = await sellikoClient.getListingById(listingId, { include_images: true, include_bids: true, include_user_details: true })
        if ((result as any).success && (result as any).listing) {
          setListing((result as any).listing)
        } else {
          setError((result as any).error || 'Failed to load listing')
        }
      } catch (error) {
        setError('Network error while loading listing')
      } finally {
        setIsLoading(false)
      }
    }
    if (!isAuthChecking) fetchListing()
  }, [listingId, isAuthChecking])

  // Approve listing
  const handleApprove = async () => {
    setProcessing(true)
    try {
      const result = await sellikoClient.approveListing(listingId, true)
      if ((result as any).success) {
        toast.success('Listing approved successfully!')
        router.replace('/admin/pending-approvals')
      } else {
        toast.error((result as any).error || 'Failed to approve listing')
      }
    } catch (error) {
      toast.error('Network error while approving listing')
    } finally {
      setProcessing(false)
    }
  }

  // Reject listing
  const handleReject = async () => {
    if (!rejectionMessage.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    setProcessing(true)
    try {
      const result = await sellikoClient.approveListing(listingId, false, rejectionMessage.trim())
      if ((result as any).success) {
        toast.success('Listing rejected successfully!')
        router.replace('/admin/pending-approvals')
      } else {
        toast.error((result as any).error || 'Failed to reject listing')
      }
    } catch (error) {
      toast.error('Network error while rejecting listing')
    } finally {
      setProcessing(false)
      setRejecting(false)
      setRejectionMessage('')
    }
  }

  if (isLoading || isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <Icons.spinner className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Listing</h2>
          <p className="text-gray-600">Preparing admin view...</p>
        </div>
      </div>
    )
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-2xl mb-4">
            <Icons.x className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Listing</h2>
          <p className="text-gray-600 mb-4">{error || 'Listing not found'}</p>
          <Button onClick={() => router.back()} variant="outline">
            <Icons.arrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Extract device and seller info
  const device = listing.devices?.[0] || {}
  const clientAddress = listing.addresses?.find((addr: any) => addr.type === 'client') || {}
  const sellerName = listing.contact_name || clientAddress.contact_name || clientAddress.name || 'Unknown Seller'
  const submittedAt = new Date(listing.created_at).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })
  const askingPrice = listing.expected_price || listing.asking_price || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <Header variant="admin" showBackButton />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{device.brand} {device.model}</h2>
              <p className="text-gray-600 mb-1">Seller: {sellerName}</p>
              <p className="text-gray-600 mb-1">Submitted: {submittedAt}</p>
              <p className="text-gray-600 mb-1">Price: ₹{askingPrice.toLocaleString()}</p>
              <Badge className="bg-yellow-100 text-yellow-800 mt-2">{listing.status}</Badge>
            </div>
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-1">Description</h3>
              <p className="text-gray-700">{device.description || 'No description provided.'}</p>
            </div>
            <div className="flex gap-3">
              {!rejecting ? (
                <>
                  <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
                    {processing ? <Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> : <Icons.check className="w-4 h-4 mr-2" />}
                    Approve
                  </Button>
                  <Button onClick={() => setRejecting(true)} variant="outline" className="text-red-600 border-red-300">
                    <Icons.x className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </>
              ) : (
                <>
                  <textarea
                    value={rejectionMessage}
                    onChange={e => setRejectionMessage(e.target.value)}
                    placeholder="Reason for rejection"
                    rows={2}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-64"
                    disabled={processing}
                  />
                  <Button onClick={handleReject} disabled={processing || !rejectionMessage.trim()} className="bg-red-600 hover:bg-red-700 text-white">
                    {processing ? <Icons.spinner className="w-4 h-4 mr-2 animate-spin" /> : <Icons.x className="w-4 h-4 mr-2" />}
                    Confirm Reject
                  </Button>
                  <Button onClick={() => { setRejecting(false); setRejectionMessage('') }} variant="outline" disabled={processing}>
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
