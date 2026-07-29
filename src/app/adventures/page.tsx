import Link from "next/link";
import { createAdminClient } from "@/lib/supabase-admin";
import { youtubeEmbedUrl } from "@/lib/youtube";

export const dynamic = "force-dynamic";

type Adventure = {
  id: string;
  title: string;
  story: string | null;
  youtube_id: string;
  site_name: string | null;
  site_id: string | null;
  state: string | null;
  created_at: string;
};

async function loadAdventures(): Promise<Adventure[]> {
  const admin = createAdminClient();
  if (!admin) return [];
  const { data } = await admin
    .from("immerse_adventures")
    .select("id, title, story, youtube_id, site_name, site_id, state, created_at")
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(36);
  return (data || []) as Adventure[];
}

export default async function AdventuresPage() {
  const adventures = await loadAdventures();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-bold text-forest-900 mb-2">Adventures</h1>
          <p className="text-forest-700 max-w-xl">
            Real trips, real places — link your YouTube videos so others can feel the land before
            they go. Parks and managers can see what people love about their sites.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/adventures/new"
            className="inline-flex px-5 py-2.5 rounded-full bg-forest-700 text-white text-sm font-semibold hover:bg-forest-800"
          >
            Share a video
          </Link>
          <Link
            href="/partners"
            className="inline-flex px-5 py-2.5 rounded-full border border-forest-300 text-forest-800 text-sm font-medium hover:bg-forest-50"
          >
            For parks & managers
          </Link>
        </div>
      </div>

      {adventures.length === 0 ? (
        <div className="text-center py-16 rounded-2xl border border-forest-100 bg-forest-50">
          <p className="text-forest-900 font-medium mb-2">No public adventures yet</p>
          <p className="text-sm text-forest-600 mb-6 max-w-md mx-auto">
            Be the first — film a trip (or link one you already posted) and show what immersion looks
            like at a real site.
          </p>
          <Link
            href="/adventures/new"
            className="inline-flex px-6 py-3 rounded-full bg-forest-700 text-white font-semibold"
          >
            Post the first adventure
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {adventures.map((a) => (
            <article
              key={a.id}
              className="bg-white rounded-2xl border border-forest-100 overflow-hidden shadow-sm"
            >
              <div className="aspect-video bg-forest-900">
                <iframe
                  title={a.title}
                  src={youtubeEmbedUrl(a.youtube_id)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h2 className="font-semibold text-lg text-forest-900 mb-1">{a.title}</h2>
                {a.site_name && (
                  <p className="text-sm text-forest-600 mb-2">
                    {a.site_id ? (
                      <Link href={`/site/${a.site_id}`} className="underline hover:text-forest-800">
                        {a.site_name}
                      </Link>
                    ) : (
                      a.site_name
                    )}
                    {a.state ? ` · ${a.state}` : ""}
                  </p>
                )}
                {a.story && (
                  <p className="text-sm text-forest-700 leading-relaxed line-clamp-4">{a.story}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
