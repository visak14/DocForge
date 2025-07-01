import Image from "next/image";
import Link from "next/link";


export default function Home() {
  return (
    <div >
       <main className="min-h-screen bg-white px-6 md:px-16 py-10 flex flex-col md:flex-row items-center justify-between gap-10">
      {/* Left Section */}
      <section className="max-w-xl">
       
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Online, collaborative documents
        </h1>
        <p className="text-gray-600 text-lg mb-6">
          AI-powered documents to help you and your team create and collaborate on content.
        </p>

        <div className="flex flex-wrap gap-4">
          <Link href="/signin">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded font-medium text-sm">
              Sign in
            </button>
          </Link>

          <button className="border border-gray-300 px-6 py-3 rounded text-sm font-medium hover:bg-gray-100">
            Try Docs for work
            <span className="ml-1">▾</span>
          </button>
        </div>
      </section>

      {/* Right Section */}
      <section className="max-w-xl w-full flex justify-center">
        <Image
          src="/docs.png"
          alt="Preview"
          width={800}
          height={600}
          className="rounded-xl shadow-xl"
        />
      </section>
    </main>
    </div>
  );
}
