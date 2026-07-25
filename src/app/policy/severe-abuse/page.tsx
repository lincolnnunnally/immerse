import Link from "next/link";
import { IMMERSE_PROTECTION, SEVERE_ABUSE_POLICY } from "@/lib/trust";

export default function SevereAbusePolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-sm text-forest-500 mb-2">Host & land protection</p>
      <h1 className="text-3xl font-bold text-forest-900 mb-3">{SEVERE_ABUSE_POLICY.title}</h1>
      <p className="text-forest-700 text-lg leading-relaxed mb-8">{SEVERE_ABUSE_POLICY.summary}</p>

      <section className="mb-8 rounded-2xl border border-red-200 bg-red-50/80 p-6">
        <h2 className="font-semibold text-forest-900 mb-3">What counts as severe abuse</h2>
        <ul className="space-y-2 text-sm text-forest-800">
          {SEVERE_ABUSE_POLICY.examples.map((ex) => (
            <li key={ex} className="flex gap-2">
              <span className="text-red-700">▸</span>
              {ex}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-forest-900 text-lg mb-3">What Immerse will do</h2>
        <ol className="list-decimal ml-5 space-y-2 text-sm text-forest-800">
          {SEVERE_ABUSE_POLICY.platformResponse.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="font-semibold text-forest-900 text-lg mb-3">Host rights</h2>
        <ul className="space-y-2 text-sm text-forest-800">
          {SEVERE_ABUSE_POLICY.hostRights.map((r) => (
            <li key={r} className="flex gap-2">
              <span className="text-forest-500">▸</span>
              {r}
            </li>
          ))}
        </ul>
      </section>

      <section className="mb-8 rounded-2xl bg-forest-50 border border-forest-100 p-6">
        <h2 className="font-semibold text-forest-900 mb-2">Honest limit of Care</h2>
        <p className="text-sm text-forest-800 mb-3">{IMMERSE_PROTECTION.irreversibleHarmNote}</p>
        <p className="text-sm text-forest-700 italic">{SEVERE_ABUSE_POLICY.honesty}</p>
      </section>

      <section className="mb-10 text-sm text-forest-700">
        <h2 className="font-semibold text-forest-900 mb-2">If this happens to you</h2>
        <ol className="list-decimal ml-5 space-y-1.5">
          <li>Do not confront if you feel unsafe — prioritize your safety.</li>
          <li>Photograph the scene if you can do so safely (wide shots + details).</li>
          <li>Note dates, times, vehicle descriptions, and any names you have.</li>
          <li>Contact local law enforcement and, for wildlife, your state wildlife / conservation agency.</li>
          <li>Report the stay in Immerse with the evidence so the account can be banned.</li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/trust"
          className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white font-semibold hover:bg-forest-800"
        >
          Full trust system
        </Link>
        <Link
          href="/host"
          className="inline-flex px-5 py-2.5 rounded-full border border-forest-300 text-forest-800 font-medium hover:bg-forest-50"
        >
          Hosting on Immerse
        </Link>
      </div>
    </div>
  );
}
