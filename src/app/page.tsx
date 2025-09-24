export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-lg">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Test Page
                </h1>
                <p className="text-gray-600">
                    This is a test page to check if routing works.
                </p>
                <div className="mt-4">
                    <a
                        href="/dashboard"
                        className="text-blue-600 hover:text-blue-800 underline"
                    >
                        Go to Dashboard
                    </a>
                </div>
            </div>
        </div>
    );
}
