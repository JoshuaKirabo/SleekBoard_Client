// Where company logos come from. Nothing here is stored on a server yet: a logo is either a URL we can point an
// <img> at or a data URL from a file the user picked. The lookups lean on Google's favicon service, which hands back
// a 16px globe when it has nothing, so "did we find one" is just "is the image bigger than a globe".

const FAVICON = "https://www.google.com/s2/favicons";
const SIZE = 128;

// Smaller than this and it's the fallback globe, not a logo.
const MIN_REAL = 24;

// Suffixes to try when all we have is a company name. Order matters: the first that resolves wins the auto pick.
const SUFFIXES = ["com", "io", "co", "app", "dev", "ai", "so", "org"];

// Public suffixes that take two labels, so "shop.example.co.uk" keeps "example.co.uk" and not "co.uk".
const DOUBLE_TLD = new Set(["co", "com", "org", "net", "ac", "gov", "edu"]);

export const faviconUrl = (domain) => `${FAVICON}?domain=${encodeURIComponent(domain)}&sz=${SIZE}`;

// The domain a favicon URL was built for, so the add sheet can say where a logo came from. Empty for anything else.
export const domainOfLogo = (url) => (url && url.startsWith(FAVICON) ? new URL(url).searchParams.get("domain") || "" : "");

// Pulls the registrable domain out of a URL or hostname. Logos live on the root site, and a careers subdomain
// often serves a worse favicon than the home page does.
export const rootDomain = (text) =>
  {
    if(!text) return "";
    let host = text.trim().toLowerCase();
    try
      {
        host = new URL(host.includes("://") ? host : `https://${host}`).hostname;
      }
    catch
      {
        return "";
      }
    const parts = host.split(".").filter(Boolean);
    if(parts.length < 2) return "";
    const keep = parts.length > 2 && DOUBLE_TLD.has(parts[parts.length - 2]) && parts[parts.length - 1].length === 2 ? 3 : 2;
    return parts.slice(-keep).join(".");
  };

// "Hugging Face" -> "huggingface". The bit before a suffix when we have to guess a domain from a name.
export const slugOf = (name) => name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]/g, "");

// Which image a job shows. An explicit logo wins, then the favicon of whatever site the listing lives on. Links on
// aggregators are skipped so a LinkedIn posting doesn't wear LinkedIn's logo.
const NOT_A_COMPANY = ["linkedin.com", "indeed.com", "glassdoor.com", "wellfound.com", "ycombinator.com", "simplify.jobs", "greenhouse.io", "lever.co", "ashbyhq.com", "workable.com", "smartrecruiters.com", "myworkdayjobs.com"];

export const logoFor = (job) =>
  {
    if(job.logo) return job.logo;
    const domain = rootDomain(job.link);
    if(!domain || NOT_A_COMPANY.some((site) => domain.endsWith(site))) return null;
    return faviconUrl(domain);
  };

// Loads a URL off-screen and says whether a real logo came back. Resolves false rather than rejecting so a batch of
// guesses can be awaited together.
const probe = (url) =>
  new Promise((resolve) =>
    {
      const image = new Image();
      image.onload = () => resolve(image.naturalWidth >= MIN_REAL);
      image.onerror = () => resolve(false);
      image.src = url;
    });

// Turns a company name or a domain into a list of logos that actually exist. A domain is tried as typed; a name is
// tried against the common suffixes. Results keep the order they were tried in.
export const findLogos = async (query) =>
  {
    const text = query.trim();
    if(!text) return [];
    const typedDomain = /\.[a-z]{2,}$/i.test(text) || text.includes("/") ? rootDomain(text) : "";
    const slug = slugOf(text);
    const domains = typedDomain ? [typedDomain] : slug ? SUFFIXES.map((suffix) => `${slug}.${suffix}`) : [];
    const candidates = domains.map((domain) => ({ domain, url: faviconUrl(domain) }));
    const hits = await Promise.all(candidates.map((candidate) => probe(candidate.url)));
    return candidates.filter((_, index) => hits[index]);
  };

// Reads a picked file into something we can store with the job. Rasters are squared off and shrunk to the logo size
// so a 3MB PNG doesn't end up in local state. SVGs stay as they are, they're already small and scale cleanly.
export const readLogoFile = (file) =>
  new Promise((resolve, reject) =>
    {
      if(!file.type.startsWith("image/")) return reject(new Error("That isn't an image."));
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Couldn't read that file."));
      reader.onload = () =>
        {
          if(file.type === "image/svg+xml") return resolve(reader.result);
          const image = new Image();
          image.onerror = () => reject(new Error("Couldn't read that image."));
          image.onload = () =>
            {
              const canvas = document.createElement("canvas");
              canvas.width = SIZE;
              canvas.height = SIZE;
              const context = canvas.getContext("2d");
              // Fit inside the square and centre it. Odd aspect ratios get letterboxed, not stretched.
              const scale = Math.min(SIZE / image.width, SIZE / image.height);
              const width = image.width * scale;
              const height = image.height * scale;
              context.drawImage(image, (SIZE - width) / 2, (SIZE - height) / 2, width, height);
              resolve(canvas.toDataURL("image/png"));
            };
          image.src = reader.result;
        };
      reader.readAsDataURL(file);
    });

// Brand colour, for the card hover. The favicon service won't let a canvas read its pixels, so remote logos are
// sampled through our own API; uploads are data URLs and sample directly. Resolves to an "r g b" triple for a CSS
// custom property, or null when the logo is monochrome, missing, or the API is down. Cached per logo for the session.
// Where to fetch a logo we're allowed to read. In dev, Vite proxies /logos to the favicon service itself (see
// vite.config.js) so nothing else has to be running; in a build it's the API's /logos route.
const LOGOS = import.meta.env.DEV ? "/logos" : `${import.meta.env.VITE_API_URL || "/api"}/logos`;
const SAMPLE = 24;
const HUE_BINS = 24;
const tints = new Map();

const sampleUrl = (logo) =>
  {
    if(logo.startsWith("data:")) return logo;
    const domain = domainOfLogo(logo);
    return domain ? `${LOGOS}/${encodeURIComponent(domain)}` : null;
  };

// Most saturated hue that covers a real share of the logo wins; whites, blacks and greys don't vote. Averaging the
// winning bin's pixels keeps a two-tone logo from landing on a muddy in-between.
const dominantColour = (pixels) =>
  {
    const bins = Array.from({ length: HUE_BINS }, () => ({ weight: 0, r: 0, g: 0, b: 0, n: 0 }));
    let opaque = 0;
    let chromatic = 0;

    for(let i = 0; i < pixels.length; i += 4)
      {
        const alpha = pixels[i + 3] / 255;
        if(alpha < 0.5) continue;
        opaque++;
        const r = pixels[i] / 255;
        const g = pixels[i + 1] / 255;
        const b = pixels[i + 2] / 255;
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const light = (max + min) / 2;
        const delta = max - min;
        const sat = delta === 0 ? 0 : delta / (1 - Math.abs(2 * light - 1));
        if(light < 0.12 || light > 0.92 || sat < 0.3) continue;
        chromatic++;

        let hue = 0;
        if(max === r) hue = ((g - b) / delta) % 6;
        else if(max === g) hue = (b - r) / delta + 2;
        else hue = (r - g) / delta + 4;
        hue = (hue * 60 + 360) % 360;

        const bin = bins[Math.floor(hue / (360 / HUE_BINS))];
        bin.weight += sat * alpha;
        bin.r += pixels[i];
        bin.g += pixels[i + 1];
        bin.b += pixels[i + 2];
        bin.n++;
      }

    if(!opaque || chromatic / opaque < 0.04) return null;
    const top = bins.reduce((best, bin) => (bin.weight > best.weight ? bin : best));
    return vivid(top.r / top.n, top.g / top.n, top.b / top.n);
  };

// Averaged favicon pixels come out dull, and a navy or maroon brand barely shows as a glow on a dark card. Keep the
// hue, set the lightness and chroma to one fixed level, so every brand lights the card the same amount. Done in
// OKLCH rather than HSL because a yellow and a blue at the same HSL lightness are nowhere near the same brightness
// to the eye, and the yellow would shout over its own text.
const LIGHT = 0.72;
const CHROMA = 0.16;

const toLinear = (channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
const toGamma = (channel) => (channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055);

const vivid = (r, g, b) =>
  {
    const [lr, lg, lb] = [r, g, b].map((channel) => toLinear(channel / 255));
    const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
    const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
    const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
    const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    const hue = Math.atan2(bb, a);

    // Back out at the fixed lightness and chroma, pulling the chroma in if the hue can't reach it in sRGB.
    for(let chroma = CHROMA; chroma >= 0; chroma -= 0.01)
      {
        const a2 = chroma * Math.cos(hue);
        const b2 = chroma * Math.sin(hue);
        const l2 = LIGHT + 0.3963377774 * a2 + 0.2158037573 * b2;
        const m2 = LIGHT - 0.1055613458 * a2 - 0.0638541728 * b2;
        const s2 = LIGHT - 0.0894841775 * a2 - 1.291485548 * b2;
        const L = l2 ** 3;
        const M = m2 ** 3;
        const S = s2 ** 3;
        const rgb = [
          4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
          -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
          -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
        ];
        if(rgb.every((channel) => channel >= -0.001 && channel <= 1.001))
          {
            return rgb.map((channel) => Math.round(toGamma(Math.min(Math.max(channel, 0), 1)) * 255)).join(" ");
          }
      }
    return `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;
  };

export const tintOf = (logo) =>
  {
    if(!logo) return Promise.resolve(null);
    if(tints.has(logo)) return tints.get(logo);

    const url = sampleUrl(logo);
    const promise = !url
      ? Promise.resolve(null)
      : new Promise((resolve) =>
          {
            const image = new Image();
            image.crossOrigin = "anonymous";
            image.onerror = () => resolve(null);
            image.onload = () =>
              {
                try
                  {
                    const canvas = document.createElement("canvas");
                    canvas.width = SAMPLE;
                    canvas.height = SAMPLE;
                    const context = canvas.getContext("2d", { willReadFrequently: true });
                    context.drawImage(image, 0, 0, SAMPLE, SAMPLE);
                    resolve(dominantColour(context.getImageData(0, 0, SAMPLE, SAMPLE).data));
                  }
                catch
                  {
                    // A tainted canvas throws on read. No colour, the card falls back to cream.
                    resolve(null);
                  }
              };
            image.src = url;
          });

    tints.set(logo, promise);
    return promise;
  };
