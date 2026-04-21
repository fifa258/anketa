const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));

// načtení dat
function loadResponses() {
  if (!fs.existsSync("responses.json")) return [];
  return JSON.parse(fs.readFileSync("responses.json", "utf8"));
}

// uložení
function saveResponse(item) {
  const data = loadResponses();
  data.push(item);
  fs.writeFileSync("responses.json", JSON.stringify(data, null, 2));
}

// formulář
app.get("/", (req, res) => {
  res.render("index");
});

// submit
app.post("/submit", (req, res) => {
  const { pohlavi, cviceni, typ, delka, duvod } = req.body;

  // kontrola prázdných hodnot
  if (!pohlavi || !cviceni || !typ || !delka || !duvod) {
    console.log("❌ Neúplný formulář - neuloženo");
    return res.redirect("/");
  }

  const newResponse = {
    pohlavi,
    cviceni,
    typ,
    delka,
    duvod,
    timestamp: new Date()
  };

  saveResponse(newResponse);

  res.redirect("/results");
});

app.get("/results", (req, res) => {
  const responses = loadResponses();

  let total = responses.length;

  let cviceniCount = {
    "0": 0,
    "1-2": 0,
    "3-4": 0,
    "5+": 0
  };

  let typCount = {
    posilovna: 0,
    sport: 0,
    oboji: 0
  };

  let duvodCount = {
    zdravi: 0,
    vzhled: 0,
    zabava: 0
  };

  responses.forEach(r => {
    if (cviceniCount[r.cviceni] !== undefined) cviceniCount[r.cviceni]++;
    if (typCount[r.typ] !== undefined) typCount[r.typ]++;
    if (duvodCount[r.duvod] !== undefined) duvodCount[r.duvod]++;
  });

  res.render("results", {
    total,
    cviceniCount,
    typCount,
    duvodCount,
    responses
  });
});

app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});