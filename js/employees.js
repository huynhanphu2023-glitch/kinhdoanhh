/* =========================================================
   APX BUSINESS WORLD — KHU VỰC NHÂN VIÊN
   Gồm danh sách nhân viên, tuyển dụng, phòng ban và đào tạo.
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
        '<span class="eyebrow">APX GROUP · NHÂN SỰ</span>' +
        "<h1>" + title + "</h1>" +
        "<p>" + description + "</p>" +
      "</header>"
    );
  }

  function allPeople(state) {
    var hiredPeople = state.hired.map(function (candidateId) {
      var candidate = window.APX_DATA.candidates.find(function (candidate) {
        return candidate.id === candidateId;
      });
      return candidate && window.APXCompanies
        ? window.APXCompanies.hydrateEmployee(state, candidate)
        : candidate;
    }).filter(Boolean);

    return window.APX_DATA.employees.concat(hiredPeople);
  }

  function totalGroupEmployees(state) {
    if (window.APXCompanies) {
      return window.APXCompanies.getCompanySummary(state).employees;
    }
    var companyStaff = window.APX_DATA.companies.reduce(function (sum, company) {
      return sum + company.staff;
    }, 0);

    return companyStaff + state.hired.length;
  }

  function portraitIndexFor(person) {
    var ownIndex = Number(person.portraitIndex);

    if (isFinite(ownIndex) && ownIndex >= 0 && ownIndex < 50) {
      return Math.floor(ownIndex);
    }

    var roster = window.APX_DATA.employees || [];
    var matchingEmployee = roster.find(function (employee) {
      return employee.name === person.name &&
        isFinite(Number(employee.portraitIndex));
    });

    if (matchingEmployee) {
      return Math.floor(Number(matchingEmployee.portraitIndex));
    }

    return -1;
  }

  function portraitMarkup(person, extraClass, size) {
    var portraitIndex = portraitIndexFor(person);
    var initials = person.initials || person.name.slice(0, 1);
    var className = "portrait " + (extraClass || "");

    if (portraitIndex < 0) {
      return (
        '<span class="' + safeText(className) + '">' +
          safeText(initials) +
        "</span>"
      );
    }

    var column = portraitIndex % 10;
    var row = Math.floor(portraitIndex / 10);
    var xPosition = (column / 9) * 100;
    var yPosition = row * (400 / 17);
    var avatarSize = Number(size) || 58;

    var portraitStyle = [
      "display:inline-flex",
      "width:" + avatarSize + "px",
      "height:" + avatarSize + "px",
      "flex:0 0 " + avatarSize + "px",
      "overflow:hidden",
      "background-color:#14262d",
      "background-image:url(assets/portraits/employee-sheet.png)",
      "background-repeat:no-repeat",
      "background-size:1000% auto",
      "background-position:" + xPosition.toFixed(2) + "% " +
        yPosition.toFixed(2) + "%",
      "border:1px solid rgba(216,187,113,.45)",
      "border-radius:14px",
      "box-shadow:0 8px 20px rgba(0,0,0,.22)"
    ].join(";");

    return (
      '<span class="' + safeText(className + " portrait-photo") + '"' +
        ' role="img"' +
        ' aria-label="Chân dung ' + safeText(person.name) + '"' +
        ' title="' + safeText(person.name) + '"' +
        ' style="' + portraitStyle + '">' +
      "</span>"
    );
  }

  function directoryPage(state) {
    var search = String(state.employeeSearch || "").trim().toLowerCase();
    var people = allPeople(state).filter(function (person) {
      var name = person.name.toLowerCase();
      var role = person.role.toLowerCase();
      var department = (person.department || "").toLowerCase();

      return !search ||
        name.includes(search) ||
        role.includes(search) ||
        department.includes(search);
    });

    return (
      pageHeading(
        "Danh sách nhân viên",
        "Tìm kiếm hồ sơ mẫu trong hệ thống nhân sự của APX."
      ) +

      '<section class="employee-summary-grid grid three">' +
        '<article class="metric"><small>NHÂN SỰ TOÀN TẬP ĐOÀN</small>' +
          "<strong>" + totalGroupEmployees(state) + "</strong>" +
          '<span class="metric-detail">Theo dữ liệu quy mô công ty</span></article>' +
        '<article class="metric"><small>HỒ SƠ ĐANG HIỂN THỊ</small>' +
          "<strong>" + people.length + "</strong>" +
          '<span class="metric-detail">Hồ sơ nhân viên mẫu</span></article>' +
        '<article class="metric"><small>ĐÃ TUYỂN THÊM</small>' +
          "<strong>" + state.hired.length + "</strong>" +
          '<span class="metric-detail">Ứng viên tuyển qua trang này</span></article>' +
      "</section>" +

      '<section class="employee-toolbar panel">' +
        '<label for="employeeSearch">' +
          '<span class="eyebrow">TRA CỨU HỒ SƠ</span>' +
          "<strong>Tìm nhân viên theo tên, chức vụ hoặc phòng ban</strong>" +
        "</label>" +
        '<input id="employeeSearch" type="search" autocomplete="off" ' +
          'placeholder="Ví dụ: An Phú, Marketing..." value="' +
          safeText(state.employeeSearch || "") + '">' +
      "</section>" +

      (people.length
        ? '<section class="employee-directory-grid grid two" aria-label="Hồ sơ nhân viên">' +
            people.map(employeeCard).join("") +
          "</section>"
        : '<section class="employee-empty panel">' +
            '<span class="empty-state-mark" aria-hidden="true">—</span>' +
            "<h2>Không tìm thấy nhân viên</h2>" +
            "<p>Thử tên, chức vụ hoặc phòng ban khác.</p>" +
          "</section>")
    );
  }

  function employeeCard(person) {
    var skills = (person.skills || []).map(function (skill) {
      return '<span class="employee-skill-chip">' + safeText(skill) + "</span>";
    }).join("");

    var performance = Math.max(0, Math.min(100, Number(person.performance) || 0));

    return (
      '<article class="employee-card panel">' +
        '<details class="employee-details">' +
          '<summary class="employee-summary">' +
            portraitMarkup(person, "employee-portrait", 58) +

            '<span class="employee-summary-copy">' +
              "<strong>" + safeText(person.name) + "</strong>" +
              "<small>" + safeText(person.role) + "</small>" +
            "</span>" +

            '<span class="employee-level">CẤP ' +
              safeText(person.level || 1) + "</span>" +

            '<span class="employee-expand-mark" aria-hidden="true">+</span>' +
          "</summary>" +

          '<div class="employee-profile-detail">' +
            '<div class="data-row"><span>Phòng ban</span><strong>' +
              safeText(person.department || "Chưa phân công") + "</strong></div>" +
            '<div class="data-row"><span>Công ty</span><strong>' +
              safeText(person.company || "APX Group") + "</strong></div>" +
            '<div class="data-row"><span>Nơi làm việc</span><strong>' +
              safeText(person.branch || "Chưa phân công") + "</strong></div>" +
            '<div class="data-row"><span>Lương tháng</span><strong>' +
              window.APXUI.money(person.salary) + "</strong></div>" +

            '<div class="employee-performance">' +
              '<div class="employee-performance-heading">' +
                "<span>Hiệu suất mẫu</span><strong>" + performance + " / 100</strong>" +
              "</div>" +
              '<div class="progress" role="progressbar" aria-label="Hiệu suất ' +
                safeText(person.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
                performance + '">' +
                '<span style="width:' + performance + '%"></span>' +
              "</div>" +
            "</div>" +

            '<div class="employee-skill-list">' +
              "<small>KỸ NĂNG</small>" +
              (skills || "<span>Chưa có thông tin kỹ năng.</span>") +
            "</div>" +
          "</div>" +
        "</details>" +
      "</article>"
    );
  }

  function hiringPage(state) {
    var availableCandidates = window.APX_DATA.candidates.filter(function (candidate) {
      return !state.hired.includes(candidate.id);
    });
    var employeeLimit = window.APXCharacter
      ? window.APXCharacter.getEmployeeLimit(state)
      : Math.max(4, state.hired.length + 4);
    var hireLimitReached = state.hired.length >= employeeLimit;

    return (
      pageHeading(
        "Tuyển dụng",
        "Xem hồ sơ ứng viên và bổ sung nhân sự cho tập đoàn."
      ) +

      '<section class="hiring-intro panel">' +
        '<span class="hiring-intro-mark" aria-hidden="true">HR</span>' +
        "<div><span class=\"eyebrow\">APX TALENT NETWORK</span>" +
          "<h2>Tìm người phù hợp với đội ngũ</h2>" +
          "<p>Nhân viên được tuyển sẽ xuất hiện trong danh sách. Lương của họ được tính khi đóng ngày.</p></div>" +
        '<span class="hiring-candidate-count">' +
          availableCandidates.length + "<small>ỨNG VIÊN MỞ · " + state.hired.length + "/" + employeeLimit + " ĐÃ TUYỂN</small></span>" +
      "</section>" +

      (availableCandidates.length
        ? '<section class="candidate-grid grid two" aria-label="Ứng viên đang tìm việc">' +
            availableCandidates.map(function (candidate) { return candidateCard(candidate, hireLimitReached); }).join("") +
          "</section>"
        : '<section class="employee-empty panel">' +
            '<span class="empty-state-mark" aria-hidden="true">✓</span>' +
            "<h2>Đã tuyển hết ứng viên hiện có</h2>" +
            "<p>Danh sách ứng viên mới có thể được bổ sung sau.</p>" +
          "</section>") +

      '<section class="hiring-note panel">' +
        "<strong>Chi phí nhân sự</strong>" +
        "<p>Mỗi ứng viên có mức lương tháng riêng. Game phân bổ lương thành chi phí theo ngày khi bạn đóng sổ.</p>" +
      "</section>"
    );
  }

  function candidateCard(person, hireLimitReached) {
    var performance = Math.max(0, Math.min(100, Number(person.performance) || 0));
    var skills = (person.skills || []).map(function (skill) {
      return '<span class="employee-skill-chip">' + safeText(skill) + "</span>";
    }).join("");

    return (
      '<article class="candidate-card panel">' +
        '<div class="candidate-heading">' +
          portraitMarkup(person, "candidate-portrait", 58) +
          '<span class="candidate-heading-copy">' +
            '<span class="eyebrow">ỨNG VIÊN · CẤP ' + safeText(person.level || 1) + "</span>" +
            "<h2>" + safeText(person.name) + "</h2>" +
            "<p>" + safeText(person.role) + "</p>" +
          "</span>" +
        "</div>" +

        '<div class="candidate-facts">' +
          '<div><small>PHÒNG BAN</small><strong>' +
            safeText(person.department) + "</strong></div>" +
          '<div><small>LƯƠNG THÁNG</small><strong>' +
            window.APXUI.money(person.salary) + "</strong></div>" +
        "</div>" +

        '<div class="candidate-performance">' +
          '<div class="employee-performance-heading">' +
            "<span>Đánh giá hồ sơ</span><strong>" + performance + " / 100</strong>" +
          "</div>" +
          '<div class="progress" role="progressbar" aria-label="Đánh giá ' +
            safeText(person.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
            performance + '">' +
            '<span style="width:' + performance + '%"></span>' +
          "</div>" +
        "</div>" +

        '<div class="employee-skill-list">' +
          "<small>KỸ NĂNG NỔI BẬT</small>" +
          skills +
        "</div>" +

        '<div class="candidate-actions">' +
          '<button class="button button-gold" type="button" data-action="hire" data-id="' +
            safeText(person.id) + '"' + (hireLimitReached ? ' disabled title="Tăng cấp hoặc kỹ năng Lãnh đạo để mở thêm chỗ"' : '') + '>' +
            (hireLimitReached ? 'Đã đạt giới hạn nhân sự' : 'Tuyển dụng') + '</button>' +
        "</div>" +
      "</article>"
    );
  }

  function departmentsPage(state) {
    var people = allPeople(state);
    var departments = (window.APX_DATA.departments || []).slice();

    people.forEach(function (person) {
      if (person.department && departments.indexOf(person.department) === -1) {
        departments.push(person.department);
      }
    });

    return (
      pageHeading(
        "Phòng ban",
        "Các bộ phận chuyên môn trong hệ sinh thái APX."
      ) +

      '<section class="department-intro panel">' +
        '<span class="eyebrow">CƠ CẤU TỔ CHỨC</span>' +
        "<h2>Nhóm và chức năng</h2>" +
        "<p>Số lượng dưới đây dựa trên các hồ sơ nhân sự mẫu đang được hiển thị.</p>" +
      "</section>" +

      '<section class="department-grid grid three" aria-label="Các phòng ban">' +
        departments.map(function (department, index) {
          var members = people.filter(function (person) {
            return person.department === department;
          });

          var portraits = members.slice(0, 4).map(function (person) {
            return portraitMarkup(person, "department-avatar", 34);
          }).join("");

          return (
            '<article class="department-card panel">' +
              '<div class="department-card-top">' +
                '<span class="department-index">' +
                  String(index + 1).padStart(2, "0") +
                "</span>" +
                '<span class="department-member-count">' +
                  members.length + " hồ sơ</span>" +
              "</div>" +
              "<h3>" + safeText(department) + "</h3>" +
              "<p>" + departmentDescription(department) + "</p>" +
              '<div class="department-team">' +
                (portraits || '<span class="department-empty">Chưa có hồ sơ mẫu</span>') +
              "</div>" +
              (members.length
                ? '<div class="department-member-list">' +
                    members.map(function (person) {
                      return '<div class="data-row"><span>' +
                        safeText(person.name) + "<small>" + safeText(person.role) +
                        "</small></span><strong>" + safeText(person.level || 1) +
                        "</strong></div>";
                    }).join("") +
                  "</div>"
                : "") +
            "</article>"
          );
        }).join("") +
      "</section>"
    );
  }

  function departmentDescription(name) {
    var descriptions = {
      "Ban giám đốc": "Định hướng chiến lược và mục tiêu chung của tập đoàn.",
      "Kinh doanh": "Phát triển quan hệ khách hàng và mở rộng hoạt động thương mại.",
      "Tài chính": "Theo dõi ngân sách, báo cáo và quyết định đầu tư.",
      "Marketing": "Phát triển thương hiệu và kết nối với khách hàng.",
      "Nhân sự": "Tuyển dụng, đào tạo và hỗ trợ đội ngũ.",
      "Công nghệ": "Xây dựng sản phẩm số và hạ tầng công nghệ.",
      "Dự án": "Lập kế hoạch và điều phối các dự án của tập đoàn.",
      "Vận hành": "Đảm bảo công ty và chi nhánh hoạt động ổn định."
    };

    return descriptions[name] || "Bộ phận chuyên môn của APX Group.";
  }

  function trainingPage() {
    var programs = [
      {
        id: "leadership",
        name: "Lãnh đạo đội nhóm",
        category: "QUẢN LÝ",
        duration: "5 ngày",
        description: "Kỹ năng giao việc, phản hồi và hỗ trợ đội ngũ."
      },
      {
        id: "finance",
        name: "Phân tích tài chính",
        category: "TÀI CHÍNH",
        duration: "3 ngày",
        description: "Đọc báo cáo và đánh giá hiệu quả hoạt động."
      },
      {
        id: "service",
        name: "Trải nghiệm khách hàng",
        category: "VẬN HÀNH",
        duration: "4 ngày",
        description: "Nâng cao chất lượng phục vụ tại các chi nhánh."
      }
    ];

    return (
      pageHeading(
        "Đào tạo",
        "Các chương trình phát triển năng lực cho đội ngũ APX."
      ) +

      '<section class="training-intro panel">' +
        '<span class="training-intro-mark" aria-hidden="true">APX</span>' +
        "<div><span class=\"eyebrow\">APX ACADEMY</span>" +
          "<h2>Học tập và phát triển</h2>" +
          "<p>Danh mục chương trình đã có. Tính năng đăng ký và cập nhật kỹ năng đang được phát triển.</p></div>" +
      "</section>" +

      '<section class="training-grid grid three" aria-label="Chương trình đào tạo">' +
        programs.map(function (program, index) {
          return (
            '<article class="training-card panel">' +
              '<div class="training-card-top">' +
                '<span class="training-index">0' + (index + 1) + "</span>" +
                '<span class="training-category">' + program.category + "</span>" +
              "</div>" +
              "<h3>" + program.name + "</h3>" +
              "<p>" + program.description + "</p>" +
              '<div class="training-duration"><small>THỜI LƯỢNG</small><strong>' +
                program.duration + "</strong></div>" +
              '<button class="button training-disabled" type="button" disabled ' +
                'title="Tính năng này chưa được triển khai">ĐANG PHÁT TRIỂN</button>' +
            "</article>"
          );
        }).join("") +
      "</section>"
    );
  }

  window.APXPages.employees = function (page, state) {
    if (page === "hiring") {
      return hiringPage(state);
    }

    if (page === "departments") {
      return departmentsPage(state);
    }

    if (page === "training") {
      return trainingPage();
    }

    return directoryPage(state);
  };
})();
