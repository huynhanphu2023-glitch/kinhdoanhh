/* =========================================================
   APX BUSINESS WORLD — HỆ THỐNG VẬN HÀNH CÔNG TY
   State công ty nằm trong save game; data.js chỉ dùng để tạo
   dữ liệu khởi tạo cho các bản save chưa có hệ thống này.
   ========================================================= */
(function () {
  "use strict";

  var PRODUCT_SEEDS = {
    coffee: [
      { name: "Atelier Espresso", price: 85000, costRatio: 0.34 },
      { name: "Cold Brew Saigon", price: 105000, costRatio: 0.31 },
      { name: "Ethiopia Signature", price: 145000, costRatio: 0.36 }
    ],
    tech: [
      { name: "Nexus Analytics", price: 1800000, costRatio: 0.13 },
      { name: "APX Cloud", price: 2600000, costRatio: 0.16 },
      { name: "Urban Data Platform", price: 3200000, costRatio: 0.19 }
    ],
    estate: [
      { name: "Lumen Residences", price: 2500000, costRatio: 0.3 },
      { name: "Lumen Offices", price: 3300000, costRatio: 0.27 },
      { name: "Central Boulevard", price: 4500000, costRatio: 0.34 }
    ]
  };

  var INDUSTRY_BY_COMPANY = { coffee: "lifestyle", tech: "technology", estate: "real-estate" };
  var INITIAL_SHARE = { coffee: 12, tech: 9, estate: 10 };
  var INITIAL_COMPETITORS = [
    { id: "northstar", name: "Northstar Living", sector: "lifestyle", strength: 72, marketShare: 24, priceIndex: 1.04, strategy: "Trải nghiệm cao cấp" },
    { id: "vela", name: "Vela Urban", sector: "real-estate", strength: 68, marketShare: 21, priceIndex: 0.98, strategy: "Mở rộng đô thị" },
    { id: "nexa", name: "Nexa Systems", sector: "technology", strength: 71, marketShare: 26, priceIndex: 1.02, strategy: "Đầu tư nền tảng số" }
  ];

  function gameState() { return window.APXGame && window.APXGame.state; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value) || 0)); }
  function money(value) { return Math.round(Number(value) || 0); }
  function commit(state, renderNow) {
    if (window.APXGame) {
      window.APXGame.save();
      if (renderNow) window.APXGame.render();
    }
  }
  function groupTransaction(state, kind, companyId, amount, note) {
    state.companyFinanceLedger.unshift({ day: state.day, type: kind, companyId: companyId || "group", amount: money(amount), note: note || "" });
    state.companyFinanceLedger = state.companyFinanceLedger.slice(0, 100);
  }
  function baseBranch(branch, index, company) {
    var initialEmployees = Math.max(1, Number(branch.employees) || 1);
    return {
      id: branch.id,
      name: branch.name,
      location: branch.district || branch.location || "TP. Hồ Chí Minh",
      type: index === 0 ? "Flagship" : "Chi nhánh",
      value: Math.max(150000000, Math.round(company.revenue * 0.35 / Math.max(1, company.branches.length))),
      capacity: initialEmployees * 12,
      seedCapacity: initialEmployees * 12,
      seedEmployees: initialEmployees,
      employeeIds: [],
      revenue: 0,
      costs: 0,
      efficiency: 1,
      level: 1,
      status: "Đang hoạt động",
      isInitial: true
    };
  }
  function initialProducts(company) {
    var definitions = PRODUCT_SEEDS[company.id] || [];
    var totalDailyRevenue = (Number(company.revenue) || 0) / 30;
    return definitions.map(function (product, index) {
      return {
        id: company.id + "-product-" + (index + 1),
        name: product.name,
        price: product.price,
        basePrice: product.price,
        unitCost: Math.round(product.price * product.costRatio),
        quality: 70,
        demand: 70,
        unitsPerDay: totalDailyRevenue / Math.max(1, definitions.length) / product.price,
        unitsSold: 0,
        revenue: 0,
        active: true,
        developed: true
      };
    });
  }
  function initialInventory(company) {
    if (company.id === "coffee") return { name: "Hạt cà phê", stock: 4000, unitCost: 8000, usePerSale: 1 };
    if (company.id === "tech") return { name: "Tài nguyên máy chủ", stock: 800, unitCost: 35000, usePerSale: 0.08 };
    return { name: "Vật liệu vận hành", stock: 1200, unitCost: 18000, usePerSale: 0.25 };
  }
  function makeCompany(company) {
    return {
      id: company.id,
      name: company.name,
      field: company.field,
      description: company.description,
      founded: company.founded,
      status: "Đang hoạt động",
      capital: 0,
      cash: 0,
      debt: 0,
      initialFunding: 0,
      seedRevenueMonthly: Number(company.revenue) || 0,
      seedStaff: Number(company.staff) || 0,
      basePayrollMonthly: Math.round((Number(company.revenue) || 0) * 0.18),
      baseOperatingMonthly: Math.round((Number(company.revenue) || 0) * 0.16),
      baseRentMonthly: Math.round((Number(company.revenue) || 0) * 0.08),
      revenue: 0,
      costs: 0,
      profit: 0,
      dailyRevenue: 0,
      dailyCosts: 0,
      dailyProfit: 0,
      totalRevenue: 0,
      totalCosts: 0,
      totalProfit: 0,
      growth: 0,
      reputation: 50,
      marketShare: INITIAL_SHARE[company.id] || 8,
      industryId: INDUSTRY_BY_COMPANY[company.id] || "lifestyle",
      branches: (company.branches || []).map(function (branch, index) { return baseBranch(branch, index, company); }),
      products: initialProducts(company),
      employeeAssignments: [],
      assets: [],
      inventory: initialInventory(company),
      campaigns: [],
      pendingExpenses: { marketing: 0, research: 0, other: 0 },
      lastDay: null,
      history: []
    };
  }
  function initialMarket() {
    return (window.APX_DATA.market || []).reduce(function (result, sector) {
      result[sector.id] = { id: sector.id, name: sector.name, index: 1, trend: 0, outlook: sector.outlook, history: [] };
      return result;
    }, {});
  }
  function ensureState(state) {
    if (!state) return null;
    if (!state.companyOperations || typeof state.companyOperations !== "object") state.companyOperations = {};
    var operations = state.companyOperations;
    if (!operations.companies || typeof operations.companies !== "object") operations.companies = {};
    if (!Array.isArray(state.companyFinanceLedger)) state.companyFinanceLedger = [];
    if (!state.marketConditions || typeof state.marketConditions !== "object") state.marketConditions = initialMarket();
    var marketDefaults = initialMarket();
    Object.keys(marketDefaults).forEach(function (id) {
      if (!state.marketConditions[id]) state.marketConditions[id] = marketDefaults[id];
    });
    if (!state.competitorState || !Array.isArray(state.competitorState)) state.competitorState = INITIAL_COMPETITORS.map(function (item) { return Object.assign({}, item); });
    if (!state.companyAssignments || typeof state.companyAssignments !== "object") state.companyAssignments = {};
    if (!state.companyBuildingOwnership || typeof state.companyBuildingOwnership !== "object") state.companyBuildingOwnership = {};
    if (!state.companyManager || typeof state.companyManager !== "object") state.companyManager = { companyId: null, tab: "overview" };
    if (!Array.isArray(state.companyEventHistory)) state.companyEventHistory = [];
    if (!Object.prototype.hasOwnProperty.call(state, "pendingBusinessEvent")) state.pendingBusinessEvent = null;

    (window.APX_DATA.companies || []).forEach(function (seed) {
      if (!operations.companies[seed.id]) {
        operations.companies[seed.id] = makeCompany(seed);
        operations.companies[seed.id].projectionInitialized = false;
      }
      var company = operations.companies[seed.id];
      company.name = company.name || seed.name;
      company.field = company.field || seed.field;
      company.description = company.description || seed.description;
      company.founded = Number(company.founded) || seed.founded;
      company.industryId = company.industryId || INDUSTRY_BY_COMPANY[seed.id] || "lifestyle";
      if (!Array.isArray(company.branches)) company.branches = [];
      if (!Array.isArray(company.products)) company.products = initialProducts(seed);
      if (!Array.isArray(company.employeeAssignments)) company.employeeAssignments = [];
      if (!Array.isArray(company.assets)) company.assets = [];
      if (!Array.isArray(company.campaigns)) company.campaigns = [];
      if (!Array.isArray(company.history)) company.history = [];
      if (!company.inventory) company.inventory = initialInventory(seed);
      if (!company.pendingExpenses) company.pendingExpenses = { marketing: 0, research: 0, other: 0 };
      company.cash = Number(company.cash) || 0;
      company.debt = Math.max(0, Number(company.debt) || 0);
      company.reputation = clamp(company.reputation == null ? 50 : company.reputation, 0, 100);
      company.marketShare = clamp(company.marketShare == null ? INITIAL_SHARE[seed.id] || 8 : company.marketShare, 0, 100);
      company.status = company.status || "Đang hoạt động";
      company.seedRevenueMonthly = Number(company.seedRevenueMonthly) || Number(seed.revenue) || 0;
      company.seedStaff = Number(company.seedStaff) || Number(seed.staff) || 0;
      company.basePayrollMonthly = Number(company.basePayrollMonthly) || Math.round(company.seedRevenueMonthly * 0.18);
      company.baseOperatingMonthly = Number(company.baseOperatingMonthly) || Math.round(company.seedRevenueMonthly * 0.16);
      company.baseRentMonthly = Number(company.baseRentMonthly) || Math.round(company.seedRevenueMonthly * 0.08);
      if (!company.branches.length) company.branches = (seed.branches || []).map(function (branch, index) { return baseBranch(branch, index, seed); });
      company.branches.forEach(function (branch) {
        if (!Array.isArray(branch.employeeIds)) branch.employeeIds = [];
        if (!Number.isFinite(Number(branch.efficiency))) branch.efficiency = 1;
        if (!Number.isFinite(Number(branch.level))) branch.level = 1;
        if (!Number.isFinite(Number(branch.capacity))) branch.capacity = Math.max(100, (Number(branch.seedEmployees) || 1) * 12);
        if (!Number.isFinite(Number(branch.seedCapacity))) branch.seedCapacity = branch.capacity;
        branch.status = branch.status || "Đang hoạt động";
      });
      company.products.forEach(function (product) {
        product.price = Math.max(1, Number(product.price) || 1);
        product.basePrice = Math.max(1, Number(product.basePrice) || product.price);
        product.unitCost = Math.max(0, Number(product.unitCost) || 0);
        product.quality = clamp(product.quality == null ? 70 : product.quality, 1, 100);
        product.unitsPerDay = Math.max(0, Number(product.unitsPerDay) || 0);
        product.active = product.active !== false;
      });
      var companySeedBuildings = (window.APX_DATA.buildings || []).filter(function (building) { return building.owner === company.name; });
      companySeedBuildings.forEach(function (building) {
        if (!company.assets.some(function (asset) { return asset.id === building.id; })) {
          company.assets.push({ id: building.id, name: building.name, value: Number(building.value) || 0, kind: "Công trình hiện hữu" });
        }
      });
    });

    if (!operations.initialized) {
      var companies = Object.keys(operations.companies).map(function (id) { return operations.companies[id]; });
      var requestedFunding = companies.reduce(function (sum, company) { return sum + company.seedRevenueMonthly * 1.5; }, 0);
      var fundScale = requestedFunding > 0 ? Math.min(1, Math.max(0, Number(state.treasury) || 0) / requestedFunding) : 0;
      companies.forEach(function (company) {
        company.initialFunding = money(company.seedRevenueMonthly * 1.5 * fundScale);
        var openingStockValue = money(company.inventory.stock * company.inventory.unitCost);
        company.inventory.value = openingStockValue;
        company.cash = money(company.cash + Math.max(0, company.initialFunding - openingStockValue));
        company.capital = money(company.capital || company.initialFunding);
        if (company.initialFunding) groupTransaction(state, "capitalization", company.id, -company.initialFunding, "Cấp vốn lưu động ban đầu từ ngân quỹ tập đoàn");
      });
      state.treasury = Math.max(0, money((Number(state.treasury) || 0) - companies.reduce(function (sum, company) { return sum + company.initialFunding; }, 0)));
      operations.initialized = true;
      operations.version = 1;
      operations.startedAtDay = Number(state.day) || 1;
    }

    state.hired.forEach(function (employeeId) {
      if (state.companyAssignments[employeeId]) return;
      var candidate = (window.APX_DATA.candidates || []).find(function (person) { return person.id === employeeId; });
      if (!candidate) return;
      var companyId = defaultCompanyForCandidate(candidate);
      var company = operations.companies[companyId];
      var branch = company && company.branches.find(function (item) { return item.status === "Đang hoạt động"; });
      state.companyAssignments[employeeId] = {
        employeeId: employeeId,
        companyId: companyId,
        branchId: branch ? branch.id : "",
        department: candidate.department || "Vận hành",
        role: candidate.role || "Nhân viên",
        salary: Number(candidate.salary) || 0,
        performance: Number(candidate.performance) || 75,
        status: "Đang làm việc",
        hiredDay: Number(state.day) || 1
      };
    });
    (state.projects || []).forEach(function (project) {
      if (!project.companyId || !operations.companies[project.companyId]) {
        project.companyId = companyForProject(project, state);
      }
    });
    Object.keys(state.companyAssignments).forEach(function (employeeId) {
      var assignment = state.companyAssignments[employeeId];
      if (!assignment || !operations.companies[assignment.companyId]) return;
      var owner = operations.companies[assignment.companyId];
      if (owner.employeeAssignments.indexOf(employeeId) < 0) owner.employeeAssignments.push(employeeId);
    });
    getCompaniesForState(state).forEach(function (company) {
      if (company.projectionInitialized) return;
      // Đặt cờ trước khi tính để các helper bên dưới gọi ensureState an toàn.
      company.projectionInitialized = true;
      var forecastRevenue = calculateCompanyRevenue(company, state);
      var forecastCosts = calculateCompanyCosts(company, state, forecastRevenue);
      company.revenue = company.dailyRevenue = forecastRevenue;
      company.costs = company.dailyCosts = forecastCosts.total;
      company.profit = company.dailyProfit = money(forecastRevenue - forecastCosts.total);
    });
    return operations;
  }

  function getCompaniesForState(state) {
    var ops = state && state.companyOperations;
    return ops && ops.companies ? Object.keys(ops.companies).map(function (id) { return ops.companies[id]; }) : [];
  }

  function defaultCompanyForCandidate(candidate) {
    var department = String(candidate.department || "").toLowerCase();
    if (/kỹ thuật|công nghệ|phần mềm|dữ liệu/.test(department)) return "tech";
    if (/dự án|bất động sản|xây dựng/.test(department)) return "estate";
    return "coffee";
  }
  function getCompanyById(id, state) {
    state = state || gameState();
    var operations = ensureState(state);
    return operations && operations.companies[id] || null;
  }
  function getCompanies(state) {
    state = state || gameState();
    var operations = ensureState(state);
    return operations ? Object.keys(operations.companies).map(function (id) { return operations.companies[id]; }) : [];
  }
  function getCompanyEmployees(companyId, state) {
    state = state || gameState();
    ensureState(state);
    return Object.keys(state.companyAssignments).map(function (id) {
      var candidate = (window.APX_DATA.candidates || []).find(function (person) { return person.id === id; });
      var assignment = state.companyAssignments[id];
      return candidate && assignment && assignment.companyId === companyId ? Object.assign({}, candidate, assignment) : null;
    }).filter(Boolean);
  }
  function hydrateEmployee(state, person) {
    if (!person || !state || !state.companyAssignments || !state.companyAssignments[person.id]) return person;
    var assignment = state.companyAssignments[person.id];
    var company = getCompanyById(assignment.companyId, state);
    var branch = company && company.branches.find(function (item) { return item.id === assignment.branchId; });
    return Object.assign({}, person, assignment, {
      company: company ? company.name : "APX Group",
      branch: branch ? branch.name : "Chưa phân công"
    });
  }
  function assignHiredEmployee(state, candidate, companyId, branchId) {
    ensureState(state);
    var company = getCompanyById(companyId, state);
    if (!company) return false;
    var branch = branchId
      ? company.branches.find(function (item) { return item.id === branchId && item.status === "Đang hoạt động"; })
      : company.branches.find(function (item) { return item.status === "Đang hoạt động"; });
    if (branchId && !branch) return false;
    var id = candidate.id;
    var old = state.companyAssignments[id];
    if (old) {
      var oldCompany = getCompanyById(old.companyId, state);
      if (oldCompany) oldCompany.employeeAssignments = oldCompany.employeeAssignments.filter(function (employeeId) { return employeeId !== id; });
    }
    state.companyAssignments[id] = {
      employeeId: id, companyId: company.id, branchId: branch ? branch.id : "",
      department: candidate.department || "Vận hành", role: candidate.role || "Nhân viên",
      salary: Number(candidate.salary) || 0, performance: Number(candidate.performance) || 75,
      status: "Đang làm việc", hiredDay: Number(state.day) || 1
    };
    if (company.employeeAssignments.indexOf(id) < 0) company.employeeAssignments.push(id);
    return true;
  }
  function moveEmployee(employeeId, companyId, branchId, state) {
    state = state || gameState();
    ensureState(state);
    var candidate = (window.APX_DATA.candidates || []).find(function (person) { return person.id === employeeId; });
    if (!candidate || !state.hired.includes(employeeId)) return { ok: false, message: "Chỉ có thể điều chuyển nhân viên đã tuyển." };
    if (!assignHiredEmployee(state, candidate, companyId, branchId)) return { ok: false, message: "Không tìm thấy công ty hoặc chi nhánh đang hoạt động." };
    commit(state, true);
    return { ok: true, message: "Đã điều chuyển " + candidate.name + "." };
  }
  function employeePayroll(company, state) {
    var rawPayroll = getCompanyEmployees(company.id, state).filter(function (employee) { return employee.status === "Đang làm việc"; }).reduce(function (sum, employee) { return sum + (Number(employee.salary) || 0); }, 0);
    var leadership = window.APXCharacter ? window.APXCharacter.getCharacterSkillEffect("leadership", state) : { payrollMultiplier: 1 };
    return rawPayroll * (Number(leadership.payrollMultiplier) || 1);
  }
  function teamMultiplier(company, state) {
    var hired = getCompanyEmployees(company.id, state);
    var total = company.seedStaff + hired.length;
    if (!total) return 0.75;
    var score = (company.seedStaff * 80 + hired.reduce(function (sum, employee) { return sum + clamp(employee.performance, 0, 120); }, 0)) / total;
    return clamp(score / 80, 0.7, 1.35);
  }
  function branchMultiplier(company) {
    var active = company.branches.filter(function (branch) { return branch.status === "Đang hoạt động"; });
    var seed = company.branches.filter(function (branch) { return branch.isInitial; }).reduce(function (sum, branch) { return sum + Number(branch.seedCapacity || branch.capacity); }, 0);
    if (!seed) seed = active.reduce(function (sum, branch) { return sum + Number(branch.seedCapacity || branch.capacity); }, 0) || 1;
    return active.reduce(function (sum, branch) { return sum + Number(branch.capacity) * Number(branch.efficiency || 1); }, 0) / seed;
  }
  function sectorIndex(state, company) {
    var market = state.marketConditions[company.industryId];
    return market ? clamp(market.index, 0.65, 1.5) : 1;
  }
  function demandMultiplier(state, company) {
    var activeMarketing = company.campaigns.filter(function (campaign) { return campaign.daysLeft > 0; }).reduce(function (sum, campaign) { return sum + Number(campaign.demandBoost || 0); }, 0);
    var rep = 0.75 + Number(company.reputation) / 200;
    var share = 0.9 + Number(company.marketShare) / 100;
    var competitors = state.competitorState.filter(function (item) { return item.sector === company.industryId; });
    var competition = competitors.length ? clamp(1.08 - competitors.reduce(function (sum, item) {
      return sum + (Number(item.strength || 50) / 100) * 0.2 + (Number(item.marketShare || 0) / 100) * 0.5;
    }, 0) / competitors.length, 0.65, 1.05) : 1;
    return clamp(sectorIndex(state, company) * rep * share * teamMultiplier(company, state) * branchMultiplier(company) * (1 + activeMarketing) * competition, 0.2, 3.5);
  }
  function calculateCompanyRevenue(company, state) {
    var demand = demandMultiplier(state, company);
    var activeProducts = company.products.filter(function (product) { return product.active; });
    var wanted = activeProducts.map(function (product) {
      var quality = clamp(Number(product.quality) / 70, 0.5, 1.5);
      var priceRatio = Number(product.price) / Math.max(1, Number(product.basePrice) || Number(product.price));
      var priceDemand = clamp(1 - (priceRatio - 1) * 0.35, 0.35, 1.3);
      return Math.max(0, Number(product.unitsPerDay) * demand * quality * priceDemand * (Number(product.demand || 70) / 70));
    });
    var wantedTotal = wanted.reduce(function (sum, units) { return sum + units; }, 0);
    var stockLimit = Number(company.inventory.usePerSale) > 0
      ? Math.max(0, Number(company.inventory.stock) || 0) / Number(company.inventory.usePerSale)
      : Infinity;
    var stockScale = wantedTotal > 0 ? Math.min(1, stockLimit / wantedTotal) : 1;
    var productRevenue = activeProducts.reduce(function (sum, product, index) {
      var units = wanted[index] * stockScale;
      product.unitsSold = units;
      product.revenue = money(units * Number(product.price));
      sum += product.revenue;
      return sum;
    }, 0);
    company.products.filter(function (product) { return !product.active; }).forEach(function (product) {
      product.unitsSold = 0;
      product.revenue = 0;
    });
    var projectRevenue = state.projects.filter(function (project) {
      return project.status === "Đang hoạt động" && project.companyId === company.id;
    }).reduce(function (sum, project) {
      return sum + Math.max(0, Number(project.monthlyRevenue) || 0) / 30;
    }, 0);
    return money(productRevenue + projectRevenue);
  }
  function calculateCompanyCosts(company, state, revenue) {
    var products = company.products.filter(function (product) { return product.active; });
    var production = products.reduce(function (sum, product) { return sum + product.unitsSold * product.unitCost; }, 0);
    var salary = (Number(company.basePayrollMonthly) + employeePayroll(company, state)) / 30;
    var activeBranches = company.branches.filter(function (branch) { return branch.status === "Đang hoạt động"; });
    var branchScale = Math.max(0.35, activeBranches.length / Math.max(1, company.branches.filter(function (branch) { return branch.isInitial; }).length));
    var operations = Number(company.baseOperatingMonthly) / 30 * branchScale;
    var rent = Number(company.baseRentMonthly) / 30 * branchScale;
    var debtInterest = Math.max(0, Number(company.debt) || 0) * 0.0002;
    var projectRevenue = state.projects.filter(function (project) { return project.status === "Đang hoạt động" && project.companyId === company.id; }).reduce(function (sum, project) { return sum + (Number(project.monthlyRevenue) || 0) / 30; }, 0);
    var projectOperations = projectRevenue * 0.38;
    var marketing = Number(company.pendingExpenses.marketing) || 0;
    var research = Number(company.pendingExpenses.research) || 0;
    var other = Number(company.pendingExpenses.other) || 0;
    var productRevenue = Math.max(0, Number(revenue) - projectRevenue);
    return { production: money(production), payroll: money(salary), operations: money(operations), rent: money(rent), projectOperations: money(projectOperations), interest: money(debtInterest), marketing: money(marketing), research: money(research), other: money(other), total: money(production + salary + operations + rent + projectOperations + debtInterest + marketing + research + other), projectRevenue: money(projectRevenue), revenue: money(productRevenue) };
  }
  function updateMarketAndCompetitors(state) {
    Object.keys(state.marketConditions).forEach(function (id) {
      var market = state.marketConditions[id];
      var previous = Number(market.index) || 1;
      var drift = (Math.random() - 0.48) * 0.035;
      market.index = Math.round(clamp(previous + drift, 0.7, 1.35) * 1000) / 1000;
      market.trend = Math.round((market.index - previous) * 10000) / 100;
      market.history.push({ day: state.day, index: market.index });
      market.history = market.history.slice(-30);
      market.outlook = market.trend > 0.15 ? "Tăng trưởng" : market.trend < -0.15 ? "Suy giảm" : "Ổn định";
    });
    state.competitorState.forEach(function (competitor) {
      competitor.strength = Math.round(clamp(Number(competitor.strength) + (Math.random() - 0.52) * 2.4, 40, 98));
      competitor.marketShare = Math.round(clamp(Number(competitor.marketShare) + (Math.random() - 0.5) * 0.6, 5, 60) * 10) / 10;
      if (Math.random() < 0.12) competitor.strategy = ["Giảm giá", "Ra mắt sản phẩm", "Mở rộng chi nhánh", "Đẩy mạnh quảng cáo"][Math.floor(Math.random() * 4)];
    });
  }
  function updateCompanyDay(company, state, revenue, costs) {
    var profit = money(revenue - costs.total);
    var materialUnits = company.products.reduce(function (sum, product) { return sum + Number(product.unitsSold || 0); }, 0);
    company.inventory.stock = Math.max(0, Number(company.inventory.stock) - materialUnits * Number(company.inventory.usePerSale || 0));
    company.inventory.value = Math.max(0, Number(company.inventory.value || 0) - Math.min(Number(company.inventory.value || 0), materialUnits * Number(company.inventory.usePerSale || 0) * Number(company.inventory.unitCost || 0)));
    company.products.forEach(function (product) { product.totalSold = (Number(product.totalSold) || 0) + Number(product.unitsSold || 0); });
    company.branches.filter(function (branch) { return branch.status === "Đang hoạt động"; }).forEach(function (branch) {
      var share = branch.capacity * branch.efficiency / Math.max(1, company.branches.reduce(function (sum, item) { return sum + (item.status === "Đang hoạt động" ? item.capacity * item.efficiency : 0); }, 0));
      branch.revenue = money(revenue * share);
      branch.costs = money((costs.total - costs.marketing - costs.research) * share);
    });
    company.revenue = revenue;
    company.costs = costs.total;
    company.profit = profit;
    company.dailyRevenue = revenue;
    company.dailyCosts = costs.total;
    company.dailyProfit = profit;
    company.totalRevenue = (Number(company.totalRevenue) || 0) + revenue;
    company.totalCosts = (Number(company.totalCosts) || 0) + costs.total;
    company.totalProfit = (Number(company.totalProfit) || 0) + profit;
    company.growth = company.history.length ? Math.round(((revenue - Number(company.history[0].revenue || revenue)) / Math.max(1, Number(company.history[0].revenue || revenue))) * 1000) / 10 : 0;
    company.lastDay = { day: state.day, revenue: revenue, costs: costs.total, profit: profit, cash: company.cash, marketShare: company.marketShare, breakdown: costs };
    company.history.unshift(company.lastDay);
    company.history = company.history.slice(0, 90);
    company.reputation = clamp(Number(company.reputation) + (profit >= 0 ? 0.025 : -0.08) + (Number(company.products.reduce(function (sum, product) { return sum + product.quality; }, 0)) / Math.max(1, company.products.length) - 70) * 0.0008, 0, 100);
    var campaignBoost = company.campaigns.reduce(function (sum, campaign) { return sum + (campaign.daysLeft > 0 ? Number(campaign.demandBoost || 0) : 0); }, 0);
    company.marketShare = Math.round(clamp(company.marketShare + (profit >= 0 ? 0.045 : -0.08) + campaignBoost * 0.25 + (company.reputation - 50) * 0.0004, 1, 65) * 10) / 10;
    company.campaigns.forEach(function (campaign) { campaign.daysLeft -= 1; });
    company.campaigns = company.campaigns.filter(function (campaign) { return campaign.daysLeft > 0; });
    company.pendingExpenses = { marketing: 0, research: 0, other: 0 };
    return profit;
  }
  function createBusinessEvent(state) {
    if (state.pendingBusinessEvent || Number(state.day) % 5 !== 0) return;
    var companies = getCompanies(state).filter(function (company) { return company.status === "Đang hoạt động"; });
    if (!companies.length) return;
    var company = companies[(Math.floor(Number(state.day) / 5) - 1) % companies.length];
    var opportunity = Number(state.day) % 10 === 0;
    state.pendingBusinessEvent = opportunity ? {
      id: "event-opportunity-" + state.day, day: state.day, companyId: company.id,
      title: "Khách hàng lớn đang quan tâm", description: company.name + " có cơ hội ký hợp đồng mới nếu đầu tư chăm sóc khách hàng.",
      options: [{ id: "invest", label: "Đầu tư 25 triệu để theo đuổi", kind: "invest" }, { id: "decline", label: "Từ chối, giữ ngân quỹ", kind: "decline" }]
    } : {
      id: "event-cost-" + state.day, day: state.day, companyId: company.id,
      title: "Nhà cung cấp báo tăng giá", description: "Chi phí nguyên liệu của " + company.name + " có nguy cơ tăng. Bạn có thể dự trữ hoặc chấp nhận giá mới.",
      options: [{ id: "stock", label: "Dự trữ nguồn hàng · 18 triệu", kind: "stock" }, { id: "accept", label: "Chấp nhận, uy tín giảm nhẹ", kind: "accept" }]
    };
  }
  function closeAllCompanies(state) {
    ensureState(state);
    updateMarketAndCompetitors(state);
    var totalRevenue = 0;
    var totalCosts = 0;
    var totalProfit = 0;
    var groupTransfer = 0;
    var details = [];
    getCompanies(state).forEach(function (company) {
      if (company.status !== "Đang hoạt động") return;
      var openingCash = Number(company.cash) || 0;
      var revenue = calculateCompanyRevenue(company, state);
      var costs = calculateCompanyCosts(company, state, revenue);
      var profit = updateCompanyDay(company, state, revenue, costs);
      var distribution = 0;
      // Nguyên liệu, marketing và nghiên cứu đã được thanh toán lúc nhập/chạy;
      // không trừ chúng lần thứ hai khỏi tiền mặt cuối ngày.
      var cashCosts = costs.total - costs.production - costs.marketing - costs.research;
      var cashAfterOperation = Number(company.cash) + revenue - cashCosts;
      var bailout = 0;
      var debtBorrowing = 0;
      if (cashAfterOperation < 0) {
        var shortfall = -cashAfterOperation;
        bailout = Math.min(Math.max(0, Number(state.treasury) || 0), shortfall);
        state.treasury -= bailout;
        groupTransfer -= bailout;
        debtBorrowing = money(shortfall - bailout);
        company.debt += debtBorrowing;
        cashAfterOperation = 0;
        if (bailout) groupTransaction(state, "bailout", company.id, -bailout, "Tập đoàn bù thiếu hụt vận hành");
        if (shortfall > bailout) {
          state.companyFinanceLedger.unshift({ day: state.day, type: "company-debt", companyId: company.id, amount: money(shortfall - bailout), note: "Ghi nhận khoản phải trả do thiếu dòng tiền" });
          state.companyFinanceLedger = state.companyFinanceLedger.slice(0, 100);
        }
      }
      var debtRepayment = Math.min(company.debt, Math.max(0, cashAfterOperation) * 0.15);
      company.debt = money(company.debt - debtRepayment);
      cashAfterOperation -= debtRepayment;
      distribution = profit > 0 ? Math.min(money(profit * 0.3), money(Math.max(0, cashAfterOperation))) : 0;
      company.cash = money(cashAfterOperation - distribution);
      company.lastDay.cashFlow = {
        opening: money(openingCash),
        inflow: money(revenue),
        outflow: money(cashCosts),
        debtBorrowing: debtBorrowing,
        debtRepayment: money(debtRepayment),
        transferredToGroup: money(distribution),
        groupSupport: money(bailout),
        closing: company.cash
      };
      if (company.history.length) company.history[0] = company.lastDay;
      if (distribution) {
        state.treasury += distribution;
        groupTransfer += distribution;
        groupTransaction(state, "distribution", company.id, distribution, "Lợi nhuận chuyển về APX Group");
      }
      company.capital = Math.max(0, money(company.capital + profit));
      totalRevenue += revenue;
      totalCosts += costs.total;
      totalProfit += profit;
      details.push({ id: company.id, name: company.name, revenue: revenue, cost: costs.total, profit: profit, cash: company.cash, transferred: distribution, bailout: bailout, breakdown: costs });
    });
    createBusinessEvent(state);
    return { revenue: money(totalRevenue), cost: money(totalCosts), profit: money(totalProfit), groupTransfer: money(groupTransfer), companies: details };
  }
  function branchCost(company) { return company.id === "coffee" ? 720000000 : company.id === "tech" ? 1150000000 : 980000000; }
  function openBranch(companyId, values, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var name = String(values.name || "").trim();
    var location = String(values.location || "").trim();
    if (!company || name.length < 3 || location.length < 2) return { ok: false, message: "Nhập tên chi nhánh và khu vực hợp lệ." };
    if (company.branches.some(function (branch) { return branch.name.toLowerCase() === name.toLowerCase(); })) return { ok: false, message: "Tên chi nhánh này đã được dùng." };
    var cost = branchCost(company);
    if (company.cash < cost) return { ok: false, message: "Tiền công ty không đủ. Cần " + window.APXUI.money(cost) + "." };
    company.cash -= cost;
    company.branches.push({ id: company.id + "-branch-" + Date.now(), name: name, location: location, type: "Chi nhánh mới", value: cost, capacity: 180, seedCapacity: 0, seedEmployees: 0, employeeIds: [], revenue: 0, costs: 0, efficiency: 0.8, level: 1, status: "Đang hoạt động", isInitial: false });
    groupTransaction(state, "company-investment", company.id, -cost, "Mở chi nhánh " + name);
    commit(state, true); return { ok: true, message: "Đã mở chi nhánh " + name + " bằng ngân quỹ của " + company.name + "." };
  }
  function upgradeBranch(companyId, branchId, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var branch = company && company.branches.find(function (item) { return item.id === branchId; });
    if (!branch || branch.status !== "Đang hoạt động") return { ok: false, message: "Không tìm thấy chi nhánh đang hoạt động." };
    var cost = 180000000 * Math.max(1, Number(branch.level) || 1);
    if (company.cash < cost) return { ok: false, message: "Tiền công ty không đủ để nâng cấp." };
    company.cash -= cost; branch.level += 1; branch.efficiency = clamp(Number(branch.efficiency) + 0.12, 0.6, 1.8); branch.capacity = Math.round(branch.capacity * 1.15); branch.value += cost;
    groupTransaction(state, "company-investment", company.id, -cost, "Nâng cấp " + branch.name);
    commit(state, true); return { ok: true, message: "Đã nâng cấp " + branch.name + "." };
  }
  function closeBranch(companyId, branchId, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var branch = company && company.branches.find(function (item) { return item.id === branchId; });
    if (!branch || branch.isInitial || branch.status !== "Đang hoạt động") return { ok: false, message: "Không thể đóng chi nhánh gốc hoặc chi nhánh không hoạt động." };
    var assigned = Object.keys(state.companyAssignments).filter(function (id) { var a = state.companyAssignments[id]; return a.companyId === company.id && a.branchId === branch.id; });
    if (assigned.length) return { ok: false, message: "Hãy điều chuyển nhân viên khỏi chi nhánh trước." };
    branch.status = "Đã đóng"; commit(state, true); return { ok: true, message: "Đã đóng chi nhánh." };
  }
  function updateProduct(companyId, productId, changes, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var product = company && company.products.find(function (item) { return item.id === productId; });
    if (!product) return { ok: false, message: "Không tìm thấy sản phẩm." };
    if (changes.toggle) product.active = !product.active;
    if (changes.price != null) {
      var price = money(changes.price);
      if (price < product.basePrice * 0.5 || price > product.basePrice * 2) return { ok: false, message: "Giá chỉ được thay đổi trong khoảng 50% đến 200% giá gốc." };
      product.price = price;
    }
    if (changes.upgrade) {
      var cost = 45000000 + Number(product.quality) * 650000;
      if (company.cash < cost) return { ok: false, message: "Ngân quỹ công ty không đủ để nâng chất lượng." };
      company.cash -= cost; product.quality = Math.min(100, product.quality + 8); product.unitCost = Math.round(product.unitCost * 1.04);
      company.pendingExpenses.research += cost;
      groupTransaction(state, "company-research", company.id, -cost, "Cải thiện chất lượng " + product.name);
    }
    commit(state, true); return { ok: true, message: "Đã cập nhật " + product.name + "." };
  }
  function createProduct(companyId, values, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var name = String(values.name || "").trim();
    var price = money(values.price);
    var cost = company && company.id === "tech" ? 90000000 : 55000000;
    if (!company || name.length < 3 || price <= 0) return { ok: false, message: "Nhập tên và giá sản phẩm hợp lệ." };
    if (company.products.some(function (product) { return product.name.toLowerCase() === name.toLowerCase(); })) return { ok: false, message: "Sản phẩm này đã tồn tại." };
    if (company.cash < cost) return { ok: false, message: "Ngân quỹ công ty không đủ để nghiên cứu sản phẩm." };
    company.cash -= cost;
    company.products.push({ id: company.id + "-product-" + Date.now(), name: name, price: price, basePrice: price, unitCost: Math.round(price * 0.35), quality: 62, demand: 45, unitsPerDay: Math.max(0.1, company.seedRevenueMonthly / 30 / Math.max(1, company.products.length + 1) / price * 0.15), unitsSold: 0, revenue: 0, active: true, developed: true });
    company.pendingExpenses.research += cost;
    groupTransaction(state, "company-research", company.id, -cost, "Phát triển sản phẩm " + name);
    commit(state, true); return { ok: true, message: "Đã phát triển sản phẩm " + name + "." };
  }
  var CAMPAIGNS = [
    { id: "local", name: "Quảng cáo địa phương", cost: 18000000, days: 4, demandBoost: 0.08, description: "Tiếp cận khách hàng quanh các chi nhánh." },
    { id: "social", name: "Mạng xã hội", cost: 32000000, days: 5, demandBoost: 0.13, description: "Tăng nhận diện và nhu cầu trực tuyến." },
    { id: "event", name: "Sự kiện thương hiệu", cost: 58000000, days: 3, demandBoost: 0.2, description: "Tạo đợt tăng nhu cầu ngắn hạn." }
  ];
  function runMarketing(companyId, campaignId, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var campaign = CAMPAIGNS.find(function (item) { return item.id === campaignId; });
    if (!company || !campaign) return { ok: false, message: "Không tìm thấy chiến dịch." };
    if (company.cash < campaign.cost) return { ok: false, message: "Tiền công ty không đủ cho chiến dịch này." };
    company.cash -= campaign.cost;
    company.pendingExpenses.marketing += campaign.cost;
    company.campaigns.push({ id: campaign.id + "-" + Date.now(), name: campaign.name, daysLeft: campaign.days, demandBoost: campaign.demandBoost, cost: campaign.cost, audience: company.field });
    groupTransaction(state, "marketing", company.id, -campaign.cost, campaign.name);
    commit(state, true); return { ok: true, message: "Đã khởi chạy " + campaign.name + " cho " + company.name + "." };
  }
  function buyInventory(companyId, quantity, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    quantity = Math.floor(Number(quantity) || 0);
    if (!company || quantity < 1 || quantity > 10000) return { ok: false, message: "Số lượng nhập kho không hợp lệ." };
    var cost = money(quantity * company.inventory.unitCost);
    if (company.cash < cost) return { ok: false, message: "Tiền công ty không đủ để nhập kho." };
    company.cash -= cost; company.inventory.stock += quantity; company.inventory.value = (Number(company.inventory.value) || 0) + cost;
    groupTransaction(state, "inventory-purchase", company.id, -cost, "Nhập " + quantity + " " + company.inventory.name);
    commit(state, true); return { ok: true, message: "Đã nhập " + quantity + " " + company.inventory.name + "." };
  }
  function transferCash(companyId, amount, direction, state) {
    state = state || gameState(); ensureState(state); amount = money(amount);
    var company = getCompanyById(companyId, state);
    if (!company || amount <= 0) return { ok: false, message: "Số tiền chuyển không hợp lệ." };
    if (direction === "to-company") {
      if (state.treasury < amount) return { ok: false, message: "Ngân quỹ tập đoàn không đủ." };
      state.treasury -= amount; company.cash += amount;
      groupTransaction(state, "group-to-company", company.id, -amount, "Cấp vốn cho " + company.name);
    } else {
      if (company.cash < amount) return { ok: false, message: "Tiền mặt công ty không đủ." };
      company.cash -= amount; state.treasury += amount;
      groupTransaction(state, "company-to-group", company.id, amount, "Chuyển lợi nhuận về APX Group");
    }
    commit(state, true); return { ok: true, message: "Đã ghi nhận giao dịch chuyển vốn." };
  }
  function adjustSalary(employeeId, delta, state) {
    state = state || gameState(); ensureState(state);
    var assignment = state.companyAssignments[employeeId];
    var company = assignment && getCompanyById(assignment.companyId, state);
    var amount = money(delta);
    if (!assignment || !company || !amount) return { ok: false, message: "Không tìm thấy hồ sơ lương." };
    assignment.salary = Math.max(1000000, assignment.salary + amount);
    commit(state, true); return { ok: true, message: "Đã cập nhật lương nhân viên." };
  }
  function companyForProject(project) {
    if (project && project.companyId && getCompanyById(project.companyId)) return project.companyId;
    var text = String(project && (project.name || project.type) || "").toLowerCase();
    if (text.indexOf("coffee") >= 0 || text.indexOf("cà phê") >= 0) return "coffee";
    if (text.indexOf("tech") >= 0 || text.indexOf("cloud") >= 0 || text.indexOf("data") >= 0) return "tech";
    return "estate";
  }
  function assignProject(project, companyId, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    if (!project || !company) return false;
    project.companyId = company.id;
    return true;
  }
  function startProject(template, state) {
    state = state || gameState(); ensureState(state);
    var companyId = companyForProject(template, state);
    var company = getCompanyById(companyId, state);
    var cost = money(template && template.cost);
    if (!template || !company || cost <= 0) return { ok: false, message: "Không tìm thấy dự án hoặc công ty phụ trách." };
    if (company.cash < cost) return { ok: false, message: "Tiền mặt " + company.name + " chưa đủ. Hãy điều chuyển vốn từ APX Group trong trang công ty." };
    var project = {
      id: "project-" + Date.now(), name: template.name, type: template.type,
      cost: cost, monthlyRevenue: money(template.monthlyRevenue),
      daysLeft: Math.max(1, Number(template.daysToBuild) || 5),
      status: "Đang xây", tone: template.tone, companyId: company.id
    };
    company.cash -= cost;
    state.projects.push(project);
    groupTransaction(state, "company-project", company.id, -cost, "Khởi công " + project.name);
    commit(state, true);
    return { ok: true, message: "Đã khởi công " + project.name + " bằng ngân quỹ của " + company.name + ".", project: project };
  }
  function buyMarketAsset(companyId, buildingId, state) {
    state = state || gameState(); ensureState(state);
    var company = getCompanyById(companyId, state);
    var building = (window.APX_DATA.buildings || []).find(function (item) { return item.id === buildingId; });
    state.companyBuildingOwnership = state.companyBuildingOwnership || {};
    if (!company || !building || building.owned || building.status !== "Mở bán" || state.buildings.includes(buildingId) || state.companyBuildingOwnership[buildingId]) return { ok: false, message: "Tài sản này không còn mở bán." };
    var price = money(building.value);
    if (price <= 0 || company.cash < price) return { ok: false, message: "Tiền mặt công ty không đủ để mua tài sản." };
    company.cash -= price;
    company.assets.push({ id: building.id, name: building.name, value: price, kind: "Bất động sản công ty" });
    state.companyBuildingOwnership[building.id] = company.id;
    groupTransaction(state, "company-asset", company.id, -price, "Mua tài sản " + building.name);
    commit(state, true); return { ok: true, message: "Đã mua " + building.name + " bằng tiền của " + company.name + "." };
  }
  function resolveBusinessEvent(optionId, state) {
    state = state || gameState(); ensureState(state);
    var event = state.pendingBusinessEvent;
    if (!event) return { ok: false, message: "Không có sự kiện đang chờ." };
    var company = getCompanyById(event.companyId, state);
    if (!company) { state.pendingBusinessEvent = null; return { ok: false, message: "Công ty không còn hoạt động." }; }
    var option = event.options.find(function (item) { return item.id === optionId; });
    if (!option) return { ok: false, message: "Lựa chọn sự kiện không hợp lệ." };
    var result = "";
    var transactionAmount = 0;
    if (option.kind === "invest") {
      if (company.cash < 25000000) return { ok: false, message: "Tiền công ty không đủ để theo đuổi hợp đồng." };
      company.cash -= 25000000; company.pendingExpenses.marketing += 25000000; transactionAmount = -25000000;
      company.campaigns.push({ id: "event-deal-" + event.day, name: "Chăm sóc khách hàng lớn", daysLeft: 3, demandBoost: 0.24, cost: 25000000, audience: "Khách hàng doanh nghiệp" }); result = "Đã đầu tư chăm sóc khách hàng lớn.";
    } else if (option.kind === "stock") {
      if (company.cash < 18000000) return { ok: false, message: "Tiền công ty không đủ để dự trữ." };
      company.cash -= 18000000; company.inventory.stock += 1800; company.inventory.value = (Number(company.inventory.value) || 0) + 18000000; transactionAmount = -18000000; result = "Đã dự trữ nguồn hàng, giảm rủi ro thiếu nguyên liệu.";
    } else if (option.kind === "accept") {
      company.products.forEach(function (product) { product.unitCost = Math.round(product.unitCost * 1.08); });
      company.reputation = clamp(company.reputation - 2, 0, 100); result = "Chi phí sản xuất tăng 8%, uy tín giảm nhẹ.";
    } else {
      result = "Đã từ chối cơ hội và giữ nguyên tiền mặt.";
    }
    state.companyEventHistory.unshift({ day: event.day, companyId: company.id, title: event.title, choice: option.label, result: result });
    state.companyEventHistory = state.companyEventHistory.slice(0, 30);
    state.pendingBusinessEvent = null;
    if (transactionAmount) groupTransaction(state, "business-event", company.id, transactionAmount, option.label);
    commit(state, true); return { ok: true, message: result };
  }
  function getCompanySummary(state) {
    state = state || gameState(); ensureState(state);
    var companies = getCompanies(state);
    return {
      companies: companies,
      cash: companies.reduce(function (sum, company) { return sum + company.cash; }, 0),
      revenue: companies.reduce(function (sum, company) { return sum + company.revenue; }, 0),
      costs: companies.reduce(function (sum, company) { return sum + company.costs; }, 0),
      profit: companies.reduce(function (sum, company) { return sum + company.profit; }, 0),
      branches: companies.reduce(function (sum, company) { return sum + company.branches.filter(function (branch) { return branch.status === "Đang hoạt động"; }).length; }, 0),
      employees: companies.reduce(function (sum, company) { return sum + company.seedStaff + getCompanyEmployees(company.id, state).length; }, 0),
      products: companies.reduce(function (sum, company) { return sum + company.products.filter(function (product) { return product.active; }).length; }, 0),
      assets: companies.reduce(function (sum, company) {
        var fixedAssets = company.assets.reduce(function (assets, asset) { return assets + (Number(asset.value) || 0); }, 0);
        var branchAssets = company.branches.reduce(function (assets, branch) { return assets + (branch.status === "Đang hoạt động" ? Number(branch.value) || 0 : 0); }, 0);
        return sum + fixedAssets + branchAssets + (Number(company.inventory.value) || 0);
      }, 0) + (state.projects || []).reduce(function (sum, project) { return sum + (project.status === "Đang xây" || project.status === "Đang hoạt động" ? Number(project.cost) || 0 : 0); }, 0),
      debt: companies.reduce(function (sum, company) { return sum + Math.max(0, Number(company.debt) || 0); }, 0),
      cashFlow: companies.reduce(function (sum, company) { return sum + (company.lastDay && company.lastDay.cashFlow ? (Number(company.lastDay.cashFlow.inflow) || 0) - (Number(company.lastDay.cashFlow.outflow) || 0) - (Number(company.lastDay.cashFlow.debtRepayment) || 0) - (Number(company.lastDay.cashFlow.transferredToGroup) || 0) : 0); }, 0),
      marketShare: companies.length ? companies.reduce(function (sum, company) { return sum + (Number(company.marketShare) || 0); }, 0) / companies.length : 0
    };
  }
  function getManagerTabs() {
    return [
      { id: "overview", label: "Tổng quan" }, { id: "finance", label: "Tài chính" },
      { id: "branches", label: "Chi nhánh" }, { id: "products", label: "Sản phẩm" },
      { id: "staff", label: "Nhân sự" }, { id: "marketing", label: "Marketing" },
      { id: "operations", label: "Kho / Vận hành" }, { id: "expansion", label: "Mở rộng" }
    ];
  }
  function getCompanyAssetValue(company, state) {
    if (!company) return 0;
    var fixed = company.assets.reduce(function (sum, asset) { return sum + (Number(asset.value) || 0); }, 0);
    var branches = company.branches.reduce(function (sum, branch) { return sum + (branch.status === "Đang hoạt động" ? Number(branch.value) || 0 : 0); }, 0);
    var inventory = Number(company.inventory && company.inventory.value) || 0;
    var projects = ((state || gameState()).projects || []).filter(function (project) {
      return project.companyId === company.id && (project.status === "Đang xây" || project.status === "Đang hoạt động");
    }).reduce(function (sum, project) { return sum + (Number(project.cost) || 0); }, 0);
    return fixed + branches + inventory + projects;
  }
  function getCampaignDefinitions() { return CAMPAIGNS.slice(); }
  function getCompetitors(state) { state = state || gameState(); ensureState(state); return state.competitorState; }
  function getMarkets(state) { state = state || gameState(); ensureState(state); return state.marketConditions; }
  function api() {
    ensureState(gameState());
    return {
      ensureState: ensureState, getCompanyById: getCompanyById, getCompanies: getCompanies,
      getCompanyEmployees: getCompanyEmployees, hydrateEmployee: hydrateEmployee,
      assignHiredEmployee: assignHiredEmployee, moveEmployee: moveEmployee,
      calculateCompanyRevenue: calculateCompanyRevenue, calculateCompanyCosts: calculateCompanyCosts,
      closeAllCompanies: closeAllCompanies, getCompanySummary: getCompanySummary,
      getCompanyAssetValue: getCompanyAssetValue,
      openBranch: openBranch, upgradeBranch: upgradeBranch, closeBranch: closeBranch,
      updateProduct: updateProduct, createProduct: createProduct, runMarketing: runMarketing,
      buyInventory: buyInventory, transferCash: transferCash, adjustSalary: adjustSalary,
      buyMarketAsset: buyMarketAsset, companyForProject: companyForProject, assignProject: assignProject,
      startProject: startProject,
      resolveBusinessEvent: resolveBusinessEvent, getManagerTabs: getManagerTabs,
      getCampaignDefinitions: getCampaignDefinitions, getCompetitors: getCompetitors,
      getMarkets: getMarkets, defaultCompanyForCandidate: defaultCompanyForCandidate
    };
  }
  window.APXCompanies = api();
  var activeState = gameState();
  if (activeState) {
    ensureState(activeState);
    commit(activeState, true);
    if (window.APXGame && typeof window.APXGame.startRealtimeClock === "function") window.APXGame.startRealtimeClock();
  }
})();
