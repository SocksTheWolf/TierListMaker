const tiers = ["S", "A", "B", "C", "D", "E", "F", "G"];

const spacing = () => {
  let span = document.createElement("span");
  span.innerHTML = "&nbsp";
  return span;
};

function createFAElement(kind, name) {
  let icon = document.createElement("i");
  icon.classList.add(kind, name);

  let element = document.createElement("span");
  element.classList.add("icon");
  element.appendChild(icon);

  return element;
}

function moveRowUp(row_id, table_id) {
  const table = document.getElementById(table_id);
  const row = document.getElementById(row_id);
  const previous = row.previousSibling;

  if (previous === null) {
    return;
  }

  row.parentElement.removeChild(row);
  table.insertBefore(row, previous);
}

function moveRowDown(row_id, table_id) {
  const table = document.getElementById(table_id);
  const row = document.getElementById(row_id);

  const next = row.nextSibling?.nextSibling;
  if (next !== null) {
    row.parentElement.removeChild(row);
    table.insertBefore(row, next);
  } else if (row.nextSibling !== null && next === null) {
    row.parentElement.removeChild(row);
    table.appendChild(row);
  }
}

function addElementInRow(row_id) {
  const tier_title = document.getElementById(row_id).firstChild.innerText;
  document.getElementById(
    "addContentModalTitle"
  ).innerText = `Add content to tier ${tier_title}`;

  const tier_color = window
    .getComputedStyle(document.getElementById(row_id).firstChild)
    .getPropertyValue("background-color")
    .replace(/^rgb/, "")
    .replace("(", "")
    .replace(")", "")
    .split(", ")
    .map((value) => parseInt(value).toString(16))
    .join("")
    .replace(/.+/, "#$&");
  document.getElementById("colorInput").value = tier_color;

  const el = document.getElementById("addContentModal");
  const modal = bootstrap.Modal.getInstance(el);

  modal.data = {
    color: tier_color,
    tier: row_id,
  };

  modal.toggle();
}

function addRow() {
  const identifier = "tableBody";
  const table_body = document.getElementById(identifier);

  const row_index = Number(table_body.getAttribute("numRows")) + 1;
  const row_name = tiers[row_index % tiers.length].toLowerCase();
  const row_identifier = `tier-${row_index}`;

  const tier_th = document.createElement("th");
  tier_th.setAttribute("scope", "row");
  tier_th.setAttribute("contenteditable", "true");
  tier_th.classList.add(
    `tlm-bgcolor-${row_name}`,
    "text-center",
    "align-middle"
  );
  tier_th.innerText = "Edit";

  const content = document.createElement("td");
  ["enter", "over", "leave"].forEach((name) => {
    content.addEventListener(`drag${name}`, preventDefault, false);
  });
  content.addEventListener(
    "drop",
    (ev) => {
      preventDefault(ev);

      const files = toArray(ev.dataTransfer.files);
      if (files.length !== 0) {
        files.forEach((img) => {
          loadImageAndAddToDOM(img, false, (el) => {
            content.appendChild(el);
          });
        });
      } else {
        const id = ev.dataTransfer.getData("text");
        const el = document.getElementById(id);
        const drop_zone = ev.currentTarget;

        if (ev.target instanceof HTMLImageElement) {
          ev.target.parentNode.insertBefore(el, ev.target.nextSibling);
        } else {
          drop_zone.appendChild(el);
        }
      }
    },
    false
  );

  const settings = createSettingsTd(row_identifier, identifier);

  const row = document.createElement("tr");
  row.setAttribute("id", row_identifier);
  row.appendChild(tier_th);
  row.appendChild(content);
  row.appendChild(settings);

  table_body.appendChild(row);
  table_body.setAttribute("numRows", row_index);
}

function deleteRow(row_id, shiftClicked) {
  const tier_title = document.getElementById(row_id).firstChild.innerText;	
  if (shiftClicked || confirm(`Are you sure you want to delete row "${tier_title}"?`)) {
    const row = document.getElementById(row_id);
    row.parentElement.removeChild(row);
  }
}

function createSettingsTd(row_id, table_id) {
  let add = createFAElement("fas", "fa-plus");
  add.addEventListener("click", () => addElementInRow(row_id));
  let go_up = createFAElement("fas", "fa-level-up-alt");
  go_up.addEventListener("click", () => moveRowUp(row_id, table_id));
  let go_down = createFAElement("fas", "fa-level-down-alt");
  go_down.addEventListener("click", () => moveRowDown(row_id, table_id));
  let delete_row = createFAElement("fas", "fa-trash");
  delete_row.addEventListener("click", (ev) => deleteRow(row_id, ev.shiftKey));

  let container = document.createElement("td");
  [add, go_up, go_down, delete_row].forEach((el, idx, max) => {
    el.classList.add("tlm-pointer");
    container.appendChild(el);
    if (idx !== max - 1) container.appendChild(spacing());
  });
  container.classList.add("text-center");

  return container;
}

function generateTable(identifier, count = -1) {
  if (count === -1) {
    count = tiers.length;
  }

  const table_body = document.getElementById(identifier);
  table_body.innerHTML = "";

  tiers.forEach((value, index) => {
    // early return if we displayed enough
    if (index >= count) return;

    const row_name = value.toLowerCase();
    const row_identifier = `tier-${index}`;

    const tier_th = document.createElement("th");
    tier_th.setAttribute("scope", "row");
    tier_th.setAttribute("contenteditable", "true");
    tier_th.setAttribute("spellcheck", "false");
    tier_th.classList.add(
      `tlm-bgcolor-${row_name}`,
      "text-center",
      "align-middle"
    );
    tier_th.innerText = value;

    const content = document.createElement("td");
    ["enter", "over", "leave"].forEach((name) => {
      content.addEventListener(`drag${name}`, preventDefault, false);
    });
    content.addEventListener(
      "drop",
      (ev) => {
        preventDefault(ev);

        const files = toArray(ev.dataTransfer.files);
        if (files.length !== 0) {
          files.forEach((img) => {
            loadImageAndAddToDOM(img, false, (el) => {
              content.appendChild(el);
            });
          });
        } else {
          const id = ev.dataTransfer.getData("text");
          const el = document.getElementById(id);
          const drop_zone = ev.currentTarget;

          if (ev.target instanceof HTMLImageElement) {
            ev.target.parentNode.insertBefore(el, ev.target);
          } else {
            drop_zone.appendChild(el);
          }
        }
      },
      false
    );

    const settings = createSettingsTd(row_identifier, identifier);

    const row = document.createElement("tr");
    row.setAttribute("id", row_identifier);
    row.appendChild(tier_th);
    row.appendChild(content);
    row.appendChild(settings);

    table_body.appendChild(row);
    table_body.setAttribute("numRows", count);
  });
}
