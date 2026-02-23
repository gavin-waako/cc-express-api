import express from "express";
import fs from "fs/promises";

const app = express();
const PORT = 3000;
let congressData = [];

// Load data immediately on startup
async function loadData() {
  try {
    const data = await fs.readFile("legislators-current.json", "utf8");
    congressData = JSON.parse(data);
    console.log("Congress data loaded successfully.");
  } catch (err) {
    console.error("Failed to load data file:", err);
  }
}

// /getPerson?bioguide=######
app.get("/getPerson", (req, res) => {
  const { bioguide } = req.query;

  if (!bioguide) {
    return res.status(400).send("Missing bioguide parameter.");
  }

  const person = congressData.find((p) => p.id.bioguide === bioguide);

  if (person) {
    res.json(person);
  } else {
    res.status(404).send("Congressperson not found.");
  }
});

// /getAllPeople?FIELD=VALUE
app.get("/getAllPeople", (req, res) => {
  const filters = req.query;
  const filterKeys = Object.keys(filters);

  if (filterKeys.length === 0) {
    return res.json(congressData);
  }

  const filteredList = congressData.filter((person) => {
    return filterKeys.every((key) => {
      const val = filters[key];
      const lastTerm = person.terms[person.terms.length - 1];

      // Check top-level, bio, and the most recent term attributes
      return (
        person[key] == val ||
        (person.bio && person.bio[key] == val) ||
        (lastTerm && lastTerm[key] == val)
      );
    });
  });

  res.json(filteredList);
});

// Run loader then start server
loadData().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
});
