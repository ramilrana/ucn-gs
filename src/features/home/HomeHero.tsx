import campusBanner from '../../assets/home/campus-aerial.webp?w=640;1280&format=webp&as=picture';

interface HomeHeroProps {
  universityName: string;
  schoolName: string;
  programName?: string;
}

/**
 * Home banner: a decorative campus photo under a maroon tint that is solid behind the text and fades to the photo on
 * the right (fully tinted below lg). The text always sits on near-solid maroon, so its contrast never depends on the
 * photo. Gold text is allowed here because it is on maroon (D9).
 */
export function HomeHero({ universityName, schoolName, programName }: HomeHeroProps) {
  return (
    <div className="on-maroon relative isolate overflow-hidden bg-maroon-900 text-white">
      <img
        src={campusBanner.img.src}
        srcSet={Object.values(campusBanner.sources)[0]}
        sizes="100vw"
        width={campusBanner.img.w}
        height={campusBanner.img.h}
        alt=""
        fetchPriority="high"
        className="absolute inset-0 -z-10 h-full w-full object-cover"
      />
      <div
        aria-hidden="true"
        // Between lg and xl the title runs to about 68% of the width, so the solid part reaches 65% there (a 2.9:1 gold
        // contrast at 1024px over a bright roof before this change); from xl the title ends near 55%.
        className="absolute inset-0 -z-10 bg-maroon-800/90 lg:bg-transparent lg:bg-linear-to-r lg:from-maroon-800 lg:from-65% lg:via-maroon-800/80 lg:via-80% lg:to-transparent xl:from-50% xl:via-65%"
      />
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20 lg:py-24">
        <div className="max-w-xl lg:max-w-3xl">
          <h1
            id="page-title"
            tabIndex={-1}
            className="font-serif text-3xl font-semibold leading-tight tracking-tight text-white outline-none sm:text-4xl lg:text-5xl"
          >
            <span className="reveal block text-gold-500">{universityName}</span>{' '}
            <span className="reveal block [--d:1]">{schoolName}</span>
          </h1>
          {programName && <p className="reveal mt-3 max-w-[60ch] text-lg [--d:2] text-white sm:text-xl">{programName}</p>}
          <div aria-hidden="true" className="reveal-rule mt-5 h-[3px] w-16 bg-gold-500 [--d:2]" />
        </div>
      </div>
    </div>
  );
}
