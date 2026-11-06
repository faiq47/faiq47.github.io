/* Faiq Ahmed Siddique · Portfolio interactions */
(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(pointer: fine)").matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Preloader ---------- */
  document.body.classList.add("is-loading");
  const hideLoader = () => {
    $("#loader").classList.add("done");
    document.body.classList.remove("is-loading");
  };
  window.addEventListener("load", () => setTimeout(hideLoader, reduceMotion ? 0 : 1100));
  setTimeout(hideLoader, 3800); // safety net if fonts are slow

  $("#year").textContent = new Date().getFullYear();

  /* ---------- Header, progress, active link ---------- */
  const header = $("#header");
  const progress = $("#scrollProgress");
  const links = $$(".nav__links a[href^='#']:not(.btn)");
  const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle("scrolled", y > 30);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    let current = null;
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) current = s;
    links.forEach((a) => a.classList.toggle("active", !!current && a.getAttribute("href") === "#" + current.id));
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const burger = $("#burger");
  const menu = $("#navLinks");
  const setMenu = (open) => {
    burger.classList.toggle("open", open);
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => e.key === "Escape" && setMenu(false));

  /* ---------- Typed roles ---------- */
  const roles = ["Odoo Developer", "Python Developer", "Full-Stack Web Developer", "ERP Problem Solver"];
  const typed = $("#typed");
  if (reduceMotion) typed.textContent = roles[0];
  else {
    let r = 0, i = 0, del = false;
    const tick = () => {
      const w = roles[r];
      typed.textContent = w.slice(0, i);
      if (!del && i === w.length) { del = true; return setTimeout(tick, 1700); }
      if (del && i === 0) { del = false; r = (r + 1) % roles.length; }
      i += del ? -1 : 1;
      setTimeout(tick, del ? 35 : 75);
    };
    setTimeout(tick, 1300);
  }

  /* ---------- Counters + reveal ---------- */
  const countUp = (el) => {
    const to = +el.dataset.to, dec = +(el.dataset.dec || 0);
    if (reduceMotion) { el.textContent = to.toFixed(dec); return; }
    const start = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - start) / dur);
      el.textContent = (to * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      $$(".counter", e.target).forEach(countUp);
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  $$(".reveal").forEach((el) => io.observe(el));

  /* ---------- Module filters ---------- */
  const mods = $$(".mod");
  const popIn = (list) => list.forEach((m, k) => {
    m.classList.remove("pop");
    void m.offsetWidth; // restart the animation
    m.style.animationDelay = k * 0.05 + "s";
    m.classList.add("pop");
  });
  $$(".filter").forEach((btn) => btn.addEventListener("click", () => {
    $$(".filter").forEach((b) => b.classList.toggle("is-active", b === btn));
    const f = btn.dataset.filter;
    const shown = [];
    mods.forEach((m) => {
      const ok = f === "all" || m.dataset.cat === f;
      m.classList.toggle("is-hidden", !ok);
      if (ok) shown.push(m);
    });
    popIn(shown);
  }));
  const modsIo = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { popIn(mods); modsIo.disconnect(); }
  }, { threshold: 0.1 });
  modsIo.observe($("#mods"));

  /* ---------- Code editor typer ---------- */
  const code = `from odoo import fields, models
from odoo.exceptions import UserError


class TimesheetSheet(models.Model):
    _name = "hr.timesheet.sheet"
    _description = "Weekly Timesheet"

    employee_id = fields.Many2one("hr.employee", required=True)
    state = fields.Selection([
        ("draft", "Draft"),
        ("submitted", "Submitted"),
        ("approved", "Approved"),
    ], default="draft", tracking=True)

    def action_submit(self):
        # Block submission until the week is complete
        for sheet in self:
            if sheet.total_hours < sheet.expected_hours:
                raise UserError("Please complete your timesheet first.")
        self.write({"state": "submitted"})`;
  const hl = (s) => s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/(#[^\n]*)|("[^"\n]*"?)|\b(from|import|class|def|for|in|if|raise|return|self|True|False)\b|\b(\w+)(?=\()/g,
      (m, c, str, kw, fn) => c ? `<span class="c">${c}</span>`
        : str ? `<span class="s">${str}</span>`
        : kw ? `<span class="k">${kw}</span>`
        : `<span class="f">${fn}</span>`);
  const codeEl = $("#codeTyper");
  const lineEl = $("#codeLine");
  let typingStarted = false;
  const typeCode = () => {
    if (reduceMotion) { codeEl.innerHTML = hl(code); return; }
    let n = 0;
    const step = () => {
      n = Math.min(code.length, n + (code[n] === " " ? 4 : 3));
      const part = code.slice(0, n);
      codeEl.innerHTML = hl(part);
      lineEl.textContent = "Ln " + part.split("\n").length;
      if (n < code.length) setTimeout(step, part.endsWith("\n") ? 90 : 16);
      else setTimeout(() => { n = 0; step(); }, 5000);
    };
    step();
  };
  new IntersectionObserver((entries, obs) => {
    if (entries[0].isIntersecting && !typingStarted) { typingStarted = true; typeCode(); obs.disconnect(); }
  }, { threshold: 0.3 }).observe($(".editor"));

  /* ---------- Tilt, magnetic buttons, cursor glow ---------- */
  if (finePointer && !reduceMotion) {
    $$(".tilt").forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", x * 100 + "%");
        card.style.setProperty("--my", y * 100 + "%");
        card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
    $$(".magnetic").forEach((btn) => {
      btn.addEventListener("pointermove", (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
      });
      btn.addEventListener("pointerleave", () => { btn.style.transform = ""; });
    });
    const glow = $("#cursorGlow"), portrait = $("#portrait");
    window.addEventListener("pointermove", (e) => {
      glow.style.opacity = 1;
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
      const dx = (e.clientX / innerWidth - 0.5) * 2, dy = (e.clientY / innerHeight - 0.5) * 2;
      portrait.style.transform = `translate(${dx * -10}px, ${dy * -10}px)`;
    }, { passive: true });
  }

  /* ---------- Particle network ---------- */
  const canvas = $("#particles"), ctx = canvas.getContext("2d");
  let pts = [];
  const colors = ["rgba(167,139,250,.75)", "rgba(45,212,191,.65)", "rgba(244,114,182,.6)"];
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(70, (innerWidth * innerHeight) / 22000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * innerWidth, y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.4, c: colors[Math.floor(Math.random() * 3)],
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of pts) {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
      if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill();
    }
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(167,139,250,${0.08 * (1 - d / 130)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  resize();
  window.addEventListener("resize", resize);
  if (!reduceMotion) requestAnimationFrame(draw);

  /* ---------- Contact form opens the email app ---------- */
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const subject = f.get("subject") || `Portfolio enquiry from ${f.get("name")}`;
    const body = `${f.get("message")}\n\n${f.get("name")}\n${f.get("email")}`;
    window.location.href = `mailto:faiqahmad1548@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
})();
