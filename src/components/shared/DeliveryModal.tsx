import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Icons } from '@/components/ui/icons'
import { 
  XMarkIcon,
  TruckIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  UserIcon,
  BuildingOffice2Icon
} from '@heroicons/react/24/outline'

interface PickupDeliverTo {
  id: string
  vendor_code: string
  name: string
  email: string
  number: string
  address: string
  city: string
  pincode: string
  state: string
  landmark: string
  contact_person: string
  contact_person_phone: string
  working_pincodes: string
}

interface PendingDelivery {
  listing_id: number
  name: string
  seller: string
  time: string
  deliver_to: PickupDeliverTo
}

interface DeliveryModalProps {
  isOpen: boolean
  onClose: () => void
  delivery: PendingDelivery | null
  onConfirmDelivery: (listingId: number, deliveryOtp: string) => Promise<void>
  isLoading?: boolean
}

export default function DeliveryModal({ 
  isOpen, 
  onClose, 
  delivery, 
  onConfirmDelivery,
  isLoading = false 
}: DeliveryModalProps) {
  const [otp, setOtp] = useState(['', '', '', ''])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return // Only allow single digit
    if (!/^\d*$/.test(value)) return // Only allow numbers

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleConfirmDelivery = async () => {
    if (!delivery) return
    
    const otpString = otp.join('')
    if (otpString.length !== 4) {
      alert('Please enter a 4-digit OTP')
      return
    }

    setIsSubmitting(true)
    try {
      await onConfirmDelivery(delivery.listing_id, otpString)
      // Reset OTP on success
      setOtp(['', '', '', ''])
      onClose()
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setOtp(['', '', '', ''])
    onClose()
  }

  if (!delivery) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TruckIcon className="w-6 h-6 text-orange-600" />
            <span>Confirm Delivery</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Listing Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Listing Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Device</p>
                <p className="font-medium">{delivery.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Listing ID</p>
                <p className="font-medium">#{delivery.listing_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Seller</p>
                <p className="font-medium">{delivery.seller}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pickup Time</p>
                <p className="font-medium">{new Date(delivery.time).toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Vendor Details */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <BuildingOffice2Icon className="w-5 h-5 mr-2 text-blue-600" />
              Deliver To: {delivery.deliver_to.name}
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Address</p>
                  <p className="text-sm text-gray-600">
                    {delivery.deliver_to.address}
                  </p>
                  <p className="text-sm text-gray-600">
                    {delivery.deliver_to.city}, {delivery.deliver_to.state} - {delivery.deliver_to.pincode}
                  </p>
                  {delivery.deliver_to.landmark && (
                    <p className="text-sm text-gray-500">
                      Landmark: {delivery.deliver_to.landmark}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <UserIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Contact Person</p>
                    <p className="text-sm text-gray-600">{delivery.deliver_to.contact_person}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <PhoneIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Phone</p>
                    <p className="text-sm text-gray-600">
                      <a href={`tel:${delivery.deliver_to.contact_person_phone}`} className="text-blue-600 hover:underline">
                        {delivery.deliver_to.contact_person_phone}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Email</p>
                    <p className="text-sm text-gray-600">
                      <a href={`mailto:${delivery.deliver_to.email}`} className="text-blue-600 hover:underline">
                        {delivery.deliver_to.email}
                      </a>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <BuildingOffice2Icon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">Vendor Code</p>
                    <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                      {delivery.deliver_to.vendor_code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OTP Input */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Delivery Confirmation</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 4-digit OTP provided by the vendor to confirm delivery
            </p>
            
            <div className="flex justify-center space-x-3 mb-6">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-orange-500"
                  placeholder="0"
                />
              ))}
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="flex-1"
              >
                Cancel
              </Button>
              
              <Button
                onClick={handleConfirmDelivery}
                disabled={isSubmitting || otp.join('').length !== 4}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isSubmitting ? (
                  <>
                    <Icons.spinner className="w-4 h-4 mr-2 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <TruckIcon className="w-4 h-4 mr-2" />
                    Confirm Delivery
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 