type Props = {
  text: string;
  initialClassName?: string;
  className?: string;
};

const siteBasePath = process.env.NODE_ENV === "production" ? "/camos-tap-talks" : "";

export default function IconInitialHeading({
  text,
  className,
  initialClassName,
}: Props) {
  const firstChar = text.charAt(0);
  const restText = text.slice(1);

  return (
    <h2 className={className}>
      <span
        className={`relative mr-[0.5em] inline-grid h-[1.8em] w-[1.8em] place-items-center align-[0.1em] text-[0.92em] leading-none text-white ${initialClassName ?? ""}`}
        aria-hidden="true"
      >
        <span
          className="pointer-events-none absolute inset-0 bg-no-repeat"
          style={{
            backgroundImage: `url(${siteBasePath}/icon.png)`,
            backgroundSize: "100%",
            // backgroundPosition: "50% 50%",
            transform: "translate(0.22em, -0.18em) scale(1.5)",
            transformOrigin: "center",
          }}
        />
        <span className="relative z-10 text-[1.4em]">{firstChar}</span>
      </span>
      {restText}
    </h2>
  );
}
