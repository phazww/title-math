// 2026 season data. Update after every race: points, wins, and remove the finished race from RACES.
window.UPDATED = "2026-10-11";
window.AFTER = "Singapore Grand Prix (round 17 of 23)";
window.POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
// No sprint weekends remain in 2026, so each race is worth 25 points at most.
window.RACES = [
  { code: "USA", name: "United States", place: "Austin", date: "25 Oct" },
  { code: "MEX", name: "Mexico City", place: "Mexico City", date: "1 Nov" },
  { code: "BRA", name: "São Paulo", place: "São Paulo", date: "8 Nov" },
  { code: "LVG", name: "Las Vegas", place: "Las Vegas", date: "21 Nov" },
  { code: "QAT", name: "Qatar", place: "Lusail", date: "29 Nov" },
  { code: "ABU", name: "Abu Dhabi", place: "Yas Marina", date: "6 Dec" }
];
// wins: grand prix wins so far, used only to break ties. Taken from a single source, so treat as provisional.
window.DRIVERS = [
  { code: "ANT", name: "Kimi Antonelli", team: "Mercedes", color: "#27F4D2", pts: 340, wins: 8 },
  { code: "RUS", name: "George Russell", team: "Mercedes", color: "#27F4D2", pts: 238, wins: 3 },
  { code: "HAM", name: "Lewis Hamilton", team: "Ferrari", color: "#E8002D", pts: 229, wins: 1 },
  { code: "VER", name: "Max Verstappen", team: "Red Bull", color: "#3671C6", pts: 221, wins: 2 },
  { code: "LEC", name: "Charles Leclerc", team: "Ferrari", color: "#E8002D", pts: 215, wins: 1 },
  { code: "NOR", name: "Lando Norris", team: "McLaren", color: "#FF8000", pts: 201, wins: 2 },
  { code: "PIA", name: "Oscar Piastri", team: "McLaren", color: "#FF8000", pts: 138, wins: 0 },
  { code: "HAD", name: "Isack Hadjar", team: "Red Bull", color: "#3671C6", pts: 97, wins: 0 },
  { code: "LAW", name: "Liam Lawson", team: "Racing Bulls", color: "#6692FF", pts: 75, wins: 0 },
  { code: "GAS", name: "Pierre Gasly", team: "Alpine", color: "#FF87BC", pts: 41, wins: 0 },
  { code: "LIN", name: "Arvid Lindblad", team: "Racing Bulls", color: "#6692FF", pts: 38, wins: 0 },
  { code: "COL", name: "Franco Colapinto", team: "Alpine", color: "#FF87BC", pts: 27, wins: 0 },
  { code: "BEA", name: "Oliver Bearman", team: "Haas", color: "#B6BABD", pts: 23, wins: 0 },
  { code: "HUL", name: "Nico Hülkenberg", team: "Audi", color: "#C0392B", pts: 13, wins: 0 },
  { code: "BOR", name: "Gabriel Bortoleto", team: "Audi", color: "#C0392B", pts: 10, wins: 0 },
  { code: "OCO", name: "Esteban Ocon", team: "Haas", color: "#B6BABD", pts: 7, wins: 0 },
  { code: "ALO", name: "Fernando Alonso", team: "Aston Martin", color: "#229971", pts: 7, wins: 0 },
  { code: "SAI", name: "Carlos Sainz", team: "Williams", color: "#1868DB", pts: 7, wins: 0 },
  { code: "ALB", name: "Alexander Albon", team: "Williams", color: "#1868DB", pts: 5, wins: 0 },
  { code: "TSU", name: "Yuki Tsunoda", team: "Racing Bulls", color: "#6692FF", pts: 1, wins: 0 },
  { code: "STR", name: "Lance Stroll", team: "Aston Martin", color: "#229971", pts: 0, wins: 0 },
  { code: "BOT", name: "Valtteri Bottas", team: "Cadillac", color: "#8A8D8F", pts: 0, wins: 0 },
  { code: "PER", name: "Sergio Pérez", team: "Cadillac", color: "#8A8D8F", pts: 0, wins: 0 }
];
