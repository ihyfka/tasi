function Privacy() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-10 lg:px-16">
      <p className="text-xs font-medium uppercase tracking-widest text-black/60">
        Privacy policy
      </p>
      <h1 className="mt-4 text-4xl font-main md:text-5xl">
        Your information stays yours.
      </h1>

      <div className="mt-10 space-y-8 text-base leading-7 text-black/75">
        <p>
          We collect only the information needed to provide a secure and
          personalized shopping experience. This may include your contact
          details, order history, preferences, and interactions with our
          website.
        </p>
        <p>
          We use this information to process orders, improve our services,
          communicate updates, and support customer care. We do not sell
          personal data to third parties.
        </p>
        <p>
          We may share data with trusted partners who help us with shipping,
          payment processing, analytics, and website security, subject to
          confidentiality obligations.
        </p>
        <p>
          You can request access, correction, or deletion of your personal
          information at any time by contacting us <a href="mailto:ihyfka@gmail.com" className="font-semibold">here</a>.
        </p>
      </div>
    </div>
  );
}

export default Privacy;