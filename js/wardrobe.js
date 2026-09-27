/* =========================================================
   APX BUSINESS WORLD — PHÒNG THAY ĐỒ THEO SKIN NGUYÊN BỘ
   Mỗi skin dùng một ảnh toàn thân hoàn chỉnh. Khi chọn skin,
   ảnh nhân vật hiện tại được thay bằng ảnh của skin đó.
   ========================================================= */

window.APXPages = window.APXPages || {};

(function () {
  "use strict";

  /*
    THÊM SKIN MỚI:
    1. Chép ảnh toàn thân vào assets/characters/player/skin/.
    2. Thêm một mục mới vào danh sách dưới đây.
    3. Đổi id và src cho trùng tên skin và tên ảnh.
  */
  var SKINS = [
    {
      id: "skin-base-dark",
      name: "Bản nền APX",
      description: "Skin nền toàn thân để bắt đầu chơi.",
      src: "assets/characters/player/base/body.png",
      price: 0,
      rarity: "Thông thường"
    },
    {
      id: "skin-office",
      name: "Công sở APX",
      description: "Áo khoác sáng màu phối quần tây tối.",
      src: "assets/characters/player/skin/office.png",
      price: 12000000,
      rarity: "Hiếm"
    }
  ];

  var DEFAULT_SKIN_ID = "skin-base-dark";

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function findSkin(skinId) {
    return SKINS.find(function (skin) {
      return skin.id === skinId;
    }) || null;
  }

  function quantity(state, skinId) {
    if (!state.inventory || typeof state.inventory !== "object") {
      state.inventory = {};
    }
    return Number(state.inventory[skinId]) || 0;
  }

  function ownsSkin(state, skinId) {
    return quantity(state, skinId) > 0;
  }

  function prepareState(state) {
    if (!state.inventory || typeof state.inventory !== "object") {
      state.inventory = {};
    }
    if (!state.wardrobe || typeof state.wardrobe !== "object") state.wardrobe = {};
    if (state.character && state.character.wardrobe && typeof state.character.wardrobe === "object") {
      state.character.wardrobe = Object.assign({}, state.wardrobe, state.character.wardrobe);
      state.wardrobe = state.character.wardrobe;
    } else if (state.character) {
      state.character.wardrobe = state.wardrobe;
    }
    if (!findSkin(state.wardrobe.skinId)) {
      state.wardrobe.skinId = DEFAULT_SKIN_ID;
    }
    if (!state.wardrobe.tab) state.wardrobe.tab = "closet";
    if (typeof state.wardrobe.search !== "string") state.wardrobe.search = "";

    // Mở sẵn skin nền để người chơi luôn có nhân vật trong màn hình.
    if (!ownsSkin(state, DEFAULT_SKIN_ID)) {
      state.inventory[DEFAULT_SKIN_ID] = 1;
    }
    if (!ownsSkin(state, state.wardrobe.skinId)) {
      state.wardrobe.skinId = DEFAULT_SKIN_ID;
    }
    return state.wardrobe;
  }

  function addSkinsToInventoryCatalog() {
    if (!window.APX_DATA || !Array.isArray(window.APX_DATA.items)) return;

    SKINS.forEach(function (skin) {
      var exists = window.APX_DATA.items.some(function (item) {
        return item.id === skin.id;
      });
      if (exists) return;

      window.APX_DATA.items.push({
        id: skin.id,
        name: skin.name,
        type: "Trang bị",
        rarity: skin.rarity,
        price: skin.price,
        quantity: 0,
        description: skin.description,
        effect: "Skin nhân vật nguyên bộ. Chọn mặc trong Phòng thay đồ."
      });
    });
  }

  function money(value) {
    if (window.APXUI && typeof window.APXUI.money === "function") {
      return window.APXUI.money(value);
    }
    return new Intl.NumberFormat("vi-VN").format(Number(value) || 0) + " ₫";
  }

  function renderCharacter(state) {
    var skin = findSkin(state.wardrobe.skinId) || findSkin(DEFAULT_SKIN_ID);
    var profile = state.character && state.character.profile;
    var playerName = profile && profile.customized
      ? profile.name
      : "Người chơi mới";

    return (
      '<div class="wardrobe-character-stage wardrobe-skin-stage" data-character-stage>' +
        '<img class="wardrobe-full-skin" data-character-image' +
          ' src="' + escapeHTML(skin.src) + '"' +
          ' alt="' + escapeHTML(skin.name + ' của ' + playerName) + '">' +
        '<div class="wardrobe-stage-empty" data-character-fallback>' +
          '<span class="wardrobe-stage-empty-mark">APX</span>' +
          '<strong>Chưa mở được ảnh skin</strong>' +
          '<p>Kiểm tra tên ảnh và đường dẫn trong danh sách skin ở js/wardrobe.js.</p>' +
        '</div>' +
        '<div class="wardrobe-stage-caption">' +
          '<span>SKIN ĐANG MẶC</span><strong>' + escapeHTML(playerName) + '</strong>' +
        '</div>' +
      '</div>'
    );
  }

  function syncCharacterImage() {
    var stage = document.querySelector("[data-character-stage]");
    var image = stage && stage.querySelector("[data-character-image]");
    if (!stage || !image) return;

    function loaded() {
      stage.classList.add("wardrobe-has-skin-image");
      image.classList.remove("wardrobe-image-missing");
    }
    function failed() {
      stage.classList.remove("wardrobe-has-skin-image");
      image.classList.add("wardrobe-image-missing");
    }

    image.addEventListener("load", loaded, { once: true });
    image.addEventListener("error", failed, { once: true });
    if (image.complete) image.naturalWidth > 0 ? loaded() : failed();
  }

  function syncPlayerAvatars() {
    if (!window.APXGame) return;

    var state = window.APXGame.state;
    var skinId = state.wardrobe && state.wardrobe.skinId;
    var skin = findSkin(skinId) || findSkin(DEFAULT_SKIN_ID);
    var avatars = document.querySelectorAll(".player-avatar, .current-player-avatar");

    Array.prototype.forEach.call(avatars, function (avatar) {
      if (avatar.dataset.skinId === skin.id) return;
      if (!avatar.dataset.fallback) {
        avatar.dataset.fallback = avatar.textContent.trim() || "MA";
      }

      var image = document.createElement("img");
      image.className = "player-skin-avatar-image";
      image.src = skin.src;
      image.alt = "";
      image.addEventListener("error", function () {
        avatar.textContent = avatar.dataset.fallback || "MA";
        avatar.classList.remove("has-skin-avatar");
        delete avatar.dataset.skinId;
      }, { once: true });

      avatar.textContent = "";
      avatar.appendChild(image);
      avatar.dataset.skinId = skin.id;
      avatar.classList.add("has-skin-avatar");
    });
  }

  function renderSkinCard(skin, state, inShop) {
    var owned = ownsSkin(state, skin.id);
    var equipped = state.wardrobe.skinId === skin.id;
    var button;

    if (inShop) {
      button = '<button class="wardrobe-button wardrobe-button-gold" type="button"' +
        ' data-wardrobe-action="buy-skin" data-id="' + escapeHTML(skin.id) + '">' +
        'Mua skin</button>';
    } else if (equipped) {
      button = '<button class="wardrobe-button wardrobe-button-equipped" type="button" disabled>' +
        'Đang mặc</button>';
    } else {
      button = '<button class="wardrobe-button wardrobe-button-gold" type="button"' +
        ' data-wardrobe-action="wear-skin" data-id="' + escapeHTML(skin.id) + '">' +
        'Mặc skin này</button>';
    }

    return (
      '<article class="wardrobe-skin-card' + (equipped ? ' is-equipped' : '') + '">' +
        '<div class="wardrobe-skin-card-art"><img src="' + escapeHTML(skin.src) + '"' +
          ' alt="' + escapeHTML(skin.name) + '" loading="lazy"></div>' +
        '<div class="wardrobe-skin-card-info">' +
          '<span class="wardrobe-item-slot">' + escapeHTML(skin.rarity) + '</span>' +
          '<strong>' + escapeHTML(skin.name) + '</strong>' +
          '<span class="wardrobe-item-description">' + escapeHTML(skin.description) + '</span>' +
          '<span class="wardrobe-item-price">' +
            (skin.price > 0 ? escapeHTML(money(skin.price)) : 'Miễn phí') +
          '</span>' + button +
        '</div>' +
      '</article>'
    );
  }

  function renderSkinList(state) {
    var inShop = state.wardrobe.tab === "shop";
    var search = state.wardrobe.search.trim().toLowerCase();
    var skins = SKINS.filter(function (skin) {
      var correctTab = inShop ? !ownsSkin(state, skin.id) : ownsSkin(state, skin.id);
      var matches = (skin.name + " " + skin.description + " " + skin.rarity)
        .toLowerCase().includes(search);
      return correctTab && matches;
    });

    if (skins.length) {
      return skins.map(function (skin) {
        return renderSkinCard(skin, state, inShop);
      }).join("");
    }

    if (inShop) {
      return '<div class="wardrobe-empty-list wardrobe-skin-empty">' +
        '<strong>Không còn skin nào trong cửa hàng</strong>' +
        '<p>Thêm ảnh toàn thân vào assets/characters/player/skin/ và khai báo trong mảng SKINS ở đầu js/wardrobe.js.</p>' +
      '</div>';
    }
    return '<div class="wardrobe-empty-list wardrobe-skin-empty">' +
      '<strong>Không tìm thấy skin</strong><p>Thử từ khóa khác.</p></div>';
  }

  function renderPage(state) {
    var wardrobe = prepareState(state);
    var currentSkin = findSkin(wardrobe.skinId) || findSkin(DEFAULT_SKIN_ID);
    var ownedCount = SKINS.filter(function (skin) {
      return ownsSkin(state, skin.id);
    }).length;
    var tab = wardrobe.tab === "shop" ? "shop" : "closet";

    return (
      '<section class="wardrobe-page wardrobe-skin-page">' +
        '<header class="wardrobe-heading"><div>' +
          '<span class="wardrobe-eyebrow">APX PERSONAL STYLE</span>' +
          '<h1>Phòng thay đồ</h1>' +
          '<p>Chọn skin nguyên bộ để thay toàn bộ diện mạo nhân vật.</p>' +
        '</div><div class="wardrobe-cash-card"><span>TIỀN HIỆN CÓ</span>' +
          '<strong>' + escapeHTML(money(state.cash)) + '</strong></div></header>' +
        '<div class="wardrobe-layout wardrobe-skin-layout">' +
          '<section class="wardrobe-preview-panel panel">' +
            '<div class="wardrobe-panel-heading"><div>' +
              '<span class="wardrobe-eyebrow">NHÂN VẬT CỦA BẠN</span>' +
              '<h2>Xem trước skin</h2></div>' +
              '<span class="wardrobe-live-pill"><i></i> ĐANG HOẠT ĐỘNG</span></div>' +
            renderCharacter(state) +
            '<div class="wardrobe-current-skin"><span>ĐANG MẶC</span>' +
              '<strong>' + escapeHTML(currentSkin.name) + '</strong>' +
              '<p>Mỗi skin là một ảnh nhân vật hoàn chỉnh. Chọn skin khác sẽ thay cả ảnh.</p></div>' +
          '</section>' +
          '<section class="wardrobe-closet-panel panel">' +
            '<div class="wardrobe-panel-heading"><div>' +
              '<span class="wardrobe-eyebrow">BỘ SƯU TẬP NHÂN VẬT</span>' +
              '<h2>Skin nguyên bộ</h2></div>' +
              '<span class="wardrobe-owned-count">' + ownedCount + ' skin sở hữu</span></div>' +
            '<div class="wardrobe-tabs">' +
              '<button class="wardrobe-tab' + (tab === 'closet' ? ' is-active' : '') + '"' +
                ' type="button" data-wardrobe-action="tab" data-value="closet">Đã sở hữu</button>' +
              '<button class="wardrobe-tab' + (tab === 'shop' ? ' is-active' : '') + '"' +
                ' type="button" data-wardrobe-action="tab" data-value="shop">Cửa hàng</button>' +
            '</div>' +
            '<label class="wardrobe-search-label" for="wardrobeSkinSearch">Tìm skin</label>' +
            '<input class="wardrobe-search" id="wardrobeSkinSearch" type="search"' +
              ' autocomplete="off" placeholder="Nhập tên skin..." value="' + escapeHTML(wardrobe.search) + '">' +
            '<div class="wardrobe-skin-list">' + renderSkinList(state) + '</div>' +
            '<p class="wardrobe-skin-note">Ảnh áo, tóc hoặc quần rời không ghép được; mỗi skin cần là ảnh toàn thân.</p>' +
          '</section>' +
        '</div>' +
        '<p class="wardrobe-footnote">Skin đã mua sẽ xuất hiện trong Túi đồ → Trang bị.</p>' +
      '</section>'
    );
  }

  function saveAndRender(message) {
    window.APXGame.save();
    window.APXGame.render();
    window.setTimeout(syncPlayerAvatars, 0);
    if (message && typeof window.APXGame.toast === "function") {
      window.APXGame.toast(message);
    }
  }

  function handleClick(event) {
    var button = event.target.closest("[data-wardrobe-action]");
    if (!button || !window.APXGame) return;

    var state = window.APXGame.state;
    var wardrobe = prepareState(state);
    var action = button.dataset.wardrobeAction;

    if (action === "tab") {
      wardrobe.tab = button.dataset.value === "shop" ? "shop" : "closet";
      saveAndRender();
      return;
    }

    var skin = findSkin(button.dataset.id);
    if (!skin) return;

    if (action === "wear-skin") {
      if (!ownsSkin(state, skin.id)) return;
      if (window.APXCharacter) window.APXCharacter.equipSkin(skin.id);
      else wardrobe.skinId = skin.id;
      saveAndRender('Đã mặc skin "' + skin.name + '".');
      return;
    }

    if (action === "buy-skin") {
      if (window.APXCharacter) {
        var result = window.APXCharacter.buySkin(skin.id);
        if (!result.ok) {
          if (typeof window.APXGame.toast === "function") window.APXGame.toast(result.message, "warning");
          return;
        }
        saveAndRender(result.message);
      } else {
        if (ownsSkin(state, skin.id) || Number(state.cash) < skin.price) return;
        state.cash -= skin.price;
        state.inventory[skin.id] = 1;
        saveAndRender('Đã mua skin "' + skin.name + '".');
      }
    }
  }

  function handleSearch(event) {
    if (event.target.id !== "wardrobeSkinSearch" || !window.APXGame) return;
    var state = window.APXGame.state;
    var wardrobe = prepareState(state);
    var cursor = event.target.selectionStart;
    wardrobe.search = event.target.value;
    window.APXGame.save();
    window.APXGame.render();

    var input = document.getElementById("wardrobeSkinSearch");
    if (input) {
      input.focus();
      try { input.setSelectionRange(cursor, cursor); } catch (error) { /* Bỏ qua */ }
    }
  }

  addSkinsToInventoryCatalog();

  // Thêm liên kết Phòng thay đồ vào nhóm Nhân vật nếu chưa có.
  if (Array.isArray(window.APX_NAVIGATION)) {
    var characterSection = window.APX_NAVIGATION.find(function (section) {
      return section.id === "character";
    });
    if (characterSection && !characterSection.pages.some(function (page) {
      return page.id === "wardrobe";
    })) {
      characterSection.pages.push({ id: "wardrobe", label: "Phòng thay đồ" });
    }
  }

  var originalCharacterPage = window.APXPages.character;
  window.APXPages.character = function (page, state) {
    if (page === "wardrobe") {
      var html = renderPage(state);
      window.setTimeout(syncCharacterImage, 0);
      return html;
    }
    if (typeof originalCharacterPage === "function") {
      return originalCharacterPage(page, state);
    }
    return '<section class="panel"><h1>Hồ sơ nhân vật</h1></section>';
  };

  // Cho phép hệ thống nhân viên/NPC dùng chung danh sách skin về sau.
  window.APXWardrobe = {
    skins: SKINS,
    findSkin: findSkin,
    ownsSkin: ownsSkin,
    setSkin: function (state, skinId) {
      if (!findSkin(skinId) || !ownsSkin(state, skinId)) return false;
      if (window.APXCharacter) return window.APXCharacter.equipSkin(skinId);
      prepareState(state).skinId = skinId;
      return true;
    }
  };

  document.addEventListener("click", handleClick);
  document.addEventListener("input", handleSearch);

  // main.js đã chạy trước file này, nên render lại để menu vừa thêm xuất hiện.
  if (window.APXGame && typeof window.APXGame.render === "function") {
    window.APXGame.render();
    window.setTimeout(syncPlayerAvatars, 0);
  }
})();
