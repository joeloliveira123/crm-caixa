const STAGES = [
  { id: "novo", label: "Novo Contato" },
  { id: "orcamento", label: "Orçamento Enviado" },
  { id: "negociacao", label: "Em Negociação" },
  { id: "fechado", label: "Venda Fechada" }
];

const DEFAULT_DATA = {
  bizName: "Sua Empresa",
  bizColor: "#1D4ED8",
  leads: [
    {
      id: "l1",
      name: "Padaria Central · Roberto",
      service: "Site Institucional + Cardápio",
      value: 1800,
      origin: "WhatsApp",
      stage: "novo"
    },
    {
      id: "l2",
      name: "Clínica Vida · Dra. Helena",
      service: "Sistema de Agendamento",
      value: 2400,
      origin: "Indicação",
      stage: "orcamento"
    },
    {
      id: "l3",
      name: "Auto Peças Silva",
      service: "Painel de Estoque & Caixa",
      value: 3200,
      origin: "Google",
      stage: "negociacao"
    },
    {
      id: "l4",
      name: "Barbearia Dom Pedro",
      service: "Site + Clube Mensal",
      value: 1500,
      origin: "Instagram",
      stage: "fechado"
    }
  ],
  transactions: [
    {
      id: "t1",
      type: "entrada",
      desc: "Venda Fechada: Barbearia Dom Pedro",
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

const STORE_KEY = "crm_caixa_mvp_v1";

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return structuredClone(DEFAULT_DATA);
}

let state = loadState();
let txType = "entrada";
let txFilter = "all";

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
  const r = parseInt(c.slice(0, 2), 16) || 29;
  const g = parseInt(c.slice(2, 4), 16) || 78;
  const b = parseInt(c.slice(4, 6), 16) || 216;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function applyBranding() {
  document.documentElement.style.setProperty("--brand", state.bizColor);
  document.documentElement.style.setProperty("--brand-soft", hexAlpha(state.bizColor, 0.1));

  document.getElementById("biz-logo").textContent = initials(state.bizName);
  document.getElementById("biz-name").textContent = state.bizName;
  document.getElementById("footer-biz-name").textContent = state.bizName;
  document.querySelectorAll(".biz-inline-name").forEach((el) => {
    el.textContent = state.bizName;
  });
  document.title = `${state.bizName} | CRM & Fluxo de Caixa`;

  const quickName = document.getElementById("quick-biz-name");
  if (document.activeElement !== quickName) {
    quickName.value = state.bizName === DEFAULT_DATA.bizName ? "" : state.bizName;
  }
  document.getElementById("quick-biz-color").value = state.bizColor;
}

function renderKPIs() {
  const ins = state.transactions.filter((t) => t.type === "entrada");
  const outs = state.transactions.filter((t) => t.type === "saida");
  const totalIn = ins.reduce((s, t) => s + Number(t.amount), 0);
  const totalOut = outs.reduce((s, t) => s + Number(t.amount), 0);
  const profit = totalIn - totalOut;
  const margin = totalIn > 0 ? Math.round((profit / totalIn) * 100) : 0;

  const openLeads = state.leads.filter((l) => l.stage !== "fechado");
  const wonLeads = state.leads.filter((l) => l.stage === "fechado");
  const pipeline = openLeads.reduce((s, l) => s + Number(l.value), 0);
  const conversion = state.leads.length > 0 ? Math.round((wonLeads.length / state.leads.length) * 100) : 0;

  document.getElementById("kpi-profit").textContent = formatBRL(profit);
  document.getElementById("kpi-margin").textContent = `Margem: ${margin}%`;
  document.getElementById("kpi-in").textContent = formatBRL(totalIn);
  document.getElementById("kpi-in-count").textContent = `${ins.length} lançamentos`;
  document.getElementById("kpi-out").textContent = formatBRL(totalOut);
  document.getElementById("kpi-out-count").textContent = `${outs.length} lançamentos`;
  document.getElementById("kpi-pipeline").textContent = formatBRL(pipeline);
  document.getElementById("kpi-conversion").textContent = `Conversão: ${conversion}%`;

  document.getElementById("crm-count").textContent = state.leads.length;
  document.getElementById("cf-count").textContent = state.transactions.length;

  const totalFlow = totalIn + totalOut;
  const inPct = totalFlow > 0 ? Math.round((totalIn / totalFlow) * 100) : 50;
  document.getElementById("health-pct").textContent = `${inPct}% entradas`;
  document.getElementById("health-fill").style.width = `${inPct}%`;
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
      if (stage.id !== "fechado") {
        const nextStage = STAGES[idx + 1];
        actionsHtml += `<button class="lead-btn" data-act="next" data-id="${lead.id}" data-next="${nextStage.id}">Mover →</button>`;
        if (nextStage.id !== "fechado") {
          actionsHtml += `<button class="lead-btn lead-btn-win" data-act="win" data-id="${lead.id}">Fechar Venda ✓</button>`;
        }
      } else {
        actionsHtml = `<span style="font-size:0.74rem; color: var(--green); font-weight:700;">Lançado no Caixa ✓</span>`;
      }

      card.innerHTML = `
        <div class="lead-top">
          <span class="lead-origin">${lead.origin}</span>
          <span class="lead-value">${formatBRL(lead.value)}</span>
        </div>
        <strong>${lead.name}</strong>
        <div class="lead-service">${lead.service}</div>
        <div class="lead-actions">${actionsHtml}</div>
      `;
      listEl.appendChild(card);
    });

    board.appendChild(col);
  });

  board.querySelectorAll(".lead-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const lead = state.leads.find((l) => l.id === btn.dataset.id);
      if (!lead) return;
      const targetStage = btn.dataset.act === "win" ? "fechado" : btn.dataset.next;
      lead.stage = targetStage;

      if (targetStage === "fechado") {
        state.transactions.unshift({
          id: "t" + Date.now(),
          type: "entrada",
          desc: `Venda Fechada: ${lead.name}`,
          cat: "Vendas & Serviços",
          amount: Number(lead.value),
          date: new Date().toISOString().slice(0, 10)
        });
      }

      saveState();
      renderAll();
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
        <button class="tx-del" data-id="${t.id}" title="Excluir lançamento" aria-label="Excluir">✕</button>
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

function renderAll() {
  applyBranding();
  renderKPIs();
  renderKanban();
  renderLedger();
}

// MODULE TABS
document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((b) => {
      b.classList.remove("active");
      b.setAttribute("aria-selected", "false");
    });
    btn.classList.add("active");
    btn.setAttribute("aria-selected", "true");
    const isCRM = btn.dataset.tab === "crm";
    document.getElementById("tab-crm").classList.toggle("hidden", !isCRM);
    document.getElementById("tab-cashflow").classList.toggle("hidden", isCRM);
  });
});

// BRANDING
document.getElementById("quick-biz-name").addEventListener("input", (e) => {
  state.bizName = e.target.value.trim() || DEFAULT_DATA.bizName;
  saveState();
  applyBranding();
});

document.getElementById("quick-biz-color").addEventListener("input", (e) => {
  state.bizColor = e.target.value;
  saveState();
  applyBranding();
});

document.getElementById("reset-demo-btn").addEventListener("click", () => {
  state = structuredClone(DEFAULT_DATA);
  saveState();
  renderAll();
});

// TX FORM
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

// LEDGER FILTERS
document.querySelectorAll(".filter-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    document.querySelectorAll(".filter-chip").forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
    txFilter = chip.dataset.filter;
    renderLedger();
  });
});

// EXPORT CSV
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

// LEAD MODAL
const leadModal = document.getElementById("lead-modal");
document.getElementById("open-lead-modal").addEventListener("click", () => leadModal.classList.remove("hidden"));
document.getElementById("close-lead-modal").addEventListener("click", () => leadModal.classList.add("hidden"));
document.getElementById("lead-backdrop").addEventListener("click", () => leadModal.classList.add("hidden"));

document.getElementById("lead-form").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("lead-name").value.trim();
  const service = document.getElementById("lead-service").value.trim();
  const value = Number(document.getElementById("lead-value").value);
  const origin = document.getElementById("lead-origin").value;
  const stage = document.getElementById("lead-stage").value;
  if (!name || !service || !value) return;

  state.leads.unshift({
    id: "l" + Date.now(),
    name,
    service,
    value,
    origin,
    stage
  });
  e.target.reset();
  leadModal.classList.add("hidden");
  saveState();
  renderAll();
});

renderAll();
