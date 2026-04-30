import React from 'react'

const Footer = ({ footerRef }) => {
  return (
    <div ref={footerRef}>
      <section className="py-16 px-6 bg-red-900 text-orange-200">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-3xl font-bold mr-3">नेवा:</div>
                <div className="text-orange-200 text-2xl font-bold">Newa Baji</div>
              </div>
              <p className="text-lg text-orange-300 leading-relaxed mb-4">
                Preserving and sharing the authentic culinary traditions of the Newari people.
                Each dish tells the story of our ancestors and celebrates the rich heritage of Nepal.
              </p>
              <p className="text-orange-400 font-semibold">
                "भोजन मात्र नभएर, यो हाम्रो संस्कृति हो" - Food is not just sustenance, it's our culture
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">स्थान (Location)</h3>
              <p className="text-orange-300">Balaju, Baisdhara</p>

              <p className="text-orange-300">Kathmandu, Nepal</p>
              <p className="text-orange-300 mt-2">Near Ancient Temple</p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-yellow-400 mb-4">समय तालिका</h3>
              <p className="text-orange-300 mb-2">Sunday - Friday</p>
              <p className="text-orange-300 mb-2">11:00 AM - 9:00 PM</p>
              <p className="text-orange-300 mb-4">Saturday: 10:00 AM - 10:00 PM</p>
              <p className="text-orange-300">For Contact: +977-9810369555</p>
              <p className="text-orange-300">amo998@gmail.com</p>
            </div>
          </div>
        </div>
      </section>

      <div className="h-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-500"></div>
      <footer className="bg-red-800 text-orange-400 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p>&copy; {new Date().getFullYear()} Newa Baji Restaurant. सबै अधिकार सुरक्षित। Preserving tradition, one meal at a time.</p>
        </div>
      </footer></div>
  )
}

export default Footer