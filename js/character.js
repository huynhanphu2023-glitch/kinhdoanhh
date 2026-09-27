/* =========================================================
   APX BUSINESS WORLD — GIAO DIỆN NHÂN VẬT
   Mọi chỉ số động đều đọc từ state.character qua APXCharacter.
   ========================================================= */
window.APXPages = window.APXPages || {};

(function () {
  "use strict";

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function heading(title, description) {
    return '<header class="page-heading"><span class="eyebrow">HỒ SƠ NHÂN VẬT</span><h1>' + esc(title) +
      '</h1><p>' + esc(description) + '</p></header>';
  }

  function statCard(label, value, detail, className) {
    return '<article class="metric ' + (className || '') + '"><small>' + esc(label) + '</small><strong>' +
      esc(value) + '</strong>' + (detail ? '<span class="metric-detail">' + esc(detail) + '</span>' : '') + '</article>';
  }

  function api(state) {
    if (window.APXCharacter) return window.APXCharacter;
    return {
      getMetrics: function () { return { cash: state.cash, netWorth: state.networth, assetValue: 0, debt: 0, assets: [], companyCount: window.APX_DATA.companies.length, employeeCount: state.hired.length, propertyCount: 0, daysPlayed: Math.max(0, state.day - 1) }; },
      skillDefinitions: [], achievementDefinitions: []
    };
  }

  function profileEditor(profile) {
    var customized = !!profile.customized;
    var editing = !customized || !!profile.editing;
    if (!editing) {
      return '<section class="panel player-profile-edit-row"><div><span class="eyebrow">THÔNG TIN TÀI KHOẢN</span><p>Tên và thông tin nhân vật được lưu trong tiến trình trên thiết bị này.</p></div><button class="button" type="button" data-action="edit-profile">Chỉnh sửa hồ sơ</button></section>';
    }

    return '<section class="panel player-profile-editor"><div class="section-title-row"><div><span class="eyebrow">' +
      (customized ? 'CẬP NHẬT TÀI KHOẢN' : 'TẠO NHÂN VẬT') +
      '</span><h2>' + (customized ? 'Chỉnh sửa thông tin' : 'Đặt thông tin cho nhân vật của bạn') +
      '</h2><p>' + (customized ? 'Bạn có thể đổi các thông tin này bất cứ lúc nào.' : 'Đặt tên riêng thay cho hồ sơ mẫu. Tiến trình game hiện tại vẫn được giữ nguyên.') +
      '</p></div></div><form id="playerProfileForm" class="player-profile-form">' +
      '<label>Tên nhân vật<input name="playerName" type="text" minlength="2" maxlength="30" autocomplete="name" value="' + esc(customized ? profile.name : '') + '" placeholder="Ví dụ: Nguyễn Minh An" required></label>' +
      '<label>Chức danh / nghề nghiệp<input name="playerTitle" type="text" maxlength="40" value="' + esc(customized ? profile.title : '') + '" placeholder="Ví dụ: Nhà sáng lập APX" required></label>' +
      '<label>Tuổi<input name="playerAge" type="number" min="18" max="100" value="' + esc(customized && profile.age ? profile.age : '') + '" placeholder="29" required></label>' +
      '<label>Nơi ở<input name="playerLocation" type="text" maxlength="50" value="' + esc(customized ? profile.location : '') + '" placeholder="Ví dụ: Thủ Thiêm, Việt Nam" required></label>' +
      '<label class="player-profile-bio-field">Giới thiệu<textarea name="playerBio" rows="3" maxlength="180" placeholder="Viết vài dòng về nhân vật của bạn">' + esc(customized ? profile.bio : '') + '</textarea></label>' +
      '<div class="player-profile-form-actions"><button class="button button-gold" type="submit">' + (customized ? 'Lưu thay đổi' : 'Tạo nhân vật') + '</button>' +
      (customized ? '<button class="button" type="button" data-action="cancel-profile-edit">Hủy</button>' : '') +
      '</div></form></section>';
  }

  function profilePage(state) {
    var system = api(state);
    var metrics = system.getMetrics(state);
    var character = state.character || {};
    var profile = character.profile || window.APX_DATA.player;
    var level = character.level || { current: window.APX_DATA.player.level, xp: window.APX_DATA.player.experience, xpToNext: window.APX_DATA.player.nextLevelExperience };
    var reputation = character.reputation || { score: window.APX_DATA.player.reputation, history: [] };
    var profileName = profile.customized ? profile.name : "Nhân vật mới";
    var profileTitle = profile.customized ? profile.title : "Người chơi APX";
    var percent = Math.max(0, Math.min(100, Math.round((level.xp / Math.max(1, level.xpToNext)) * 100)));
    var skin = window.APXWardrobe && character.wardrobe ? window.APXWardrobe.findSkin(character.wardrobe.skinId) : null;
    var image = skin ? skin.src : "assets/characters/player/base/body.png";
    var started = profile.startedAt ? new Date(profile.startedAt) : null;
    var startedLabel = started && !isNaN(started.getTime()) ? started.toLocaleDateString("vi-VN") : "—";
    var repHistory = (reputation.history || []).slice(0, 4);
    var experienceRatio = level.xpToNext ? Math.round(level.xp / level.xpToNext * 100) : 0;

    return heading(profile.customized ? profile.name : "Tạo nhân vật", profile.customized ? "Hồ sơ, tiến trình và những ảnh hưởng của bạn trong hệ sinh thái APX." : "Đặt tên và tạo hồ sơ người chơi của bạn.") +
      '<section class="character-hero panel" aria-label="Nhân vật chính">' +
        '<div class="character-hero-art"><div class="character-orbit orbit-one"></div><div class="character-orbit orbit-two"></div>' +
          '<div class="character-portrait character-portrait-has-skin"><img class="character-portrait-image" src="' + esc(image) + '" alt="Nhân vật ' + esc(profileName) + '"><span>' + esc(profile.customized ? profile.initials || "NV" : "NV") + '</span></div>' +
          '<span class="character-hero-caption">' + esc(skin ? skin.name : (profile.customized ? profile.title : "NHÂN VẬT NGƯỜI CHƠI")) + '</span></div>' +
        '<div class="character-hero-info"><span class="eyebrow">' + esc(profileTitle) + ' · CẤP ' + level.current + '</span>' +
          '<h2>' + esc(profileName) + '</h2><p class="character-title">' + esc(profileTitle) + '</p><p class="character-bio">' + esc(profile.customized ? profile.bio : "Tạo hồ sơ để đặt tên và thông tin nhân vật.") + '</p>' +
          '<div class="character-meta">' + (profile.customized ? '<span>' + esc(profile.age) + ' tuổi</span><span>' + esc(profile.location) + '</span><span>' + esc(profile.socialRank) + '</span>' : '<span>Chưa thiết lập hồ sơ</span>') + '</div>' +
          '<div class="experience-block"><div class="experience-label"><span>XP cấp hiện tại</span><strong>' + Number(level.xp).toLocaleString("vi-VN") + ' / ' + Number(level.xpToNext).toLocaleString("vi-VN") + ' XP</strong></div>' +
            '<div class="progress" role="progressbar" aria-label="Kinh nghiệm nhân vật" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + experienceRatio + '"><span style="width:' + experienceRatio + '%"></span></div>' +
            '<small class="character-xp-total">Tổng đã nhận: ' + Number(level.totalXP || 0).toLocaleString("vi-VN") + ' XP</small></div></div></section>' +
      profileEditor(profile) +
      '<section class="character-stat-grid grid four" aria-label="Chỉ số nhân vật">' +
        statCard("TIỀN CÁ NHÂN", window.APXUI.money(metrics.cash), "Số dư có thể sử dụng", "personal-stat") +
        statCard("TỔNG TÀI SẢN", window.APXUI.money(metrics.assetValue), "Không tính tiền mặt", "investment-stat") +
        statCard("TÀI SẢN RÒNG", window.APXUI.money(metrics.netWorth), "Tiền + tài sản − nợ", "networth-stat") +
        statCard("DANH TIẾNG", Number(reputation.score).toLocaleString("vi-VN") + ' / 100', "Ảnh hưởng cơ hội và giá giao dịch", "reputation-stat") +
      '</section>' +
      '<section class="character-lower-grid grid two">' +
        '<article class="panel character-summary"><div class="section-title-row"><div><span class="eyebrow">TỔNG QUAN</span><h2>Hành trình của bạn</h2></div><span class="summary-mark" aria-hidden="true">A</span></div>' +
          '<div class="data-row"><span>Ngày bắt đầu</span><strong>' + esc(startedLabel) + '</strong></div>' +
          '<div class="data-row"><span>Số ngày đã chơi</span><strong>' + metrics.daysPlayed + ' ngày</strong></div>' +
          '<div class="data-row"><span>Công ty trong hệ sinh thái</span><strong>' + metrics.companyCount + ' công ty</strong></div>' +
          '<div class="data-row"><span>Nhân sự toàn tập đoàn</span><strong>' + metrics.employeeCount.toLocaleString("vi-VN") + ' người</strong></div>' +
          '<div class="data-row"><span>Tài sản cá nhân đang sở hữu</span><strong>' + metrics.assets.length + ' hạng mục · ' + metrics.propertyCount + ' bất động sản</strong></div>' +
          '<div class="data-row"><span>Nợ cá nhân</span><strong>' + window.APXUI.money(metrics.debt) + '</strong></div></article>' +
        '<article class="panel character-summary"><div class="section-title-row"><div><span class="eyebrow">DANH TIẾNG</span><h2>Uy tín gần đây</h2></div><span class="summary-mark" aria-hidden="true">' + Math.round(reputation.score) + '</span></div>' +
          (repHistory.length ? repHistory.map(function (entry) {
            var positive = Number(entry.delta) >= 0;
            return '<div class="character-history-row"><span class="character-history-delta ' + (positive ? 'is-positive' : 'is-negative') + '">' + (positive ? '+' : '') + Number(entry.delta).toFixed(1) + '</span><span><strong>' + esc(entry.reason) + '</strong><small>Ngày ' + Number(entry.day) + ' · danh tiếng ' + Number(entry.score).toFixed(1) + '</small></span></div>';
          }).join("") : '<p class="character-empty-note">Lịch sử sẽ cập nhật sau các ngày kinh doanh và giao dịch đầu tiên.</p>') +
          '<div class="character-highlight"><span class="highlight-symbol" aria-hidden="true">XP</span><span><strong>Level có tác dụng thật</strong><small>Mỗi cấp tăng giới hạn tuyển dụng và hiệu quả doanh thu.</small></span></div></article>' +
      '</section>';
  }

  function skillCard(skill, state) {
    var effect = window.APXCharacter
      ? window.APXCharacter.getCharacterSkillEffect(skill.id)
      : { summary: "Hiệu ứng sẽ được áp dụng khi hệ thống nhân vật khởi tạo." };
    var cost = 3000000 + skill.level * 100000;
    var progress = skill.level >= 100 ? 100 : Math.round(skill.xp / Math.max(1, skill.xpToNext) * 100);
    return '<article class="skill-card panel"><div class="skill-card-heading"><span class="skill-symbol" aria-hidden="true">' + esc(skill.shortName) + '</span><span><strong>' + esc(skill.name) + ' · cấp ' + skill.level + '</strong><small>' + esc(skill.description) + '</small></span></div>' +
      '<div class="skill-value-row"><span>Tiến trình lên cấp</span><strong>' + (skill.level >= 100 ? 'Tối đa' : Number(skill.xp).toLocaleString("vi-VN") + ' / ' + Number(skill.xpToNext).toLocaleString("vi-VN") + ' XP') + '</strong></div>' +
      '<div class="progress" role="progressbar" aria-label="' + esc(skill.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + progress + '"><span style="width:' + progress + '%"></span></div>' +
      '<p class="skill-game-effect"><strong>Hiệu ứng hiện tại:</strong> ' + esc(effect.summary || "") + '</p>' +
      '<button class="button button-gold skill-train-button" type="button" data-action="train-skill" data-id="' + esc(skill.id) + '"' + (skill.level >= 100 ? ' disabled' : '') + '>Đào tạo · ' + window.APXUI.money(cost) + '</button></article>';
  }

  function skillsPage(state) {
    var system = api(state);
    var definitions = system.skillDefinitions || [];
    var skills = definitions.map(function (definition) {
      var value = system.getSkill(definition.id) || { level: 0, xp: 0, xpToNext: 1 };
      return Object.assign({}, definition, value);
    });
    var average = skills.length ? Math.round(skills.reduce(function (sum, skill) { return sum + skill.level; }, 0) / skills.length) : 0;
    return heading("Kỹ năng", "Rèn luyện kỹ năng bằng tiền cá nhân để cải thiện kết quả kinh doanh thật.") +
      '<section class="skill-overview panel"><div><span class="eyebrow">NĂNG LỰC NHÂN VẬT</span><h2>Kỹ năng ảnh hưởng trực tiếp đến game</h2><p>Mỗi buổi đào tạo tốn tiền, tăng XP kỹ năng và XP nhân vật. Các hiệu ứng áp dụng khi đóng sổ hoặc giao dịch.</p></div><div class="skill-average"><strong>' + average + '</strong><small>ĐIỂM TRUNG BÌNH</small></div></section>' +
      '<section class="skill-grid grid two" aria-label="Danh sách kỹ năng">' + skills.map(function (skill) { return skillCard(skill, state); }).join("") + '</section>' +
      '<section class="panel skill-tree-panel"><span class="eyebrow">CÁCH TĂNG CẤP</span><h2>Học qua hành động</h2><p>Đóng sổ ngày tăng Kinh doanh, Tài chính và Marketing. Tuyển người tăng Lãnh đạo. Mua hoặc bán tài sản tăng Đàm phán và Tài chính. Dùng nút đào tạo để chủ động phát triển kỹ năng.</p></section>';
  }

  function assetCard(asset) {
    var monthlyNet = (Number(asset.monthlyIncome) || 0) - (Number(asset.monthlyMaintenance) || 0);
    var sellButton = asset.buildingId ? '<button class="button asset-sell-button" type="button" data-action="sell-building" data-id="' + esc(asset.buildingId) + '">Bán tài sản</button>' : '';
    var history = Array.isArray(asset.history) ? asset.history : [];
    var first = history.length ? history[0].value : asset.purchasePrice;
    var change = Number(asset.currentValue) - (Number(first) || 0);
    var acquisitionRow = asset.legacy
      ? '<div><span>Nguồn gốc</span><strong>Chuyển từ dữ liệu cũ</strong></div>'
      : asset.acquisitionUnknown
        ? '<div><span>Ngày mua</span><strong>Không có dữ liệu ngày</strong></div>'
        : '<div><span>Ngày mua</span><strong>Ngày ' + Number(asset.purchasedDay) + '</strong></div>';
    return '<article class="asset-card panel"><div class="asset-card-top"><span class="asset-symbol" aria-hidden="true">' + esc(asset.buildingId ? "BĐS" : "APX") + '</span><span class="asset-category">' + esc(asset.type || "Tài sản") + '</span></div>' +
      '<h3>' + esc(asset.name) + '</h3><p>' + esc(asset.location || "") + '</p><div class="asset-value"><small>GIÁ TRỊ HIỆN TẠI</small><strong>' + window.APXUI.money(asset.currentValue) + '</strong></div>' +
      '<div class="asset-detail-list"><div><span>Giá mua</span><strong>' + window.APXUI.money(asset.purchasePrice) + '</strong></div><div><span>Thu nhập / tháng</span><strong>' + window.APXUI.money(asset.monthlyIncome) + '</strong></div><div><span>Chi phí / tháng</span><strong>' + window.APXUI.money(asset.monthlyMaintenance) + '</strong></div><div><span>Dòng tiền ròng / tháng</span><strong class="' + (monthlyNet >= 0 ? 'is-positive' : 'is-negative') + '">' + window.APXUI.money(monthlyNet) + '</strong></div><div><span>Biến động từ ghi nhận đầu</span><strong class="' + (change >= 0 ? 'is-positive' : 'is-negative') + '">' + window.APXUI.money(change) + '</strong></div>' + acquisitionRow + '</div>' +
      (history.length > 1 ? '<details class="asset-history"><summary>Lịch sử định giá · ' + history.length + ' mốc</summary>' + history.slice(-5).reverse().map(function (point) { return '<div class="data-row"><span>Ngày ' + Number(point.day) + '</span><strong>' + window.APXUI.money(point.value) + '</strong></div>'; }).join("") + '</details>' : '') +
      sellButton + '</article>';
  }

  function assetsPage(state) {
    var system = api(state);
    var metrics = system.getMetrics(state);
    var assets = metrics.assets || [];
    var monthlyIncome = assets.reduce(function (sum, asset) { return sum + (Number(asset.monthlyIncome) || 0); }, 0);
    var monthlyCost = assets.reduce(function (sum, asset) { return sum + (Number(asset.monthlyMaintenance) || 0); }, 0);
    var transactions = (state.character && state.character.transactions || []).filter(function (entry) { return entry.type === "buy-property" || entry.type === "sell-property"; }).slice(0, 8);
    return heading("Tài sản cá nhân", "Danh mục lấy từ giao dịch và dữ liệu game; tài sản công ty không bị tính nhầm vào tài sản cá nhân.") +
      '<section class="personal-finance-grid grid four">' + statCard("TIỀN MẶT", window.APXUI.money(metrics.cash), "Có thể sử dụng", "personal-stat") + statCard("TÀI SẢN", window.APXUI.money(metrics.assetValue), assets.length + ' hạng mục', "investment-stat") + statCard("NỢ CÁ NHÂN", window.APXUI.money(metrics.debt), "Chi phí chưa thanh toán", "") + statCard("TÀI SẢN RÒNG", window.APXUI.money(metrics.netWorth), "Tiền + tài sản − nợ", "networth-stat") + '</section>' +
      '<section class="asset-cashflow panel"><div><span class="eyebrow">DÒNG TIỀN TÀI SẢN</span><h2>' + window.APXUI.money(monthlyIncome - monthlyCost) + ' / tháng</h2><p>Thu nhập ' + window.APXUI.money(monthlyIncome) + ' · chi phí duy trì ' + window.APXUI.money(monthlyCost) + '</p></div><a class="button" href="#" data-action="navigate" data-section="city">Mở thị trường thành phố</a></section>' +
      '<section class="asset-section"><div class="section-title-row"><div><span class="eyebrow">DANH MỤC SỞ HỮU</span><h2>Tài sản của bạn</h2></div><span class="asset-count">' + assets.length + ' HẠNG MỤC</span></div>' +
        (assets.length ? '<div class="asset-grid grid three">' + assets.map(assetCard).join("") + '</div>' : '<article class="panel character-empty-note">Bạn chưa có tài sản cá nhân. Mở Thành phố → Bất động sản để xem cơ hội mua.</article>') + '</section>' +
      '<section class="asset-history-panel panel"><span class="eyebrow">SỔ GIAO DỊCH TÀI SẢN</span><h2>Mua và bán gần đây</h2>' +
        (transactions.length ? transactions.map(function (item) { return '<div class="data-row"><span>Ngày ' + Number(item.day) + ' · ' + (item.type === "buy-property" ? 'Mua' : 'Bán') + ' · ' + esc(item.name) + '</span><strong>' + window.APXUI.money(item.amount) + '</strong></div>'; }).join("") : '<p class="character-empty-note">Giao dịch tài sản sẽ được ghi ở đây sau khi mua hoặc bán.</p>') + '</section>';
  }

  function achievementsPage(state) {
    var definitions = (window.APXCharacter && window.APXCharacter.achievementDefinitions) || [];
    var records = state.character && state.character.achievements || {};
    var unlocked = definitions.filter(function (def) { return records[def.id] && records[def.id].completed; }).length;
    return heading("Thành tựu", "Mỗi cột mốc lưu lại tiến trình và trao XP một lần duy nhất khi đạt điều kiện.") +
      '<section class="achievement-summary panel"><div class="achievement-summary-mark" aria-hidden="true">A</div><div><span class="eyebrow">BỘ SƯU TẬP CỘT MỐC</span><h2>Thành tựu đã ghi nhận</h2><p>Phần thưởng được cộng tự động và lưu trong tiến trình.</p></div><div class="achievement-summary-count"><strong>' + unlocked + ' / ' + definitions.length + '</strong><small>ĐÃ MỞ KHÓA</small></div></section>' +
      '<section class="achievement-grid grid three" aria-label="Các thành tựu">' + definitions.map(function (def) {
        var record = records[def.id] || {};
        var progress = Math.min(def.target, Number(record.progress) || 0);
        var pct = def.target ? Math.round(progress / def.target * 100) : 0;
        var done = !!record.completed;
        return '<article class="achievement-card panel ' + (done ? 'unlocked' : 'locked') + '"><div class="achievement-card-top"><span class="achievement-mark" aria-hidden="true">' + esc(def.mark) + '</span><span class="achievement-status">' + (done ? 'ĐÃ MỞ KHÓA' : 'CHƯA ĐẠT') + '</span></div><h3>' + esc(def.title) + '</h3><p>' + esc(def.description) + '</p><div class="achievement-progress-label"><span>Tiến trình</span><strong>' + progress + ' / ' + def.target + '</strong></div><div class="progress" role="progressbar" aria-label="' + esc(def.title) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></div><div class="achievement-reward"><span>Phần thưởng</span><strong>+' + Number(def.reward || 0) + ' XP</strong></div>' + (done ? '<small class="achievement-unlocked-day">Đạt ở ngày ' + Number(record.unlockedAtDay || 1) + ' · thưởng ' + (record.rewardGranted ? 'đã nhận' : 'không có') + '</small>' : '') + '</article>';
      }).join("") + '</section>';
  }

  window.APXPages.character = function (page, state) {
    if (page === "skills") return skillsPage(state);
    if (page === "assets") return assetsPage(state);
    if (page === "achievements") return achievementsPage(state);
    return profilePage(state);
  };
})();
