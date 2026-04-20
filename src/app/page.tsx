import { MarketingNav, MarketingCta } from "@/components/marketing-auth";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between h-14">
          <span className="font-bold text-lg">FeedbackIQ</span>
          <div className="flex items-center gap-4">
            <MarketingNav />
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4">
        <section className="py-24 text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            Turn user feedback<br />into pull requests
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Drop a widget on your site. Collect feedback from users.
            Our AI agent reads your codebase and creates a PR — automatically.
          </p>
          <MarketingCta
            signedOutLabel="Start for free"
            signedOutHref="/signup"
            signedInLabel="Go to dashboard"
            className="inline-block bg-black text-white px-8 py-3 rounded-md text-lg hover:bg-gray-800"
          />
        </section>

        <section className="py-16">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">1</div>
              <h3 className="font-semibold mb-2">Add the widget</h3>
              <p className="text-sm text-gray-600">
                One script tag on your site. Users see a feedback button in the corner.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">2</div>
              <h3 className="font-semibold mb-2">Collect feedback</h3>
              <p className="text-sm text-gray-600">
                Users describe what they want changed. The more detail, the better the PR.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">3</div>
              <h3 className="font-semibold mb-2">Review the PR</h3>
              <p className="text-sm text-gray-600">
                Our AI reads your codebase, makes the changes, and opens a pull request.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 text-center border-t">
          <h2 className="text-2xl font-bold mb-4">Ready to ship faster?</h2>
          <MarketingCta
            signedOutLabel="Get started"
            signedOutHref="/signup"
            signedInLabel="Open dashboard"
            className="inline-block bg-black text-white px-8 py-3 rounded-md hover:bg-gray-800"
          />
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-sm text-gray-500">
          FeedbackIQ
        </div>
      </footer>
    </div>
  );
}
