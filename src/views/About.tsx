function About() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-10 lg:px-15">
      <div className="mb-10 max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-black/60">
          About Tasi
        </p>
        <h1 className="mt-4 text-4xl font-main md:text-6xl">
          We build essentials that outlast the season.
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="rounded-[2rem] bg-[#161616] p-8 text-white">
          <p className="text-lg leading-relaxed text-white/80">
            Tasi began with a simple idea: thoughtful design should feel
            personal, useful, and quietly luxurious. We create clothing that
            balances ease, structure, and versatility so your wardrobe works
            harder for you.
          </p>
        </div>
        <div className="rounded-[2rem] bg-[#e7d8c2] p-8">
          <p className="text-lg leading-relaxed text-black/75">
            From silhouettes inspired by movement to refined everyday staples,
            every piece is designed with longevity in mind.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          [
            "Crafted slowly",
            "Thoughtful design choices and premium materials create pieces you keep for years.",
          ],
          [
            "Made to move",
            "Our silhouettes are shaped for real life — flexible, effortless, and wearable every day.",
          ],
          [
            "Designed responsibly",
            "We balance modern aesthetics with sustainable production practices and mindful sourcing.",
          ],
        ].map(([title, text]) => (
          <div
            key={title}
            className="rounded-[1.75rem] border border-black/10 bg-white/70 p-6"
          >
            <h2 className="text-2xl font-main">{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-black/70">
              {text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default About;
