import Image from "next/image";
import { Suspense } from "react";
import { Room3DScene } from "../components/Room3DScene";
import { RoomExperienceClient } from "../components/RoomExperienceClient";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-950 to-black text-zinc-50">
      <main className="mx-auto flex max-w-6xl flex-col gap-24 px-6 pb-24 pt-10 sm:px-8 lg:px-12">
        {/* Hero */}
        <section className="grid gap-10 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-center md:pt-8">
          <div className="space-y-6">
            <p className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs font-medium text-zinc-300 shadow-sm backdrop-blur">
              <span className="mr-2 inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
              AI‑Powered 3D Room Modeling
            </p>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-zinc-50 sm:text-5xl md:text-6xl">
              Design your{" "}
              <span className="bg-gradient-to-r from-emerald-400 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                dream room
              </span>{" "}
              from a single photo.
            </h1>
            <p className="max-w-xl text-balance text-sm text-zinc-400 sm:text-base">
              Upload a photo of your space and get a rule‑aware, physics‑correct
              3D replica—every wall, doorway, and piece of furniture mapped in
              1:1 scale. Tweak layouts with instant validation and auto‑fix.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-emerald-950 shadow-lg shadow-emerald-500/30 transition hover:bg-emerald-300">
                Start designing free
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/40 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900">
                Watch product demo
              </button>
              <p className="ml-1 text-xs text-zinc-500">
                Trusted by 10,000+ designers and DIY creators.
              </p>
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-tr from-emerald-500/10 via-sky-500/10 to-violet-500/10 blur-2xl" />
            <div className="relative rounded-3xl border border-zinc-800/80 bg-zinc-950/80 p-4 shadow-2xl shadow-emerald-500/10 backdrop-blur">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Live layout analysis
                </div>
                <div className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <span>Physics</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>Movement</span>
                  <span className="h-1 w-1 rounded-full bg-zinc-700" />
                  <span>Visual</span>
                </div>
              </div>
              <Suspense
                fallback={
                  <div className="h-80 w-full animate-pulse rounded-2xl bg-zinc-900/80" />
                }
              >
                <Room3DScene />
              </Suspense>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="space-y-10">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50 sm:text-3xl">
              From photo to physics‑aware 3D in seconds.
            </h2>
            <p className="max-w-2xl text-sm text-zinc-400 sm:text-base">
              Each layout is validated across eight levels—from hard physics and
              architectural accuracy to movement, clearances, zoning, and visual
              balance—so your designs feel as good as they look.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <FeatureCard
              title="Photo → 3D replica"
              description="Upload a single photo; we reconstruct walls, doors, and furniture in 1:1 scale, ready for editing."
            />
            <FeatureCard
              title="AI furniture mapping"
              description="Beds, sofas, desks, and more are auto‑typed and placed with smart defaults you can override."
            />
            <FeatureCard
              title="Rule‑aware 3D editor"
              description="Drag and drop furniture while real‑time rules prevent wall clipping, overlaps, and blocked doors."
            />
            <FeatureCard
              title="Auto‑fix layouts"
              description="One click snaps wall‑huggers to walls, centers rugs and tables, and separates overlapping items."
            />
          </div>
        </section>

        {/* Upload CTA */}
        <section className="grid gap-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 px-6 py-8 shadow-xl sm:px-8 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Upload your room. See the magic.
            </h2>
            <p className="max-w-xl text-sm text-zinc-400 sm:text-base">
              Drop in up to five JPG or PNG photos of the same room. We parse
              geometry, infer furniture, and return a clean, editable 3D room
              with validation turned on from the very first frame.
            </p>
            <RoomExperienceClient />
            <p className="text-xs text-zinc-500">
              We never train on your personal imagery. You stay in full control
              of your data.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">
              Smart furniture catalog
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <CatalogCard label="Modern sofa" />
              <CatalogCard label="Floor lamp" />
              <CatalogCard label="Wall art" />
              <CatalogCard label="Indoor plant" />
            </div>
            <button className="mt-2 flex h-24 items-center justify-center rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-zinc-900">
              Upload custom furniture model
            </button>
          </div>
        </section>

        {/* Final CTA */}
        <section className="rounded-3xl border border-zinc-800 bg-gradient-to-r from-emerald-500/10 via-sky-500/10 to-violet-500/10 px-6 py-8 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-zinc-50">
                Ready to bring your dream room to life?
              </h2>
              <p className="text-sm text-zinc-300 sm:text-base">
                Start free, design three full projects, and upgrade only when
                you are ready to share with clients.
              </p>
              <p className="text-xs text-zinc-400">
                No credit card required · Free tier includes 3 projects.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="inline-flex items-center justify-center rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-950 shadow-sm transition hover:bg-zinc-200">
                Get started for free
              </button>
              <button className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/40 px-5 py-2.5 text-sm font-medium text-zinc-100 transition hover:bg-zinc-900">
                Schedule a live demo
              </button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-4 flex flex-col gap-4 border-t border-zinc-900 pt-6 text-xs text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-zinc-400">
            <Image
              src="/next.svg"
              alt="Logo"
              width={20}
              height={20}
              className="invert"
            />
            <span>Megan&apos;s Home</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="#" className="hover:text-zinc-300">
              Product
            </a>
            <a href="#" className="hover:text-zinc-300">
              Resources
            </a>
            <a href="#" className="hover:text-zinc-300">
              Company
            </a>
          </div>
          <p className="text-xs text-zinc-600">
            © {new Date().getFullYear()} Megan&apos;s Home. All rights
            reserved.
          </p>
        </footer>
      </main>
    </div>
  );
}

function FeatureCard(props: { title: string; description: string }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4">
      <h3 className="text-sm font-semibold text-zinc-100">{props.title}</h3>
      <p className="text-xs text-zinc-400 sm:text-sm">{props.description}</p>
    </div>
  );
}

function CatalogCard(props: { label: string }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-950/40 p-3">
      <div className="h-16 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950" />
      <p className="mt-2 text-xs font-medium text-zinc-200">{props.label}</p>
    </div>
  );
}

