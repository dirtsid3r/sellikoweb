/**
 * Helper function to determine the redirect URL for a notification click
 * based on the user's role and notification metadata/cta_link.
 */
export const getNotificationRedirectUrl = (notification: any, userRole?: string): string => {
  if (!notification) return '/';

  const metadata = notification.metadata || {};
  const eventType = (notification.event_type || notification.type || '').toLowerCase();
  const ctaLink = notification.cta_link || '';
  const role = (userRole || '').toUpperCase();

  // Try to find listing ID
  let listingId = metadata.listing_id || metadata.listingId;
  if (!listingId && ctaLink) {
    // Extract listing ID from links like /listings/123 or /marketplace/listing/123 or /admin/assign-agent/123
    const listingMatch = ctaLink.match(/\/(?:listings|listing|assign-agent|assign-agents)\/(\d+)/);
    if (listingMatch) {
      listingId = listingMatch[1];
    }
  }

  // Try to find bid ID
  let bidId = metadata.bid_id || metadata.bidId;
  if (!bidId && ctaLink) {
    const bidMatch = ctaLink.match(/\/bids?\/(\d+)/);
    if (bidMatch) {
      bidId = bidMatch[1];
    }
  }

  // Try to find order ID
  let orderId = metadata.order_id || metadata.orderId || metadata.order_code;

  console.log('🔗 [REDIRECT-HELPER] Resolving redirect for:', {
    role,
    eventType,
    ctaLink,
    listingId,
    bidId,
    orderId
  });

  // 1. ADMIN Redirection
  if (role === 'ADMIN') {
    if (eventType.includes('agent') || ctaLink.includes('assign-agent')) {
      return '/admin/assign-agents';
    }
    if (listingId) {
      return `/admin/listings/${listingId}`;
    }
    return '/admin';
  }

  // 2. VENDOR Redirection
  if (role === 'VENDOR') {
    if (eventType.includes('bid') || ctaLink.includes('bid') || eventType.includes('outbid')) {
      if (listingId) {
        return `/vendor/listings/${listingId}`;
      }
      return '/vendor?tab=my-bids';
    }
    if (eventType.includes('listing') && listingId) {
      return `/vendor/listings/${listingId}`;
    }
    if (orderId) {
      if (listingId) {
        return `/vendor/listings/${listingId}`;
      }
      return '/vendor?tab=my-bids';
    }
    if (listingId) {
      return `/vendor/listings/${listingId}`;
    }
    return '/vendor';
  }

  // 3. AGENT Redirection
  if (role === 'AGENT') {
    if (eventType.includes('verification') || eventType.includes('pickup')) {
      return '/agent/verification';
    }
    return '/agent';
  }

  // 4. CLIENT / Default Redirection
  if (listingId) {
    return `/client/listings/${listingId}`;
  }
  if (orderId) {
    return `/client/orders/${orderId}`;
  }

  // Fallback to role-specific root dashboards
  if (role === 'CLIENT') return '/client';
  if (role === 'VENDOR') return '/vendor';
  if (role === 'ADMIN') return '/admin';
  if (role === 'AGENT') return '/agent';

  return '/';
};
