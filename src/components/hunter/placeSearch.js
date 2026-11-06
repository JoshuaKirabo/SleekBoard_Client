import { LOCATION_SUGGESTIONS } from "./huntOptions.js";
import { US_STATES } from "./usStates.js";

// The Location type-ahead, the same as the Kisaka job application's. Our own places answer first, in their own
// order: the hunt's short list, then public/data/places.json (every US state, city and town of 1,000 people and up,
// and Uganda's places from Kisaka's list; scripts/build_place_list.py builds it). The file loads the first time the
// box is used. Photon (photon.komoot.io, OpenStreetMap data, no key) knows every town in the world and fills in the
// rest. Only the Location text is sent, once three letters are in and typing has paused; a slow or missing Photon
// only means fewer suggestions, and whatever you type is still kept.
const PLACES_URL = "/data/places.json";
const PHOTON = "https://photon.komoot.io/api/?limit=8&lang=en&osm_tag=place&q=";
const MAX_SHOWN = 8;
const REMOTE_MIN = 3;
export const REMOTE_WAIT = 250;

// Names are compared in a plain form, so "St Louis" finds "Saint Louis" and "mt" finds "Mount".
const SAME_WORDS = { st: "saint", mt: "mount", ft: "fort" };

const plain = (text) => String(text || "").toLowerCase()
  .replace(/[’'.]/g, "")
  .replace(/[^a-z0-9]+/g, " ")
  .trim()
  .split(" ")
  .map((word) => SAME_WORDS[word] || word)
  .join(" ");

// One suggestion: `label` and `country` are what the menu shows, `value` is what lands in the field.
const placeOf = (label, country, value) => ({ label, country, value, plain: plain(value) });

// A place from the file, [place, country]. US places and the countries themselves land as written; the rest take
// their country, the way Kisaka fills them: "Muyenga, Kampala, Uganda".
const listed = ([name, country]) => placeOf(name, country, !country || country === "United States" ? name : `${name}, ${country}`);

class PlaceSearch
  {
    #local = LOCATION_SUGGESTIONS.map((name) => placeOf(name, "", name));
    #loading = null;
    #remote = new Map();

    // Loads the place file once, however many boxes ask; true once it's in. If it can't be had, the short list is all
    // there is, and the next use tries again.
    load()
      {
        if(!this.#loading)
          {
            this.#loading = fetch(PLACES_URL)
              .then((response) =>
                {
                  if(!response.ok) throw new Error("Place list not found");
                  return response.json();
                })
              .then((data) =>
                {
                  const places = (data.places || []).map(listed);
                  // The short list keeps its lead but takes the file's country, so "Seattle, WA" reads like the rest.
                  this.#local = [...this.#local.map((own) => places.find((place) => place.plain === own.plain) || own), ...places];
                  return true;
                })
              .catch(() =>
                {
                  this.#loading = null;
                  return false;
                });
          }
        return this.#loading;
      }

    // Our own places that match: every typed word must start a word in the name. Ones that start with the whole of
    // what was typed come first, and the list's order holds after that.
    local(query)
      {
        const words = plain(query).split(" ").filter(Boolean);
        if(!words.length) return [];
        const joined = words.join(" ");
        return this.#local
          .filter((place) => words.every((word) => ` ${place.plain}`.includes(` ${word}`)))
          .map((place, rank) => ({ place, rank, starts: place.plain.startsWith(joined) ? 0 : 1 }))
          .sort((a, b) => a.starts - b.starts || a.rank - b.rank)
          .map(({ place }) => place);
      }

    // Whether a query is long enough to be worth asking Photon about.
    asksRemote(query)
      {
        return plain(query).length >= REMOTE_MIN;
      }

    // Photon's places for a query. Each query is asked once; a failed one is forgotten so the next try asks again.
    remote(query)
      {
        const key = plain(query);
        if(!this.#remote.has(key))
          {
            const found = fetch(PHOTON + encodeURIComponent(query.trim()))
              .then((response) =>
                {
                  if(!response.ok) throw new Error("Place search failed");
                  return response.json();
                })
              .then((data) => (data.features || []).map((feature) => this.#placeFrom(feature.properties || {})).filter(Boolean))
              .catch(() =>
                {
                  this.#remote.delete(key);
                  return [];
                });
            this.#remote.set(key, found);
          }
        return this.#remote.get(key);
      }

    // Our own matches lead, then Photon's, leaving out anything already shown or already picked.
    merge(local, remote, picked = [])
      {
        const seen = new Set(picked.map(plain));
        const keep = Math.max(MAX_SHOWN - remote.length, 4);
        const merged = [];
        for(const place of [...local.slice(0, keep), ...remote, ...local.slice(keep)])
          {
            if(seen.has(place.plain) || merged.length >= MAX_SHOWN) continue;
            seen.add(place.plain);
            merged.push(place);
          }
        return merged;
      }

    // A Photon result as a suggestion, or null when it can't say which country it's in.
    #placeFrom(p)
      {
        if(!p.name || !p.country) return null;
        if(p.osm_value === "country") return placeOf(p.name, "", p.name);
        if(p.countrycode === "US") return this.#american(p);
        const label = this.#withArea(p);
        return placeOf(label, p.country, `${label}, ${p.country}`);
      }

    // "Sammamish, WA", "Sammamish Valley, Redmond, WA", or a state on its own, "California".
    #american(p)
      {
        const city = p.city && p.city !== p.name ? p.city : "";
        const state = p.state && p.state !== p.name ? US_STATES[p.state] || p.state : "";
        const label = [p.name, city, state].filter(Boolean).join(", ") || p.name;
        return placeOf(label, p.country, label);
      }

    // The place and the city or state it's in, as Kisaka writes them. In Uganda the city or district says where
    // ("Muyenga, Kampala"); its four regions say little.
    #withArea(p)
      {
        const uganda = p.countrycode === "UG";
        let area = uganda ? p.city || p.county || (/Region$/.test(p.state || "") ? "" : p.state) : p.city || p.state;
        if(!area || area === p.name) area = uganda || p.state === p.name ? "" : p.state;
        return area ? `${p.name}, ${area}` : p.name;
      }
  }

export const placeSearch = new PlaceSearch();
