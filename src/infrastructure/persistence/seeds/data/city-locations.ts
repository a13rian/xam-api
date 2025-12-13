// City location data for seeding accounts and organizations
// Coordinates are approximate district centers

export interface DistrictLocation {
  name: string;
  nameEn: string;
  latitude: number;
  longitude: number;
  streets: string[];
  wards: string[];
}

export interface CityData {
  code: string;
  name: string;
  nameEn: string;
  districts: DistrictLocation[];
}

// Ha Noi - Code: 01
export const hanoiData: CityData = {
  code: '01',
  name: 'Hà Nội',
  nameEn: 'Ha Noi',
  districts: [
    {
      name: 'Hoàn Kiếm',
      nameEn: 'Hoan Kiem',
      latitude: 21.0285,
      longitude: 105.8542,
      streets: [
        'Hàng Bông',
        'Hàng Gai',
        'Tràng Tiền',
        'Lý Thường Kiệt',
        'Hai Bà Trưng',
      ],
      wards: [
        'Hàng Bông',
        'Tràng Tiền',
        'Cửa Nam',
        'Hàng Trống',
        'Phan Chu Trinh',
      ],
    },
    {
      name: 'Ba Đình',
      nameEn: 'Ba Dinh',
      latitude: 21.034,
      longitude: 105.8194,
      streets: [
        'Kim Mã',
        'Liễu Giai',
        'Đội Cấn',
        'Hoàng Diệu',
        'Phan Đình Phùng',
      ],
      wards: ['Cống Vị', 'Điện Biên', 'Kim Mã', 'Liễu Giai', 'Ngọc Hà'],
    },
    {
      name: 'Đống Đa',
      nameEn: 'Dong Da',
      latitude: 21.0167,
      longitude: 105.8283,
      streets: [
        'Tây Sơn',
        'Chùa Bộc',
        'Nguyễn Lương Bằng',
        'Xã Đàn',
        'Khâm Thiên',
      ],
      wards: ['Láng Hạ', 'Ô Chợ Dừa', 'Quang Trung', 'Trung Liệt', 'Kim Liên'],
    },
    {
      name: 'Cầu Giấy',
      nameEn: 'Cau Giay',
      latitude: 21.0333,
      longitude: 105.7833,
      streets: [
        'Cầu Giấy',
        'Xuân Thủy',
        'Trần Duy Hưng',
        'Hoàng Quốc Việt',
        'Phạm Hùng',
      ],
      wards: ['Dịch Vọng', 'Mai Dịch', 'Nghĩa Đô', 'Nghĩa Tân', 'Quan Hoa'],
    },
    {
      name: 'Hai Bà Trưng',
      nameEn: 'Hai Ba Trung',
      latitude: 21.0044,
      longitude: 105.8586,
      streets: ['Bạch Mai', 'Phố Huế', 'Lò Đúc', 'Trần Khát Chân', 'Minh Khai'],
      wards: ['Bạch Đằng', 'Bạch Mai', 'Đống Mác', 'Lê Đại Hành', 'Minh Khai'],
    },
    {
      name: 'Thanh Xuân',
      nameEn: 'Thanh Xuan',
      latitude: 20.9933,
      longitude: 105.8117,
      streets: [
        'Nguyễn Trãi',
        'Khuất Duy Tiến',
        'Lê Văn Lương',
        'Hoàng Văn Thái',
        'Trường Chinh',
      ],
      wards: [
        'Khương Mai',
        'Nhân Chính',
        'Thanh Xuân Bắc',
        'Thanh Xuân Nam',
        'Thượng Đình',
      ],
    },
    {
      name: 'Long Biên',
      nameEn: 'Long Bien',
      latitude: 21.0472,
      longitude: 105.8889,
      streets: [
        'Nguyễn Văn Cừ',
        'Ngọc Lâm',
        'Long Biên',
        'Cổ Linh',
        'Thạch Bàn',
      ],
      wards: ['Bồ Đề', 'Gia Thụy', 'Ngọc Lâm', 'Ngọc Thụy', 'Phúc Đồng'],
    },
  ],
};

// Da Nang - Code: 48
export const danangData: CityData = {
  code: '48',
  name: 'Đà Nẵng',
  nameEn: 'Da Nang',
  districts: [
    {
      name: 'Hải Châu',
      nameEn: 'Hai Chau',
      latitude: 16.0678,
      longitude: 108.2208,
      streets: [
        'Nguyễn Văn Linh',
        'Lê Duẩn',
        'Bạch Đằng',
        'Trần Phú',
        'Phan Châu Trinh',
      ],
      wards: [
        'Hải Châu I',
        'Hải Châu II',
        'Thạch Thang',
        'Thanh Bình',
        'Thuận Phước',
      ],
    },
    {
      name: 'Thanh Khê',
      nameEn: 'Thanh Khe',
      latitude: 16.0708,
      longitude: 108.1883,
      streets: [
        'Điện Biên Phủ',
        'Hàm Nghi',
        'Ông Ích Khiêm',
        'Lê Độ',
        'Nguyễn Tất Thành',
      ],
      wards: ['An Khê', 'Chính Gián', 'Tam Thuận', 'Tân Chính', 'Vĩnh Trung'],
    },
    {
      name: 'Sơn Trà',
      nameEn: 'Son Tra',
      latitude: 16.1167,
      longitude: 108.25,
      streets: [
        'Ngô Quyền',
        'Phạm Văn Đồng',
        'Võ Nguyên Giáp',
        'Hoàng Sa',
        'Trường Sa',
      ],
      wards: [
        'An Hải Bắc',
        'An Hải Đông',
        'Mân Thái',
        'Nại Hiên Đông',
        'Phước Mỹ',
      ],
    },
    {
      name: 'Ngũ Hành Sơn',
      nameEn: 'Ngu Hanh Son',
      latitude: 16.0167,
      longitude: 108.25,
      streets: [
        'Lê Văn Hiến',
        'Ngũ Hành Sơn',
        'Trường Sa',
        'Võ Chí Công',
        'Non Nước',
      ],
      wards: ['Hòa Hải', 'Hòa Quý', 'Khuê Mỹ', 'Mỹ An'],
    },
    {
      name: 'Cẩm Lệ',
      nameEn: 'Cam Le',
      latitude: 16.0167,
      longitude: 108.2,
      streets: [
        'Cách Mạng Tháng 8',
        'Trần Cao Vân',
        'Ông Ích Khiêm',
        'Nguyễn Hữu Thọ',
        'Lê Đại Hành',
      ],
      wards: [
        'Hòa An',
        'Hòa Phát',
        'Hòa Thọ Đông',
        'Hòa Thọ Tây',
        'Khuê Trung',
      ],
    },
    {
      name: 'Liên Chiểu',
      nameEn: 'Lien Chieu',
      latitude: 16.0833,
      longitude: 108.15,
      streets: [
        'Tôn Đức Thắng',
        'Nguyễn Lương Bằng',
        'Nguyễn Sinh Sắc',
        'Hoàng Thị Loan',
        'Nam Cao',
      ],
      wards: [
        'Hòa Hiệp Bắc',
        'Hòa Hiệp Nam',
        'Hòa Khánh Bắc',
        'Hòa Khánh Nam',
        'Hòa Minh',
      ],
    },
  ],
};

// TP Ho Chi Minh - Code: 79
export const hcmData: CityData = {
  code: '79',
  name: 'Thành phố Hồ Chí Minh',
  nameEn: 'Ho Chi Minh City',
  districts: [
    {
      name: 'Quận 1',
      nameEn: 'District 1',
      latitude: 10.7769,
      longitude: 106.7009,
      streets: ['Nguyễn Huệ', 'Lê Lợi', 'Đồng Khởi', 'Hai Bà Trưng', 'Pasteur'],
      wards: ['Bến Nghé', 'Bến Thành', 'Cô Giang', 'Đa Kao', 'Nguyễn Cư Trinh'],
    },
    {
      name: 'Quận 3',
      nameEn: 'District 3',
      latitude: 10.7833,
      longitude: 106.6833,
      streets: [
        'Võ Văn Tần',
        'Nam Kỳ Khởi Nghĩa',
        'Nguyễn Đình Chiểu',
        'Cao Thắng',
        'Trần Quốc Thảo',
      ],
      wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'],
    },
    {
      name: 'Bình Thạnh',
      nameEn: 'Binh Thanh',
      latitude: 10.8042,
      longitude: 106.7094,
      streets: [
        'Điện Biên Phủ',
        'Xô Viết Nghệ Tĩnh',
        'Nguyễn Xí',
        'Bạch Đằng',
        'Phan Văn Trị',
      ],
      wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 5', 'Phường 6'],
    },
    {
      name: 'Phú Nhuận',
      nameEn: 'Phu Nhuan',
      latitude: 10.8,
      longitude: 106.6833,
      streets: [
        'Phan Xích Long',
        'Hoàng Văn Thụ',
        'Nguyễn Văn Trỗi',
        'Phan Đăng Lưu',
        'Trần Huy Liệu',
      ],
      wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'],
    },
    {
      name: 'Thủ Đức',
      nameEn: 'Thu Duc',
      latitude: 10.85,
      longitude: 106.75,
      streets: [
        'Võ Văn Ngân',
        'Kha Vạn Cân',
        'Phạm Văn Đồng',
        'Lê Văn Việt',
        'Xa Lộ Hà Nội',
      ],
      wards: [
        'Linh Chiểu',
        'Linh Đông',
        'Linh Tây',
        'Linh Trung',
        'Trường Thọ',
      ],
    },
    {
      name: 'Gò Vấp',
      nameEn: 'Go Vap',
      latitude: 10.8383,
      longitude: 106.65,
      streets: [
        'Quang Trung',
        'Nguyễn Oanh',
        'Phan Văn Trị',
        'Lê Đức Thọ',
        'Nguyễn Văn Nghi',
      ],
      wards: ['Phường 1', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6'],
    },
    {
      name: 'Tân Bình',
      nameEn: 'Tan Binh',
      latitude: 10.8017,
      longitude: 106.6517,
      streets: [
        'Cộng Hòa',
        'Hoàng Văn Thụ',
        'Lý Thường Kiệt',
        'Trường Chinh',
        'Cách Mạng Tháng 8',
      ],
      wards: ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5'],
    },
    {
      name: 'Quận 7',
      nameEn: 'District 7',
      latitude: 10.7333,
      longitude: 106.7167,
      streets: [
        'Nguyễn Thị Thập',
        'Nguyễn Hữu Thọ',
        'Lê Văn Lương',
        'Phú Thuận',
        'Huỳnh Tấn Phát',
      ],
      wards: [
        'Tân Phong',
        'Tân Phú',
        'Tân Quy',
        'Tân Thuận Đông',
        'Tân Thuận Tây',
      ],
    },
  ],
};

// Business name templates for organizations
export const businessNamePrefixes = [
  'Spa',
  'Beauty',
  'Nails',
  'Hair',
  'Salon',
  'Center',
  'Studio',
  'Clinic',
];

export const businessNameSuffixes = [
  'Hương Sen',
  'Hoàng Gia',
  'Thanh Xuân',
  'Phương Đông',
  'Kim Cương',
  'Ngọc Trai',
  'Ánh Dương',
  'Hoa Mai',
  'Thiên Thanh',
  'Mỹ Linh',
  'Lan Anh',
  'Thu Hà',
  'Bích Ngọc',
  'Minh Tâm',
  'Hồng Nhung',
];

// Vietnamese first names
export const vietnameseFirstNames = [
  'Anh',
  'Bình',
  'Chi',
  'Dung',
  'Đức',
  'Giang',
  'Hà',
  'Hải',
  'Hằng',
  'Hiền',
  'Hoa',
  'Hoàng',
  'Hùng',
  'Hương',
  'Khánh',
  'Lan',
  'Linh',
  'Long',
  'Mai',
  'Minh',
  'Nam',
  'Nga',
  'Ngọc',
  'Nhung',
  'Phong',
  'Phương',
  'Quân',
  'Quỳnh',
  'Sơn',
  'Tâm',
  'Thảo',
  'Thắng',
  'Thành',
  'Thủy',
  'Tiến',
  'Trang',
  'Trung',
  'Tú',
  'Tuấn',
  'Vân',
];

// Vietnamese last names
export const vietnameseLastNames = [
  'Nguyễn',
  'Trần',
  'Lê',
  'Phạm',
  'Hoàng',
  'Huỳnh',
  'Phan',
  'Vũ',
  'Võ',
  'Đặng',
  'Bùi',
  'Đỗ',
  'Hồ',
  'Ngô',
  'Dương',
  'Lý',
];

// Helper function to get random element from array
export function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper function to generate random offset for coordinates (within ~500m)
export function getRandomOffset(): number {
  return (Math.random() - 0.5) * 0.01; // ~500m variance
}

// Helper function to generate random street number
export function getRandomStreetNumber(): string {
  return String(Math.floor(Math.random() * 200) + 1);
}

// All cities data for easy access
export const allCitiesData: CityData[] = [hcmData, hanoiData, danangData];

// Get city by distribution (40% HCM, 35% Ha Noi, 25% Da Nang)
export function getCityByDistribution(): CityData {
  const rand = Math.random();
  if (rand < 0.4) return hcmData;
  if (rand < 0.75) return hanoiData;
  return danangData;
}
