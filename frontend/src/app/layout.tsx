import React from "react"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>Campus Lost & Found Intelligence System</title>
        <meta name="description" content="Find your lost items on campus" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="bg-gray-50">
        <nav className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary">Campus Lost & Found</h1>
            <div className="flex gap-4">
              <a href="/feed" className="text-gray-600 hover:text-primary">
                Browse
              </a>
              <a href="/report/lost" className="text-gray-600 hover:text-primary">
                Report Lost
              </a>
              <a href="/report/found" className="text-gray-600 hover:text-primary">
                Report Found
              </a>
              <a href="/dashboard" className="text-gray-600 hover:text-primary">
                Dashboard
              </a>
              <a href="/login" className="bg-primary text-white px-4 py-2 rounded">
                Login
              </a>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
