document.getElementById("search-btn").addEventListener("click", async () => {
  const firstName = document.getElementById("first_name").value;
  const lastName = document.getElementById("last_name").value;
  const state = document.getElementById("filter_state").value;
  const party = document.getElementById("filter_party").value;
  const sortBy = document.getElementById("sortby").value;

  let url = `/Politician?`;
  if (firstName) url += `first=${firstName}&`;
  if (lastName) url += `last=${lastName}&`;
  if (state) url += `state=${state.toUpperCase()}&`;
  if (party) url += `party=${party}&`;
  if (sortBy) url += `sortby=${sortBy}`;

  try {
    const response = await fetch(url);
    const politicians = await response.json();
    renderPoliticians(politicians);
  } catch (err) {
    console.error("Search failed:", err);
  }
});

function renderPoliticians(list) {
  const tableBody = document.getElementById("results-body");
  tableBody.innerHTML = "";

  list.forEach((p) => {
    const lastTerm = p.terms?.at(-1);
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${p.name.first} ${p.name.last}</td>
      <td>${lastTerm?.type === "sen" ? "Senator" : "Representative"}</td>
      <td>${lastTerm?.state || "N/A"}</td>
      <td>${lastTerm?.party || "N/A"}</td>
      <td>
        <button class="delete-btn" onclick="deletePolitician('${p.id.bioguide}')">Delete</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

document.getElementById("create-btn").addEventListener("click", async () => {
  const newPol = {
    id: { bioguide: document.getElementById("new-bioguide").value },
    name: {
      first: document.getElementById("new-first").value,
      last: document.getElementById("new-last").value,
    },
    terms: [
      {
        state: document.getElementById("new-state").value.toUpperCase(),
        type: document.getElementById("new-type").value,
        party: document.getElementById("new-party").value,
      },
    ],
    bio: { gender: "M" },
  };

  const response = await fetch("/Politician", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newPol),
  });

  if (response.ok) {
    alert("Politician Created!");
    document.getElementById("search-btn").click();
  } else {
    alert("Failed to create. Ensure the Bioguide ID is unique.");
  }
});

window.deletePolitician = async function (bioguide) {
  if (!confirm(`Are you sure you want to delete ${bioguide}?`)) return;

  const response = await fetch(`/Politician/${bioguide}`, {
    method: "DELETE",
  });

  if (response.ok) {
    document.getElementById("search-btn").click();
  }
};
