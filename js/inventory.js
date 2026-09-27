/* =========================================================
   APX BUSINESS WORLD — TÚI ĐỒ
   Lọc vật phẩm theo trang con, tìm kiếm và xem chi tiết.
   ========================================================= */

window.APXPages = window.APXPages || {};

(function () {
  function safeText(value) {
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

  function pageHeading(title, description) {
    return (
      '<header class="page-heading">' +
        '<span class="eyebrow">KHO VẬT PHẨM · HỒ SƠ MINH ANH</span>' +
        "<h1>" + title + "</h1>" +
        "<p>" + description + "</p>" +
      "</header>"
    );
  }

  function pageTitle(page) {
    var titles = {
      all: ["Tất cả vật phẩm", "Tất cả vật phẩm hiện có trong túi của bạn."],
      equipment: ["Trang bị", "Trang phục và thiết bị cá nhân."],
      materials: ["Nguyên vật liệu", "Tài nguyên dùng trong các hoạt động kinh doanh."],
      documents: ["Tài liệu và hợp đồng", "Hồ sơ, bản vẽ và giấy tờ của hệ sinh thái APX."]
    };

    return titles[page] || titles.all;
  }

  function itemTypeForPage(page) {
    if (page === "equipment") return "Trang bị";
    if (page === "materials") return "Nguyên liệu";
    if (page === "documents") return "Tài liệu";
    return "";
  }

  function rarityClass(rarity) {
    if (rarity === "Hiếm") return "rarity-rare";
    if (rarity === "Không phổ biến") return "rarity-uncommon";
    if (rarity === "Huyền thoại") return "rarity-legendary";
    return "rarity-common";
  }

  function itemMark(item) {
    if (item.type === "Trang bị") return "TB";
    if (item.type === "Nguyên liệu") return "NL";
    if (item.type === "Tài liệu") return "TL";
    return "APX";
  }

  function itemImagePath(item) {
    var imageFiles = {
      suit: "suit.svg",
      beans: "beans.svg",
      contract: "contract.svg",
      tablet: "tablet.svg",
      blueprint: "blueprint-icon.svg",
      "blueprint-icon": "blueprint-icon.svg",
      materials: "resources.svg",
      resources: "resources.svg"
    };

    var fileName = imageFiles[item.id];

    return fileName ? "assets/items/" + fileName : "";
  }

  function itemArt(item) {
    var imagePath = itemImagePath(item);

    if (imagePath) {
      return '<img class="item-art-image" src="' + imagePath + '" alt="" loading="lazy">';
    }

    return (
      '<span class="item-art-mark">' + itemMark(item) + "</span>" +
      '<i class="item-art-shine"></i>'
    );
  }

  function itemCard(item, quantity) {
    var isMaterial = item.type === "Nguyên liệu" && item.price > 0;
    var rarity = rarityClass(item.rarity);

    return (
      '<article class="inventory-item panel ' + rarity + '">' +
        '<details class="inventory-item-details">' +
          '<summary class="inventory-item-summary">' +

            '<span class="inventory-item-art" aria-hidden="true">' +
              itemArt(item) +
            "</span>" +

            '<span class="inventory-item-main">' +
              '<span class="inventory-item-type">' + safeText(item.type) + "</span>" +
              '<strong class="inventory-item-name">' + safeText(item.name) + "</strong>" +
              '<span class="inventory-item-rarity">' + safeText(item.rarity) + "</span>" +
            "</span>" +

            '<span class="inventory-item-quantity">' +
              "<small>SỐ LƯỢNG</small>" +
              "<strong>" + quantity + "</strong>" +
            "</span>" +

            '<span class="inventory-expand-mark" aria-hidden="true">+</span>' +
          "</summary>" +

          '<div class="inventory-item-detail">' +
            '<div class="item-detail-line">' +
              "<small>MÔ TẢ</small>" +
              "<p>" + safeText(item.description) + "</p>" +
            "</div>" +

            '<div class="item-detail-effect">' +
              '<span class="effect-mark" aria-hidden="true">i</span>' +
              "<span><small>CÔNG DỤNG</small><strong>" +
                safeText(item.effect) + "</strong></span>" +
            "</div>" +

            (item.price > 0
              ? '<div class="item-price-row"><small>GIÁ MUA MỖI ĐƠN VỊ</small><strong>' +
                window.APXUI.money(item.price) + "</strong></div>"
              : "") +
          "</div>" +
        "</details>" +

        (isMaterial
          ? '<div class="inventory-item-actions">' +
              '<span class="inventory-stock-label">Nguyên liệu có thể mua thêm</span>' +
              '<button class="button" type="button" data-action="use-item" data-id="' +
                safeText(item.id) + '">Mua thêm 1</button>' +
            "</div>"
          : "") +
      "</article>"
    );
  }

  function inventoryCategoryButton(label, pageId, activePage, count) {
    var active = pageId === activePage;

    return (
      '<button class="inventory-category' + (active ? " active" : "") + '"' +
        ' type="button"' +
        ' data-action="page"' +
        ' data-page="' + pageId + '"' +
        ' aria-current="' + (active ? "page" : "false") + '">' +
        '<span class="inventory-category-name">' + label + "</span>" +
        '<span class="inventory-category-count">' + count + "</span>" +
      "</button>"
    );
  }

  function inventoryPage(page, state) {
    var selectedTitle = pageTitle(page);
    var selectedType = itemTypeForPage(page);
    var search = String(state.itemSearch || "").trim().toLowerCase();

    var availableItems = window.APX_DATA.items.filter(function (item) {
      var quantity = Number(state.inventory[item.id]) || 0;
      var matchesType = !selectedType || item.type === selectedType;
      var matchesSearch = !search ||
        item.name.toLowerCase().includes(search) ||
        item.type.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search);

      return quantity > 0 && matchesType && matchesSearch;
    });

    var totalQuantity = availableItems.reduce(function (sum, item) {
      return sum + (Number(state.inventory[item.id]) || 0);
    }, 0);

    var materialCount = window.APX_DATA.items.filter(function (item) {
      return item.type === "Nguyên liệu" &&
        (Number(state.inventory[item.id]) || 0) > 0;
    }).length;

    var equipmentCount = window.APX_DATA.items.filter(function (item) {
      return item.type === "Trang bị" &&
        (Number(state.inventory[item.id]) || 0) > 0;
    }).length;

    var documentCount = window.APX_DATA.items.filter(function (item) {
      return item.type === "Tài liệu" &&
        (Number(state.inventory[item.id]) || 0) > 0;
    }).length;

    return (
      pageHeading(selectedTitle[0], selectedTitle[1]) +

      '<section class="inventory-summary-grid grid four" aria-label="Tổng quan kho vật phẩm">' +
        '<article class="metric"><small>VẬT PHẨM ĐANG HIỂN THỊ</small><strong>' +
          availableItems.length + "</strong></article>" +
        '<article class="metric"><small>TỔNG SỐ ĐƠN VỊ</small><strong>' +
          totalQuantity + "</strong></article>" +
        '<article class="metric"><small>TRANG BỊ</small><strong>' +
          equipmentCount + "</strong></article>" +
        '<article class="metric"><small>NGUYÊN LIỆU</small><strong>' +
          materialCount + "</strong></article>" +
      "</section>" +

      '<section class="inventory-workspace">' +

        '<aside class="inventory-sidebar panel" aria-label="Danh mục vật phẩm">' +
          '<span class="eyebrow">DANH MỤC</span>' +
          "<h2>Kho của tôi</h2>" +

          '<div class="inventory-category-list">' +
            inventoryCategoryButton("Tất cả vật phẩm", "all", page, availableItems.length) +
            inventoryCategoryButton("Trang bị", "equipment", page, equipmentCount) +
            inventoryCategoryButton("Nguyên liệu", "materials", page, materialCount) +
            inventoryCategoryButton("Tài liệu và hợp đồng", "documents", page, documentCount) +
          "</div>" +

          '<div class="inventory-sidebar-note">' +
            '<span class="note-mark" aria-hidden="true">i</span>' +
            "<p>Bấm vào một vật phẩm để mở mô tả và công dụng.</p>" +
          "</div>" +
        "</aside>" +

        '<div class="inventory-main">' +
          '<div class="inventory-toolbar">' +
            '<label class="inventory-search-label" for="itemSearch">Tìm vật phẩm</label>' +
            '<input id="itemSearch" type="search" autocomplete="off" ' +
              'placeholder="Nhập tên hoặc loại vật phẩm..." value="' +
              safeText(state.itemSearch || "") + '">' +
            '<span class="inventory-result-count">' +
              availableItems.length + " KẾT QUẢ</span>" +
          "</div>" +

          (availableItems.length
            ? '<div class="inventory-grid">' +
              availableItems.map(function (item) {
                return itemCard(item, Number(state.inventory[item.id]) || 0);
              }).join("") +
              "</div>"
            : '<div class="inventory-empty panel">' +
                '<span class="empty-state-mark" aria-hidden="true">—</span>' +
                "<h2>Không tìm thấy vật phẩm</h2>" +
                "<p>Thử một từ khóa khác hoặc chuyển sang danh mục khác.</p>" +
              "</div>") +
        "</div>" +

      "</section>" +

      '<section class="inventory-footnote panel">' +
        "<strong>Ghi chú kho đồ</strong>" +
        "<p>Số lượng vật phẩm được lưu trong dữ liệu chơi. Nút mua thêm hiện áp dụng cho nguyên liệu có giá bán.</p>" +
      "</section>"
    );
  }

  window.APXPages.inventory = function (page, state) {
    return inventoryPage(page, state);
  };
})();