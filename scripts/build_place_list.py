#!/usr/bin/env python3
"""Rebuild public/data/places.json, the place list behind the Location type-ahead in
the Job Hunter popup (src/components/hunter/placeSearch.js). The same method as the
Kisaka website's scripts/build_place_list.py, for the US and Uganda.

Sources:
  geonames/   from https://download.geonames.org/export/dump/ : cities1000.txt (unzip
              cities1000.zip) and admin1CodesASCII.txt
  Uganda      the Kisaka website's data/places.json, built by its own script from
              GeoNames and OpenStreetMap; its Ugandan places are taken as they are,
              in its order.

Then: python3 scripts/build_place_list.py <geonames folder> <kisaka places.json> public/data

Each entry is [place, country]. A US place carries its state's code ("Sammamish, WA")
and is filled in as written; a Ugandan one carries its district ("Muyenga, Kampala")
and is filled in with the country, "Muyenga, Kampala, Uganda". The list is written in
order of how likely someone is to mean it, and the type-ahead keeps that order: the
two countries, US states, US cities of 50,000 and up and Uganda's cities, towns and
Kampala neighbourhoods; then US cities of 10,000 and up; then US towns; then the rest
of Uganda.
"""
import json, re, sys

geo, kisaka, out = sys.argv[1], sys.argv[2], sys.argv[3]

# Kisaka's list opens with Uganda's cities, towns and Kampala-area neighbourhoods
# (its tiers 0 and 1); its first place abroad marks where they end.
KISAKA_MAJOR_END = "Shanghai"

def rows(path):
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("#"):
                continue
            yield line.rstrip("\n").split("\t")

# --- US states and DC, as their own places: "California" ------------------------
states = {}
for r in rows(f"{geo}/admin1CodesASCII.txt"):
    if r[0].startswith("US."):
        states[r[0][3:]] = r[1]

# --- US cities and towns of 1,000 people and up, GeoNames --------------------------
us = {}
for r in rows(f"{geo}/cities1000.txt"):
    if r[8] != "US" or r[7] in ("PPLQ", "PPLH", "PPLW"):
        continue
    name, state, population = re.sub(r"\s+", " ", r[1]).strip(), r[10], int(r[14] or 0)
    # A few towns come twice, once as "City of Sammamish" or "City of Milford (balance)".
    name = re.sub(r" \(balance\)$", "", re.sub(r"^(City|Town|Village|Borough) of (?=[A-Z])", "", name))
    if state not in states or not name:
        continue
    key = re.sub(r"[^a-z0-9]", "", name.lower()) + "|" + state
    if key not in us or population > us[key][1]:
        us[key] = (f"{name}, {state}", population)

def us_tier(population):
    if population >= 50000:
        return 0
    return 1 if population >= 10000 else 2

# Bigger first, then the shorter name.
us_sorted = sorted(us.values(), key=lambda p: (us_tier(p[1]), -p[1], len(p[0]), p[0].lower()))

# --- Uganda, from Kisaka ------------------------------------------------------------
kisaka_places = json.load(open(kisaka, encoding="utf-8"))["places"]
end = next(i for i, p in enumerate(kisaka_places) if p[0] == KISAKA_MAJOR_END)
uganda_major = [p for p in kisaka_places[:end] if p[1] == "Uganda"]
uganda_rest = [p for p in kisaka_places[end:] if p[1] == "Uganda"]

place_list = (
    [["United States", ""], ["Uganda", ""]]
    + [[name, "United States"] for name in sorted(states.values(), key=len)]
    + [[p[0], "United States"] for p in us_sorted if us_tier(p[1]) == 0]
    + uganda_major
    + [[p[0], "United States"] for p in us_sorted if us_tier(p[1]) > 0]
    + uganda_rest
)

json.dump({
    "about": "Places for the Job Hunter's Location type-ahead, as [place, country], most likely first; the popup keeps this order. US places are filled in as written (\"Sammamish, WA\"), others with their country (\"Muyenga, Kampala, Uganda\"). Built from GeoNames (CC BY 4.0, geonames.org) and OpenStreetMap (ODbL, (c) OpenStreetMap contributors) by scripts/build_place_list.py. Not complete: the popup always accepts a typed place.",
    "built": "2026-11-06",
    "places": place_list,
}, open(f"{out}/places.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))

print("places:", len(place_list), "us:", sum(1 for p in place_list if p[1] == "United States"),
      "uganda:", sum(1 for p in place_list if p[1] == "Uganda"))
