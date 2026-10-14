#!/usr/bin/env python3
"""Rebuild data.js from the Jolpica F1 API (the Ergast successor). Run after every race: python3 update.py"""
import json, re, sys, urllib.request
from datetime import date

API = "https://api.jolpi.ca/ergast/f1/2026"
COLORS = {"Mercedes": "#27F4D2", "Ferrari": "#E8002D", "Red Bull": "#3671C6", "McLaren": "#FF8000", "RB F1 Team": "#6692FF",
          "Racing Bulls": "#6692FF", "Alpine F1 Team": "#FF87BC", "Haas F1 Team": "#B6BABD", "Audi": "#C0392B", "Sauber": "#C0392B",
          "Aston Martin": "#229971", "Williams": "#1868DB", "Cadillac F1 Team": "#8A8D8F"}
SHORT = {"Alpine F1 Team": "Alpine", "Haas F1 Team": "Haas", "Cadillac F1 Team": "Cadillac", "RB F1 Team": "Racing Bulls"}
CODES = {"united_states": "USA", "mexico_city": "MEX", "brazilian": "BRA", "las_vegas": "LVG", "qatar": "QAT", "abu_dhabi": "ABU"}

def get(path):
    with urllib.request.urlopen(f"{API}/{path}?format=json&limit=100", timeout=30) as r:
        return json.load(r)["MRData"]

st = get("driverstandings/")["StandingsTable"]["StandingsLists"][0]
done_round = int(st["round"])
races = get("races/")["RaceTable"]["Races"]
last = next(r for r in races if int(r["round"]) == done_round)
left = [r for r in races if int(r["round"]) > done_round]
if any("Sprint" in r for r in left):
    sys.exit("A sprint weekend is still ahead. app.js assumes 25 points per weekend, update it first.")

drivers = []
for s in st["DriverStandings"]:
    team = s["Constructors"][-1]["name"]
    d = s["Driver"]
    drivers.append({"code": d.get("code") or d["familyName"][:3].upper(), "name": f'{d["givenName"]} {d["familyName"]}',
                    "team": SHORT.get(team, team), "color": COLORS.get(team, "#8A8D8F"), "pts": float(s["points"]), "wins": int(s["wins"])})
for d in drivers:
    if d["pts"].is_integer(): d["pts"] = int(d["pts"])

def race_entry(r):
    key = re.sub(r"_grand_prix$", "", r["raceName"].lower().replace(" ", "_"))
    day = date.fromisoformat(r["date"])
    return {"code": CODES.get(key, r["Circuit"]["circuitId"][:3].upper()), "name": r["raceName"].replace(" Grand Prix", ""),
            "place": r["Circuit"]["Location"]["locality"], "date": f"{day.day} {day.strftime('%b')}"}

out = f"""// 2026 season data, written by update.py from the Jolpica F1 API. Do not edit by hand, run: python3 update.py
window.UPDATED = "{date.today().isoformat()}";
window.AFTER = "{last['raceName']} (round {done_round} of {len(races)})";
window.POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
// No sprint weekends remain, so each race is worth 25 points at most.
window.RACES = {json.dumps([race_entry(r) for r in left], ensure_ascii=False, indent=2)};
// wins: grand prix wins so far, used only to break ties.
window.DRIVERS = {json.dumps(drivers, ensure_ascii=False, indent=2)};
"""
open("data.js", "w").write(out)
print(f"data.js updated after round {done_round}: {len(left)} races left, leader {drivers[0]['name']} {drivers[0]['pts']}")
