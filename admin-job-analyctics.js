async function loadFilters() {
  const { data: techs } = await supabase
    .from("technicians")
    .select("user_id, name")
    .order("name", { ascending: true });

  const filterTech = document.getElementById("filterTech");

  techs.forEach(t => {
    const opt = document.createElement("option");
    opt.value = t.user_id;
    opt.textContent = t.name;
    filterTech.appendChild(opt);
  });
}

async function loadAnalytics(filters = {}) {
  const { status, tech_id, start, end } = filters;

  let query = supabase.from("jobs").select("*");

  if (status) query = query.eq("status", status);
  if (tech_id) query = query.eq("technician_id", tech_id);
  if (start) query = query.gte("created_at", start + "T00:00:00");
  if (end) query = query.lte("created_at", end + "T23:59:59");

  const { data: jobs } = await query.order("created_at", { ascending: false });

  // Summary metrics
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter(j => j.completed_time).length;
  const completionRate = totalJobs ? (completedJobs / totalJobs) * 100 : 0;

  const avgResponse = average(jobs.map(j => j.response_time));
  const avgResolution = average(jobs.map(j => j.resolution_time));
  const avgDuration = average(
    jobs.map(j => j.start_time && j.end_time ? 
      (new Date(j.end_time) - new Date(j.start_time)) / (1000 * 60) : null)
  );

  document.getElementById("summaryCard").innerHTML = `
    <div class="profile-field"><label>Total Jobs</label><div>${totalJobs}</div></div>
    <div class="profile-field"><label>Completed Jobs</label><div>${completedJobs}</div></div>
    <div class="profile-field"><label>Completion Rate</label><div>${completionRate.toFixed(1)}%</div></div>
    <div class="profile-field"><label>Avg Response Time</label><div>${avgResponse || "N/A"} min</div></div>
    <div class="profile-field"><label>Avg Resolution Time</label><div>${avgResolution || "N/A"} min</div></div>
    <div class="profile-field"><label>Avg Job Duration</label><div>${avgDuration || "N/A"} min</div></div>
  `;

  // Jobs by month
  const monthMap = {};
  jobs.forEach(j => {
    const month = j.created_at.slice(0, 7);
    monthMap[month] = (monthMap[month] || 0) + 1;
  });

  const monthList = document.getElementById("monthList");
  monthList.innerHTML = "";

  Object.entries(monthMap).forEach(([month, count]) => {
    const card = document.createElement("div");
    card.className = "analytics-card";

    card.innerHTML = `
      <div class="analytics-title">${month}</div>
      <div class="analytics-meta">${count} jobs</div>
    `;

    monthList.appendChild(card);
  });

  // Completion breakdown
  const completionList = document.getElementById("completionList");
  completionList.innerHTML = "";

  const open = jobs.filter(j => j.status === "open").length;
  const assigned = jobs.filter(j => j.status === "assigned").length;
  const inProgress = jobs.filter(j => j.status === "in_progress").length;

  [
    ["Open", open],
    ["Assigned", assigned],
    ["In Progress", inProgress],
    ["Completed", completedJobs]
  ].forEach(([label, count]) => {
    const card = document.createElement("div");
    card.className = "analytics-card";

    card.innerHTML = `
      <div class="analytics-title">${label}</div>
      <div class="analytics-meta">${count} jobs</div>
    `;

    completionList.appendChild(card);
  });

  // Technician performance
  const techMap = {};
  jobs.forEach(j => {
    if (!j.technician_id) return;
    techMap[j.technician_id] = techMap[j.technician_id] || {
      jobs: 0,
      completed: 0,
      minutesLate: 0
    };
    techMap[j.technician_id].jobs++;
    if (j.completed_time) techMap[j.technician_id].completed++;
    techMap[j.technician_id].minutesLate += j.minutes_late || 0;
  });

  const techList = document.getElementById("techList");
  techList.innerHTML = "";

  Object.entries(techMap).forEach(([tech, stats]) => {
    const card = document.createElement("div");
    card.className = "analytics-card";

    card.innerHTML = `
      <div class="analytics-title">Tech ${tech}</div>
      <div class="analytics-meta">Jobs: ${stats.jobs}</div>
      <div class="analytics-meta">Completed: ${stats.completed}</div>
      <div class="analytics-meta">Completion Rate: ${(stats.completed / stats.jobs * 100).toFixed(1)}%</div>
      <div class="analytics-meta">Minutes Late: ${stats.minutesLate}</div>
    `;

    techList.appendChild(card);
  });
}

function average(arr) {
  const nums = arr.filter(n => typeof n === "number");
  if (!nums.length) return null;
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1);
}

// Apply filters
document.getElementById("applyFilters").addEventListener("click", () => {
  const filters = {
    status: document.getElementById("filterStatus").value || null,
    tech_id: document.getElementById("filterTech").value || null,
    start: document.getElementById("filterStart").value || null,
    end: document.getElementById("filterEnd").value || null
  };

  loadAnalytics(filters);
});

// Export CSV
document.getElementById("exportCSV").addEventListener("click", () => {
  const rows = [];
  rows.push(["Metric", "Value"]);

  const summary = document.querySelectorAll("#summaryCard .profile-field");

  summary.forEach(field => {
    const label = field.querySelector("label").textContent;
    const value = field.querySelector("div").textContent;
    rows.push([label, value]);
  });

  let csvContent = "data:text/csv;charset=utf-8,";
  rows.forEach(row => {
    csvContent += row.map(v => `"${v}"`).join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "job_analytics.csv");
  document.body.appendChild(link);
  link.click();
  link.remove();
});

loadFilters();
loadAnalytics();
