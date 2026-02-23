import { Router } from "express";
import fs from "fs";

let politician_routes = Router();

let politician_database = [];
try {
  const rawData = fs.readFileSync("legislators-current.json", "utf8");
  politician_database = JSON.parse(rawData);
} catch (err) {
  console.error("Failed to load politician data:", err);
}

function validateKeys(body) {
  const validKeys = ["id", "name", "bio", "terms"];
  const incomingKeys = Object.keys(body);
  if (incomingKeys.length === 0) return false;
  return incomingKeys.every((key) => validKeys.includes(key));
}

politician_routes.get("/Politician", (req, res) => {
  let { sortby, ...filters } = req.query;
  let results = [...politician_database];

  Object.keys(filters).forEach((key) => {
    const val = filters[key];
    results = results.filter((p) => {
      const lastTerm = p.terms[p.terms.length - 1];
      return (
        p[key] == val ||
        p.name?.[key] == val ||
        p.bio?.[key] == val ||
        p.id?.[key] == val ||
        (lastTerm &&
          (lastTerm[key] == val ||
            (key === "chamber" && lastTerm.type === val)))
      );
    });
  });

  if (sortby) {
    results.sort((a, b) => {
      const aVal = a[sortby] || a.name?.[sortby] || "";
      const bVal = b[sortby] || b.name?.[sortby] || "";
      return aVal > bVal ? 1 : -1;
    });
  }

  res.json(results);
});

politician_routes.get("/Politician/:bioguide", (req, res) => {
  const match = politician_database.find(
    (p) => p.id.bioguide === req.params.bioguide,
  );
  if (match) {
    res.json(match);
  } else {
    res.status(404).json("Politician not found.");
  }
});

politician_routes.post("/Politician", (req, res) => {
  if (!validateKeys(req.body)) {
    return res.status(400).json("Invalid properties provided.");
  }

  const newPolitician = req.body;
  politician_database.push(newPolitician);

  res
    .status(201)
    .send(`http://localhost:1234/Politician/${newPolitician.id.bioguide}`);
});

politician_routes.put("/Politician/:bioguide", (req, res) => {
  const index = politician_database.findIndex(
    (p) => p.id.bioguide === req.params.bioguide,
  );

  if (index === -1) return res.status(404).json("Politician not found.");
  if (!validateKeys(req.body))
    return res.status(400).json("Invalid properties.");

  politician_database[index] = { ...politician_database[index], ...req.body };
  res.sendStatus(204);
});

politician_routes.delete("/Politician/:bioguide", (req, res) => {
  const index = politician_database.findIndex(
    (p) => p.id.bioguide === req.params.bioguide,
  );

  if (index === -1) return res.status(404).json("Politician not found.");

  politician_database.splice(index, 1);
  res.sendStatus(204);
});

export const router = politician_routes;
