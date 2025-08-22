export default function About() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              About ShareVent
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              We're revolutionizing how people connect, share, and create memorable experiences together. 
              ShareVent makes event planning effortless and brings communities closer.
            </p>
          </div>

          {/* Mission Section */}
          <div className="glass-effect rounded-2xl p-8 mb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  At ShareVent, we believe that meaningful connections happen when people come together. 
                  Our platform empowers organizers to create exceptional events while making it simple 
                  for attendees to discover and participate in experiences that matter to them.
                </p>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  Whether you're hosting a small gathering or organizing a large conference, ShareVent 
                  provides the tools and community to make your event unforgettable.
                </p>
              </div>
              <div className="relative">
                <div className="w-full h-64 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center">
                  <svg className="w-24 h-24 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="card-hover glass-effect rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Innovation</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We continuously push the boundaries of what's possible in event technology, 
                delivering cutting-edge solutions that exceed expectations.
              </p>
            </div>

            <div className="card-hover glass-effect rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Community</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Building authentic connections is at the heart of everything we do. 
                We foster environments where relationships flourish and communities thrive.
              </p>
            </div>

            <div className="card-hover glass-effect rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Excellence</h3>
              <p className="text-gray-600 dark:text-gray-300">
                We're committed to delivering exceptional experiences through attention to detail, 
                reliability, and unwavering quality in every aspect of our platform.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <div className="glass-effect rounded-2xl p-8 mb-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Meet Our Team</h2>
              <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Passionate individuals working together to create the future of event experiences.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { name: "Sarah Johnson", role: "CEO & Founder", color: "from-blue-400 to-purple-600" },
                { name: "Michael Chen", role: "CTO", color: "from-green-400 to-blue-600" },
                { name: "Emily Rodriguez", role: "Head of Design", color: "from-purple-400 to-pink-600" },
                { name: "David Kim", role: "Lead Developer", color: "from-orange-400 to-red-600" },
                { name: "Lisa Thompson", role: "Product Manager", color: "from-teal-400 to-green-600" },
                { name: "Alex Morgan", role: "Marketing Director", color: "from-indigo-400 to-purple-600" }
              ].map((member, index) => (
                <div key={index} className="text-center">
                  <div className={`w-24 h-24 bg-gradient-to-r ${member.color} rounded-full mx-auto mb-4 flex items-center justify-center`}>
                    <span className="text-white font-bold text-xl">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="glass-effect rounded-2xl p-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Get In Touch</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Have questions, suggestions, or want to partner with us? We'd love to hear from you!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-gradient text-white px-8 py-3 rounded-xl flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Contact Us</span>
              </button>
              
              <button className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-500 text-gray-700 dark:text-gray-200 px-8 py-3 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Support Center</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
