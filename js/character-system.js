/* =========================================================
   APX BUSINESS WORLD — HỆ THỐNG GAMEPLAY NHÂN VẬT
   Dữ liệu nhân vật được lưu trong save hiện tại, không tạo
   một kho localStorage song song.
   ========================================================= */
(function () {
  "use strict";

  var SAVE_KEY = "apx-business-world-save-v1";
  var SKILL_DEFINITIONS = [
    { id: "business", name: "Kinh doanh", shortName: "KD", description: "Tăng doanh thu từ công ty và dự án." },
    { id: "negotiation", name: "Đàm phán", shortName: "ĐP", description: "Giảm giá mua và cải thiện giá bán tài sản." },
    { id: "leadership", name: "Lãnh đạo", shortName: "LĐ", description: "Tăng giới hạn tuyển dụng và giảm chi phí đội ngũ." },
    { id: "finance", name: "Tài chính", shortName: "TC", description: "Giảm chi phí vận hành và quản lý dòng tiền." },
    { id: "marketing", name: "Marketing", shortName: "MK", description: "Tăng nhu cầu và doanh thu kinh doanh." },
    { id: "analysis", name: "Phân tích", shortName: "PT", description: "Cải thiện tăng trưởng giá trị và độ chính xác định giá." }
  ];

  var ACHIEVEMENT_DEFINITIONS = [
    { id: "founder", title: "Người sáng lập", description: "Bắt đầu hành trình APX.", target: 1, reward: 0, mark: "01", progress: function () { return 1; } },
    { id: "first-day", title: "Ngày vận hành đầu tiên", description: "Khóa sổ ngày kinh doanh đầu tiên.", target: 1, reward: 100, mark: "02", progress: function (s) { return Math.min(1, s.closedDays || 0); } },
    { id: "first-hire", title: "Mở rộng đội ngũ", description: "Tuyển thêm một nhân viên.", target: 1, reward: 150, mark: "03", progress: function (s) { return s.hired.length; } },
    { id: "team-builder", title: "Đội ngũ vững vàng", description: "Tuyển thêm ba nhân viên.", target: 3, reward: 300, mark: "04", progress: function (s) { return s.hired.length; } },
    { id: "first-project", title: "Đặt viên gạch đầu tiên", description: "Khởi công một dự án của APX.", target: 1, reward: 200, mark: "05", progress: function (s) { return s.projects.length; } },
    { id: "city-builder", title: "Người kiến tạo đô thị", description: "Đưa công trình đầu tiên vào hoạt động.", target: 1, reward: 350, mark: "06", progress: function (s) { return s.projects.filter(function (p) { return p.status === "Đang hoạt động"; }).length; } },
    { id: "five-days", title: "Nhịp vận hành", description: "Khóa sổ năm ngày trong game.", target: 5, reward: 300, mark: "07", progress: function (s) { return s.closedDays || 0; } },
    { id: "first-property", title: "Chủ sở hữu đầu tiên", description: "Mua bất động sản cá nhân đầu tiên.", target: 1, reward: 250, mark: "08", progress: function (s) { return s.character.transactions.filter(function (t) { return t.type === "buy-property"; }).length; } },
    { id: "first-sale", title: "Giao dịch đầu tiên", description: "Bán một tài sản cá nhân.", target: 1, reward: 200, mark: "09", progress: function (s) { return s.character.transactions.filter(function (t) { return t.type === "sell-property"; }).length; } },
    { id: "style-collector", title: "Dấu ấn cá nhân", description: "Mua một skin nhân vật có trả phí.", target: 1, reward: 100, mark: "10", progress: function (s) { return s.character.transactions.filter(function (t) { return t.type === "buy-skin"; }).length; } }
  ];

  function stateNow() {
    return window.APXGame && window.APXGame.state;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function roundMoney(value) {
    return Math.round(Number(value) || 0);
  }

  function xpForNextLevel(level) {
    return 800 + Math.max(1, Number(level) || 1) * 200;
  }

  function skillXPForNextLevel(level) {
    return 80 + Math.max(1, Number(level) || 1) * 6;
  }

  function addTransaction(character, transaction) {
    character.transactions.unshift(Object.assign({ day: (stateNow() || {}).day || 1, at: new Date().toISOString() }, transaction));
    character.transactions = character.transactions.slice(0, 60);
  }

  function ensureState(state) {
    if (!state) return null;
    var player = window.APX_DATA.player || {};
    if (!Array.isArray(state.hired)) state.hired = [];
    if (!Array.isArray(state.buildings)) state.buildings = [];
    if (!Array.isArray(state.projects)) state.projects = [];
    if (!Array.isArray(state.ledger)) state.ledger = [];
    if (!state.inventory || typeof state.inventory !== "object") state.inventory = {};
    if (typeof state.cash !== "number") state.cash = 0;
    if (typeof state.day !== "number") state.day = 1;
    if (typeof state.closedDays !== "number") state.closedDays = Math.max(0, state.day - 1);

    var character = state.character && typeof state.character === "object" ? state.character : {};
    var previousLevel = character.level && typeof character.level === "object" ? character.level : {};
    if (typeof character.level === "number") previousLevel = { current: character.level };
    var previousReputation = character.reputation && typeof character.reputation === "object" ? character.reputation : {};
    if (typeof character.reputation === "number") previousReputation = { score: character.reputation };

    var savedProfile = character.profile && typeof character.profile === "object" ? character.profile : {};
    var profileWasCustomized = savedProfile.customized === true ||
      (!!savedProfile.name && savedProfile.name !== (player.name || "Minh Anh"));
    character.profile = Object.assign({
      name: player.name || "Minh Anh",
      initials: player.initials || "MA",
      title: player.title || "Nhà sáng lập APX Group",
      bio: player.bio || "",
      age: player.age || 0,
      location: player.location || "",
      socialRank: player.socialRank || "Doanh nhân trẻ",
      customized: profileWasCustomized,
      editing: false,
      startedAt: new Date().toISOString()
    }, savedProfile);

    character.level = Object.assign({
      current: Number(player.level) || 1,
      xp: Number(player.experience) || 0,
      xpToNext: Number(player.nextLevelExperience) || xpForNextLevel(player.level || 1),
      totalXP: Number(player.experience) || 0
    }, previousLevel);
    character.level.current = Math.max(1, Math.floor(Number(character.level.current) || 1));
    character.level.xp = Math.max(0, Number(character.level.xp) || 0);
    character.level.xpToNext = Math.max(1, Number(character.level.xpToNext) || xpForNextLevel(character.level.current));
    character.level.totalXP = Math.max(Number(character.level.xp), Number(character.level.totalXP) || 0);

    character.reputation = Object.assign({ score: Number(player.reputation) || 0, history: [] }, previousReputation);
    character.reputation.score = clamp(character.reputation.score, 0, 100);
    if (!Array.isArray(character.reputation.history)) character.reputation.history = [];

    var oldSkills = character.skills && typeof character.skills === "object" ? character.skills : {};
    var legacyValues = { business: 72, negotiation: 58, leadership: 64, finance: 51, marketing: 78, analysis: 35 };
    if (oldSkills.communication != null && oldSkills.marketing == null) legacyValues.marketing = Number(oldSkills.communication) || 0;
    if (oldSkills.law != null && oldSkills.analysis == null) legacyValues.analysis = Number(oldSkills.law) || 0;
    character.skills = character.skills && typeof character.skills === "object" ? character.skills : {};
    SKILL_DEFINITIONS.forEach(function (definition) {
      var old = oldSkills[definition.id];
      if (typeof old === "number") old = { level: old };
      old = old && typeof old === "object" ? old : {};
      character.skills[definition.id] = Object.assign({ level: legacyValues[definition.id], xp: 0, xpToNext: skillXPForNextLevel(legacyValues[definition.id]), totalXP: 0 }, old);
      character.skills[definition.id].level = clamp(Math.floor(Number(character.skills[definition.id].level) || 0), 0, 100);
      character.skills[definition.id].xp = Math.max(0, Number(character.skills[definition.id].xp) || 0);
      character.skills[definition.id].xpToNext = Math.max(1, Number(character.skills[definition.id].xpToNext) || skillXPForNextLevel(character.skills[definition.id].level));
      character.skills[definition.id].totalXP = Math.max(0, Number(character.skills[definition.id].totalXP) || 0);
    });

    if (!Array.isArray(character.assets)) character.assets = [];
    if (!character.propertyRecords || typeof character.propertyRecords !== "object") character.propertyRecords = {};
    if (!character.achievements || typeof character.achievements !== "object" || Array.isArray(character.achievements)) character.achievements = {};
    if (!Array.isArray(character.transactions)) character.transactions = [];
    character.debt = Math.max(0, Number(character.debt) || 0);
    character.migration = character.migration && typeof character.migration === "object" ? character.migration : {};

    var legacyWardrobe = state.wardrobe && typeof state.wardrobe === "object" ? state.wardrobe : {};
    character.wardrobe = Object.assign({}, legacyWardrobe, character.wardrobe || {});
    if (!character.wardrobe.skinId) character.wardrobe.skinId = "skin-base-dark";
    if (!character.wardrobe.tab) character.wardrobe.tab = "closet";
    if (typeof character.wardrobe.search !== "string") character.wardrobe.search = "";
    // Giữ khóa cũ để wardrobe.js và các bản save trước tiếp tục hoạt động.
    state.wardrobe = character.wardrobe;

    // Chuyển phần tài sản ròng cũ chưa được phân loại thành vốn sở hữu APX.
    // Chỉ chạy một lần và giữ nguyên tổng giá trị đã lưu trước đây.
    if (!character.migration.legacyEquityImported) {
      var oldNetworth = Number(state.networth) || 0;
      var existingLegacyEquity = character.assets.some(function (asset) { return asset.id === "legacy-apx-equity"; });
      if (oldNetworth > Number(state.cash) && !existingLegacyEquity) {
        var equity = oldNetworth - Number(state.cash) - sumAssetValues(character.assets);
        if (equity > 0) {
          character.assets.push({
            id: "legacy-apx-equity",
            name: "Cổ phần APX Group",
            type: "Đầu tư doanh nghiệp",
            location: "Hệ sinh thái APX",
            purchasePrice: equity,
            currentValue: equity,
            monthlyIncome: 0,
            monthlyMaintenance: 0,
            purchasedDay: state.day,
            status: "Đang nắm giữ",
            history: [{ day: state.day, value: equity }],
            legacy: true
          });
        }
      }
      character.migration.legacyEquityImported = true;
    }

    // Đây là vốn được chuyển từ save cũ, không phải giao dịch mua trong ngày 1.
    character.assets.forEach(function (asset) {
      if (asset.id === "legacy-apx-equity") asset.legacy = true;
    });

    state.character = character;
    recalculateNetWorth(state);
    return character;
  }

  function sumAssetValues(assets) {
    return (assets || []).reduce(function (sum, asset) {
      return sum + Math.max(0, Number(asset.currentValue) || 0);
    }, 0);
  }

  function cityProperties(state) {
    var character = state.character;
    return (state.buildings || []).map(function (id) {
      var building = window.APX_DATA.buildings.find(function (entry) { return entry.id === id; });
      if (!building || building.owned) return null;
      var record = character.propertyRecords[id] || {};
      var purchaseDayKnown = Number.isFinite(Number(record.purchasedDay)) && Number(record.purchasedDay) > 0;
      return {
        id: "property-" + id,
        buildingId: id,
        name: building.name,
        type: "Bất động sản cá nhân",
        location: building.district,
        purchasePrice: Number(record.purchasePrice) || Number(building.value) || 0,
        currentValue: Math.max(0, Number(record.currentValue) || Number(building.value) || 0),
        monthlyIncome: Number(record.monthlyIncome != null ? record.monthlyIncome : building.monthlyIncome) || 0,
        monthlyMaintenance: Number(record.monthlyMaintenance != null ? record.monthlyMaintenance : building.monthlyMaintenance) || 0,
        purchasedDay: purchaseDayKnown ? Number(record.purchasedDay) : null,
        acquisitionUnknown: !purchaseDayKnown,
        status: record.status || "Đang sở hữu",
        history: Array.isArray(record.history) ? record.history : []
      };
    }).filter(Boolean);
  }

  function allAssets(state) {
    return state.character.assets.concat(cityProperties(state));
  }

  function recalculateNetWorth(state) {
    if (!state || !state.character) return 0;
    var assetsValue = allAssets(state).reduce(function (sum, asset) {
      return sum + Math.max(0, Number(asset.currentValue) || 0);
    }, 0);
    var netWorth = Math.max(0, Number(state.cash) || 0) + assetsValue - (Number(state.character.debt) || 0);
    state.networth = Math.round(netWorth);
    return state.networth;
  }

  function commit(state, renderNow) {
    recalculateNetWorth(state);
    if (window.APXGame && typeof window.APXGame.save === "function") window.APXGame.save();
    if (renderNow && window.APXGame && typeof window.APXGame.render === "function") window.APXGame.render();
  }

  function notify(message) {
    if (window.APXGame && typeof window.APXGame.toast === "function") window.APXGame.toast(message);
  }

  function addXPInternal(state, amount, reason) {
    var level = state.character.level;
    var gained = Math.max(0, Math.floor(Number(amount) || 0));
    if (!gained) return { gained: 0, levels: 0 };
    level.xp += gained;
    level.totalXP += gained;
    var levels = 0;
    while (level.xp >= level.xpToNext) {
      level.xp -= level.xpToNext;
      level.current += 1;
      level.xpToNext = xpForNextLevel(level.current);
      levels += 1;
    }
    if (reason) state.character.lastXPReason = { text: String(reason), day: state.day, amount: gained };
    if (levels) notify("Lên cấp " + level.current + "! Giới hạn đội ngũ và hiệu quả kinh doanh đã tăng.");
    return { gained: gained, levels: levels };
  }

  function changeReputationInternal(state, delta, reason) {
    var reputation = state.character.reputation;
    var before = Number(reputation.score) || 0;
    var after = Math.round(clamp(before + (Number(delta) || 0), 0, 100) * 10) / 10;
    var actual = Math.round((after - before) * 10) / 10;
    if (!actual) return 0;
    reputation.score = after;
    reputation.history.unshift({ day: state.day, delta: actual, score: after, reason: String(reason || "Hoạt động kinh doanh") });
    reputation.history = reputation.history.slice(0, 15);
    return actual;
  }

  function increaseSkillInternal(state, skillId, amount) {
    var skill = state.character.skills[skillId];
    if (!skill || skill.level >= 100) return { gained: 0, levels: 0 };
    var gained = Math.max(0, Math.floor(Number(amount) || 0));
    skill.xp += gained;
    skill.totalXP += gained;
    var levels = 0;
    while (skill.xp >= skill.xpToNext && skill.level < 100) {
      skill.xp -= skill.xpToNext;
      skill.level += 1;
      skill.xpToNext = skillXPForNextLevel(skill.level);
      levels += 1;
    }
    if (skill.level >= 100) skill.xp = 0;
    if (levels) notify("Kỹ năng " + skillName(skillId) + " tăng lên cấp " + skill.level + ".");
    return { gained: gained, levels: levels };
  }

  function skillName(skillId) {
    var entry = SKILL_DEFINITIONS.find(function (skill) { return skill.id === skillId; });
    return entry ? entry.name : skillId;
  }

  function checkAchievementsInternal(state, silent) {
    var unlockedNow = [];
    ACHIEVEMENT_DEFINITIONS.forEach(function (definition) {
      var progress = Math.min(definition.target, Math.max(0, Number(definition.progress(state)) || 0));
      var record = state.character.achievements[definition.id];
      if (!record || typeof record !== "object") record = state.character.achievements[definition.id] = {};
      record.progress = record.completed ? definition.target : progress;
      record.target = definition.target;
      record.completed = !!record.completed;
      if (progress >= definition.target && !record.completed) {
        record.completed = true;
        record.unlockedAtDay = state.day;
        record.unlockedAt = new Date().toISOString();
        if (!record.rewardGranted) {
          record.rewardGranted = true;
          record.reward = definition.reward;
          if (definition.reward > 0) addXPInternal(state, definition.reward, "Thành tựu: " + definition.title);
        }
        unlockedNow.push(definition);
        if (!silent) notify("Thành tựu mới: " + definition.title + (definition.reward ? " · +" + definition.reward + " XP" : ""));
      }
    });
    return unlockedNow;
  }

  function skillEffect(skillId, state) {
    state = state || stateNow();
    if (!state) return {};
    var level = clamp(state.character.skills[skillId] ? state.character.skills[skillId].level : 0, 0, 100);
    var rep = clamp(state.character.reputation.score, 0, 100);
    if (skillId === "business") return { revenueMultiplier: 1 + level * 0.001, summary: "Doanh thu công ty +" + (level / 10).toFixed(1) + "%" };
    if (skillId === "negotiation") return { purchaseDiscount: Math.min(0.12, level * 0.001), salePremium: Math.min(0.05, level * 0.00025), summary: "Giảm " + (level / 10).toFixed(1) + "% khi mua tài sản" };
    if (skillId === "leadership") return { payrollMultiplier: 1 - level * 0.0005, employeeLimit: Math.max(1, Math.floor(4 + state.character.level.current * 0.4 + level * 0.15)), summary: "Tối đa " + Math.floor(4 + state.character.level.current * 0.4 + level * 0.15) + " nhân viên tuyển thêm" };
    if (skillId === "finance") return { operatingCostMultiplier: 1 - level * 0.0012, summary: "Giảm " + (level * 0.12).toFixed(1) + "% chi phí vận hành" };
    if (skillId === "marketing") return { revenueMultiplier: 1 + level * 0.0012, summary: "Doanh thu +" + (level * 0.12).toFixed(1) + "%" };
    if (skillId === "analysis") return { appreciationDailyRate: 0.00004 + level * 0.0000005, marketAccuracy: Math.round(45 + level * 0.55), summary: "Định giá thị trường chính xác khoảng " + Math.round(45 + level * 0.55) + "%" };
    return { reputationBonus: rep };
  }

  function metrics(state) {
    state = state || stateNow();
    if (!state) return {};
    var assets = allAssets(state);
    var assetValue = assets.reduce(function (sum, asset) { return sum + (Number(asset.currentValue) || 0); }, 0);
    var companies = window.APX_DATA.companies || [];
    var employeeCount = companies.reduce(function (sum, company) { return sum + (Number(company.staff) || 0); }, 0) + state.hired.length;
    return {
      cash: Number(state.cash) || 0,
      assetValue: Math.round(assetValue),
      debt: Number(state.character.debt) || 0,
      netWorth: recalculateNetWorth(state),
      companyCount: companies.length,
      employeeCount: employeeCount,
      propertyCount: cityProperties(state).length,
      daysPlayed: Math.max(Number(state.closedDays) || 0, Number(state.day) - 1),
      assets: assets
    };
  }

  function purchaseCityProperty(buildingId) {
    var state = stateNow();
    if (!state) return { ok: false, message: "Trạng thái game chưa sẵn sàng." };
    ensureState(state);
    var building = window.APX_DATA.buildings.find(function (item) { return item.id === buildingId; });
    if (!building || building.owned || building.status !== "Mở bán") return { ok: false, message: "Bất động sản này không còn mở bán." };
    if (state.buildings.indexOf(buildingId) >= 0) return { ok: false, message: "Bạn đã sở hữu bất động sản này." };
    var discount = skillEffect("negotiation", state).purchaseDiscount + state.character.reputation.score * 0.0002;
    discount = clamp(discount, 0, 0.2);
    var price = roundMoney((Number(building.value) || 0) * (1 - discount));
    if ((Number(state.cash) || 0) < price) return { ok: false, message: "Bạn cần " + window.APXUI.money(price) + " sau ưu đãi để mua tài sản này." };

    state.cash -= price;
    state.buildings.push(buildingId);
    state.character.propertyRecords[buildingId] = {
      purchasePrice: price,
      currentValue: Number(building.value) || price,
      monthlyIncome: Number(building.monthlyIncome) || 0,
      monthlyMaintenance: Number(building.monthlyMaintenance) || 0,
      purchasedDay: state.day,
      status: "Đang sở hữu",
      history: [{ day: state.day, value: Number(building.value) || price }]
    };
    addTransaction(state.character, { type: "buy-property", assetId: buildingId, name: building.name, amount: price });
    addXPInternal(state, 120, "Mua bất động sản");
    increaseSkillInternal(state, "negotiation", 35);
    increaseSkillInternal(state, "finance", 15);
    changeReputationInternal(state, 0.4, "Đầu tư bất động sản");
    checkAchievementsInternal(state, false);
    commit(state, true);
    return { ok: true, message: "Đã mua " + building.name + " với giá " + window.APXUI.money(price) + "." };
  }

  function sellCityProperty(buildingId) {
    var state = stateNow();
    if (!state) return { ok: false, message: "Trạng thái game chưa sẵn sàng." };
    ensureState(state);
    var index = state.buildings.indexOf(buildingId);
    var building = window.APX_DATA.buildings.find(function (item) { return item.id === buildingId; });
    if (index < 0 || !building || building.owned) return { ok: false, message: "Không tìm thấy tài sản cá nhân để bán." };
    var record = state.character.propertyRecords[buildingId] || {};
    var marketValue = Number(record.currentValue) || Number(building.value) || 0;
    var premium = skillEffect("negotiation", state).salePremium;
    var proceeds = roundMoney(marketValue * (1 + premium));
    state.cash = (Number(state.cash) || 0) + proceeds;
    state.buildings.splice(index, 1);
    delete state.character.propertyRecords[buildingId];
    addTransaction(state.character, { type: "sell-property", assetId: buildingId, name: building.name, amount: proceeds });
    addXPInternal(state, 90, "Bán tài sản");
    increaseSkillInternal(state, "negotiation", 25);
    increaseSkillInternal(state, "finance", 10);
    changeReputationInternal(state, 0.2, "Hoàn tất giao dịch tài sản");
    checkAchievementsInternal(state, false);
    commit(state, true);
    return { ok: true, message: "Đã bán " + building.name + " và nhận " + window.APXUI.money(proceeds) + "." };
  }

  function trainSkill(skillId) {
    var state = stateNow();
    if (!state) return { ok: false, message: "Trạng thái game chưa sẵn sàng." };
    ensureState(state);
    var skill = state.character.skills[skillId];
    if (!skill) return { ok: false, message: "Không tìm thấy kỹ năng." };
    if (skill.level >= 100) return { ok: false, message: "Kỹ năng đã đạt cấp tối đa." };
    var price = 3000000 + skill.level * 100000;
    if ((Number(state.cash) || 0) < price) return { ok: false, message: "Không đủ tiền cho buổi đào tạo " + window.APXUI.money(price) + "." };
    state.cash -= price;
    var result = increaseSkillInternal(state, skillId, 55);
    addXPInternal(state, 12, "Đào tạo kỹ năng " + skillName(skillId));
    addTransaction(state.character, { type: "skill-training", assetId: skillId, name: skillName(skillId), amount: price, xp: 55 });
    commit(state, true);
    return { ok: true, message: "Đã đào tạo " + skillName(skillId) + (result.levels ? " · kỹ năng tăng cấp " + skill.level : " · tiến trình " + skill.xp + "/" + skill.xpToNext) + "." };
  }

  function updateOwnedPropertiesForDay(state) {
    var totalNetIncome = 0;
    var analysisEffect = skillEffect("analysis", state);
    state.buildings.forEach(function (buildingId) {
      var building = window.APX_DATA.buildings.find(function (item) { return item.id === buildingId; });
      if (!building || building.owned) return;
      var record = state.character.propertyRecords[buildingId];
      if (!record) return;
      record.currentValue = roundMoney((Number(record.currentValue) || Number(building.value) || 0) * (1 + analysisEffect.appreciationDailyRate));
      record.history = Array.isArray(record.history) ? record.history : [];
      record.history.push({ day: state.day, value: record.currentValue });
      record.history = record.history.slice(-30);
      totalNetIncome += ((Number(record.monthlyIncome) || 0) - (Number(record.monthlyMaintenance) || 0)) / 30;
    });
    var rentCashflow = roundMoney(totalNetIncome);
    if (rentCashflow >= 0) {
      state.cash += rentCashflow;
    } else {
      var payable = Math.min(Math.max(0, Number(state.cash) || 0), -rentCashflow);
      state.cash -= payable;
      state.character.debt += (-rentCashflow - payable);
    }
    return rentCashflow;
  }

  function addPersonalAsset(asset) {
    var state = stateNow();
    if (!state || !asset || typeof asset !== "object") return false;
    ensureState(state);
    var id = String(asset.id || "asset-" + Date.now());
    if (state.character.assets.some(function (item) { return item.id === id; })) return false;
    state.character.assets.push(Object.assign({
      id: id,
      name: "Tài sản cá nhân",
      type: "Khác",
      location: "",
      purchasePrice: 0,
      currentValue: 0,
      monthlyIncome: 0,
      monthlyMaintenance: 0,
      purchasedDay: state.day,
      status: "Đang sở hữu",
      history: [{ day: state.day, value: Number(asset.currentValue) || 0 }]
    }, asset, { id: id }));
    commit(state, true);
    return true;
  }

  function removePersonalAsset(assetId) {
    var state = stateNow();
    if (!state) return false;
    ensureState(state);
    var index = state.character.assets.findIndex(function (asset) { return asset.id === assetId; });
    if (index >= 0) {
      state.character.assets.splice(index, 1);
      commit(state, true);
      return true;
    }
    if (String(assetId).indexOf("property-") === 0) {
      var buildingId = String(assetId).slice("property-".length);
      var buildingIndex = state.buildings.indexOf(buildingId);
      if (buildingIndex >= 0) {
        state.buildings.splice(buildingIndex, 1);
        delete state.character.propertyRecords[buildingId];
        commit(state, true);
        return true;
      }
    }
    return false;
  }

  function buySkin(skinId) {
    var state = stateNow();
    var wardrobe = window.APXWardrobe;
    var skin = wardrobe && wardrobe.findSkin(skinId);
    if (!state || !skin) return { ok: false, message: "Không tìm thấy skin." };
    ensureState(state);
    if (wardrobe.ownsSkin(state, skinId)) return { ok: false, message: "Skin này đã có trong bộ sưu tập." };
    if ((Number(state.cash) || 0) < skin.price) return { ok: false, message: "Bạn chưa đủ tiền để mua skin này." };
    state.cash -= skin.price;
    state.inventory[skinId] = 1;
    addTransaction(state.character, { type: "buy-skin", assetId: skinId, name: skin.name, amount: skin.price });
    addXPInternal(state, 25, "Mua skin");
    checkAchievementsInternal(state, false);
    commit(state, true);
    return { ok: true, message: "Đã mua skin \"" + skin.name + "\"." };
  }

  function equipSkin(skinId) {
    var state = stateNow();
    if (!state || !window.APXWardrobe || !window.APXWardrobe.findSkin(skinId)) return false;
    ensureState(state);
    if (!window.APXWardrobe.ownsSkin(state, skinId)) return false;
    state.character.wardrobe.skinId = skinId;
    state.wardrobe = state.character.wardrobe;
    commit(state, true);
    return true;
  }

  function getEmployeeLimit(state) {
    state = state || stateNow();
    if (!state) return 0;
    ensureState(state);
    var nominal = skillEffect("leadership", state).employeeLimit;
    return Math.max(nominal, state.hired.length);
  }

  function apiAddXP(amount, reason) {
    var state = stateNow(); if (!state) return { gained: 0, levels: 0 };
    ensureState(state); var result = addXPInternal(state, amount, reason); commit(state, true); return result;
  }
  function apiChangeRep(delta, reason) {
    var state = stateNow(); if (!state) return 0;
    ensureState(state); var result = changeReputationInternal(state, delta, reason); commit(state, true); return result;
  }
  function apiIncreaseSkill(skillId, amount) {
    var state = stateNow(); if (!state) return { gained: 0, levels: 0 };
    ensureState(state); var result = increaseSkillInternal(state, skillId, amount); commit(state, true); return result;
  }
  function apiUnlockAchievement(id) {
    var state = stateNow(); if (!state) return false;
    ensureState(state);
    var definition = ACHIEVEMENT_DEFINITIONS.find(function (entry) { return entry.id === id; });
    if (!definition) return false;
    var record = state.character.achievements[id] || (state.character.achievements[id] = {});
    if (record.completed) return false;
    record.progress = definition.target;
    record.target = definition.target;
    record.completed = true;
    record.unlockedAtDay = state.day;
    record.unlockedAt = new Date().toISOString();
    if (!record.rewardGranted) {
      record.rewardGranted = true;
      record.reward = definition.reward;
      if (definition.reward > 0) addXPInternal(state, definition.reward, "Thành tựu: " + definition.title);
    }
    notify("Thành tựu mới: " + definition.title + (definition.reward ? " · +" + definition.reward + " XP" : ""));
    commit(state, true);
    return true;
  }

  function onDayClosed(state, dailyRetainedProfit, dailyProfit) {
    ensureState(state);
    var equity = state.character.assets.find(function (asset) { return asset.id === "legacy-apx-equity"; });
    if (equity) equity.currentValue = Math.max(0, roundMoney((Number(equity.currentValue) || 0) + (Number(dailyRetainedProfit) || 0)));
    updateOwnedPropertiesForDay(state);
    var score = Number(dailyProfit) || 0;
    changeReputationInternal(state, score >= 0 ? 0.1 : -0.25, score >= 0 ? "Ngày kinh doanh có lãi" : "Ngày kinh doanh thua lỗ");
    addXPInternal(state, 10 + Math.min(15, Math.floor(Math.max(0, score) / 10000000)), "Khóa sổ ngày");
    increaseSkillInternal(state, "business", 8);
    increaseSkillInternal(state, "finance", 10);
    increaseSkillInternal(state, "marketing", 5);
    checkAchievementsInternal(state, false);
  }

  function onProjectStarted(state) {
    ensureState(state);
    addXPInternal(state, 60, "Khởi công dự án");
    increaseSkillInternal(state, "business", 12);
    increaseSkillInternal(state, "analysis", 8);
    checkAchievementsInternal(state, false);
  }

  function onProjectsCompleted(state, count) {
    ensureState(state);
    var amount = Math.max(0, Number(count) || 0);
    if (!amount) return;
    addXPInternal(state, 180 * amount, "Hoàn thành dự án");
    changeReputationInternal(state, Math.min(3, amount * 1.2), "Hoàn thành dự án");
    increaseSkillInternal(state, "business", 30 * amount);
    increaseSkillInternal(state, "analysis", 20 * amount);
    checkAchievementsInternal(state, false);
  }

  function onHire(state, candidate) {
    ensureState(state);
    addXPInternal(state, 80, "Tuyển dụng " + candidate.name);
    changeReputationInternal(state, 0.2, "Mở rộng đội ngũ");
    increaseSkillInternal(state, "leadership", 30);
    checkAchievementsInternal(state, false);
  }

  ensureState(stateNow());
  window.APXCharacter = {
    skillDefinitions: SKILL_DEFINITIONS,
    achievementDefinitions: ACHIEVEMENT_DEFINITIONS,
    prepareState: ensureState,
    getSkill: function (skillId) { var s = stateNow(); if (!s) return null; ensureState(s); return s.character.skills[skillId] || null; },
    getCharacterSkill: function (skillId) { var skill = this.getSkill(skillId); return skill ? skill.level : 0; },
    getCharacterSkillEffect: function (skillId) { var s = stateNow(); if (s) ensureState(s); return skillEffect(skillId, s); },
    getEmployeeLimit: getEmployeeLimit,
    getAssets: function () { var s = stateNow(); if (!s) return []; ensureState(s); return allAssets(s); },
    getMetrics: metrics,
    getNetWorth: function () { var s = stateNow(); return s ? (ensureState(s), recalculateNetWorth(s)) : 0; },
    addCharacterXP: apiAddXP,
    changeReputation: apiChangeRep,
    increaseSkill: apiIncreaseSkill,
    addPersonalAsset: addPersonalAsset,
    removePersonalAsset: removePersonalAsset,
    unlockAchievement: apiUnlockAchievement,
    checkAchievements: function () { var s = stateNow(); if (!s) return []; ensureState(s); var r = checkAchievementsInternal(s, false); commit(s, true); return r; },
    purchaseCityProperty: purchaseCityProperty,
    sellCityProperty: sellCityProperty,
    trainSkill: trainSkill,
    buySkin: buySkin,
    equipSkin: equipSkin,
    getRevenueMultiplier: function (state) {
      state = state || stateNow(); if (!state) return 1; ensureState(state);
      return skillEffect("business", state).revenueMultiplier * skillEffect("marketing", state).revenueMultiplier * (1 + state.character.level.current * 0.002) * (1 + state.character.reputation.score * 0.0002);
    },
    getOperatingCostMultiplier: function (state) {
      state = state || stateNow(); if (!state) return 1; ensureState(state);
      return skillEffect("finance", state).operatingCostMultiplier * skillEffect("leadership", state).payrollMultiplier;
    },
    onDayClosed: onDayClosed,
    onProjectStarted: onProjectStarted,
    onProjectsCompleted: onProjectsCompleted,
    onHire: onHire,
    migrateAfterReset: function (state) { ensureState(state); checkAchievementsInternal(state, true); commit(state, false); }
  };

  var state = stateNow();
  if (state) {
    checkAchievementsInternal(state, true);
    commit(state, true);
  }
})();
