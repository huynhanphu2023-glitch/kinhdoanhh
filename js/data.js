/* =========================================================
   APX BUSINESS WORLD — DỮ LIỆU BAN ĐẦU
   File này chứa dữ liệu mẫu và trạng thái lúc bắt đầu game.
   Chưa xử lý thao tác bấm nút; việc đó nằm trong main.js.
   ========================================================= */

/* Danh sách 50 nhân vật theo ảnh chân dung.
   portraitIndex đánh số từ trái sang phải, trên xuống dưới. */
var apxEmployeeSeed = [
  {
    name: "An Phú",
    role: "Giám đốc điều hành (CEO)",
    department: "Ban giám đốc",
    company: "APX Group",
    branch: "APX Tower",
    salary: 85000000,
    level: 10,
    performance: 98,
    skills: ["Điều hành tập đoàn", "Chiến lược", "Đầu tư"]
  },
  {
    name: "Minh Anh",
    role: "Trưởng phòng kinh doanh",
    department: "Kinh doanh",
    company: "APX Group",
    branch: "APX Tower",
    salary: 52000000,
    level: 8,
    performance: 95,
    skills: ["Phát triển kinh doanh", "Đàm phán", "Quản lý khách hàng"]
  },
  {
    name: "Thảo Vy",
    role: "Trưởng phòng marketing",
    department: "Marketing",
    company: "APX Group",
    branch: "APX Tower",
    salary: 48000000,
    level: 7,
    performance: 94,
    skills: ["Chiến lược thương hiệu", "Truyền thông", "Nghiên cứu khách hàng"]
  },
  {
    name: "Đình Phong",
    role: "Trưởng phòng tài chính",
    department: "Tài chính",
    company: "APX Group",
    branch: "APX Tower",
    salary: 50000000,
    level: 7,
    performance: 93,
    skills: ["Lập ngân sách", "Phân tích đầu tư", "Quản trị dòng tiền"]
  },
  {
    name: "Ngọc Mai",
    role: "Trưởng phòng nhân sự",
    department: "Nhân sự",
    company: "APX Group",
    branch: "APX Tower",
    salary: 46000000,
    level: 7,
    performance: 92,
    skills: ["Tuyển dụng", "Đào tạo", "Phát triển nhân sự"]
  },
  {
    name: "Hải Đăng",
    role: "Trưởng phòng công nghệ",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 54000000,
    level: 8,
    performance: 96,
    skills: ["Kiến trúc hệ thống", "Quản lý kỹ thuật", "Dữ liệu"]
  },
  {
    name: "Quang Huy",
    role: "Trưởng phòng sản xuất",
    department: "Sản xuất",
    company: "APX Group",
    branch: "APX Tower",
    salary: 43000000,
    level: 7,
    performance: 91,
    skills: ["Quản lý sản xuất", "Kiểm soát tiến độ", "Tối ưu quy trình"]
  },
  {
    name: "Bảo Châu",
    role: "Trưởng phòng dự án",
    department: "Dự án",
    company: "APX Real Estate",
    branch: "Ban dự án Lumen",
    salary: 47000000,
    level: 7,
    performance: 93,
    skills: ["Quản lý dự án", "Điều phối", "Quản trị rủi ro"]
  },
  {
    name: "Tuấn Kiệt",
    role: "Trưởng phòng pháp lý",
    department: "Pháp lý",
    company: "APX Group",
    branch: "APX Tower",
    salary: 49000000,
    level: 7,
    performance: 90,
    skills: ["Pháp luật doanh nghiệp", "Hợp đồng", "Tư vấn pháp lý"]
  },
  {
    name: "Linh Đan",
    role: "Trưởng phòng chăm sóc khách hàng",
    department: "Chăm sóc khách hàng",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 45000000,
    level: 7,
    performance: 92,
    skills: ["Chăm sóc khách hàng", "Quản lý dịch vụ", "Xử lý phản hồi"]
  },
  {
    name: "Đức Anh",
    role: "Kế toán trưởng",
    department: "Tài chính",
    company: "APX Group",
    branch: "APX Tower",
    salary: 40000000,
    level: 6,
    performance: 94,
    skills: ["Kế toán", "Báo cáo tài chính", "Kiểm toán"]
  },
  {
    name: "Phương Nhi",
    role: "Chuyên viên marketing",
    department: "Marketing",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 26000000,
    level: 3,
    performance: 87,
    skills: ["Nội dung", "Mạng xã hội", "Chiến dịch thương hiệu"]
  },
  {
    name: "Hoàng Nam",
    role: "Chuyên viên kinh doanh",
    department: "Kinh doanh",
    company: "APX Group",
    branch: "APX Tower",
    salary: 30000000,
    level: 4,
    performance: 86,
    skills: ["Tư vấn khách hàng", "Bán hàng", "Đàm phán"]
  },
  {
    name: "Gia Hân",
    role: "Chuyên viên nhân sự",
    department: "Nhân sự",
    company: "APX Group",
    branch: "APX Tower",
    salary: 24000000,
    level: 3,
    performance: 84,
    skills: ["Tuyển dụng", "Hồ sơ nhân sự", "Hỗ trợ nhân viên"]
  },
  {
    name: "Nhật Minh",
    role: "Chuyên viên tài chính",
    department: "Tài chính",
    company: "APX Group",
    branch: "APX Tower",
    salary: 32000000,
    level: 4,
    performance: 88,
    skills: ["Phân tích tài chính", "Lập báo cáo", "Dự báo ngân sách"]
  },
  {
    name: "Khánh Linh",
    role: "Chuyên viên công nghệ",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 33000000,
    level: 4,
    performance: 89,
    skills: ["Phát triển phần mềm", "Kiểm thử", "Hỗ trợ hệ thống"]
  },
  {
    name: "Văn Tùng",
    role: "Kỹ sư sản xuất",
    department: "Sản xuất",
    company: "APX Group",
    branch: "APX Tower",
    salary: 31000000,
    level: 4,
    performance: 88,
    skills: ["Quy trình sản xuất", "Vận hành thiết bị", "Kiểm tra chất lượng"]
  },
  {
    name: "Thu Hà",
    role: "Chuyên viên dự án",
    department: "Dự án",
    company: "APX Real Estate",
    branch: "Ban dự án Lumen",
    salary: 29000000,
    level: 4,
    performance: 86,
    skills: ["Theo dõi tiến độ", "Điều phối dự án", "Báo cáo"]
  },
  {
    name: "Mạnh Cường",
    role: "Chuyên viên pháp lý",
    department: "Pháp lý",
    company: "APX Group",
    branch: "APX Tower",
    salary: 34000000,
    level: 5,
    performance: 89,
    skills: ["Rà soát hợp đồng", "Nghiên cứu pháp luật", "Hồ sơ doanh nghiệp"]
  },
  {
    name: "Thanh Trúc",
    role: "Chuyên viên chăm sóc khách hàng",
    department: "Chăm sóc khách hàng",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 25000000,
    level: 3,
    performance: 85,
    skills: ["Tư vấn khách hàng", "Hỗ trợ dịch vụ", "Tiếp nhận phản hồi"]
  },
  {
    name: "Quỳnh Anh",
    role: "Thiết kế đồ họa",
    department: "Thiết kế",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 27000000,
    level: 3,
    performance: 89,
    skills: ["Thiết kế đồ họa", "Nhận diện thương hiệu", "Minh họa"]
  },
  {
    name: "Tiến Dũng",
    role: "Lập trình viên",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 34000000,
    level: 4,
    performance: 91,
    skills: ["JavaScript", "Phát triển ứng dụng", "Cơ sở dữ liệu"]
  },
  {
    name: "Bích Ngọc",
    role: "Content Creator",
    department: "Marketing",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 24000000,
    level: 3,
    performance: 88,
    skills: ["Sáng tạo nội dung", "Chụp ảnh", "Mạng xã hội"]
  },
  {
    name: "Trọng Hải",
    role: "DevOps",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 36000000,
    level: 5,
    performance: 93,
    skills: ["Tự động hóa", "Hạ tầng đám mây", "Triển khai hệ thống"]
  },
  {
    name: "Lan Hương",
    role: "Thiết kế UI/UX",
    department: "Thiết kế",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 31000000,
    level: 4,
    performance: 90,
    skills: ["Thiết kế giao diện", "Nghiên cứu người dùng", "Nguyên mẫu"]
  },
  {
    name: "Đức Trí",
    role: "Chuyên viên phân tích dữ liệu",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 35000000,
    level: 5,
    performance: 92,
    skills: ["Phân tích dữ liệu", "Báo cáo", "Trực quan hóa dữ liệu"]
  },
  {
    name: "Kim Oanh",
    role: "Chuyên viên logistics",
    department: "Vận hành",
    company: "APX Group",
    branch: "APX Tower",
    salary: 28000000,
    level: 4,
    performance: 86,
    skills: ["Điều phối vận chuyển", "Quản lý kho", "Lập kế hoạch"]
  },
  {
    name: "Hữu Phát",
    role: "Nhân viên kho",
    department: "Vận hành",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 18000000,
    level: 2,
    performance: 83,
    skills: ["Kiểm kê", "Sắp xếp hàng hóa", "Quản lý tồn kho"]
  },
  {
    name: "Thùy Dương",
    role: "Trợ lý giám đốc",
    department: "Ban giám đốc",
    company: "APX Group",
    branch: "APX Tower",
    salary: 32000000,
    level: 4,
    performance: 91,
    skills: ["Điều phối lịch trình", "Soạn thảo", "Hỗ trợ điều hành"]
  },
  {
    name: "Quốc Bảo",
    role: "Nhân viên IT hỗ trợ",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 22000000,
    level: 3,
    performance: 85,
    skills: ["Hỗ trợ kỹ thuật", "Quản lý thiết bị", "Xử lý sự cố"]
  },
  {
    name: "Phúc Lâm",
    role: "Nhân viên hành chính",
    department: "Hành chính",
    company: "APX Group",
    branch: "APX Tower",
    salary: 18000000,
    level: 2,
    performance: 82,
    skills: ["Hồ sơ hành chính", "Quản lý văn phòng", "Hỗ trợ nội bộ"]
  },
  {
    name: "Diễm My",
    role: "Nhân viên lễ tân",
    department: "Hành chính",
    company: "APX Group",
    branch: "APX Tower",
    salary: 16000000,
    level: 2,
    performance: 87,
    skills: ["Đón tiếp khách", "Giao tiếp", "Điều phối lịch hẹn"]
  },
  {
    name: "Văn Khánh",
    role: "Bảo vệ",
    department: "An ninh",
    company: "APX Group",
    branch: "APX Tower",
    salary: 15000000,
    level: 2,
    performance: 84,
    skills: ["Kiểm soát ra vào", "An toàn tòa nhà", "Tuần tra"]
  },
  {
    name: "Lê Vy",
    role: "Nhân viên kế hoạch",
    department: "Dự án",
    company: "APX Real Estate",
    branch: "Ban dự án Lumen",
    salary: 26000000,
    level: 3,
    performance: 86,
    skills: ["Lập kế hoạch", "Theo dõi tiến độ", "Tổng hợp báo cáo"]
  },
  {
    name: "Anh Tuấn",
    role: "Nhân viên mua hàng",
    department: "Vận hành",
    company: "APX Group",
    branch: "APX Tower",
    salary: 24000000,
    level: 3,
    performance: 88,
    skills: ["Tìm nhà cung cấp", "Đàm phán giá", "Theo dõi đơn hàng"]
  },
  {
    name: "Mỹ Linh",
    role: "Nhân viên nghiên cứu",
    department: "Nghiên cứu",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 29000000,
    level: 4,
    performance: 90,
    skills: ["Nghiên cứu thị trường", "Phân tích", "Tổng hợp dữ liệu"]
  },
  {
    name: "Gia Bảo",
    role: "Nhân viên kỹ thuật",
    department: "Kỹ thuật",
    company: "APX Real Estate",
    branch: "Ban dự án Lumen",
    salary: 24000000,
    level: 3,
    performance: 87,
    skills: ["Bảo trì thiết bị", "Kiểm tra kỹ thuật", "An toàn công trình"]
  },
  {
    name: "Ngọc Thảo",
    role: "Nhân viên chăm sóc khách hàng",
    department: "Chăm sóc khách hàng",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 21000000,
    level: 3,
    performance: 89,
    skills: ["Hỗ trợ khách hàng", "Giao tiếp", "Giải quyết yêu cầu"]
  },
  {
    name: "Minh Tâm",
    role: "Nhân viên truyền thông",
    department: "Marketing",
    company: "APX Group",
    branch: "APX Tower",
    salary: 27000000,
    level: 3,
    performance: 89,
    skills: ["Truyền thông", "Viết nội dung", "Quan hệ báo chí"]
  },
  {
    name: "Phương Thảo",
    role: "Nhân viên PR",
    department: "Marketing",
    company: "APX Group",
    branch: "APX Tower",
    salary: 28000000,
    level: 3,
    performance: 88,
    skills: ["Quan hệ công chúng", "Tổ chức sự kiện", "Truyền thông"]
  },
  {
    name: "Tấn Phát",
    role: "Nhân viên bảo trì",
    department: "Kỹ thuật",
    company: "APX Real Estate",
    branch: "Ban dự án Lumen",
    salary: 20000000,
    level: 2,
    performance: 84,
    skills: ["Bảo trì cơ sở", "Sửa chữa", "Kiểm tra thiết bị"]
  },
  {
    name: "Hoài Nam",
    role: "Nhân viên kiểm soát chất lượng",
    department: "Sản xuất",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 23000000,
    level: 3,
    performance: 89,
    skills: ["Kiểm soát chất lượng", "Quy trình", "Kiểm tra sản phẩm"]
  },
  {
    name: "Cẩm Tú",
    role: "Nhân viên kế toán",
    department: "Tài chính",
    company: "APX Group",
    branch: "APX Tower",
    salary: 24000000,
    level: 3,
    performance: 91,
    skills: ["Kế toán", "Đối soát", "Báo cáo thu chi"]
  },
  {
    name: "Khải Minh",
    role: "Nhân viên pha chế",
    department: "Vận hành",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 16000000,
    level: 2,
    performance: 88,
    skills: ["Pha chế", "Kiến thức cà phê", "Dịch vụ khách hàng"]
  },
  {
    name: "Hồng Nhung",
    role: "Nhân viên triển khai",
    department: "Dự án",
    company: "APX Real Estate",
    branch: "Ban dự án Lumen",
    salary: 25000000,
    level: 3,
    performance: 86,
    skills: ["Triển khai kế hoạch", "Điều phối", "Theo dõi tiến độ"]
  },
  {
    name: "Nhật Vy",
    role: "Nhân viên sáng tạo nội dung",
    department: "Marketing",
    company: "APX Coffee",
    branch: "Flagship Quận 1",
    salary: 25000000,
    level: 3,
    performance: 90,
    skills: ["Sáng tạo nội dung", "Viết bài", "Mạng xã hội"]
  },
  {
    name: "Quốc Việt",
    role: "Nhân viên vận hành",
    department: "Vận hành",
    company: "APX Group",
    branch: "APX Tower",
    salary: 27000000,
    level: 3,
    performance: 88,
    skills: ["Vận hành", "Điều phối", "Tối ưu quy trình"]
  },
  {
    name: "Thùy An",
    role: "Nhân viên chăm sóc nội bộ",
    department: "Nhân sự",
    company: "APX Group",
    branch: "APX Tower",
    salary: 24000000,
    level: 3,
    performance: 91,
    skills: ["Hỗ trợ nhân viên", "Gắn kết nội bộ", "Tổ chức hoạt động"]
  },
  {
    name: "Bằng Khoa",
    role: "Nhân viên nghiên cứu thị trường",
    department: "Nghiên cứu",
    company: "APX Group",
    branch: "APX Tower",
    salary: 28000000,
    level: 4,
    performance: 92,
    skills: ["Nghiên cứu thị trường", "Khảo sát", "Phân tích đối thủ"]
  },
  {
    name: "Bảo Long",
    role: "Nhân viên hỗ trợ kỹ thuật",
    department: "Công nghệ",
    company: "APX Technology",
    branch: "Innovation Lab",
    salary: 24000000,
    level: 3,
    performance: 86,
    skills: ["Hỗ trợ kỹ thuật", "Xử lý sự cố", "Hướng dẫn người dùng"]
  }
];

var apxEmployees = apxEmployeeSeed.map(function (employee, index) {
  var nameParts = employee.name.trim().split(/\s+/);
  var initials = nameParts.slice(0, 2).map(function (part) {
    return part.charAt(0);
  }).join("").toUpperCase();

  return {
    id: "e" + (index + 1),
    name: employee.name,
    initials: initials,
    role: employee.role,
    department: employee.department,
    company: employee.company,
    branch: employee.branch,
    salary: employee.salary,
    level: employee.level,
    performance: employee.performance,
    skills: employee.skills,
    portraitSheet: "assets/portraits/employee-sheet.png",
    portraitIndex: index
  };
});

window.APX_DATA = {
  world: {
    name: "APX Business World",
    city: "Thành phố Hồ Chí Minh",
    headquarters: "APX Tower · Thủ Thiêm",
    year: 2026,
    season: "Khai mở đế chế"
  },

  player: {
    name: "Minh Anh",
    initials: "MA",
    age: 29,
    title: "Nhà sáng lập APX Group",
    location: "Thủ Thiêm, Việt Nam",
    level: 12,
    experience: 2480,
    nextLevelExperience: 3200,
    reputation: 68,
    socialRank: "Doanh nhân trẻ",
    bio: "Người sáng lập APX Group, theo đuổi mục tiêu kết nối công nghệ, phong cách sống và đô thị."
  },

  companies: [
    {
      id: "coffee",
      name: "APX Coffee",
      field: "Đồ uống và phong cách sống",
      shortField: "ĐỒ UỐNG",
      description: "Thương hiệu cà phê thành thị, tập trung vào trải nghiệm cửa hàng và sản phẩm tuyển chọn.",
      revenue: 640000000,
      profit: 194000000,
      staff: 28,
      growth: 12.8,
      founded: 2022,
      color: "#c58e5b",
      symbol: "C",
      branches: [
        { id: "coffee-q1", name: "Flagship Quận 1", district: "Bến Nghé", employees: 12 },
        { id: "coffee-thuthiem", name: "APX Coffee Thủ Thiêm", district: "Thủ Thiêm", employees: 9 },
        { id: "coffee-binhthanh", name: "APX Coffee Bình Thạnh", district: "Bình Thạnh", employees: 7 }
      ],
      products: ["Atelier Espresso", "Cold Brew Saigon", "Ethiopia Signature"]
    },
    {
      id: "tech",
      name: "APX Technology",
      field: "Công nghệ và dữ liệu",
      shortField: "CÔNG NGHỆ",
      description: "Phát triển nền tảng dữ liệu, dịch vụ số và giải pháp quản lý cho doanh nghiệp.",
      revenue: 520000000,
      profit: 171000000,
      staff: 34,
      growth: 18.4,
      founded: 2021,
      color: "#5caeae",
      symbol: "T",
      branches: [
        { id: "tech-lab", name: "Innovation Lab", district: "Thủ Thiêm", employees: 20 },
        { id: "tech-office", name: "Văn phòng Technology", district: "Quận 1", employees: 14 }
      ],
      products: ["Nexus Analytics", "APX Cloud", "Urban Data Platform"]
    },
    {
      id: "estate",
      name: "APX Real Estate",
      field: "Bất động sản và phát triển đô thị",
      shortField: "BẤT ĐỘNG SẢN",
      description: "Đầu tư và quản lý không gian thương mại, văn phòng và khu dân cư.",
      revenue: 390000000,
      profit: 106000000,
      staff: 34,
      growth: 9.6,
      founded: 2023,
      color: "#c3a968",
      symbol: "R",
      branches: [
        { id: "estate-hcm", name: "Văn phòng TP. Hồ Chí Minh", district: "Thủ Thiêm", employees: 22 },
        { id: "estate-projects", name: "Ban dự án Lumen", district: "Thảo Điền", employees: 12 }
      ],
      products: ["Lumen Residences", "Lumen Offices", "Central Boulevard"]
    }
  ],

  buildings: [
    {
      id: "tower",
      name: "APX Tower",
      type: "TRỤ SỞ TẬP ĐOÀN",
      district: "Thủ Thiêm",
      value: 128000000000,
      owner: "APX Group",
      status: "Đang hoạt động",
      owned: true,
      tone: "tower",
      detail: "Trụ sở điều hành APX Group với văn phòng, phòng họp hội đồng và khu vườn trên cao."
    },
    {
      id: "coffee-shop",
      name: "APX Coffee · Quận 1",
      type: "CỬA HÀNG FLAGSHIP",
      district: "Bến Nghé",
      value: 18400000000,
      owner: "APX Coffee",
      status: "Đang hoạt động",
      owned: true,
      tone: "coffee",
      detail: "Cửa hàng flagship hai tầng dành cho dòng cà phê tuyển chọn của APX."
    },
    {
      id: "tech-lab",
      name: "Innovation Lab",
      type: "TRUNG TÂM CÔNG NGHỆ",
      district: "Thủ Thiêm",
      value: 39700000000,
      owner: "APX Technology",
      status: "Đang hoạt động",
      owned: true,
      tone: "technology",
      detail: "Trung tâm nghiên cứu, phát triển sản phẩm và phân tích dữ liệu đô thị."
    },
    {
      id: "lumen-residences",
      name: "Lumen Residences",
      type: "KHU CĂN HỘ",
      district: "Thảo Điền",
      value: 46200000000,
      owner: "APX Real Estate",
      status: "Đang hoạt động",
      owned: true,
      tone: "residential",
      detail: "Khu căn hộ có sân trong, hồ bơi và không gian sinh hoạt cộng đồng."
    },
    {
      id: "market-lot",
      name: "Lô thương mại 17",
      type: "LÔ ĐẤT THƯƠNG MẠI",
      district: "Central Boulevard",
      value: 18600000000,
      owner: "Đang chào bán",
      status: "Mở bán",
      owned: false,
      tone: "land",
      detail: "Lô đất góc gần phố đi bộ, phù hợp để phát triển cửa hàng hoặc văn phòng."
    },
    {
      id: "riverside-studio",
      name: "Căn hộ Riverside Studio",
      type: "CĂN HỘ CÁ NHÂN",
      district: "Bờ Đông",
      value: 2800000000,
      owner: "Đang chào bán",
      status: "Mở bán",
      owned: false,
      tone: "residential",
      monthlyIncome: 24000000,
      monthlyMaintenance: 6000000,
      detail: "Căn hộ studio tại khu Riverside, có thể cho thuê. Giá trị, thu nhập thuê và chi phí được ghi vào hồ sơ tài sản cá nhân khi mua."
    },
    {
      id: "city-park",
      name: "Công viên Bờ Đông",
      type: "CÔNG VIÊN ĐÔ THỊ",
      district: "Thủ Thiêm",
      value: 0,
      owner: "Thành phố",
      status: "Công cộng",
      owned: false,
      tone: "park",
      detail: "Công viên ven sông với quảng trường, đường đi bộ và khu nghệ thuật ngoài trời."
    }
  ],

  employees: apxEmployees,

  candidates: [
    {
      id: "c1",
      name: "Gia Hân",
      initials: "GH",
      role: "Chuyên viên marketing",
      department: "Marketing",
      salary: 24000000,
      level: 2,
      performance: 78,
      skills: ["Nội dung", "Mạng xã hội", "Thiết kế chiến dịch"]
    },
    {
      id: "c2",
      name: "Đức Anh",
      initials: "DA",
      role: "Nhân viên phân tích tài chính",
      department: "Tài chính",
      salary: 28000000,
      level: 3,
      performance: 82,
      skills: ["Báo cáo", "Excel", "Phân tích chi phí"]
    },
    {
      id: "c3",
      name: "Hoàng Nam",
      initials: "HN",
      role: "Kỹ sư phần mềm",
      department: "Kỹ thuật",
      salary: 32000000,
      level: 3,
      performance: 85,
      skills: ["JavaScript", "Cơ sở dữ liệu", "Kiểm thử phần mềm"]
    },
    {
      id: "c4",
      name: "Mai Phương",
      initials: "MP",
      role: "Điều phối dự án",
      department: "Vận hành",
      salary: 26000000,
      level: 2,
      performance: 80,
      skills: ["Lập kế hoạch", "Điều phối", "Báo cáo tiến độ"]
    }
  ],

  items: [
    {
      id: "suit",
      name: "Vest Founder",
      type: "Trang bị",
      rarity: "Hiếm",
      price: 0,
      quantity: 1,
      description: "Trang phục biểu tượng của nhà sáng lập APX.",
      effect: "Dùng trong hồ sơ nhân vật."
    },
    {
      id: "beans",
      name: "Hạt cà phê Ethiopia",
      type: "Nguyên liệu",
      rarity: "Không phổ biến",
      price: 1800000,
      quantity: 28,
      description: "Hạt rang sáng, hương hoa nhài và cam bergamot.",
      effect: "Nguyên liệu cho APX Coffee."
    },
    {
      id: "contract",
      name: "Hợp đồng thuê mặt bằng",
      type: "Tài liệu",
      rarity: "Hiếm",
      price: 0,
      quantity: 2,
      description: "Hợp đồng thương mại tại Central Boulevard.",
      effect: "Hồ sơ đầu tư bất động sản."
    },
    {
      id: "tablet",
      name: "APX Field Tablet",
      type: "Trang bị",
      rarity: "Không phổ biến",
      price: 18500000,
      quantity: 1,
      description: "Thiết bị bảo mật dùng để xem báo cáo tại công trường.",
      effect: "Vật phẩm công nghệ cá nhân."
    },
    {
      id: "blueprint",
      name: "Bản vẽ Lumen Tower",
      type: "Tài liệu",
      rarity: "Hiếm",
      price: 0,
      quantity: 1,
      description: "Hồ sơ quy hoạch và thiết kế tòa nhà Lumen.",
      effect: "Tài liệu tham khảo cho dự án."
    },
    {
      id: "materials",
      name: "Bộ vật liệu hoàn thiện",
      type: "Nguyên liệu",
      rarity: "Thông thường",
      price: 620000,
      quantity: 64,
      description: "Vật liệu dùng cho các dự án cải tạo thương mại.",
      effect: "Tài nguyên xây dựng."
    }
  ],

  projects: [
    {
      id: "coffee",
      name: "APX Coffee Flagship",
      type: "Cửa hàng flagship",
      cost: 4800000000,
      monthlyRevenue: 130000000,
      daysToBuild: 5,
      description: "Cửa hàng lớn tại khu phố thương mại.",
      tone: "coffee"
    },
    {
      id: "office",
      name: "APX Urban Offices",
      type: "Tòa nhà văn phòng",
      cost: 12500000000,
      monthlyRevenue: 280000000,
      daysToBuild: 5,
      description: "Không gian văn phòng cho thuê tại Central Boulevard.",
      tone: "technology"
    },
    {
      id: "residence",
      name: "Lumen Residences",
      type: "Khu căn hộ cao cấp",
      cost: 16200000000,
      monthlyRevenue: 220000000,
      daysToBuild: 5,
      description: "Dự án căn hộ có tiện ích và khu sinh hoạt chung.",
      tone: "residential"
    }
  ],

  departments: [
    "Ban giám đốc",
    "Tài chính",
    "Marketing",
    "Nhân sự",
    "Kỹ thuật",
    "Vận hành"
  ],

  market: [
    {
      id: "technology",
      name: "Công nghệ",
      outlook: "Tăng trưởng",
      description: "Nhu cầu về dữ liệu và nền tảng quản lý đang tăng."
    },
    {
      id: "lifestyle",
      name: "Phong cách sống",
      outlook: "Ổn định",
      description: "Khách hàng quan tâm nhiều hơn đến trải nghiệm tại cửa hàng."
    },
    {
      id: "real-estate",
      name: "Bất động sản",
      outlook: "Cơ hội mới",
      description: "Một số khu thương mại mới đang được quy hoạch."
    }
  ]
};

/* Trạng thái người chơi nhận được khi bắt đầu ván mới. */
window.APX_INITIAL_STATE = {
  route: {
    section: "character",
    page: "profile"
  },

  day: 1,
  cash: 3280000000,
  treasury: 8240000000,
  networth: 246800000000,

  hired: [],
  inventory: {
    suit: 1,
    beans: 28,
    contract: 2,
    tablet: 1,
    blueprint: 1,
    materials: 64
  },
  buildings: [],
  projects: [],
  ledger: [],

  buildChoice: "coffee",
  itemSearch: "",
  employeeSearch: ""
};

/* Hàm định dạng tiền dùng chung cho mọi trang. */
window.APXUI = {
  money: function (value) {
    var amount = Number(value) || 0;
    var sign = amount < 0 ? "− " : "";
    var absolute = Math.abs(amount);

    if (absolute >= 1000000000000) {
      return sign + "₫ " +
        (absolute / 1000000000000).toFixed(2).replace(/\.?0+$/, "") +
        " nghìn tỷ";
    }

    if (absolute >= 1000000000) {
      return sign + "₫ " +
        (absolute / 1000000000).toFixed(2).replace(/\.?0+$/, "") +
        " tỷ";
    }

    if (absolute >= 1000000) {
      return sign + "₫ " +
        Math.round(absolute / 1000000).toLocaleString("vi-VN") +
        " triệu";
    }

    return sign + "₫ " + Math.round(absolute).toLocaleString("vi-VN");
  }
};
