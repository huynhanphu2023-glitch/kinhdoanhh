/* =========================================================
   APX BUSINESS WORLD — KHU VỰC THÀNH PHỐ
   Gồm bản đồ, bất động sản, xây dựng và thị trường.
   ========================================================= */

window.APXPages = window.APXPages || {};

(function () {
  function pageHeading(title, description) {
    return (
      '<header class="page-heading">' +
        '<span class="eyebrow">THÀNH PHỐ · QUY HOẠCH ĐÔ THỊ</span>' +
        "<h1>" + title + "</h1>" +
        "<p>" + description + "</p>" +
      "</header>"
    );
  }

  function summaryMetric(label, value, detail) {
    return (
      '<article class="metric">' +
        "<small>" + label + "</small>" +
        "<strong>" + value + "</strong>" +
        (detail ? '<span class="metric-detail">' + detail + "</span>" : "") +
      "</article>"
    );
  }

  function ownedBuildings(state) {
    return window.APX_DATA.buildings.filter(function (building) {
      return building.owned || state.buildings.includes(building.id) ||
        Boolean((state.companyBuildingOwnership || {})[building.id]);
    });
  }

function mapPage(state) {
  var buildings = window.APX_DATA.buildings;

  var positions = {
    "city-park": { x: 15, y: 27 },
    "tower": { x: 38, y: 27 },
    "coffee-shop": { x: 60, y: 27 },
    "market-lot": { x: 84, y: 27 },
    "riverside-studio": { x: 88, y: 63 },
    "lumen-residences": { x: 34, y: 69 },
    "tech-lab": { x: 70, y: 68 }
  };

  /*
    Bản đồ minh họa SVG tự vẽ:
    có sông, công viên, đường và các cụm công trình isometric.
  */
  var cityArtwork = `
    <svg
      class="city-map-art"
      viewBox="0 0 1280 620"
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="Minh họa thành phố APX nhìn từ trên cao"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="city-land" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#23463f"/>
          <stop offset=".55" stop-color="#193931"/>
          <stop offset="1" stop-color="#142c2e"/>
        </linearGradient>

        <linearGradient id="city-water" x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stop-color="#24515a"/>
          <stop offset=".55" stop-color="#183c4a"/>
          <stop offset="1" stop-color="#102b3a"/>
        </linearGradient>

        <linearGradient id="city-road" x1="0" y1="0" x2="1" y2=".4">
          <stop offset="0" stop-color="#455457"/>
          <stop offset=".5" stop-color="#344548"/>
          <stop offset="1" stop-color="#2c3d42"/>
        </linearGradient>

        <linearGradient id="city-roof-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#ddc67f"/>
          <stop offset="1" stop-color="#9e8550"/>
        </linearGradient>

        <linearGradient id="city-building-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#76aaa5"/>
          <stop offset=".45" stop-color="#38646a"/>
          <stop offset="1" stop-color="#203f4b"/>
        </linearGradient>

        <pattern id="city-window-pattern" width="16" height="14" patternUnits="userSpaceOnUse">
          <rect x="3" y="3" width="5" height="5" rx="1" fill="#b2d9cb" opacity=".5"/>
          <rect x="10" y="3" width="3" height="5" rx="1" fill="#d9c78e" opacity=".35"/>
        </pattern>

        <filter id="city-shadow" x="-30%" y="-30%" width="160%" height="180%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#071116" flood-opacity=".48"/>
        </filter>
      </defs>

      <!-- Nền đất -->
      <rect width="1280" height="620" fill="url(#city-land)"/>

      <!-- Các khu cây xanh rải quanh thành phố -->
      <path
        d="M0 0H355L329 82L370 132L337 220L273 258L216 222L144 251L83 201L0 220Z"
        fill="#315943"
        opacity=".76"
      />
      <path
        d="M845 0H1280V173L1218 210L1162 188L1105 230L1042 202L1010 145L940 131Z"
        fill="#284b3c"
        opacity=".66"
      />
      <path
        d="M0 409L103 373L177 401L206 470L155 525L59 545L0 514Z"
        fill="#2c503d"
        opacity=".67"
      />

      <!-- Công viên trung tâm -->
      <path
        d="M38 76L185 47L317 100L337 186L257 245L124 231L59 181Z"
        fill="#376847"
        stroke="#7aa77b"
        stroke-opacity=".35"
        stroke-width="3"
      />
      <path
        d="M82 158C126 116 170 108 219 123C254 135 278 160 301 191"
        fill="none"
        stroke="#c5bd8e"
        stroke-opacity=".55"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path
        d="M119 91C144 143 190 177 251 204"
        fill="none"
        stroke="#c5bd8e"
        stroke-opacity=".35"
        stroke-width="4"
        stroke-linecap="round"
      />

      <!-- Sông uốn quanh khu đô thị -->
      <path
        d="M613 620C661 552 708 534 794 546C902 561 929 611 1010 620H1280V391C1214 375 1168 408 1120 439C1059 479 1001 501 916 481C819 458 758 436 693 454C636 470 584 512 552 557Z"
        fill="url(#city-water)"
        stroke="#6da8a4"
        stroke-opacity=".42"
        stroke-width="4"
      />
      <path
        d="M677 590C732 546 797 548 853 565M974 586C1061 600 1121 522 1204 493"
        fill="none"
        stroke="#91c5bd"
        stroke-opacity=".33"
        stroke-width="3"
        stroke-linecap="round"
      />

      <!-- Đường lớn: có viền sáng và mặt đường -->
      <path
        d="M-45 370C178 346 302 300 464 278C647 252 775 279 935 245C1079 215 1174 169 1325 156"
        fill="none"
        stroke="#8c9a8e"
        stroke-opacity=".32"
        stroke-width="92"
        stroke-linecap="round"
      />
      <path
        d="M-45 370C178 346 302 300 464 278C647 252 775 279 935 245C1079 215 1174 169 1325 156"
        fill="none"
        stroke="url(#city-road)"
        stroke-width="80"
        stroke-linecap="round"
      />
      <path
        d="M-45 370C178 346 302 300 464 278C647 252 775 279 935 245C1079 215 1174 169 1325 156"
        fill="none"
        stroke="#d8c985"
        stroke-opacity=".58"
        stroke-width="2"
        stroke-dasharray="16 17"
        stroke-linecap="round"
      />

      <path
        d="M383 -40C400 85 447 173 521 272C591 369 623 454 610 660"
        fill="none"
        stroke="#899890"
        stroke-opacity=".3"
        stroke-width="78"
        stroke-linecap="round"
      />
      <path
        d="M383 -40C400 85 447 173 521 272C591 369 623 454 610 660"
        fill="none"
        stroke="url(#city-road)"
        stroke-width="67"
        stroke-linecap="round"
      />
      <path
        d="M383 -40C400 85 447 173 521 272C591 369 623 454 610 660"
        fill="none"
        stroke="#d8c985"
        stroke-opacity=".42"
        stroke-width="2"
        stroke-dasharray="14 16"
      />

      <path
        d="M847 -30C824 91 848 191 914 283C976 368 1028 445 1042 548"
        fill="none"
        stroke="#81918a"
        stroke-opacity=".24"
        stroke-width="51"
        stroke-linecap="round"
      />
      <path
        d="M847 -30C824 91 848 191 914 283C976 368 1028 445 1042 548"
        fill="none"
        stroke="#35464a"
        stroke-width="43"
        stroke-linecap="round"
      />

      <!-- Các nhánh đường trong khu dân cư -->
      <path d="M85 285L247 325L377 410" fill="none" stroke="#405154" stroke-width="20" stroke-linecap="round"/>
      <path d="M684 92L751 158L801 226" fill="none" stroke="#405154" stroke-width="19" stroke-linecap="round"/>
      <path d="M1001 308L1100 337L1194 328" fill="none" stroke="#405154" stroke-width="19" stroke-linecap="round"/>

      <!-- Cụm APX Tower -->
      <g filter="url(#city-shadow)">
        <path d="M323 191L383 157L443 187L382 224Z" fill="url(#city-roof-gold)"/>
        <path d="M323 191L382 224V318L323 285Z" fill="#25404a"/>
        <path d="M382 224L443 187V281L382 318Z" fill="#365b61"/>
        <path d="M340 199L378 221V294L340 273Z" fill="url(#city-window-pattern)" opacity=".92"/>
        <path d="M394 225L427 205V275L394 294Z" fill="url(#city-window-pattern)" opacity=".8"/>
        <path d="M350 181L382 163L414 179L382 198Z" fill="#ead69a"/>
        <path d="M354 175L382 158L410 174" fill="none" stroke="#fff0bd" stroke-opacity=".6" stroke-width="2"/>
      </g>

      <!-- Khu cửa hàng APX Coffee -->
      <g filter="url(#city-shadow)">
        <path d="M555 142L615 111L674 142L613 176Z" fill="#c98e5c"/>
        <path d="M555 142L613 176V228L555 194Z" fill="#4f4035"/>
        <path d="M613 176L674 142V194L613 228Z" fill="#785b43"/>
        <path d="M568 150L607 173V203L568 181Z" fill="#a9d0c1" opacity=".78"/>
        <path d="M622 179L659 158V188L622 209Z" fill="#c0d8c7" opacity=".72"/>
        <path d="M556 193L613 225L674 191" fill="none" stroke="#e6c68e" stroke-width="5"/>
      </g>

      <!-- Lô thương mại đang mở bán -->
      <g>
        <path d="M1023 139L1085 107L1145 139L1083 174Z" fill="#6e8067" opacity=".9"/>
        <path d="M1023 139L1083 174V226L1023 191Z" fill="#3c5144"/>
        <path d="M1083 174L1145 139V191L1083 226Z" fill="#4f6652"/>
        <path d="M1038 151L1082 176V211M1128 151L1084 177V211"
          fill="none" stroke="#d8c985" stroke-width="3" stroke-dasharray="5 6"/>
        <path d="M1036 144L1084 118L1131 143"
          fill="none" stroke="#e1cc89" stroke-width="2"/>
      </g>

      <!-- Khu căn hộ Lumen -->
      <g filter="url(#city-shadow)">
        <path d="M344 430L402 400L460 431L401 463Z" fill="#9caa91"/>
        <path d="M344 430L401 463V521L344 488Z" fill="#3f5b58"/>
        <path d="M401 463L460 431V489L401 521Z" fill="#52706a"/>
        <path d="M357 441L393 462V495L357 475Z" fill="url(#city-window-pattern)"/>
        <path d="M410 469L446 449V482L410 502Z" fill="url(#city-window-pattern)"/>
        <path d="M362 423L401 402L440 423L401 445Z" fill="#b9c39a"/>
      </g>

      <!-- Trung tâm công nghệ -->
      <g filter="url(#city-shadow)">
        <path d="M817 382L876 351L935 383L875 417Z" fill="#6ba8a5"/>
        <path d="M817 382L875 417V474L817 440Z" fill="#294852"/>
        <path d="M875 417L935 383V439L875 474Z" fill="#38656c"/>
        <path d="M830 393L868 415V451L830 429Z" fill="url(#city-window-pattern)"/>
        <path d="M885 422L921 402V436L885 457Z" fill="url(#city-window-pattern)"/>
        <path d="M839 374L876 354L913 374L876 395Z" fill="#8dc7bd"/>
      </g>

      <!-- Hàng cây trong công viên -->
      <g fill="#5e9662" stroke="#a4c382" stroke-opacity=".4" stroke-width="2">
        <circle cx="83" cy="108" r="13"/>
        <circle cx="119" cy="76" r="10"/>
        <circle cx="157" cy="211" r="14"/>
        <circle cx="216" cy="76" r="12"/>
        <circle cx="277" cy="126" r="15"/>
        <circle cx="85" cy="194" r="11"/>
        <circle cx="250" cy="221" r="10"/>
        <circle cx="179" cy="158" r="9"/>
        <circle cx="72" cy="458" r="12"/>
        <circle cx="119" cy="482" r="9"/>
        <circle cx="1115" cy="73" r="12"/>
        <circle cx="1170" cy="95" r="9"/>
        <circle cx="1227" cy="58" r="13"/>
      </g>

      <!-- Điểm sáng và ký hiệu đường phố -->
      <g fill="#ead69a" opacity=".72">
        <circle cx="283" cy="331" r="3"/>
        <circle cx="493" cy="271" r="3"/>
        <circle cx="713" cy="253" r="3"/>
        <circle cx="957" cy="238" r="3"/>
        <circle cx="529" cy="379" r="3"/>
        <circle cx="902" cy="318" r="3"/>
      </g>

      <!-- Nhãn trang trí trên bản đồ -->
      <g
        fill="#d5d8bf"
        opacity=".65"
        font-family="Segoe UI, Arial, sans-serif"
        font-size="12"
        letter-spacing="3"
      >
        <text x="72" y="294">RIVERSIDE PARK</text>
        <text x="972" y="480">EAST BANK</text>
        <text x="1080" y="277">CENTRAL BOULEVARD</text>
      </g>
    </svg>
  `;

  var mapPins = buildings.map(function (building) {
    var position = positions[building.id] || { x: 50, y: 50 };
    var personallyOwned = !building.owned && state.buildings.includes(building.id);
    var companyOwnerId = (state.companyBuildingOwnership || {})[building.id];
    var companyOwner = companyOwnerId && window.APXCompanies && window.APXCompanies.getCompanyById(companyOwnerId, state);
    var ownedClass = building.owned || personallyOwned || companyOwner ? " map-pin-owned" : " map-pin-market";
    var status = companyOwner ? companyOwner.name.toUpperCase() : (building.owned ? "TÀI SẢN APX" : (personallyOwned ? "SỞ HỮU CÁ NHÂN" : building.status));

    return (
      '<button class="map-pin' + ownedClass + '"' +
        ' type="button"' +
        ' data-action="building"' +
        ' data-id="' + building.id + '"' +
        ' style="--pin-x:' + position.x + "%;--pin-y:" + position.y + '"' +
        ' aria-label="Xem ' + building.name + '">' +
        '<span class="map-pin-icon" aria-hidden="true">' +
          '<i class="map-pin-building"></i>' +
          '<i class="map-pin-glow"></i>' +
        "</span>" +
        '<span class="map-pin-label">' +
          "<strong>" + building.name + "</strong>" +
          "<small>" + status + "</small>" +
        "</span>" +
      "</button>"
    );
  }).join("");

  var ownedCount = buildings.filter(function (building) {
    return building.owned || state.buildings.includes(building.id) ||
      Boolean((state.companyBuildingOwnership || {})[building.id]);
  }).length;

  var saleCount = buildings.filter(function (building) {
    return building.status === "Mở bán" && !state.buildings.includes(building.id) &&
      !(state.companyBuildingOwnership || {})[building.id];
  }).length;

  var projectsInProgress = state.projects.filter(function (project) {
    return project.status === "Đang xây";
  }).length;

  return (
    pageHeading(
      "Bản đồ thành phố",
      "Khám phá khu đô thị, công viên, bờ sông và các công trình của APX."
    ) +

    '<section class="city-overview-strip grid three">' +
      summaryMetric("CÔNG TRÌNH APX", ownedCount, "Đang thuộc hệ sinh thái") +
      summaryMetric("LÔ ĐANG MỞ BÁN", saleCount, "Cơ hội đầu tư mô phỏng") +
      summaryMetric("DỰ ÁN ĐANG THI CÔNG", projectsInProgress, "Theo dõi tiến độ mỗi ngày") +
    "</section>" +

    '<section class="city-map-section panel">' +
      '<div class="city-map-heading">' +
        '<div><span class="eyebrow">KHU ĐÔ THỊ APX</span>' +
          "<h2>Thủ Thiêm và khu vực lân cận</h2></div>" +
        '<span class="map-live-status"><i></i> BẢN ĐỒ ĐANG HOẠT ĐỘNG</span>' +
      "</div>" +

      '<div class="apx-map-scene" role="group" aria-label="Bản đồ công trình APX">' +
        cityArtwork +

        '<div class="map-scene-heading">' +
          "<span>APX URBAN DISTRICT</span>" +
          "<small>THÀNH PHỐ HỒ CHÍ MINH · 2026</small>" +
        "</div>" +

        '<div class="map-north-indicator" aria-hidden="true">' +
          "<span>N</span><i></i>" +
        "</div>" +

        '<div class="map-pin-layer">' + mapPins + "</div>" +

        '<div class="map-scale"><i></i><span>1 KM</span></div>' +
      "</div>" +

      '<div class="map-legend">' +
        '<span><i class="legend-owned"></i> Công trình APX</span>' +
        '<span><i class="legend-sale"></i> Đang mở bán</span>' +
        '<span><i class="legend-green"></i> Công viên và cây xanh</span>' +
        '<span><i class="legend-water"></i> Bờ sông</span>' +
      "</div>" +
    "</section>" +

    '<section class="city-projects-panel panel">' +
      '<div class="section-title-row">' +
        '<div><span class="eyebrow">TIẾN ĐỘ THÀNH PHỐ</span><h2>Dự án của tập đoàn</h2></div>' +
        '<button class="button" type="button" data-action="page" data-page="build">' +
          "Mở trang xây dựng" +
        "</button>" +
      "</div>" +
      renderProjectList(state) +
    "</section>"
  );
}

  function renderProjectList(state) {
    if (!state.projects.length) {
      return (
        '<div class="empty-state">' +
          '<span class="empty-state-mark" aria-hidden="true">—</span>' +
          "<strong>Chưa có dự án mới</strong>" +
          "<p>Chọn một mô hình trong trang Xây dựng để khởi công dự án đầu tiên.</p>" +
        "</div>"
      );
    }

    return (
      '<div class="city-project-list">' +
        state.projects.map(function (project) {
          var daysLeft = Math.max(0, Number(project.daysLeft) || 0);
          var completed = project.status === "Đang hoạt động";
          var progress = completed ? 100 : Math.max(0, Math.min(100, ((5 - daysLeft) / 5) * 100));
          var status = completed ? "Đang hoạt động" : "Đang xây · còn " + daysLeft + " ngày";

          return (
            '<article class="city-project-row">' +
              '<span class="project-mark" aria-hidden="true">APX</span>' +
              '<span class="city-project-copy">' +
                "<strong>" + project.name + "</strong>" +
                "<small>" + status + "</small>" +
                '<span class="progress" role="progressbar" aria-label="Tiến độ ' +
                  project.name + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' +
                  progress + '">' +
                  '<span style="width:' + progress + '%"></span>' +
                "</span>" +
              "</span>" +
              '<span class="city-project-revenue">' +
                "<small>DOANH THU DỰ KIẾN / THÁNG</small>" +
                "<strong>" + window.APXUI.money(project.monthlyRevenue) + "</strong>" +
              "</span>" +
            "</article>"
          );
        }).join("") +
      "</div>"
    );
  }

  function propertyCard(building, state) {
    var personallyOwned = !building.owned && state.buildings.includes(building.id);
    var companyOwnerId = (state.companyBuildingOwnership || {})[building.id];
    var companyOwner = companyOwnerId && window.APXCompanies && window.APXCompanies.getCompanyById(companyOwnerId, state);
    var record = personallyOwned && state.character && state.character.propertyRecords
      ? state.character.propertyRecords[building.id] || {}
      : {};
    var displayedValue = Number(record.currentValue) || Number(building.value) || 0;
    var owner = companyOwner ? companyOwner.name : (personallyOwned
      ? ((state.character && state.character.profile && state.character.profile.customized && state.character.profile.name) || "Người chơi mới")
      : building.owner);
    var status = companyOwner ? "Tài sản công ty" : (personallyOwned ? "Đang sở hữu cá nhân" : building.status);
    var action = "";

    if (companyOwner) {
      action = '<span class="property-status">Được mua bằng ngân quỹ công ty.</span>';
    } else if (personallyOwned) {
      action = '<button class="button property-sell-button" type="button" data-action="sell-building" data-id="' + building.id + '">Bán tài sản</button>';
    } else if (!building.owned && building.status === "Mở bán") {
      var negotiation = window.APXCharacter ? window.APXCharacter.getCharacterSkillEffect("negotiation") : { purchaseDiscount: 0 };
      var reputation = state.character && state.character.reputation ? Number(state.character.reputation.score) || 0 : Number(window.APX_DATA.player.reputation) || 0;
      var discount = Math.max(0, Math.min(0.2, (Number(negotiation.purchaseDiscount) || 0) + reputation * 0.0002));
      var askingPrice = Math.round((Number(building.value) || 0) * (1 - discount));
      action = '<div class="property-purchase"><span>Giá sau ưu đãi đàm phán</span><strong>' + window.APXUI.money(askingPrice) + '</strong><button class="button button-gold" type="button" data-action="buy-building" data-id="' + building.id + '">Mua bằng tiền cá nhân</button></div>';
    }

    return (
      '<article class="property-card panel">' +
        '<div class="property-illustration property-' + building.tone + '">' +
          '<span class="property-illustration-mark">' + building.type + "</span>" +
          '<span class="property-illustration-name">' + building.name + "</span>" +
        "</div>" +
        '<div class="property-card-body">' +
          '<span class="eyebrow">' + building.district + "</span>" +
          "<h3>" + building.name + "</h3>" +
          "<p>" + building.detail + "</p>" +
          '<div class="data-row"><span>Đơn vị sở hữu</span><strong>' + owner + "</strong></div>" +
          '<div class="data-row"><span>Giá trị ước tính</span><strong>' +
            window.APXUI.money(displayedValue) + "</strong></div>" +
          (personallyOwned ? '<div class="data-row"><span>Thu nhập / tháng</span><strong>' + window.APXUI.money(record.monthlyIncome || building.monthlyIncome) + '</strong></div>' : '') +
          '<div class="property-status"><i></i>' + status + "</div>" + action +
        "</div>" +
      "</article>"
    );
  }

  function propertiesPage(state) {
    var owned = ownedBuildings(state);
    var available = window.APX_DATA.buildings.filter(function (building) {
      return building.status === "Mở bán" && !state.buildings.includes(building.id) &&
        !(state.companyBuildingOwnership || {})[building.id];
    });

    return (
      pageHeading(
        "Bất động sản",
        "Danh mục công trình, vị trí và cơ hội đang được chào bán."
      ) +

      '<section class="property-summary grid three">' +
        summaryMetric("CÔNG TRÌNH SỞ HỮU", owned.length, "Trụ sở và tài sản hoạt động") +
        summaryMetric("DỰ ÁN ĐANG XÂY", state.projects.filter(function (project) {
          return project.status === "Đang xây";
        }).length, "Được theo dõi theo ngày") +
        summaryMetric("CƠ HỘI ĐANG BÁN", available.length, "Thông tin thị trường mẫu") +
      "</section>" +

      '<section class="property-section">' +
        '<div class="section-title-row">' +
          "<div><span class=\"eyebrow\">TÀI SẢN APX</span><h2>Công trình đang sở hữu</h2></div>" +
          '<span class="asset-count">' + owned.length + " TÀI SẢN</span>" +
        "</div>" +
        '<div class="property-grid grid two">' +
          owned.map(function (building) { return propertyCard(building, state); }).join("") +
        "</div>" +
      "</section>" +

      '<section class="property-section">' +
        '<div class="section-title-row">' +
          "<div><span class=\"eyebrow\">CƠ HỘI ĐẦU TƯ</span><h2>Bất động sản đang mở bán</h2></div>" +
        "</div>" +
        '<div class="property-grid grid two">' +
          (available.length
            ? available.map(function (building) { return propertyCard(building, state); }).join("")
            : '<article class="panel"><p>Hiện chưa có bất động sản nào được chào bán.</p></article>') +
        "</div>" +
      "</section>" +

      '<section class="property-section">' +
        '<div class="section-title-row">' +
          "<div><span class=\"eyebrow\">DỰ ÁN PHÁT TRIỂN</span><h2>Công trình mới</h2></div>" +
        "</div>" +
        renderProjectList(state) +
      "</section>"
    );
  }

  function projectCard(project, selected) {
    return (
      '<article class="build-option panel' + (selected ? " selected" : "") + '">' +
        '<div class="build-option-art build-art-' + project.tone + '">' +
          '<span class="build-option-art-mark">' + project.type + "</span>" +
          '<span class="build-option-art-shape" aria-hidden="true"></span>' +
        "</div>" +

        '<div class="build-option-content">' +
          '<span class="eyebrow">DỰ ÁN · ' + project.daysToBuild + " NGÀY</span>" +
          "<h3>" + project.name + "</h3>" +
          "<p>" + project.description + "</p>" +

          '<div class="data-row"><span>Vốn xây dựng</span><strong>' +
            window.APXUI.money(project.cost) + "</strong></div>" +
          '<div class="data-row"><span>Doanh thu dự kiến</span><strong>' +
            window.APXUI.money(project.monthlyRevenue) + "/tháng</strong></div>" +

          '<button class="button' + (selected ? " active" : "") + '"' +
            ' type="button"' +
            ' data-action="choose-project"' +
            ' data-id="' + project.id + '"' +
            ' aria-pressed="' + (selected ? "true" : "false") + '">' +
            (selected ? "ĐANG CHỌN" : "Chọn dự án") +
          "</button>" +
        "</div>" +
      "</article>"
    );
  }

  function buildPage(state) {
    var projects = window.APX_DATA.projects;
    var selected = projects.find(function (project) {
      return project.id === state.buildChoice;
    }) || projects[0];
    var companies = window.APXCompanies;
    var projectCompanyId = companies ? companies.companyForProject(selected, state) : "";
    var projectCompany = companies ? companies.getCompanyById(projectCompanyId, state) : null;

    return (
      pageHeading(
        "Xây dựng",
        "Chọn mô hình công trình, xem chi phí và khởi công dự án mới."
      ) +

      '<section class="build-intro panel">' +
        '<span class="build-intro-mark" aria-hidden="true">APX</span>' +
        "<div><span class=\"eyebrow\">BAN PHÁT TRIỂN ĐÔ THỊ</span>" +
          "<h2>Lựa chọn dự án đầu tư</h2>" +
          "<p>Công trình cần thời gian xây dựng. Sau khi hoàn thành, doanh thu và chi phí vận hành được ghi vào công ty phụ trách.</p></div>" +
      "</section>" +

      '<section class="build-budget-grid grid two">' +
        summaryMetric("NGÂN QUỸ " + (projectCompany ? projectCompany.name : "CÔNG TY"), window.APXUI.money(projectCompany ? projectCompany.cash : 0), "Dự án sẽ dùng tiền của công ty phụ trách") +
        summaryMetric(
          "DỰ ÁN HIỆN CÓ",
          state.projects.length,
          state.projects.filter(function (project) {
            return project.status === "Đang hoạt động";
          }).length + " công trình đang vận hành"
        ) +
      "</section>" +

      '<section class="build-project-grid grid three" aria-label="Các mô hình công trình">' +
        projects.map(function (project) {
          return projectCard(project, project.id === selected.id);
        }).join("") +
      "</section>" +

      '<section class="build-confirm panel">' +
        '<div class="build-confirm-copy">' +
          '<span class="eyebrow">DỰ ÁN ĐANG CHỌN · ' + (projectCompany ? projectCompany.name : "CHƯA PHÂN CÔNG") + '</span>' +
          "<h2>" + selected.name + "</h2>" +
          "<p>" + selected.description + "</p>" +
        "</div>" +
        '<div class="build-confirm-numbers">' +
          "<span><small>VỐN CẦN CÓ</small><strong>" + window.APXUI.money(selected.cost) + "</strong></span>" +
          "<span><small>DOANH THU / THÁNG</small><strong>" +
            window.APXUI.money(selected.monthlyRevenue) + "</strong></span>" +
        "</div>" +
        '<button class="button button-gold build-start-button" type="button" data-action="build-project">' +
          "Khởi công dự án" +
        "</button>" +
      "</section>" +

      '<p class="build-footnote">Dự án chỉ khởi công khi công ty phụ trách đủ tiền mặt. Muốn bổ sung vốn, mở trang Công ty → chọn công ty → Kho / Vận hành → Điều chuyển vốn.</p>'
    );
  }

  function marketPage() {
    var market = window.APX_DATA.market || [];

    return (
      pageHeading(
        "Thị trường",
        "Theo dõi các lĩnh vực và cơ hội đang được mô phỏng trong thành phố."
      ) +

      '<section class="market-overview panel">' +
        '<span class="eyebrow">BẢN TIN KHU VỰC</span>' +
        "<h2>Triển vọng đầu tư</h2>" +
        "<p>Thông tin dưới đây dùng làm dữ liệu tham khảo cho thế giới chơi thử.</p>" +
      "</section>" +

      '<section class="market-grid grid three">' +
        market.map(function (sector, index) {
          return (
            '<article class="market-card panel">' +
              '<div class="market-card-top">' +
                '<span class="market-index">0' + (index + 1) + "</span>" +
                '<span class="market-outlook">' + sector.outlook + "</span>" +
              "</div>" +
              '<span class="eyebrow">NGÀNH NGHỀ</span>' +
              "<h3>" + sector.name + "</h3>" +
              "<p>" + sector.description + "</p>" +
            "</article>"
          );
        }).join("") +
      "</section>" +

      '<section class="market-disclaimer panel">' +
        "<strong>Thông tin mô phỏng</strong>" +
        "<p>Triển vọng thị trường hiện là dữ liệu mẫu, chưa làm thay đổi giá đất hoặc doanh thu.</p>" +
      "</section>"
    );
  }

  window.APXPages.city = function (page, state) {
    if (page === "properties") {
      return propertiesPage(state);
    }

    if (page === "build") {
      return buildPage(state);
    }

    if (page === "market") {
      return marketPage();
    }

    return mapPage(state);
  };
})();
