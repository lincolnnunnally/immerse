import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12 prose prose-forest">
      <h1 className="text-3xl font-bold text-forest-900 mb-4">Privacy</h1>
      <p className="text-forest-700 leading-relaxed mb-4">
        Immerse is part of the Life Produces Life / United Under God family of tools. We collect
        only what we need to help you plan time in nature and keep the service honest.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">What we collect</h2>
      <ul className="list-disc ml-5 text-forest-700 space-y-1 mb-4">
        <li>Account email and optional display name when you sign up</li>
        <li>Saved trips and adventure videos you choose to post</li>
        <li>Private-stay interest forms and park-partner interest forms you submit</li>
        <li>Basic product analytics (page views, anonymous session id) to improve the tool</li>
      </ul>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">How we use it</h2>
      <ul className="list-disc ml-5 text-forest-700 space-y-1 mb-4">
        <li>Sync your trips across devices</li>
        <li>Show public adventure videos you mark as public</li>
        <li>Respond to partner or stay interest (when those programs are active)</li>
        <li>Connect your growth journey with other ecosystem tools you already use</li>
      </ul>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">What we don&apos;t do</h2>
      <ul className="list-disc ml-5 text-forest-700 space-y-1 mb-4">
        <li>We do not sell your personal data</li>
        <li>We do not show fake community members as real people</li>
        <li>We do not take payment for private stays until fulfillment is proven</li>
      </ul>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Third parties</h2>
      <p className="text-forest-700 leading-relaxed mb-4">
        Campground inventory may load from Recreation.gov / RIDB. YouTube embeds load only when you
        view adventure videos. Auth and data are stored on our shared Supabase project.
      </p>
      <h2 className="text-xl font-semibold text-forest-900 mt-8 mb-2">Contact</h2>
      <p className="text-forest-700 leading-relaxed mb-8">
        Privacy questions:{" "}
        <a className="underline" href="mailto:privacy@unitedundergod.org">
          privacy@unitedundergod.org
        </a>
      </p>
      <Link href="/" className="text-forest-700 underline text-sm">
        ← Home
      </Link>
    </div>
  );
}
