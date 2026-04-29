let teamData = [];
function updateTeamData() {
  teamData = window.TEAM_DATA || [];
}

const themes = {
  Stark: {
    accent: "#8faecc",
    strong: "#b7c9da",
    soft: "rgba(143, 174, 204, 0.1)",
    glow: "rgba(143, 174, 204, 0.14)",
    line: "rgba(143, 174, 204, 0.22)",
    rgb: "143, 174, 204",
    bgTintA: "rgba(104, 178, 235, 0.22)",
    bgTintB: "rgba(76, 127, 182, 0.14)",
    bgTintC: "rgba(24, 60, 103, 0.18)",
    bgCoreTop: "#0d1a2a",
    bgCoreMid: "#08121f",
    bgCoreLow: "#030812",
    bgCoreBottom: "#010207"
  },
  Targaryen: {
    accent: "#8d4747",
    strong: "#b26c6c",
    soft: "rgba(141, 71, 71, 0.1)",
    glow: "rgba(141, 71, 71, 0.14)",
    line: "rgba(141, 71, 71, 0.22)",
    rgb: "141, 71, 71",
    bgTintA: "rgba(173, 46, 46, 0.24)",
    bgTintB: "rgba(116, 22, 22, 0.16)",
    bgTintC: "rgba(74, 16, 16, 0.18)",
    bgCoreTop: "#1d1012",
    bgCoreMid: "#14090b",
    bgCoreLow: "#0c0406",
    bgCoreBottom: "#040102"
  },
  Lannister: {
    accent: "#b89a5f",
    strong: "#d4bb86",
    soft: "rgba(184, 154, 95, 0.1)",
    glow: "rgba(184, 154, 95, 0.14)",
    line: "rgba(184, 154, 95, 0.22)",
    rgb: "184, 154, 95",
    bgTintA: "rgba(191, 138, 38, 0.24)",
    bgTintB: "rgba(132, 86, 18, 0.16)",
    bgTintC: "rgba(82, 52, 10, 0.18)",
    bgCoreTop: "#1d1610",
    bgCoreMid: "#14100a",
    bgCoreLow: "#0b0703",
    bgCoreBottom: "#040301"
  },
  Baratheon: {
    accent: "#b49c52",
    strong: "#d0bb78",
    soft: "rgba(180, 156, 82, 0.1)",
    glow: "rgba(180, 156, 82, 0.14)",
    line: "rgba(180, 156, 82, 0.22)",
    rgb: "180, 156, 82",
    bgTintA: "rgba(123, 88, 189, 0.24)",
    bgTintB: "rgba(78, 52, 130, 0.16)",
    bgTintC: "rgba(54, 30, 97, 0.18)",
    bgCoreTop: "#171122",
    bgCoreMid: "#100b18",
    bgCoreLow: "#08050e",
    bgCoreBottom: "#030106"
  }
};

const logos = {
  Stark: "Logos/Stark.png",
  Targaryen: "Logos/Targaryen.png",
  Lannister: "Logos/Lannister.png",
  Baratheon: "Logos/Baratheon.png"
};

const teamList = document.querySelector("#team-list");
const batchGrid = document.querySelector("#batch-grid");
const selectedTeam = document.querySelector("#selected-team");
const detailsPanel = document.querySelector(".details-panel");
const topbar = document.querySelector(".topbar");
const panels = document.querySelectorAll(".team-panel, .details-panel");
const root = document.documentElement;
let activeThemeTween;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatNamePart(part) {
  return part
    .split(/(\s+|-|'|\/)/)
    .map((token) => {
      if (!token || /^\s+$/.test(token) || token === "-" || token === "'" || token === "/") {
        return token;
      }

      if (/^[A-Z]{1,3}$/.test(token) || /^[A-Z](?:\.[A-Z])+\.?$/.test(token)) {
        return token;
      }

      if (/^[A-Za-z]+(?:\.[A-Za-z]+)*\.?$/.test(token)) {
        return token
          .split(".")
          .map((chunk) => {
            if (!chunk) {
              return chunk;
            }
            if (/^[A-Z]{1,3}$/.test(chunk)) {
              return chunk;
            }
            const lower = chunk.toLowerCase();
            return lower.charAt(0).toUpperCase() + lower.slice(1);
          })
          .join(".");
      }

      const lower = token.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("")
    .replace(/\s*\.\s*/g, ".")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanNameInput(value) {
  return String(value)
    .replace(/\ufeff/g, "")
    .replace(/\u00e3\u0192\u00bb/g, " ")
    .replace(/\u00e2\u20ac\u00a2/g, " ")
    .replace(/\u00c2/g, "")
    .replace(/[\u2022\u30fb\u00b7]/g, " ")
    .replace(/\s*\.\s*/g, ".")
    .replace(/\s*-\s*/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function formatStudentLabel(value) {
  const raw = String(value);
  const separatorIndex = raw.lastIndexOf(" - ");

  if (separatorIndex === -1) {
    return formatNamePart(cleanNameInput(raw));
  }

  const namePart = raw.slice(0, separatorIndex).trim();
  const suffix = raw.slice(separatorIndex);
  return `${formatNamePart(cleanNameInput(namePart))}${suffix}`;
}

function getOrderedBatches(team) {
  return [...team.batches].sort((a, b) => {
    const order = { 2023: 0, 2024: 1, 2025: 2 };
    return (order[a.year] ?? 99) - (order[b.year] ?? 99);
  });
}

function renderTeams() {
  teamList.innerHTML = teamData.map((team, index) => {
    const theme = themes[team.team] || themes.Stark;
    const logo = logos[team.team];
    return `
      <button class="team-button${index === 0 ? " is-active" : ""}" data-team="${team.team}" style="--accent: ${theme.accent}; --accent-strong: ${theme.strong}; --i: ${index}">
        <span class="stripe" aria-hidden="true"></span>
        <span class="team-content">
          ${logo ? `<img class="team-logo" src="${logo}" alt="${escapeHtml(team.team)} logo">` : ""}
          <span>
            <span class="team-name">${escapeHtml(team.team)}</span>
          </span>
        </span>
        <span class="arrow" aria-hidden="true">&gt;</span>
      </button>
    `;
  }).join("");
}

function applyTheme(teamName) {
  const theme = themes[teamName] || themes.Stark;

  // Set CSS variables immediately (non-GSAP path)
  const setVars = () => {
    root.style.setProperty("--accent",      theme.accent);
    root.style.setProperty("--accent-strong", theme.strong);
    root.style.setProperty("--accent-soft",  theme.soft);
    root.style.setProperty("--accent-glow",  theme.glow);
    root.style.setProperty("--accent-line",  theme.line);
    root.style.setProperty("--accent-rgb",   theme.rgb);
    root.style.setProperty("--bg-tint-a",    theme.bgTintA);
    root.style.setProperty("--bg-tint-b",    theme.bgTintB);
    root.style.setProperty("--bg-tint-c",    theme.bgTintC);
    root.style.setProperty("--bg-core-top",  theme.bgCoreTop);
    root.style.setProperty("--bg-core-mid",  theme.bgCoreMid);
    root.style.setProperty("--bg-core-low",  theme.bgCoreLow);
    root.style.setProperty("--bg-core-bottom", theme.bgCoreBottom);
  };

  if (!window.gsap) {
    setVars();
    return;
  }

  // For GSAP: color vars transition, accent-line set immediately
  // (GSAP can't interpolate rgba strings reliably, so set it directly)
  root.style.setProperty("--accent-line", theme.line);
  root.style.setProperty("--accent-soft", theme.soft);
  root.style.setProperty("--accent-glow", theme.glow);
  root.style.setProperty("--accent-rgb",  theme.rgb);
  activeThemeTween?.kill();
  activeThemeTween = gsap.to(root, {
    "--accent":        theme.accent,
    "--accent-strong": theme.strong,
    "--bg-tint-a":     theme.bgTintA,
    "--bg-tint-b":     theme.bgTintB,
    "--bg-tint-c":     theme.bgTintC,
    "--bg-core-top":   theme.bgCoreTop,
    "--bg-core-mid":   theme.bgCoreMid,
    "--bg-core-low":   theme.bgCoreLow,
    "--bg-core-bottom": theme.bgCoreBottom,
    duration: 0.5,
    ease: "power2.inOut",
    overwrite: "auto"
  });
}

function buildTeamRender(teamName) {
  const team = teamData.find((item) => item.team === teamName) || teamData[0];
  const logo = logos[team.team];
  const orderedBatches = getOrderedBatches(team);
  const batchesMarkup = orderedBatches.map((batch, index) => `
    <article class="batch-card" style="--i: ${index}">
      <button class="batch-toggle" type="button" aria-expanded="false">
        <span>
          <span class="batch-title">${escapeHtml(batch.year)} Batch</span>
        </span>
        <span class="batch-icon" aria-hidden="true">+</span>
      </button>
      <div class="student-list">
        ${batch.students.map((student, studentIndex) => `<div class="student" style="--i: ${studentIndex}">${escapeHtml(formatStudentLabel(student))}</div>`).join("")}
      </div>
    </article>
  `).join("");

  return {
    teamName: team.team,
    logo: logo ? `<img class="title-logo" src="${logo}" alt="${escapeHtml(team.team)} logo">` : "",
    batches: batchesMarkup || `<div class="empty-state">No members available for this team.</div>`
  };
}

function applyRenderedTeam(rendered) {
  const theme = themes[rendered.teamName] || themes.Stark;
  applyTheme(rendered.teamName);

  // Logo goes into its own slot (above the team name)
  const logoSlot = document.getElementById("team-logo-slot");
  if (logoSlot) logoSlot.innerHTML = rendered.logo;

  // h2 just shows the team name
  selectedTeam.textContent = rendered.teamName;

  batchGrid.style.setProperty("--accent", theme.accent);
  batchGrid.style.setProperty("--accent-strong", theme.strong);
  batchGrid.innerHTML = rendered.batches;

  document.querySelectorAll(".team-button").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.team === rendered.teamName);
  });
}

function renderTeam(teamName, immediate = false) {
  const rendered = buildTeamRender(teamName);

  if (!window.gsap || immediate) {
    applyRenderedTeam(rendered);
    // Clear any inline styles GSAP may have left
    [batchGrid, selectedTeam].forEach(el => {
      el.style.cssText = "";
    });
    detailsPanel.classList.remove("is-changing");
    return;
  }

  // Kill any running team transition before starting a new one
  gsap.killTweensOf([selectedTeam, batchGrid]);

  detailsPanel.classList.add("is-changing");

  // Fast content swap — no opacity flash, just a subtle translate
  gsap.to([selectedTeam, batchGrid], {
    y: 6,
    duration: 0.12,
    ease: "power2.in",
    force3D: true,
    overwrite: true,
    onComplete: () => {
      applyRenderedTeam(rendered);
      // Reset inline styles before animating in
      gsap.set([selectedTeam, batchGrid], { y: -4, opacity: 1, force3D: true });
      animateTeamTransition();
    }
  });
}

teamList.addEventListener("click", (event) => {
  const button = event.target.closest(".team-button");
  if (!button) {
    return;
  }
  renderTeam(button.dataset.team);
});

batchGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".batch-toggle");
  if (!button) {
    return;
  }

  const card = button.closest(".batch-card");
  const isOpen = card.classList.contains("is-open");

  if (isOpen) {
    closeBatch(card, button);
  } else {
    openBatch(card, button);
  }
});


function animateTeamTransition() {
  const batchCards = batchGrid.querySelectorAll(".batch-card");

  // Snap header into view immediately — no opacity flash
  gsap.set([selectedTeam, batchGrid], { opacity: 1, y: 0, clearProps: "all" });
  detailsPanel.classList.remove("is-changing");

  if (!batchCards.length) return;

  // Stagger batch cards in from slight offset
  gsap.fromTo(
    batchCards,
    { opacity: 0, y: 8 },
    {
      opacity: 1,
      y: 0,
      duration: 0.28,
      ease: "power2.out",
      stagger: 0.035,
      force3D: true,
      clearProps: "all"
    }
  );
}

function openBatch(card, button) {
  const list     = card.querySelector(".student-list");
  const students = list.querySelectorAll(".student");

  card.classList.add("is-open");
  button.setAttribute("aria-expanded", "true");
  button.querySelector(".batch-icon").textContent = "-";

  if (!window.gsap) {
    return;
  }

  gsap.killTweensOf([list, students]);

  // Measure before any style changes (avoid layout thrash)
  gsap.set(list, { maxHeight: 0, paddingTop: 0, paddingBottom: 0 });
  const targetH = list.scrollHeight;

  gsap.set(students, { opacity: 0, y: 6, force3D: true });

  const tl = gsap.timeline({ defaults: { ease: "expo.out", force3D: true } });

  tl.to(list, {
    maxHeight: targetH + 44,
    paddingTop: 14,
    paddingBottom: 18,
    duration: 0.38
  }).to(
    students,
    {
      opacity: 1,
      y: 0,
      duration: 0.24,
      stagger: 0.008,
      clearProps: "all"
    },
    "-=0.22"
  );
}

function closeBatch(card, button) {
  const list     = card.querySelector(".student-list");
  const students = list.querySelectorAll(".student");

  button.setAttribute("aria-expanded", "false");
  button.querySelector(".batch-icon").textContent = "+";

  if (!window.gsap) {
    card.classList.remove("is-open");
    return;
  }

  gsap.killTweensOf([list, students]);

  const tl = gsap.timeline({
    defaults: { force3D: true },
    onComplete: () => card.classList.remove("is-open")
  });

  tl.to(students, {
    opacity: 0,
    y: 4,
    duration: 0.14,
    stagger: { each: 0.005, from: "end" },
    ease: "power2.in"
  }).to(
    list,
    {
      maxHeight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      duration: 0.22,
      ease: "expo.inOut"
    },
    "-=0.06"
  );
}

function attachTilt(selector, amount) {
  document.querySelectorAll(selector).forEach((element) => {
    element.addEventListener("mousemove", (event) => {
      if (window.innerWidth < 821) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      const rotateY = (px - 0.5) * amount;
      const rotateX = (0.5 - py) * amount;

      gsap.to(element, {
        rotateX,
        rotateY,
        transformPerspective: 1000,
        duration: 0.35,
        ease: "power3.out"
      });
    });

    element.addEventListener("mouseleave", () => {
      gsap.to(element, {
        rotateX: 0,
        rotateY: 0,
        duration: 0.55,
        ease: "expo.out"
      });
    });
  });
}

if (window.gsap) {
  gsap.registerPlugin(ScrollTrigger);

  // Detect touch/mobile to reduce animation complexity
  const isMobile = window.matchMedia("(max-width: 820px)").matches;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReducedMotion) {
    // Topbar slides down
    gsap.from(topbar, {
      opacity: 0,
      y: isMobile ? -12 : -20,
      duration: isMobile ? 0.5 : 0.7,
      ease: "expo.out",
      clearProps: "all",
      force3D: true
    });

    // Team sidebar slides in
    gsap.from(".team-panel", {
      opacity: 0,
      x: isMobile ? 0 : -20,
      y: isMobile ? 10 : 0,
      duration: isMobile ? 0.4 : 0.6,
      ease: "expo.out",
      delay: 0.05,
      clearProps: "all",
      force3D: true
    });

    // Details panel fades up
    gsap.from(".details-panel", {
      opacity: 0,
      y: isMobile ? 10 : 16,
      duration: isMobile ? 0.4 : 0.55,
      ease: "expo.out",
      delay: 0.1,
      clearProps: "all",
      force3D: true
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateTeamData();
  renderTeams();
  renderTeam(teamData[0]?.team, true);
});

// ============================================================
// SEARCH FUNCTIONALITY
// ============================================================
const searchInput = document.getElementById('global-search');
const searchResults = document.getElementById('search-results');

function performSearch(query) {
  if (!query) {
    searchResults.classList.remove('is-active');
    return;
  }
  
  query = query.toLowerCase();
  const results = [];
  
  teamData.forEach(team => {
    team.batches.forEach(batch => {
      batch.students.forEach(student => {
        const studentName = formatStudentLabel(student);
        if (studentName.toLowerCase().includes(query)) {
          results.push({
            name: studentName,
            team: team.team,
            batch: batch.year
          });
        }
      });
    });
  });
  
  if (results.length === 0) {
    searchResults.innerHTML = '<div class="empty-state" style="padding: 16px;">No members found</div>';
  } else {
    searchResults.innerHTML = results.slice(0, 15).map(res => {
      const theme = themes[res.team] || themes.Stark;
      return `
        <button class="search-result-item" data-team="${res.team}" data-batch="${res.batch}" data-name="${escapeHtml(res.name)}">
          <span class="search-result-name">${escapeHtml(res.name)}</span>
          <span class="search-result-team" style="color: ${theme.strong}">${escapeHtml(res.team)} • ${escapeHtml(res.batch)} Batch</span>
        </button>
      `;
    }).join('');
  }
  
  searchResults.classList.add('is-active');
}

searchInput.addEventListener('input', (e) => {
  performSearch(e.target.value.trim());
});

document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-wrapper')) {
    searchResults.classList.remove('is-active');
  }
});

searchResults.addEventListener('click', (e) => {
  const item = e.target.closest('.search-result-item');
  if (item) {
    const teamName = item.dataset.team;
    const batchYear = item.dataset.batch;
    const studentName = item.dataset.name;
    
    // Check if team is already selected, if not render it
    const currentlyActiveTeam = document.querySelector('.team-button.is-active');
    if (!currentlyActiveTeam || currentlyActiveTeam.dataset.team !== teamName) {
      renderTeam(teamName);
    }
    
    // Add a slight delay to allow rendering and GSAP to settle
    setTimeout(() => {
      const batchCards = document.querySelectorAll('.batch-card');
      batchCards.forEach(card => {
        const title = card.querySelector('.batch-title').textContent;
        if (title.includes(batchYear)) {
          const btn = card.querySelector('.batch-toggle');
          if (!card.classList.contains('is-open')) {
            openBatch(card, btn);
          }
          
          // Wait for batch to open, then highlight the student
          setTimeout(() => {
            const students = card.querySelectorAll('.student');
            students.forEach(s => {
              if (s.textContent === studentName) {
                s.classList.add('is-highlighted');
                
                // Scroll into view gently
                s.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Optional: remove highlight after a few seconds
                setTimeout(() => {
                  s.classList.remove('is-highlighted');
                }, 2500);
              }
            });
          }, 350); // Delay for GSAP batch open animation
        }
      });
    }, 150); // Delay for GSAP team render animation

    searchResults.classList.remove('is-active');
    searchInput.value = '';
  }
});
