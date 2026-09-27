/* =========================================================
   APX BUSINESS WORLD — BỘ ĐIỀU KHIỂN CHÍNH
   Kết nối điều hướng, dữ liệu, các trang và thao tác game.
   ========================================================= */

(function () {
  var SAVE_KEY = "apx-business-world-save-v1";
  var realtimeClockStarted = false;

  // Một ngày trong game tương ứng một ngày lịch ngoài đời thực.
  function nextLocalMidnight(timestamp) {
    var date = new Date(timestamp == null ? Date.now() : timestamp);
    date.setHours(24, 0, 0, 0);
    return date.getTime();
  }

  /*
    Tạo bản sao mới từ trạng thái ban đầu.
    Nhờ vậy các lần chơi không dùng chung danh sách vật phẩm,
    dự án hoặc giao dịch.
  */
  function createFreshState() {
    return JSON.parse(JSON.stringify(window.APX_INITIAL_STATE));
  }

  /*
    Đọc dữ liệu đã lưu trong trình duyệt.
    Nếu chưa có hoặc dữ liệu bị lỗi, dùng trạng thái ban đầu.
  */
  function loadState() {
    var freshState = createFreshState();

    try {
      var savedText = localStorage.getItem(SAVE_KEY);

      if (!savedText) {
        return freshState;
      }

      var savedState = JSON.parse(savedText);

      if (!savedState || typeof savedState !== "object") {
        return freshState;
      }

      return Object.assign(freshState, savedState);
    } catch (error) {
      return freshState;
    }
  }

  var state = loadState();

  /*
    Bổ sung các trường cần thiết nếu có bản lưu từ phiên bản cũ.
  */
  function prepareState() {
    if (!state.route || typeof state.route !== "object") {
      state.route = {
        section: "character",
        page: "profile"
      };
    }

    if (!Array.isArray(state.hired)) state.hired = [];
    if (!Array.isArray(state.buildings)) state.buildings = [];
    if (!Array.isArray(state.projects)) state.projects = [];
    if (!Array.isArray(state.ledger)) state.ledger = [];

    if (!state.inventory || typeof state.inventory !== "object") {
      state.inventory = {};
    }

    if (typeof state.day !== "number") state.day = 1;
    if (typeof state.cash !== "number") state.cash = 3280000000;
    if (typeof state.treasury !== "number") state.treasury = 8240000000;
    if (typeof state.networth !== "number") state.networth = 246800000000;

    if (typeof state.buildChoice !== "string") {
      state.buildChoice = "coffee";
    }

    if (typeof state.itemSearch !== "string") state.itemSearch = "";
    if (typeof state.employeeSearch !== "string") state.employeeSearch = "";

    if (typeof state.closedDays !== "number") state.closedDays = 0;
    if (!Number.isFinite(Number(state.nextDayAt)) || Number(state.nextDayAt) <= 0) {
      state.nextDayAt = nextLocalMidnight(Date.now());
    }
    if (typeof state.totalRevenue !== "number") state.totalRevenue = 0;
    if (typeof state.totalCosts !== "number") state.totalCosts = 0;
    if (typeof state.totalProfit !== "number") state.totalProfit = 0;
  }

  prepareState();

  /*
    Escape nội dung trước khi chèn dữ liệu vào HTML.
    Các dữ liệu game hiện tại đều là dữ liệu cục bộ.
  */
  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      var replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };

      return replacements[char];
    });
  }

  /*
    Lưu trạng thái game và cập nhật số liệu trên thanh trên cùng.
  */
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    } catch (error) {
      // Game vẫn tiếp tục chạy nếu trình duyệt chặn lưu cục bộ.
    }

    updateTopbar();
    if (window.APXAccount && window.APXAccount.queueSave) {
      window.APXAccount.queueSave(state);
    }
  }

  function updateTopbar() {
    var cash = document.getElementById("cashValue");
    var treasury = document.getElementById("treasuryValue");
    var day = document.getElementById("dayValue");
    var countdown = document.getElementById("dayCountdown");
    var profile = state.character && state.character.profile;
    var playerName = profile && profile.customized ? profile.name : "Người chơi mới";
    var playerTitle = profile && profile.customized ? profile.title : "NGƯỜI CHƠI APX";
    var initials = profile && profile.customized ? profile.initials : "NV";

    if (cash) {
      cash.textContent = window.APXUI.money(state.cash);
    }

    if (treasury) {
      treasury.textContent = window.APXUI.money(state.treasury);
    }

    if (day) {
      day.textContent = state.day;
    }

    if (countdown) {
      var remaining = Math.max(0, Number(state.nextDayAt) - Date.now());
      var hours = Math.floor(remaining / 3600000);
      var minutes = Math.floor((remaining % 3600000) / 60000);
      var seconds = Math.floor((remaining % 60000) / 1000);
      countdown.textContent = "ĐỔI NGÀY SAU " +
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0");
    }

    Array.prototype.forEach.call(document.querySelectorAll(".page-owner, .player-copy strong, .current-player-copy strong"), function (element) {
      element.textContent = playerName;
    });
    Array.prototype.forEach.call(document.querySelectorAll(".player-copy small, .current-player-copy small"), function (element) {
      element.textContent = playerTitle.toLocaleUpperCase("vi-VN");
    });
    Array.prototype.forEach.call(document.querySelectorAll(".player-avatar, .current-player-avatar"), function (avatar) {
      if (avatar.querySelector("img")) {
        avatar.dataset.fallback = initials;
      } else {
        avatar.textContent = initials;
      }
    });
  }

  /*
    Hiển thị trang ứng với khu vực và trang con hiện tại.
  */
  function render() {
    var route = window.APXNav.normalize();
    var pageContent = document.getElementById("pageContent");

    if (!pageContent) {
      return;
    }

    window.APXNav.render();

    var renderer = window.APXPages[route.section];

    if (typeof renderer === "function") {
      pageContent.innerHTML = renderer(route.page, state);
    } else {
      pageContent.innerHTML =
        '<section class="panel">' +
          "<h1>Trang đang được chuẩn bị</h1>" +
          "<p>Nội dung của khu vực này chưa sẵn sàng.</p>" +
        "</section>";
    }

    updateTopbar();
  }

  /*
    Hiển thị thông báo ngắn.
    Dùng textContent để nội dung thông báo không bị hiểu thành HTML.
  */
  function toast(message, kind) {
    var root = document.getElementById("toastRoot");

    if (!root) {
      return;
    }

    var notice = document.createElement("div");
    notice.className = "toast" + (kind ? " " + kind : "");
    notice.setAttribute("role", "status");
    notice.textContent = message;

    root.appendChild(notice);

    window.setTimeout(function () {
      if (notice.parentNode) {
        notice.parentNode.removeChild(notice);
      }
    }, 3200);
  }

  /*
    Lấy tổng doanh thu tháng dự kiến từ công ty và dự án đang hoạt động.
  */
  function getMonthlyRevenue() {
    var companyRevenue = window.APX_DATA.companies.reduce(function (sum, company) {
      return sum + (Number(company.revenue) || 0);
    }, 0);

    var projectRevenue = state.projects
      .filter(function (project) {
        return project.status === "Đang hoạt động";
      })
      .reduce(function (sum, project) {
        return sum + (Number(project.monthlyRevenue) || 0);
      }, 0);

    return companyRevenue + projectRevenue;
  }

  /*
    Tính lương tháng của nhân viên do người chơi tuyển thêm.
  */
  function getExtraMonthlyPayroll() {
    return state.hired.reduce(function (sum, candidateId) {
      var candidate = window.APX_DATA.candidates.find(function (person) {
        return person.id === candidateId;
      });

      return sum + (candidate ? Number(candidate.salary) || 0 : 0);
    }, 0);
  }

  /*
    Đóng sổ một ngày:
    - Ghi doanh thu và chi phí vào sổ.
    - Cập nhật ngân quỹ và tiền cá nhân.
    - Giảm thời gian xây dựng của dự án.
    - Chuyển sang ngày tiếp theo.
  */
  function closeDay(silent) {
    var closedDay = state.day;
    var companyResult = window.APXCompanies
      ? window.APXCompanies.closeAllCompanies(state)
      : { revenue: 0, cost: 0, profit: 0, companies: [] };
    var character = window.APXCharacter;
    var dailyRevenue = Number(companyResult.revenue) || 0;
    var dailyCost = Number(companyResult.cost) || 0;
    var dailyProfit = Number(companyResult.profit) || 0;
    var dividend = Math.min(
      Math.max(0, Number(state.treasury) || 0),
      Math.max(0, Math.round(dailyProfit * 0.08))
    );

    state.treasury -= dividend;
    state.cash += dividend;

    state.totalRevenue += dailyRevenue;
    state.totalCosts += dailyCost;
    state.totalProfit += dailyProfit;
    state.closedDays += 1;

    state.ledger.unshift({
      day: closedDay,
      revenue: dailyRevenue,
      cost: dailyCost,
      profit: dailyProfit,
      dividend: dividend,
      companies: companyResult.companies || []
    });

    // Chỉ lưu tối đa 30 giao dịch gần nhất.
    state.ledger = state.ledger.slice(0, 30);

    var completedProjects = [];

    state.projects.forEach(function (project) {
      if (project.status !== "Đang xây") {
        return;
      }

      project.daysLeft = Math.max(0, (Number(project.daysLeft) || 1) - 1);

      if (project.daysLeft === 0) {
        project.status = "Đang hoạt động";
        completedProjects.push(project.name);
      }
    });

    if (character) {
      character.onProjectsCompleted(state, completedProjects.length);
      character.onDayClosed(state, dailyProfit - dividend, dailyProfit);
    }

    state.day += 1;
    state.nextDayAt = nextLocalMidnight(state.nextDayAt);
    save();
    if (silent) return completedProjects;
    render();

    if (completedProjects.length) {
      toast(
        completedProjects.join(", ") +
        " đã hoàn thành và bắt đầu tạo doanh thu từ ngày kế tiếp."
      );
      return;
    }

    toast(
      "Đã khóa sổ ngày " + closedDay +
      ". Doanh thu " + window.APXUI.money(dailyRevenue) +
      ", lợi nhuận " + window.APXUI.money(dailyProfit) +
      ", cổ tức cá nhân " + window.APXUI.money(dividend) + "."
    );
  }

  // Tự chốt những ngày đã trôi qua kể cả khi người chơi đóng trình duyệt.
  function processElapsedGameDays() {
    var completedDays = 0;

    // Đọc mốc mới nhất trước khi chốt để tránh hai tab cùng xử lý một ngày.
    try {
      var latestSave = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
      if (latestSave && Number(latestSave.nextDayAt) > Number(state.nextDayAt)) {
        state = Object.assign(state, latestSave);
      }
    } catch (error) {
      // Tiếp tục bằng dữ liệu đang chạy nếu không đọc được bản lưu.
    }

    while (Number(state.nextDayAt) <= Date.now()) {
      closeDay(true);
      completedDays += 1;
    }
    if (completedDays) {
      save();
      render();
      toast("Đã tự cập nhật " + completedDays + " ngày theo thời gian thực.");
    }
  }

  function startRealtimeClock() {
    if (realtimeClockStarted) return;
    realtimeClockStarted = true;
    processElapsedGameDays();
    save();
    updateTopbar();
    window.setInterval(function () {
      if (Number(state.nextDayAt) <= Date.now()) {
        processElapsedGameDays();
      } else {
        updateTopbar();
      }
    }, 1000);
  }

  /*
    Khởi công dự án đang được chọn.
  */
  function buildProject() {
    var project = window.APX_DATA.projects.find(function (item) {
      return item.id === state.buildChoice;
    });

    if (!project) {
      toast("Không tìm thấy dự án đã chọn.", "warning");
      return;
    }

    var projectStart = window.APXCompanies
      ? window.APXCompanies.startProject(project, state)
      : { ok: false, message: "Hệ thống công ty chưa sẵn sàng." };
    if (!projectStart.ok) {
      toast(projectStart.message, "warning");
      return;
    }

    if (window.APXCharacter) window.APXCharacter.onProjectStarted(state);

    save();
    render();

    toast(projectStart.message + " Dự án cần " + (project.daysToBuild || 5) + " ngày trong game.");
  }

  /*
    Tuyển ứng viên và thêm vào trạng thái đã tuyển.
  */
  function hireCandidate(candidateId) {
    var candidate = window.APX_DATA.candidates.find(function (person) {
      return person.id === candidateId;
    });

    if (!candidate) {
      toast("Không tìm thấy hồ sơ ứng viên.", "warning");
      return;
    }

    if (state.hired.includes(candidateId)) {
      toast(candidate.name + " đã được tuyển trước đó.");
      return;
    }

    if (window.APXCharacter && state.hired.length >= window.APXCharacter.getEmployeeLimit(state)) {
      toast("Bạn đã đạt giới hạn tuyển dụng hiện tại. Tăng cấp nhân vật hoặc kỹ năng Lãnh đạo để mở rộng đội ngũ.", "warning");
      return;
    }

    state.hired.push(candidateId);
    if (window.APXCompanies) {
      var destination = window.APXCompanies.defaultCompanyForCandidate(candidate);
      window.APXCompanies.assignHiredEmployee(state, candidate, destination);
    }
    if (window.APXCharacter) window.APXCharacter.onHire(state, candidate);
    save();
    render();

    toast(
      "Đã tuyển " + candidate.name +
      ". Lương sẽ được tính khi đóng sổ ngày."
    );
  }

  /*
    Xử lý nút mua thêm nguyên liệu trong túi đồ.
  */
  function useInventoryItem(itemId) {
    var item = window.APX_DATA.items.find(function (entry) {
      return entry.id === itemId;
    });

    if (!item) {
      toast("Không tìm thấy vật phẩm.", "warning");
      return;
    }

    if (item.type !== "Nguyên liệu" || item.price <= 0) {
      toast("Thao tác sử dụng vật phẩm này chưa được triển khai.");
      return;
    }

    if (state.cash < item.price) {
      toast(
        "Tiền cá nhân chưa đủ. Cần " +
        window.APXUI.money(item.price) + ".",
        "warning"
      );
      return;
    }

    state.cash -= item.price;
    state.inventory[item.id] = (Number(state.inventory[item.id]) || 0) + 1;

    if (window.APXCharacter) window.APXCharacter.addCharacterXP(5, "Mua nguyên liệu");

    save();
    render();

    toast("Đã mua thêm 1 " + item.name + ".");
  }

  /*
    Mở cửa sổ thông tin công trình trên bản đồ.
  */
  function showBuilding(buildingId) {
    var building = window.APX_DATA.buildings.find(function (item) {
      return item.id === buildingId;
    });

    if (!building) {
      toast("Không tìm thấy thông tin công trình.", "warning");
      return;
    }

    var root = document.getElementById("modalRoot");

    if (!root) {
      return;
    }

    var personalOwnership = !building.owned && state.buildings.includes(building.id);
    var companyOwnerId = (state.companyBuildingOwnership || {})[building.id];
    var companyOwner = companyOwnerId && window.APXCompanies
      ? window.APXCompanies.getCompanyById(companyOwnerId, state)
      : null;
    var propertyRecord = personalOwnership && state.character && state.character.propertyRecords
      ? state.character.propertyRecords[building.id] || {}
      : {};
    var ownerName = companyOwner
      ? companyOwner.name
      : personalOwnership
      ? ((state.character && state.character.profile && state.character.profile.customized && state.character.profile.name) || "Người chơi mới")
      : building.owner;
    var currentValue = Number(propertyRecord.currentValue) || Number(building.value) || 0;
    var propertyAction = "";
    if (companyOwner) {
      propertyAction = '<p class="character-empty-note">Tài sản này thuộc ngân quỹ và hồ sơ của công ty.</p>';
    } else if (personalOwnership) {
      propertyAction = '<button class="button" type="button" data-action="sell-building" data-id="' + building.id + '">Bán tài sản</button>';
    } else if (!building.owned && building.status === "Mở bán") {
      propertyAction = '<button class="button button-gold" type="button" data-action="buy-building" data-id="' + building.id + '">Mua bằng tiền cá nhân</button>';
    }

    root.innerHTML =
      '<div class="modal-backdrop" data-action="close-modal">' +
        '<article class="modal" role="dialog" aria-modal="true" aria-labelledby="buildingModalTitle">' +
          '<span class="eyebrow">' + escapeHTML(building.type) + "</span>" +
          '<h2 id="buildingModalTitle">' + escapeHTML(building.name) + "</h2>" +
          '<div class="data-row"><span>Khu vực</span><strong>' +
            escapeHTML(building.district) + "</strong></div>" +
          '<div class="data-row"><span>Chủ sở hữu</span><strong>' +
            escapeHTML(ownerName) + "</strong></div>" +
          '<div class="data-row"><span>Trạng thái</span><strong>' +
            escapeHTML(companyOwner ? "Tài sản công ty" : (personalOwnership ? "Đang sở hữu cá nhân" : building.status)) + "</strong></div>" +
          '<div class="data-row"><span>Giá trị ước tính</span><strong>' +
            window.APXUI.money(currentValue) + "</strong></div>" +
          "<p>" + escapeHTML(building.detail) + "</p>" +
          propertyAction +
          '<button class="button button-gold" type="button" data-action="close-modal">Đóng</button>' +
        "</article>" +
      "</div>";
  }

  function closeModal() {
    var root = document.getElementById("modalRoot");

    if (root) {
      root.innerHTML = "";
    }
  }

  function submitPlayerProfile(form) {
    var name = String(form.elements.playerName.value || "").trim().replace(/\s+/g, " ");
    var title = String(form.elements.playerTitle.value || "").trim().replace(/\s+/g, " ");
    var age = Number(form.elements.playerAge.value);
    var location = String(form.elements.playerLocation.value || "").trim().replace(/\s+/g, " ");
    var bio = String(form.elements.playerBio.value || "").trim();

    if (name.length < 2 || name.length > 30 || !title || !location || !Number.isInteger(age) || age < 18 || age > 100) {
      toast("Kiểm tra tên, chức danh, tuổi từ 18 đến 100 và nơi ở rồi lưu lại nhé.", "warning");
      return;
    }

    if (window.APXCharacter) window.APXCharacter.prepareState(state);
    var profile = state.character.profile;
    var isFirstProfile = !profile.customized;
    var nameParts = name.split(" ");

    profile.name = name;
    profile.initials = nameParts.slice(-2).map(function (part) { return part.charAt(0); }).join("").toLocaleUpperCase("vi-VN");
    profile.title = title;
    profile.socialRank = title;
    profile.age = age;
    profile.location = location;
    profile.bio = bio;
    profile.customized = true;
    profile.editing = false;
    if (isFirstProfile) profile.startedAt = new Date().toISOString();

    // Giữ các module cũ tương thích với hồ sơ vừa chỉnh sửa.
    if (window.APX_DATA && window.APX_DATA.player) {
      Object.assign(window.APX_DATA.player, {
        name: name,
        initials: profile.initials,
        title: title,
        bio: bio,
        age: age,
        location: location
      });
    }

    save();
    render();
    toast(isFirstProfile ? "Đã tạo nhân vật " + name + "." : "Đã cập nhật thông tin nhân vật.");
  }

  /*
    Xử lý mọi nút có data-action.
    Việc dùng một bộ xử lý chung giúp các trang có thể được tạo lại
    mà không phải gắn sự kiện riêng cho từng nút.
  */
  function handleAction(button) {
    var action = button.dataset.action;

    switch (action) {
      case "section":
        window.APXNav.go(button.dataset.section);
        break;

      case "page":
        window.APXNav.go(state.route.section, button.dataset.page);
        break;

      case "navigate":
        window.APXNav.go(button.dataset.section);
        break;

      case "advance-day":
        toast("Không thể bỏ qua ngày. Ngày game tự chuyển lúc 00:00 theo giờ máy.", "warning");
        break;

      case "edit-profile":
        if (state.character && state.character.profile) {
          state.character.profile.editing = true;
          save();
          render();
        }
        break;

      case "cancel-profile-edit":
        if (state.character && state.character.profile && state.character.profile.customized) {
          state.character.profile.editing = false;
          save();
          render();
        }
        break;

      case "choose-project":
        state.buildChoice = button.dataset.id;
        save();
        render();
        break;

      case "build-project":
        buildProject();
        break;

      case "hire":
        hireCandidate(button.dataset.id);
        break;

      case "open-company":
        if (window.APXCompanies && window.APXCompanies.getCompanyById(button.dataset.id)) {
          state.companyManager = { companyId: button.dataset.id, tab: "overview" };
          window.APXNav.go("company", "companies");
        }
        break;

      case "company-list":
        state.companyManager = { companyId: null, tab: "overview" };
        save(); render();
        break;

      case "company-manager-tab":
        if (state.companyManager) state.companyManager.tab = button.dataset.tab || "overview";
        save(); render();
        break;

      case "company-upgrade-branch": {
        var upgradeCompany = window.APXCompanies.getCompanyById(button.dataset.company, state);
        var upgradeBranch = upgradeCompany && upgradeCompany.branches.find(function (item) { return item.id === button.dataset.id; });
        var branchPrice = 180000000 * Math.max(1, Number(upgradeBranch && upgradeBranch.level) || 1);
        if (!window.confirm("Nâng cấp chi nhánh sẽ dùng " + window.APXUI.money(branchPrice) + " từ tiền công ty. Tiếp tục?")) break;
        var branchUpgrade = window.APXCompanies.upgradeBranch(button.dataset.company, button.dataset.id, state);
        toast(branchUpgrade.message, branchUpgrade.ok ? undefined : "warning");
        break;
      }

      case "company-close-branch": {
        if (!window.confirm("Đóng chi nhánh này? Nhân viên phải được điều chuyển trước.")) break;
        var branchClose = window.APXCompanies.closeBranch(button.dataset.company, button.dataset.id, state);
        toast(branchClose.message, branchClose.ok ? undefined : "warning");
        if (branchClose.ok) render();
        break;
      }

      case "company-toggle-product": {
        var productToggle = window.APXCompanies.updateProduct(button.dataset.company, button.dataset.id, { toggle: true }, state);
        toast(productToggle.message, productToggle.ok ? undefined : "warning");
        if (productToggle.ok) render();
        break;
      }

      case "company-upgrade-product": {
        var productUpgrade = window.APXCompanies.updateProduct(button.dataset.company, button.dataset.id, { upgrade: true }, state);
        toast(productUpgrade.message, productUpgrade.ok ? undefined : "warning");
        if (productUpgrade.ok) render();
        break;
      }

      case "company-run-marketing": {
        var campaign = window.APXCompanies.getCampaignDefinitions().find(function (item) { return item.id === button.dataset.id; });
        if (campaign && !window.confirm("Chiến dịch " + campaign.name + " tốn " + window.APXUI.money(campaign.cost) + " từ ngân quỹ công ty. Chạy chiến dịch?")) break;
        var marketing = window.APXCompanies.runMarketing(button.dataset.company, button.dataset.id, state);
        toast(marketing.message, marketing.ok ? undefined : "warning");
        if (marketing.ok) render();
        break;
      }

      case "company-adjust-salary": {
        var salaryChange = window.APXCompanies.adjustSalary(button.dataset.id, Number(button.dataset.delta), state);
        toast(salaryChange.message, salaryChange.ok ? undefined : "warning");
        if (salaryChange.ok) render();
        break;
      }

      case "company-buy-asset": {
        var building = window.APX_DATA.buildings.find(function (item) { return item.id === button.dataset.id; });
        if (building && !window.confirm("Mua " + building.name + " với giá " + window.APXUI.money(building.value) + " từ tiền mặt công ty?")) break;
        var companyAsset = window.APXCompanies.buyMarketAsset(button.dataset.company, button.dataset.id, state);
        toast(companyAsset.message, companyAsset.ok ? undefined : "warning");
        if (companyAsset.ok) render();
        break;
      }

      case "company-event": {
        var eventResult = window.APXCompanies.resolveBusinessEvent(button.dataset.id, state);
        toast(eventResult.message, eventResult.ok ? undefined : "warning");
        if (eventResult.ok) render();
        break;
      }

      case "buy-building": {
        var purchase = window.APXCharacter && window.APXCharacter.purchaseCityProperty(button.dataset.id);
        if (purchase) {
          toast(purchase.message, purchase.ok ? undefined : "warning");
          if (purchase.ok) { closeModal(); save(); render(); }
        }
        break;
      }

      case "sell-building": {
        var sale = window.APXCharacter && window.APXCharacter.sellCityProperty(button.dataset.id);
        if (sale) {
          toast(sale.message, sale.ok ? undefined : "warning");
          if (sale.ok) { closeModal(); save(); render(); }
        }
        break;
      }

      case "train-skill": {
        var training = window.APXCharacter && window.APXCharacter.trainSkill(button.dataset.id);
        if (training) {
          toast(training.message, training.ok ? undefined : "warning");
          if (training.ok) { save(); render(); }
        }
        break;
      }

      case "use-item":
        useInventoryItem(button.dataset.id);
        break;

      case "building":
        showBuilding(button.dataset.id);
        break;

      case "close-modal":
        closeModal();
        break;

      case "reset":
        resetGame();
        break;

      default:
        break;
    }
  }

  /*
    Đặt lại ván chơi về trạng thái ban đầu.
  */
  function resetGame() {
    var confirmed = window.confirm(
      "Bạn có chắc muốn xóa tiến trình hiện tại và bắt đầu lại không?"
    );

    if (!confirmed) {
      return;
    }

    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (error) {
      // Nếu trình duyệt chặn xóa, game vẫn đặt lại trạng thái trong bộ nhớ.
    }

    state = createFreshState();
    prepareState();
    if (window.APXCharacter) window.APXCharacter.migrateAfterReset(state);
    closeModal();
    render();

    toast("Đã đặt lại dữ liệu. Bạn đang bắt đầu một ván mới.");
  }

  /*
    Gõ tìm kiếm: lưu từ khóa, dựng lại danh sách,
    rồi đưa con trỏ về đúng vị trí cũ.
  */
  function handleSearchInput(event) {
    var input = event.target;
    var inputId = input.id;

    if (inputId !== "itemSearch" && inputId !== "employeeSearch") {
      return;
    }

    var cursorStart = input.selectionStart;
    var cursorEnd = input.selectionEnd;

    if (inputId === "itemSearch") {
      state.itemSearch = input.value;
    } else {
      state.employeeSearch = input.value;
    }

    save();
    render();

    var updatedInput = document.getElementById(inputId);

    if (updatedInput) {
      updatedInput.focus();

      try {
        updatedInput.setSelectionRange(cursorStart, cursorEnd);
      } catch (error) {
        // Một số trình duyệt không hỗ trợ đặt con trỏ cho ô tìm kiếm.
      }
    }
  }

  /*
    Bấm Escape để đóng cửa sổ thông tin nếu đang mở.
  */
  function handleKeyboard(event) {
    if (event.key === "Escape") {
      closeModal();
    }
  }

  /*
    Gắn sự kiện toàn trang.
    Dùng ủy quyền sự kiện để các nút vẫn hoạt động sau khi đổi trang.
  */
  document.addEventListener("click", function (event) {
    var button = event.target.closest("[data-action]");

    if (!button) {
      return;
    }

    // Không để liên kết logo nhảy lên đầu trang.
    if (button.tagName === "A") {
      event.preventDefault();
    }

    // Bấm vào phần bên trong cửa sổ không làm cửa sổ tự đóng.
    if (
      button.classList.contains("modal-backdrop") &&
      event.target.closest(".modal")
    ) {
      return;
    }

    handleAction(button);
  });

  document.addEventListener("input", handleSearchInput);
  document.addEventListener("keydown", handleKeyboard);
  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form) return;
    if (form.id === "playerProfileForm") {
      event.preventDefault(); submitPlayerProfile(form); return;
    }
    if (form.id === "companyOpenBranchForm") {
      event.preventDefault();
      var branchCompany = window.APXCompanies.getCompanyById(form.elements.companyId.value);
      var branchCost = branchCompany && (branchCompany.id === "coffee" ? 720000000 : branchCompany.id === "tech" ? 1150000000 : 980000000);
      if (!branchCompany || !window.confirm("Mở chi nhánh mới với chi phí " + window.APXUI.money(branchCost) + " từ tiền công ty?")) return;
      var branchResult = window.APXCompanies.openBranch(form.elements.companyId.value, { name: form.elements.name.value, location: form.elements.location.value }, state);
      toast(branchResult.message, branchResult.ok ? undefined : "warning"); if (branchResult.ok) render(); return;
    }
    if (form.id === "companyCreateProductForm") {
      event.preventDefault();
      var productCompany = window.APXCompanies.getCompanyById(form.elements.companyId.value);
      var researchCost = productCompany && productCompany.id === "tech" ? 90000000 : 55000000;
      if (!productCompany || !window.confirm("Phát triển sản phẩm cần " + window.APXUI.money(researchCost) + " từ tiền công ty. Tiếp tục?")) return;
      var createResult = window.APXCompanies.createProduct(form.elements.companyId.value, { name: form.elements.name.value, price: form.elements.price.value }, state);
      toast(createResult.message, createResult.ok ? undefined : "warning"); if (createResult.ok) render(); return;
    }
    if (form.dataset.companyForm === "product-price") {
      event.preventDefault();
      var priceResult = window.APXCompanies.updateProduct(form.elements.companyId.value, form.elements.productId.value, { price: form.elements.price.value }, state);
      toast(priceResult.message, priceResult.ok ? undefined : "warning"); if (priceResult.ok) render(); return;
    }
    if (form.id === "companyInventoryForm") {
      event.preventDefault();
      var inventoryCompany = window.APXCompanies.getCompanyById(form.elements.companyId.value);
      var inventoryCost = inventoryCompany && Number(form.elements.quantity.value) * inventoryCompany.inventory.unitCost;
      if (!inventoryCompany || !window.confirm("Nhập kho sẽ dùng " + window.APXUI.money(inventoryCost) + " từ tiền công ty. Tiếp tục?")) return;
      var stockResult = window.APXCompanies.buyInventory(form.elements.companyId.value, form.elements.quantity.value, state);
      toast(stockResult.message, stockResult.ok ? undefined : "warning"); if (stockResult.ok) render(); return;
    }
    if (form.id === "companyTransferForm") {
      event.preventDefault();
      var transferResult = window.APXCompanies.transferCash(form.elements.companyId.value, form.elements.amount.value, form.elements.direction.value, state);
      toast(transferResult.message, transferResult.ok ? undefined : "warning"); if (transferResult.ok) render();
    }
  });
  document.addEventListener("change", function (event) {
    var select = event.target;
    if (!select || select.dataset.change !== "move-company-employee") return;
    var destination = String(select.value || "").split("|");
    var moveResult = window.APXCompanies.moveEmployee(select.dataset.id, destination[0], destination[1], state);
    toast(moveResult.message, moveResult.ok ? undefined : "warning");
  });

  /*
    Công khai một số hàm để navigation.js gọi.
  */
  window.APXGame = {
    get state() {
      return state;
    },

    save: save,
    render: render,
    toast: toast,
    startRealtimeClock: startRealtimeClock,
    loadCloudState: function (cloudState) {
      if (!cloudState || typeof cloudState !== "object" || Array.isArray(cloudState)) {
        throw new Error("Bản lưu tài khoản không hợp lệ.");
      }
      state = Object.assign(createFreshState(), cloudState);
      prepareState();
      if (window.APXCharacter) window.APXCharacter.prepareState(state);
      if (window.APXCompanies) window.APXCompanies.ensureState(state);
      save();
      render();
    },
    createAccountState: function (profile) {
      state = createFreshState();
      prepareState();
      if (window.APXCharacter) window.APXCharacter.prepareState(state);
      if (window.APXCompanies) window.APXCompanies.ensureState(state);
      state.character.profile.customized = true;
      state.character.profile.name = profile.display_name;
      state.character.profile.initials = profile.display_name.trim().split(/\s+/).slice(-2).map(function (part) { return part.charAt(0); }).join("").toLocaleUpperCase("vi-VN");
      state.character.profile.characterId = profile.character_id;
      state.character.profile.avatar = profile.avatar_url || "";
      save();
      render();
    }
  };

  // Mở trang mặc định sau khi tất cả module đã tải xong.
  render();
})();
