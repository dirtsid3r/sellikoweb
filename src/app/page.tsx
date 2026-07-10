import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">

      {/* ============================================
          STATIC NAVIGATION BAR
          ============================================ */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-200 shadow-sm safe-top">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-start space-x-2 group pt-0.5">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform flex-shrink-0">
              {/* Phone icon inline SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 leading-none pt-1">SELLIKO</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-900 hover:text-green-600 transition-colors">
              Home
            </Link>
            <a href="#how-it-works" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
              How It Works
            </a>
            <a href="#why-sellikko" className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors">
              Why Sellikko
            </a>
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
            >
              Login
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-5 py-2.5 text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 rounded-lg transition-all shadow-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Spacer for fixed nav */}
      <div className="h-16 safe-top" />

      {/* ============================================
          HERO SECTION
          ============================================ */}
      <section className="pt-16 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            {/* Hero badge */}
            <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-8">
              {/* Trophy icon */}
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.996.178-1.768.534-2.166 1.014a.75.75 0 0 0 .208 1.14c.546.304 1.258.49 1.958.553M18.75 4.236c.996.178 1.768.534 2.166 1.014a.75.75 0 0 1-.208 1.14 4.129 4.129 0 0 1-1.958.553M5.25 4.236V3a.75.75 0 0 1 .75-.75h12a.75.75 0 0 1 .75.75v1.236M5.25 4.236V7.5c0 2.108.966 3.99 2.48 5.228M18.75 4.236V7.5a7.5 7.5 0 0 1-2.48 5.228" />
              </svg>
              Kerala&apos;s #1 Mobile Resale Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Sell Your Phone in
              <span className="block text-green-600">24 Hours at Your Price</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Kerala&apos;s first verified vendor bidding marketplace for used phones.
            </p>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <div className="flex items-center bg-green-100 px-4 py-2 rounded-full">
                {/* ShieldCheck icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
                <span className="text-green-700 font-medium">200+ Verified Vendors</span>
              </div>
              <div className="flex items-center bg-yellow-100 px-4 py-2 rounded-full">
                {/* Star solid icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-yellow-500 mr-2">
                  <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                </svg>
                <span className="text-yellow-700 font-medium">4.9/5 User Rating</span>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link
                href="/login"
                className="btn-primary text-lg px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg transition-mobile inline-flex items-center justify-center"
              >
                Sell Your Phone Now
                {/* ArrowRight icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Hero Phone Image */}
            <div className="flex justify-center">
              <div className="relative max-w-md mx-auto">
                <Image
                  src="/images/phone.png"
                  alt="Sellikko - Kerala's premier phone resale platform"
                  width={400}
                  height={400}
                  className="object-contain drop-shadow-2xl"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          BRANDS WE ACCEPT
          ============================================ */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-blue-50/30">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">We accept all major brands</h3>
          <p className="text-gray-600 mb-8">From premium flagships to budget-friendly devices</p>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 items-center">
            {/* Apple */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <div className="text-2xl font-bold text-gray-700" style={{ fontFamily: 'system-ui' }}>
                  
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700">Apple</span>
            </div>

            {/* Samsung */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-blue-600" style={{ fontFamily: 'Arial, sans-serif' }}>S</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Samsung</span>
            </div>

            {/* OnePlus */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-red-600">1+</span>
              </div>
              <span className="text-sm font-medium text-gray-700">OnePlus</span>
            </div>

            {/* Xiaomi */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-orange-600">Mi</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Xiaomi</span>
            </div>

            {/* Oppo */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-green-600">O</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Oppo</span>
            </div>

            {/* Vivo */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-purple-600">V</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Vivo</span>
            </div>

            {/* Realme */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-yellow-600">R</span>
              </div>
              <span className="text-sm font-medium text-gray-700">Realme</span>
            </div>

            {/* More */}
            <div className="flex flex-col items-center group cursor-pointer">
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3 group-hover:shadow-md transition-shadow border border-gray-100">
                <span className="text-lg font-bold text-gray-600">+10</span>
              </div>
              <span className="text-sm font-medium text-gray-700">&amp; More</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          HOW IT WORKS
          ============================================ */}
      <section id="how-it-works" className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Sell your phone in <span className="text-green-600">3 simple steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our streamlined process makes selling your phone fast, secure, and profitable
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-12">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold mb-8">
                1
              </div>
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                {/* DevicePhoneMobile icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Upload &amp; List</h3>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                Take photos of your device, enter specifications, and set your asking price. Our smart wizard guides you through the entire process.
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>4-angle photo upload</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>IMEI verification</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Set your price</span>
                </div>
              </div>
              {/* Connection Line */}
              <div className="hidden md:block absolute top-8 left-full w-12 h-px bg-gray-200" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }}></div>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold mb-8">
                2
              </div>
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                {/* CurrencyRupee icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Competitive Bids</h3>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                Verified vendors across Kerala compete to give you the best price. Receive multiple offers within hours of listing.
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>200+ verified vendors</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Real-time bidding</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Instant notifications</span>
                </div>
              </div>
              {/* Connection Line */}
              <div className="hidden md:block absolute top-8 left-full w-12 h-px bg-gray-200" style={{ width: 'calc(100% - 2rem)', left: 'calc(50% + 2rem)' }}></div>
            </div>

            {/* Step 3 */}
            <div className="relative text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-900 text-white rounded-full text-2xl font-bold mb-8">
                3
              </div>
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-gray-100">
                {/* ShieldCheck icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Doorstep Verification</h3>
              <p className="text-gray-600 leading-relaxed mb-6 max-w-sm mx-auto">
                Our certified agents visit your location, verify the device condition, and complete the payment instantly.
              </p>
              <div className="space-y-3 text-sm text-gray-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Professional verification</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Same-day pickup</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                  <span>Instant payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Trust Badge */}
          <div className="text-center mt-20">
            <div className="inline-flex items-center px-8 py-4 bg-gray-50 rounded-full border border-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-700 mr-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
              <span className="text-gray-800 font-medium">100% Safe &amp; Secure Process</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          WHY SELLIKKO
          ============================================ */}
      <section id="why-sellikko" className="py-20 bg-gradient-to-r from-gray-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Sellikko?</h2>
            <p className="text-lg text-gray-600">Upload phone and get your asking price in minutes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* 24 Hours */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {/* Clock icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">24 Hours</h3>
              <p className="text-gray-600 text-sm">Turnaround from listing to verification and pickup.</p>
            </div>

            {/* Verified */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Verified</h3>
              <p className="text-gray-600 text-sm">All vendors go through our verification process.</p>
            </div>

            {/* Your Price */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 8.25H9m6 3H9m3 6-3-3h1.5a3 3 0 1 0 0-6M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Your Price</h3>
              <p className="text-gray-600 text-sm">Set your asking price and get competitive bids.</p>
            </div>

            {/* Doorstep */}
            <div className="card-mobile bg-white/80 backdrop-blur-sm p-6 text-center hover:card-elevated transition-mobile">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                {/* UserGroup icon */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Doorstep</h3>
              <p className="text-gray-600 text-sm">Convenient pickup and payment at your location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          TESTIMONIAL
          ============================================ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card-mobile bg-white/80 backdrop-blur-sm p-8 lg:p-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">R</span>
              </div>
            </div>

            <blockquote className="text-xl md:text-2xl text-gray-900 font-medium mb-6">
              &ldquo;I sold my <span className="text-green-600 font-bold">iPhone 12</span> in less than{' '}
              <span className="text-green-600 font-bold">6 hours!</span> The vendors bought it for my price.
              The agents came to my home, verified the phone, and paid me cash.{' '}
              <span className="text-green-600 font-bold">Excellent service!</span>&rdquo;
            </blockquote>

            <div className="flex flex-col items-center">
              <div className="w-4 h-4 bg-red-500 rounded-full mb-2"></div>
              <cite className="text-gray-700 font-semibold not-italic">Rahul M.</cite>
              <p className="text-gray-500 text-sm">Kochi, Kerala</p>
              <p className="text-gray-500 text-sm">iPhone 12, 128GB</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          FINAL CTA
          ============================================ */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to turn your used phone into cash?
          </h2>
          <p className="text-xl mb-8 text-green-100">
            Join thousands of satisfied sellers across Kerala.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center px-8 py-4 bg-white text-green-600 font-semibold text-lg rounded-xl hover:bg-gray-50 transition-mobile shadow-lg active-scale-sm"
          >
            Sell Your Phone Now
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 ml-2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ============================================
          FOOTER
          ============================================ */}
      <footer className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-400">made by fairtreez</p>
        </div>
      </footer>
    </div>
  )
}
