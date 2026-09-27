/* =========================================================
   APX BUSINESS WORLD — ĐIỀU HƯỚNG
   Quản lý 5 khu vực chính, trang con và breadcrumb.
   Nội dung của từng trang được tạo trong các file riêng.
   ========================================================= */

window.APX_NAVIGATION = [
  {
    id: "character",
    label: "Nhân vật",
    icon: "icon-grid",
    pages: [
      { id: "profile", label: "Hồ sơ cá nhân" },
      { id: "skills", label: "Kỹ năng" },
      { id: "assets", label: "Tài sản cá nhân" },
      { id: "achievements", label: "Thành tựu" }
    ]
  },
  {
    id: "city",
    label: "Thành phố",
    icon: "icon-city",
    pages: [
      { id: "map", label: "Bản đồ thành phố" },
      { id: "properties", label: "Bất động sản" },
      { id: "build", label: "Xây dựng" },
      { id: "market", label: "Thị trường" }
    ]
  },
  {
    id: "company",
    label: "Công ty",
    icon: "icon-company",
    pages: [
      { id: "overview", label: "Tổng quan tập đoàn" },
      { id: "companies", label: "Danh sách công ty" },
      { id: "finance", label: "Tài chính" },
      { id: "market", label: "Thị trường" }
    ]
  },
  {
    id: "inventory",
    label: "Túi đồ",
    icon: "icon-bag",
    pages: [
      { id: "all", label: "Tất cả vật phẩm" },
      { id: "equipment", label: "Trang bị" },
      { id: "materials", label: "Nguyên vật liệu" },
      { id: "documents", label: "Tài liệu và hợp đồng" }
    ]
  },
  {
    id: "employees",
    label: "Nhân viên",
    icon: "icon-users",
    pages: [
      { id: "directory", label: "Danh sách nhân viên" },
      { id: "hiring", label: "Tuyển dụng" },
      { id: "departments", label: "Phòng ban" },
      { id: "training", label: "Đào tạo" }
    ]
  },
  {
    id: "account",
    label: "Tài khoản",
    icon: "icon-users",
    pages: [
      { id: "profile", label: "Đăng nhập và hồ sơ" },
      { id: "reports", label: "Báo cáo người chơi" },
      { id: "admin", label: "Quản trị Admin", adminOnly: true }
    ]
  }
];

/*
  Hàm tìm một khu vực theo mã.
  Ví dụ: getSection("city") trả về dữ liệu điều hướng Thành phố.
*/
function apxFindSection(sectionId) {
  return window.APX_NAVIGATION.find(function (section) {
    return section.id === sectionId;
  });
}

/*
  Hàm tìm trang con theo mã khu vực và mã trang.
  Ví dụ: getPage("city", "build") trả về trang Xây dựng.
*/
function apxFindPage(sectionId, pageId) {
  var section = apxFindSection(sectionId);

  if (!section) {
    return null;
  }

  return section.pages.find(function (page) {
    return page.id === pageId;
  }) || null;
}

window.APXNav = {
  /*
    Lấy khu vực theo mã để các file khác có thể tra cứu.
  */
  getSection: function (sectionId) {
    return apxFindSection(sectionId);
  },

  /*
    Lấy trang con theo mã.
  */
  getPage: function (sectionId, pageId) {
    return apxFindPage(sectionId, pageId);
  },

  /*
    Chuẩn hóa đường dẫn đang lưu.
    Nếu đường dẫn bị thiếu hoặc không hợp lệ, quay về Hồ sơ nhân vật.
  */
  normalize: function () {
    var state = window.APXGame.state;

    if (!state.route || typeof state.route !== "object") {
      state.route = {
        section: "character",
        page: "profile"
      };
      return state.route;
    }

    var section = apxFindSection(state.route.section);

    if (!section) {
      state.route = {
        section: "character",
        page: "profile"
      };
      return state.route;
    }

    var page = apxFindPage(state.route.section, state.route.page);

    if (state.route.section === "account" && state.route.page === "admin" &&
        !(window.APXAccount && window.APXAccount.isAdmin())) {
      state.route.page = "profile";
      page = apxFindPage("account", "profile");
    }

    if (!page) {
      state.route.page = section.pages[0].id;
    }

    return state.route;
  },

  /*
    Chuyển khu vực hoặc trang con.
    Nếu không truyền pageId, mở trang con đầu tiên của khu vực đó.
  */
  go: function (sectionId, pageId) {
    var section = apxFindSection(sectionId);

    if (!section) {
      return;
    }

    var targetPage = pageId
      ? apxFindPage(sectionId, pageId)
      : section.pages[0];

    if (!targetPage) {
      targetPage = section.pages[0];
    }

    window.APXGame.state.route = {
      section: section.id,
      page: targetPage.id
    };

    window.APXGame.save();
    window.APXGame.render();
  },

  /*
    Tạo menu khu vực chính, menu trang con và breadcrumb.
    Hàm này được main.js gọi mỗi lần đổi trang.
  */
  render: function () {
    var route = this.normalize();
    var activeSection = apxFindSection(route.section);

    if (!activeSection) {
      return;
    }

    var primaryNav = document.getElementById("primaryNav");
    var secondaryNav = document.getElementById("secondaryNav");
    var breadcrumb = document.getElementById("breadcrumb");

    if (!primaryNav || !secondaryNav || !breadcrumb) {
      return;
    }

    /*
      Tạo 5 nút khu vực chính.
      data-action và data-section được main.js đọc khi người chơi bấm.
    */
    var visibleSections = window.APX_NAVIGATION;
    primaryNav.innerHTML = visibleSections.map(function (section) {
      var isActive = section.id === route.section;
      var activeClass = isActive ? " active" : "";
      var currentPage = isActive ? ' aria-current="page"' : "";

      return (
        '<button class="nav-button' + activeClass + '"' +
          ' type="button"' +
          ' data-action="section"' +
          ' data-section="' + section.id + '"' +
          ' aria-label="Mở khu vực ' + section.label + '"' +
          currentPage +
        '>' +
          '<svg class="icon nav-icon" aria-hidden="true">' +
            '<use href="#' + section.icon + '"></use>' +
          '</svg>' +
          '<span class="nav-label">' + section.label + '</span>' +
        '</button>'
      );
    }).join("");

    /*
      Tạo các trang con thuộc khu vực hiện tại.
      Số thứ tự giúp phân biệt các mục khi nhìn nhanh.
    */
    var visiblePages = activeSection.pages.filter(function (page) {
      return !page.adminOnly || (window.APXAccount && window.APXAccount.isAdmin());
    });
    secondaryNav.innerHTML = visiblePages.map(function (page, index) {
      var isActive = page.id === route.page;
      var activeClass = isActive ? " active" : "";
      var currentPage = isActive ? ' aria-current="page"' : "";
      var pageNumber = String(index + 1).padStart(2, "0");

      return (
        '<button class="nav-button sub' + activeClass + '"' +
          ' type="button"' +
          ' data-action="page"' +
          ' data-page="' + page.id + '"' +
          currentPage +
        '>' +
          '<span class="nav-page-index" aria-hidden="true">' + pageNumber + '</span>' +
          '<span class="nav-label">' + page.label + '</span>' +
        '</button>'
      );
    }).join("");

    /*
      Dùng textContent để chỉ hiển thị đường dẫn,
      không chèn HTML do người dùng nhập vào.
    */
    var activePage = apxFindPage(route.section, route.page);

    breadcrumb.textContent = activePage
      ? activeSection.label + "  /  " + activePage.label
      : activeSection.label;
  }
};
