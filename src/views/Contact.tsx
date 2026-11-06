"use client";

function Contact() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 md:px-10 lg:px-15">
      <div className="mb-10 max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-black/60">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-main md:text-6xl">
          Let’s talk styling, support, and custom requests.
        </h1>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.1fr_0.9fr]">
        <form className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-black/5 md:p-8">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm font-medium text-black/70">
              Name
              <input
                type="text"
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none focus:border-black"
                placeholder="Your name"
              />
            </label>
            <label className="block text-sm font-medium text-black/70">
              Email
              <input
                type="email"
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none focus:border-black"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label className="mt-5 block text-sm font-medium text-black/70">
            Message
            <textarea
              rows={6}
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3 outline-none focus:border-black"
              placeholder="Tell us how we can help."
            />
          </label>

          <button
            type="submit"
            className="mt-6 inline-flex items-center rounded-full bg-[#161616] px-6 py-3 text-sm font-medium text-white transition hover:bg-black"
          >
            Send message
          </button>
        </form>

        <div className="rounded-[2rem] bg-[#e7d8c2] p-8">
          <h2 className="text-2xl font-main">Reach us</h2>
          <ul className="mt-6 space-y-5 text-base text-black/75">
            <li>
              <span className="block text-xs uppercase tracking-[0.24em] text-black/60">
                Email
              </span>
              hello@tasi.studio
            </li>
            <li>
              <span className="block text-xs uppercase tracking-[0.24em] text-black/60">
                Call
              </span>
              +1 (415) 555-0194
            </li>
            <li>
              <span className="block text-xs uppercase tracking-[0.24em] text-black/60">
                Visit
              </span>
              44 Mercer Street, New York, NY
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Contact;
