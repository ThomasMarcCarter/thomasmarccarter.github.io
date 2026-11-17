export default function Game() {
  return (
    <section className="pt-16 pb-20 sm:pt-24" aria-labelledby="lolillion-title">
      <h1
        id="lolillion-title"
        className="text-[clamp(2.75rem,8vw,5.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em]"
      >
        Lolillion
      </h1>
      <p className="mt-6 max-w-[48ch] text-xl leading-snug sm:text-2xl">
        Daily League of Legends trivia. Coming soon.
      </p>
    </section>
  );
}
