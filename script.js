const STORAGE_KEY = "studenthub_records_v1";
let students = loadStudents();

const form = document.getElementById("studentForm");
const table = document.getElementById("studentTable");
const searchInput = document.getElementById("searchInput");

function loadStudents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}
function saveStudents() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}
function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
  }[ch]));
}
function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase();
}
function renderStudents() {
  const query = searchInput.value.trim().toLowerCase();
  const filtered = students.filter(s =>
    [s.name, s.roll, s.email, s.course].some(value => value.toLowerCase().includes(query))
  );
  table.innerHTML = filtered.map(s => `
    <tr>
      <td><div class="student-cell"><span class="avatar">${escapeHTML(initials(s.name))}</span><span class="student-name">${escapeHTML(s.name)}</span></div></td>
      <td>${escapeHTML(s.roll)}</td>
      <td><span class="course-tag">${escapeHTML(s.course)}</span></td>
      <td>${escapeHTML(s.email)}</td>
      <td><button class="delete-btn" data-delete="${escapeHTML(s.id)}" aria-label="Delete ${escapeHTML(s.name)}">Delete</button></td>
    </tr>`).join("");
  document.getElementById("emptyState").style.display = filtered.length ? "none" : "block";
  document.getElementById("recordLabel").textContent = `${filtered.length} record${filtered.length === 1 ? "" : "s"}`;
  document.getElementById("totalCount").textContent = students.length;
  document.getElementById("courseCount").textContent = new Set(students.map(s => s.course)).size;
  document.getElementById("recentCount").textContent = students.length ? Math.min(students.length, 5) : 0;
}
form.addEventListener("submit", event => {
  event.preventDefault();
  const name = document.getElementById("studentName").value.trim();
  const roll = document.getElementById("rollNumber").value.trim();
  const email = document.getElementById("email").value.trim();
  const course = document.getElementById("course").value;
  if (!name || !roll || !email || !course) return;
  if (students.some(s => s.roll.toLowerCase() === roll.toLowerCase())) {
    alert("This roll number already exists. Please use a different one.");
    return;
  }
  students.unshift({ id: String(Date.now()), name, roll, email, course });
  saveStudents();
  form.reset();
  renderStudents();
});
table.addEventListener("click", event => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;
  students = students.filter(s => s.id !== button.dataset.delete);
  saveStudents();
  renderStudents();
});
searchInput.addEventListener("input", renderStudents);
renderStudents();
