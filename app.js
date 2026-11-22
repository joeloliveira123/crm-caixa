const STAGES = [
  { id: "novo", label: "Novo Contato", short: "Novo" },
  { id: "orcamento", label: "Orçamento Enviado", short: "Orçamento" },
  { id: "negociacao", label: "Em Negociação", short: "VIP · Negoc." },
  { id: "fechado", label: "Venda Fechada", short: "Fechado" },
  { id: "perdido", label: "Não Fechou", short: "Perdido" }
];

const VIEW_META = {
  dashboard: { title: "Dashboard", sub: "Resumo financeiro, gráfico de vendas e carteira de clientes" },
  crm: { title: "Funil de Vendas", sub: "Acompanhamento de etapas com lançamento automático no caixa" },
  cashflow: { title: "Fluxo de Caixa", sub: "Entradas, saídas, extrato completo e saúde financeira" },
  customers: { title: "Clientes", sub: "Lista pesquisável com status, contato, serviço e ações rápidas" },
  analytics: { title: "Equipe & ROI", sub: "Ranking de vendas por responsável, perdas e lucro real" }
};

const PERIOD_SERIES = {
  diario: {
    labels: ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB", "HOJE"],
    values: [900, 1250, 1100, 1650, 1480, 1920, 2450],
    growth: "+14,2%"
  },
  semanal: {
    labels: ["SEM 1", "SEM 2", "SEM 3", "SEM 4", "SEM 5", "SEM 6"],
    values: [1450, 1780, 1620, 2190, 2050, 2450],
    growth: "+19,8%"
  },
  mensal: {
    labels: ["MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV"],
    values: [1280, 1720, 1490, 2240, 1890, 2150, 2450],
    growth: "+24,5%"
  }
};

const DEFAULT_DATA = {
  bizName: "Sua Empresa",
  bizColor: "#5B5CE6",
  leads: [
    {
      id: "l1",
      code: "CL-1041",
      name: "Padaria Central · Roberto",
      phone: "(11) 99412-3010",
      service: "Site Institucional + Cardápio",
      value: 1800,
      origin: "WhatsApp",
      seller: "Joel Oliveira",
      stage: "novo"
    },
    {
      id: "l2",
      code: "CL-1042",
      name: "Clínica Vida · Dra. Helena",
      phone: "(11) 98744-1122",
      service: "Sistema de Agendamento",
      value: 2400,
      origin: "Indicação",
      seller: "Mariana Costa",
      stage: "orcamento"
    },
    {
      id: "l3",
      code: "CL-1043",
      name: "Auto Peças Silva",
      phone: "(11) 99108-7740",
      service: "Painel de Estoque & Caixa",
      value: 3200,
      origin: "Google",
      seller: "Joel Oliveira",
      stage: "negociacao"
    },
    {
      id: "l4",
      code: "CL-1044",
      name: "Barbearia Dom Pedro",
      phone: "(11) 98320-5599",
      service: "Site + Clube Mensal",
      value: 1500,
      origin: "Instagram",
      seller: "Lucas Silva",
      stage: "fechado"
    },
    {
      id: "l5",
      code: "CL-1045",
      name: "Restaurante Sabor Sul",
      phone: "(11) 97655-8821",
      service: "Cardápio Digital",
      value: 1200,
      origin: "WhatsApp",
      seller: "Mariana Costa",
      stage: "perdido",
      lostReason: "Achou o preço alto"
    }
  ],
  transactions: [
    {
      id: "t1",
      type: "entrada",
      desc: "Venda Fechada: Barbearia Dom Pedro (Lucas Silva)",
      cat: "Vendas & Serviços",
      amount: 1500,
      date: new Date().toISOString().slice(0, 10)
    },
    {
      id: "t2",
      type: "entrada",
      desc: "Mensalidade Suporte · Loja Matriz",
      cat: "Vendas & Serviços",
      amount: 950,
      date: new Date().toISOString().slice(0, 10)
    },
    {
      id: "t3",
      type: "saida",
      desc: "Aluguel & Internet Escritório",
      cat: "Custos Fixos",
      amount: 680,
      date: new Date().toISOString().slice(0, 10)
    },
    {
      id: "t4",
      type: "saida",
      desc: "Anúncios Meta / Google Ads",
      cat: "Marketing",
      amount: 320,
      date: new Date().toISOString().slice(0, 10)
    }
  ]
};

const STORE_KEY = "crm_caixa_saas_v3";

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return structuredClone(DEFAULT_DATA);
}

let state = loadState();
let activeTab = "dashboard";
let chartPeriod = "mensal";
let txType = "entrada";
let txFilter = "all";
let dashSearch = "";
let dashStage = "all";
let fullSearch = "";

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function formatBRL(v) {
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function initials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase() || "SE";
}

function hexAlpha(hex, a) {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16) || 91;
  const g = parseInt(c.slice(2, 4), 16) || 92;
  const b = parseInt(c.slice(4, 6), 16) || 230;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function applyBranding() {
  document.documentElement.style.setProperty("--brand", state.bizColor);
  document.documentElement.style.setProperty("--brand-soft", hexAlpha(state.bizColor, 0.12));

  const code = initials(state.bizName);
  document.getElementById("biz-logo").textContent = code;
  document.getElementById("header-avatar").textContent = code;
  document.getElementById("biz-name").textContent = state.bizName;
  document.getElementById("header-biz-label").textContent = state.bizName;
  document.getElementById("footer-biz-name").textContent = state.bizName;
  document.querySelectorAll(".biz-inline-name").forEach((el) => {
    el.textContent = state.bizName;
  });
  document.title = `${state.bizName} | CRM, ROI & Fluxo de Caixa`;

  const quickName = document.getElementById("quick-biz-name");
  if (document.activeElement !== quickName) {
    quickName.value = state.bizName === DEFAULT_DATA.bizName ? "" : state.bizName;
  }
  document.getElementById("quick-biz-color").value = state.bizColor;
}

function getFinancialMetrics() {
  const ins = state.transactions.filter((t) => t.type === "entrada");
  const outs = state.transactions.filter((t) => t.type === "saida");
  const totalIn = ins.reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = outs.reduce((s, t) => s + Number(t.amount), 0);
  const profit = totalIn - totalOut;
  const margin = totalIn > 0 ? Math.round((profit / totalIn) * 100) : 0;

  const mktInvest = outs
    .filter((t) => t.cat === "Marketing")
    .reduce((s, t) => s + Number(t.amount), 0);
  const baseInvest = mktInvest > 0 ? mktInvest : totalOut;
  const roiPct = baseInvest > 0 ? Math.round(((totalIn - baseInvest) / baseInvest) * 100) : 0;
  const roasX = baseInvest > 0 ? (totalIn / baseInvest).toFixed(1) : "0.0";

  const wonLeads = state.leads.filter((l) => l.stage === "fechado");
  const lostLeads = state.leads.filter((l) => l.stage === "perdido");
  const openPipelineVal = state.leads
    .filter((l) => l.stage !== "fechado" && l.stage !== "perdido")
    .reduce((s, l) => s + Number(l.value), 0);
  const lostTotal = lostLeads.reduce((s, l) => s + Number(l.value), 0);
  const conversion =
    state.leads.length > 0 ? Math.round((wonLeads.length / state.leads.length) * 100) : 0;

  return {
    outs,
    totalIn,
    totalOut,
    profit,
    margin,
    baseInvest,
    roiPct,
    roasX,
    wonLeads,
    lostLeads,
    openPipelineVal,
    lostTotal,
    conversion
  };
}

function renderKPIs() {
  const m = getFinancialMetrics();
  const resultCard = document.getElementById("kpi-result-card");
  const resultLabel = document.getElementById("kpi-result-label");

  if (m.profit < 0) {
    resultCard.classList.add("kpi-loss");
    resultLabel.textContent = "Prejuízo no Período";
  } else {
    resultCard.classList.remove("kpi-loss");
    resultLabel.textContent = "Lucro Líquido";
  }

  document.getElementById("kpi-profit").textContent = formatBRL(m.profit);
  document.getElementById("kpi-margin").textContent = `${m.margin}% (${m.outs.length} saídas)`;
  document.getElementById("kpi-in").textContent = formatBRL(m.totalIn);
  document.getElementById("kpi-out-sub").textContent = formatBRL(m.totalOut);
  document.getElementById("kpi-roi").textContent = `${m.roiPct >= 0 ? "+" : ""}${m.roiPct}%`;
  document.getElementById("kpi-roi-sub").textContent = `${m.roasX}x sobre ${formatBRL(m.baseInvest)}`;
  document.getElementById("kpi-funnel-mix").textContent =
    `${state.leads.length} / ${m.wonLeads.length} / ${m.lostLeads.length}`;
  document.getElementById("kpi-conversion").textContent =
    `${m.conversion}% · Perdidos ${formatBRL(m.lostTotal)}`;

  document.getElementById("crm-count").textContent = state.leads.length;
  document.getElementById("cf-count").textContent = state.transactions.length;

  const totalFlow = m.totalIn + m.totalOut;
  const inPct = totalFlow > 0 ? Math.round((m.totalIn / totalFlow) * 100) : 50;
  document.getElementById("health-pct").textContent = `${inPct}% entradas`;
  document.getElementById("health-fill").style.width = `${inPct}%`;
}

function renderCharts() {
  const m = getFinancialMetrics();
  const series = PERIOD_SERIES[chartPeriod] || PERIOD_SERIES.mensal;
  const values = [...series.values];
  // Ajusta o último ponto dinamicamente ao total atual de entradas do caixa
  values[values.length - 1] = Math.max(m.totalIn, 400);

  document.getElementById("sales-chart-total").textContent = formatBRL(m.totalIn);
  document.getElementById("sales-growth-pill").textContent = `↗ ${series.growth}`;

  const W = 620;
  const H = 210;
  const padL = 42;
  const padR = 18;
  const padT = 26;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxVal = Math.max(...values, 2800) * 1.15;

  const pts = values.map((val, i) => ({
    x: padL + (i / (values.length - 1)) * innerW,
    y: padT + innerH - (val / maxVal) * innerH,
    val,
    label: series.labels[i]
  }));

  let lineD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const cx = (pts[i].x + pts[i + 1].x) / 2;
    lineD += ` C ${cx} ${pts[i].y}, ${cx} ${pts[i + 1].y}, ${pts[i + 1].x} ${pts[i + 1].y}`;
  }
  const areaD = `${lineD} L ${pts[pts.length - 1].x} ${padT + innerH} L ${pts[0].x} ${padT + innerH} Z`;

  let peak = pts[0];
  pts.forEach((p) => {
    if (p.val >= peak.val) peak = p;
  });

  const gridLines = [0, 0.33, 0.66, 1]
    .map((ratio) => {
      const y = padT + innerH * (1 - ratio);
      const tick = Math.round((maxVal * ratio) / 100) * 100;
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#E5E7EB" stroke-dasharray="4 4" />
        <text x="${padL - 8}" y="${y + 4}" text-anchor="end" fill="#9CA3AF" font-size="10">${tick}</text>
      `;
    })
    .join("");

  const xLabels = pts
    .map(
      (p) =>
        `<text x="${p.x}" y="${H - 6}" text-anchor="middle" fill="#9CA3AF" font-size="10" font-weight="600">${p.label}</text>`
    )
    .join("");

  const tipX = Math.min(Math.max(peak.x - 52, padL), W - 120);
  const tipY = Math.max(peak.y - 46, 4);

  document.getElementById("sales-chart-svg-wrap").innerHTML = `
    <svg viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Curva de vendas e entradas">
      <defs>
        <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${state.bizColor}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${state.bizColor}" stop-opacity="0.01" />
        </linearGradient>
      </defs>
      ${gridLines}
      <path d="${areaD}" fill="url(#salesAreaGrad)" />
      <path d="${lineD}" stroke="${state.bizColor}" stroke-width="3" stroke-linecap="round" />
      <line x1="${peak.x}" y1="${peak.y}" x2="${peak.x}" y2="${padT + innerH}" stroke="${state.bizColor}" stroke-width="1.5" stroke-dasharray="3 3" />
      <circle cx="${peak.x}" cy="${peak.y}" r="5.5" fill="#FFFFFF" stroke="${state.bizColor}" stroke-width="3" />
      <rect x="${tipX}" y="${tipY}" width="108" height="34" rx="9" fill="#111827" />
      <text x="${tipX + 54}" y="${tipY + 14}" text-anchor="middle" fill="#A5B4FC" font-size="9" font-weight="600">${state.leads.length} clientes no funil</text>
      <text x="${tipX + 54}" y="${tipY + 27}" text-anchor="middle" fill="#FFFFFF" font-size="11" font-weight="800">${formatBRL(peak.val)}</text>
      ${xLabels}
    </svg>
  `;

  // Gráfico de cápsulas verticais à direita
  const combinedRevenue = m.totalIn + m.openPipelineVal;
  document.getElementById("revenue-chart-total").textContent = formatBRL(combinedRevenue);
  document.getElementById("legend-won-val").textContent = formatBRL(m.totalIn);
  document.getElementById("legend-pipe-val").textContent = formatBRL(m.openPipelineVal);

  const barSpec = [
    { lbl: "MAR", main: 42, cap: 24 },
    { lbl: "ABR", main: 62, cap: 18 },
    { lbl: "MAI", main: 36, cap: 34 },
    { lbl: "JUN", main: 58, cap: 28 },
    { lbl: "JUL", main: 48, cap: 22 },
    { lbl: "AGO", main: 70, cap: 20 },
    { lbl: "SET", main: 52, cap: 26 },
    { lbl: "OUT", main: 66, cap: 18 },
    { lbl: "NOV", main: Math.min(82, Math.max(38, Math.round((m.totalIn / Math.max(combinedRevenue, 1)) * 95))), cap: 16 }
  ];

  document.getElementById("capsule-bars").innerHTML = barSpec
    .map(
      (b) => `
      <div class="capsule-col">
        <div class="capsule-track">
          <div class="capsule-top-cap" style="height:${b.cap}%;"></div>
          <div class="capsule-fill" style="height:${b.main}%;"></div>
        </div>
        <span class="capsule-label">${b.lbl}</span>
      </div>`
    )
    .join("");
}

function advanceLeadStage(leadId, action, nextStageId) {
  const lead = state.leads.find((l) => l.id === leadId);
  if (!lead) return;

  if (action === "lost") {
    lead.stage = "perdido";
    lead.lostReason = "Preço / Sem retorno";
  } else {
    const targetStage = action === "win" ? "fechado" : nextStageId;
    lead.stage = targetStage;

    if (targetStage === "fechado") {
      state.transactions.unshift({
        id: "t" + Date.now(),
        type: "entrada",
        desc: `Venda Fechada: ${lead.name} (${lead.seller || "Equipe"})`,
        cat: "Vendas & Serviços",
        amount: Number(lead.value),
        date: new Date().toISOString().slice(0, 10)
      });
    }
  }

  saveState();
  renderAll();
}

function renderCustomerTable(tbodyId, searchQuery, stageFilter) {
  const tbody = document.getElementById(tbodyId);
  if (!tbody) return;

  const q = searchQuery.trim().toLowerCase();
  const filtered = state.leads.filter((lead) => {
    if (stageFilter !== "all" && lead.stage !== stageFilter) return false;
    if (!q) return true;
    return `${lead.name} ${lead.service} ${lead.phone || ""} ${lead.seller} ${lead.code || ""}`
      .toLowerCase()
      .includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; color: var(--muted); padding: 1.5rem;">
          Nenhum cliente encontrado para este filtro.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered
    .map((lead, idx) => {
      const stageMeta = STAGES.find((s) => s.id === lead.stage) || STAGES[0];
      const stageIdx = STAGES.findIndex((s) => s.id === lead.stage);
      const nextStage = STAGES[stageIdx + 1];
      const code = lead.code || `CL-${1040 + state.leads.length - idx}`;

      let actionBtns = "";
      if (lead.stage !== "fechado" && lead.stage !== "perdido" && nextStage) {
        actionBtns = `
          <div class="row-actions">
            <button type="button" class="lead-btn" data-act="next" data-id="${lead.id}" data-next="${nextStage.id}">Mover →</button>
            <button type="button" class="lead-btn lead-btn-win" data-act="win" data-id="${lead.id}">Fechar ✓</button>
            <button type="button" class="lead-btn lead-btn-lost" data-act="lost" data-id="${lead.id}">✕</button>
          </div>
        `;
      } else if (lead.stage === "fechado") {
        actionBtns = `<span class="text-green" style="font-size:0.75rem;font-weight:700;">No Caixa ✓</span>`;
      } else {
        actionBtns = `<span class="text-red" style="font-size:0.74rem;font-weight:600;">${lead.lostReason || "Perdido"}</span>`;
      }

      return `
        <tr>
          <td>
            <div class="client-cell">
              <span class="client-mini-avatar">${initials(lead.name)}</span>
              <div>
                <strong>${lead.name}</strong>
                <div style="font-size:0.72rem;color:var(--muted);">${lead.origin}</div>
              </div>
            </div>
          </td>
          <td style="color:var(--muted);font-weight:600;">${code}</td>
          <td>${lead.phone || "(11) 99999-0000"}</td>
          <td><span class="stage-badge stage-${lead.stage}">${stageMeta.short}</span></td>
          <td>
            <strong>${formatBRL(lead.value)}</strong>
            <div style="font-size:0.72rem;color:var(--muted);">${lead.service}</div>
          </td>
          <td>${lead.seller || "Equipe"}</td>
          <td>${actionBtns}</td>
        </tr>
      `;
    })
    .join("");

  tbody.querySelectorAll(".lead-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      advanceLeadStage(btn.dataset.id, btn.dataset.act, btn.dataset.next);
    });
  });
}

function renderIntel() {
  const sellers = {};
  state.leads.forEach((l) => {
    const s = l.seller || "Equipe";
    if (!sellers[s]) sellers[s] = { wonCount: 0, wonVal: 0, total: 0 };
    sellers[s].total += 1;
    if (l.stage === "fechado") {
      sellers[s].wonCount += 1;
      sellers[s].wonVal += Number(l.value);
    }
  });

  document.getElementById("seller-ranking").innerHTML = Object.entries(sellers)
    .sort((a, b) => b[1].wonVal - a[1].wonVal)
    .map(
      ([name, d]) => `
      <div class="intel-row">
        <span>${name} (${d.wonCount}/${d.total} vendas)</span>
        <strong class="text-green">${formatBRL(d.wonVal)}</strong>
      </div>`
    )
    .join("");

  const lostLeads = state.leads.filter((l) => l.stage === "perdido");
  const lostEl = document.getElementById("lost-summary");
  if (lostLeads.length === 0) {
    lostEl.innerHTML = `<div class="intel-row"><span>Nenhuma venda perdida até agora.</span><strong>R$ 0,00</strong></div>`;
  } else {
    lostEl.innerHTML = lostLeads
      .map(
        (l) => `
      <div class="intel-row">
        <span>${l.name} · ${l.lostReason || "Sem retorno"}</span>
        <strong class="text-red">-${formatBRL(l.value)}</strong>
      </div>`
      )
      .join("");
  }

  const m = getFinancialMetrics();
  const avgTicket =
    m.wonLeads.length > 0
      ? m.wonLeads.reduce((s, l) => s + Number(l.value), 0) / m.wonLeads.length
      : 0;

  document.getElementById("roi-breakdown").innerHTML = `
    <div class="intel-row"><span>Ticket Médio (Vendas)</span><strong>${formatBRL(avgTicket)}</strong></div>
    <div class="intel-row"><span>Total que Entrou</span><strong class="text-green">${formatBRL(m.totalIn)}</strong></div>
    <div class="intel-row"><span>Total que Saiu</span><strong class="text-red">${formatBRL(m.totalOut)}</strong></div>
    <div class="intel-row">
      <span>${m.profit >= 0 ? "Lucro Real" : "Prejuízo Real"}</span>
      <strong class="${m.profit >= 0 ? "text-green" : "text-red"}">${formatBRL(m.profit)}</strong>
    </div>
  `;
}

function renderKanban() {
  const board = document.getElementById("kanban-board");
  board.innerHTML = "";

  STAGES.forEach((stage, idx) => {
    const colLeads = state.leads.filter((l) => l.stage === stage.id);
    const colTotal = colLeads.reduce((s, l) => s + Number(l.value), 0);

    const col = document.createElement("div");
    col.className = "kanban-col";
    col.innerHTML = `
      <div class="kanban-col-head">
        <h3>${stage.label} (${colLeads.length})</h3>
        <span class="col-total">${formatBRL(colTotal)}</span>
      </div>
      <div class="kanban-list"></div>
    `;

    const listEl = col.querySelector(".kanban-list");
    colLeads.forEach((lead) => {
      const card = document.createElement("div");
      card.className = "lead-card";

      let actionsHtml = "";
      if (stage.id !== "fechado" && stage.id !== "perdido") {
        const nextStage = STAGES[idx + 1];
        actionsHtml += `<button type="button" class="lead-btn" data-act="next" data-id="${lead.id}" data-next="${nextStage.id}">Mover →</button>`;
        if (nextStage.id !== "fechado") {
          actionsHtml += `<button type="button" class="lead-btn lead-btn-win" data-act="win" data-id="${lead.id}">Fechar ✓</button>`;
        }
        actionsHtml += `<button type="button" class="lead-btn lead-btn-lost" data-act="lost" data-id="${lead.id}">Perdido ✕</button>`;
      } else if (stage.id === "fechado") {
        actionsHtml = `<span class="text-green" style="font-size:0.74rem;font-weight:700;">Lançado no Caixa ✓</span>`;
      } else {
        actionsHtml = `<span class="text-red" style="font-size:0.74rem;font-weight:700;">${lead.lostReason || "Não fechou"}</span>`;
      }

      card.innerHTML = `
        <div class="lead-top">
          <span class="lead-origin">${lead.origin}</span>
          <span class="lead-value">${formatBRL(lead.value)}</span>
        </div>
        <strong>${lead.name}</strong>
        <div class="lead-service">${lead.service}</div>
        <div class="lead-seller-tag">Resp.: ${lead.seller || "Equipe"}</div>
        <div class="lead-actions">${actionsHtml}</div>
      `;
      listEl.appendChild(card);
    });

    board.appendChild(col);
  });

  board.querySelectorAll(".lead-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      advanceLeadStage(btn.dataset.id, btn.dataset.act, btn.dataset.next);
    });
  });
}

function renderLedger() {
  const list = document.getElementById("tx-list");
  list.innerHTML = "";

  const filtered = state.transactions.filter((t) => txFilter === "all" || t.type === txFilter);
  if (filtered.length === 0) {
    list.innerHTML = `<p style="color: var(--muted); margin: 0;">Nenhuma movimentação encontrada.</p>`;
    return;
  }

  filtered.forEach((t) => {
    const isIn = t.type === "entrada";
    const item = document.createElement("div");
    item.className = "tx-item";
    item.innerHTML = `
      <div class="tx-info">
        <strong>${t.desc}</strong>
        <span>${t.cat} · ${t.date}</span>
      </div>
      <div class="tx-right">
        <span class="tx-amount ${isIn ? "text-green" : "text-red"}">
          ${isIn ? "+" : "-"} ${formatBRL(t.amount)}
        </span>
        <button type="button" class="tx-del" data-id="${t.id}" title="Excluir lançamento" aria-label="Excluir">✕</button>
      </div>
    `;
    list.appendChild(item);
  });

  list.querySelectorAll(".tx-del").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.transactions = state.transactions.filter((t) => t.id !== btn.dataset.id);
      saveState();
      renderAll();
    });
  });
}

function switchTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".nav-item").forEach((b) => {
    const isMatch = b.dataset.tab === tab;
    b.classList.toggle("active", isMatch);
    b.setAttribute("aria-selected", String(isMatch));
  });

  Object.keys(VIEW_META).forEach((key) => {
    const sec = document.getElementById(`tab-${key}`);
    if (sec) sec.classList.toggle("hidden", key !== tab);
  });

  const meta = VIEW_META[tab] || VIEW_META.dashboard;
  document.getElementById("workspace-title").textContent = meta.title;
  document.getElementById("workspace-subtitle").innerHTML =
    `${meta.sub} · <span class="biz-inline-name">${state.bizName}</span>`;

  closeMobileSidebar();
}

function closeMobileSidebar() {
  document.getElementById("app-sidebar").classList.remove("is-open");
  document.getElementById("sidebar-backdrop").classList.add("hidden");
}

function renderAll() {
  applyBranding();
  renderKPIs();
  renderCharts();
  renderCustomerTable("customer-table-body-dash", dashSearch, dashStage);
  renderCustomerTable("customer-table-body-full", fullSearch, "all");
  renderIntel();
  renderKanban();
  renderLedger();
}

// NAVEGACAO LATERAL + ATALHO DETALHES
document.querySelectorAll(".nav-item").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

document.querySelectorAll("[data-jump-tab]").forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.jumpTab));
});

document.getElementById("open-sidebar-btn").addEventListener("click", () => {
  document.getElementById("app-sidebar").classList.add("is-open");
  document.getElementById("sidebar-backdrop").classList.remove("hidden");
});

document.getElementById("close-sidebar-btn").addEventListener("click", closeMobileSidebar);
document.getElementById("sidebar-backdrop").addEventListener("click", closeMobileSidebar);

// PERIOD SWITCH NO GRAFICO DE VENDAS
document.querySelectorAll(".period-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".period-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    chartPeriod = btn.dataset.period;
    renderCharts();
  });
});

// FILTROS TABELA CLIENTES
document.getElementById("customer-search-dash").addEventListener("input", (e) => {
  dashSearch = e.target.value;
  renderCustomerTable("customer-table-body-dash", dashSearch, dashStage);
});

document.getElementById("customer-stage-dash").addEventListener("change", (e) => {
  dashStage = e.target.value;
  renderCustomerTable("customer-table-body-dash", dashSearch, dashStage);
});

document.getElementById("customer-search-full").addEventListener("input", (e) => {
  fullSearch = e.target.value;
  renderCustomerTable("customer-table-body-full", fullSearch, "all");
});

// PERSONALIZACAO DA MARCA
document.getElementById("quick-biz-name").addEventListener("input", (e) => {
  state.bizName = e.target.value.trim() || DEFAULT_DATA.bizName;
  saveState();
  applyBranding();
});

document.getElementById("quick-biz-color").addEventListener("input", (e) => {
  state.bizColor = e.target.value;
  saveState();
  applyBranding();
  renderCharts();
});

document.getElementById("reset-demo-btn").addEventListener("click", () => {
  state = structuredClone(DEFAULT_DATA);
  saveState();
  renderAll();
});

// FORMULARIO FLUXO DE CAIXA
document.getElementById("tx-date").value = new Date().toISOString().slice(0, 10);

document.querySelectorAll(".type-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    txType = btn.dataset.type;
    document.querySelectorAll(".type-btn").forEach((b) => {
      b.classList.remove("active-in", "active-out");
    });
    btn.classList.add(txType === "entrada" ? "active-in" : "active-out");
  });
});

document.getElementById("tx-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const desc = document.getElementById("tx-desc").value.trim();
  const amount = Number(document.getElementById("tx-amount").value);
  const date = document.getElementById("tx-date").value;
  const cat = document.getElementById("tx-cat").value;
  if (!desc || !amount) return;

  state.transactions.unshift({
    id: "t" + Date.now(),
    type: txType,
    desc,
    cat,
    amount,
    date
  });
  e.target.reset();
  document.getElementById("tx-date").value = new Date().toISOString().slice(0, 10);
  saveState();
  renderAll();
});

document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    txFilter = chip.dataset.filter;
    renderLedger();
  });
});

// EXPORTAR CSV
document.getElementById("export-csv-btn").addEventListener("click", () => {
  const header = "Data;Tipo;Categoria;Descricao;Valor\n";
  const rows = state.transactions
    .map((t) => `${t.date};${t.type};${t.cat};"${t.desc.replace(/"/g, '""')}";${t.amount}`)
    .join("\n");
  const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fluxo_caixa_${state.bizName.toLowerCase().replace(/\s+/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
});

// MODAL NOVO CLIENTE / ORCAMENTO
const leadModal = document.getElementById("lead-modal");
const openLeadModal = () => leadModal.classList.remove("hidden");
const closeLeadModal = () => leadModal.classList.add("hidden");

document.getElementById("open-lead-modal").addEventListener("click", openLeadModal);
document.getElementById("add-customer-dash").addEventListener("click", openLeadModal);
document.getElementById("add-customer-full").addEventListener("click", openLeadModal);
document.getElementById("close-lead-modal").addEventListener("click", closeLeadModal);
document.getElementById("lead-backdrop").addEventListener("click", closeLeadModal);

document.getElementById("lead-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("lead-name").value.trim();
  const phone = document.getElementById("lead-phone").value.trim() || "(11) 99999-0000";
  const service = document.getElementById("lead-service").value.trim();
  const value = Number(document.getElementById("lead-value").value);
  const seller = document.getElementById("lead-seller").value;
  const origin = document.getElementById("lead-origin").value;
  const stage = document.getElementById("lead-stage").value;
  if (!name || !service || !value) return;

  state.leads.unshift({
    id: "l" + Date.now(),
    code: `CL-${1041 + state.leads.length}`,
    name,
    phone,
    service,
    value,
    seller,
    origin,
    stage
  });
  e.target.reset();
  closeLeadModal();
  saveState();
  renderAll();
});

renderAll();
