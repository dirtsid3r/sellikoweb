'use client'

import React from 'react'
import { Icons } from '@/components/ui/icons'
import ZoomableImage from '@/components/shared/ZoomableImage'
import { useAuth } from '@/lib/auth'

interface VerificationDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  verification: any
  deviceTitle?: string
  deviceModel?: string
}

export default function VerificationDetailsModal({
  isOpen,
  onClose,
  verification,
  deviceTitle = 'Device',
  deviceModel = ''
}: VerificationDetailsModalProps) {
  const { user } = useAuth()
  const userRole = user?.role?.toUpperCase()
  const canSeeBankDetails = userRole === 'ADMIN' || userRole === 'AGENT'

  if (!isOpen || !verification) return null

  // Extract checklist, notes and deductions
  const checklist = verification.verification_data?.checklist || []
  const note = verification.verification_data?.note || verification.verification_note || ''
  const deductions = verification.deductions || []
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Mask bank account number
  const maskAccountNumber = (accNum: string) => {
    if (!accNum) return 'N/A'
    const clean = accNum.trim()
    if (clean.length <= 4) return '****'
    return `•••• •••• •••• ${clean.slice(-4)}`
  }

  // Group checklist by category
  const categories = Array.from(new Set(checklist.map((item: any) => item.category || 'general'))) as string[]

  const getCategoryTitle = (cat: string) => {
    return cat.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'minor': return 'bg-yellow-50 text-yellow-800 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900/35'
      case 'major': return 'bg-orange-50 text-orange-800 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/35'
      case 'critical': return 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/35'
      default: return 'bg-gray-50 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400'
    }
  }

  const totalDeductions = deductions.reduce((sum: number, d: any) => sum + (d.amount || 0), 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl flex flex-col max-w-4xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400">
                Verified
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {formatDate(verification.created_at)}
              </span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              Agent Verification Report
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {deviceTitle} {deviceModel && `• ${deviceModel}`} • Listing ID: {verification.listing_id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-105 duration-200"
            title="Close details"
          >
            <Icons.x className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* Price Summary Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
                Winning Bid Price
              </span>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-1">
                {formatPrice(verification.bid_price || 0)}
              </p>
            </div>
            <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl">
              <span className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wider">
                Total Deductions
              </span>
              <p className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                -{formatPrice(totalDeductions)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/15 border border-green-100 dark:border-green-900/40 p-5 rounded-2xl shadow-sm shadow-green-100 dark:shadow-none">
              <span className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wider">
                Final Offer Price
              </span>
              <p className="text-3xl font-extrabold text-green-600 dark:text-green-400 mt-0.5">
                {formatPrice(verification.offer_price || 0)}
              </p>
            </div>
          </div>

          {/* Checklist Checks Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.check className="w-5 h-5 text-green-500" />
              Verification Checklist Items
            </h3>
            
            <div className="space-y-6">
              {categories.map((category) => {
                const categoryItems = checklist.filter((item: any) => (item.category || 'general') === category)
                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest pl-1">
                      {getCategoryTitle(category)}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categoryItems.map((step: any) => (
                        <div 
                          key={step.id} 
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 border border-gray-100/80 dark:border-gray-800/80 rounded-2xl gap-4"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate" title={step.item}>
                              {step.item}
                            </p>
                            <p className="text-xs text-gray-400 capitalize mt-0.5">
                              Type: {step.type}
                            </p>
                          </div>
                          
                          <div className="flex-shrink-0">
                            {step.type === 'bool' && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                                step.value === true
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/30 dark:text-green-400'
                                  : 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400'
                              }`}>
                                {step.value === true ? 'Pass' : 'Fail'}
                              </span>
                            )}
                            {step.type === 'text' && (
                              <span className="inline-block px-3 py-1 bg-gray-200/60 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg text-xs font-medium max-w-[150px] truncate" title={step.value}>
                                {step.value || 'N/A'}
                              </span>
                            )}
                            {step.type === 'image' && step.value && (
                              <div className="w-14 h-14 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white">
                                <ZoomableImage
                                  src={step.value}
                                  alt={step.item}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Deductions breakdown */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.minus className="w-5 h-5 text-red-500" />
              Applied Price Deductions
            </h3>
            
            {deductions.length === 0 ? (
              <div className="p-4 bg-gray-50/50 dark:bg-gray-800/20 border border-dashed rounded-2xl text-center text-sm text-gray-500">
                No deductions were applied during verification. The device met all standard checks.
              </div>
            ) : (
              <div className="border border-gray-100 dark:border-gray-800 rounded-2xl overflow-hidden">
                <table className="min-w-full divide-y divide-gray-150 dark:divide-gray-800">
                  <thead className="bg-gray-50 dark:bg-gray-850">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Issue Description</th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Deduction</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                    {deductions.map((d: any) => (
                      <tr key={d.id || Math.random()}>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white capitalize">{d.category?.replace('_', ' ')}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{d.issue}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full border ${getSeverityColor(d.severity)}`}>
                            {d.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 text-right">-{formatPrice(d.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Observations and Notes */}
          {note && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.fileText className="w-5 h-5 text-amber-500" />
                Agent Comments & Observations
              </h3>
              <div className="p-5 bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 rounded-2xl leading-relaxed text-sm text-gray-700 dark:text-gray-300">
                {note}
              </div>
            </div>
          )}

          {/* Bank details (Role-restricted: admin / agent only) */}
          {canSeeBankDetails && verification.bank_name && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Icons.lock className="w-5 h-5 text-purple-500" />
                Client Payout Bank Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-purple-50/20 dark:bg-purple-950/10 border border-purple-100/60 dark:border-purple-900/30 rounded-2xl text-sm">
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Account Holder Name</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{verification.account_holder_name || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Bank Name</span>
                  <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{verification.bank_name}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">Account Number</span>
                  <p className="font-mono font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{maskAccountNumber(verification.account_number)}</p>
                </div>
                <div>
                  <span className="text-xs text-gray-400 dark:text-gray-500">IFSC Code</span>
                  <p className="font-mono font-semibold text-gray-800 dark:text-gray-200 mt-0.5">{verification.ifsc_code || 'N/A'}</p>
                </div>
              </div>
            </div>
          )}

        </div>
        
        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-sm font-semibold rounded-xl transition-colors"
          >
            Close Report
          </button>
        </div>

      </div>
    </div>
  )
}
