import type { Listing, Answers } from './types'

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'ocp1-s201-1205',
    name: 'Sapphire 2 — Căn 1205',
    subdivision: 'Ocean Park 1',
    price_label: '2,8 tỷ',
    area_m2: 55,
    bedrooms: 2,
    bathrooms: 1,
    image_url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80',
    match_score: 95,
    reasons: [
      'Ngân sách dưới 3 tỷ, tối ưu chi phí',
      '2 phòng ngủ gọn gàng, ban công hướng Đông Nam thoáng mát',
      'Gần đại học VinUni và hồ điều hòa 24.5ha'
    ],
    detail_url: '#'
  },
  {
    id: 'ocp1-ruby1-0802',
    name: 'Ruby 1 — Căn 0802',
    subdivision: 'Ocean Park 1',
    price_label: '4,1 tỷ',
    area_m2: 72,
    bedrooms: 2,
    bathrooms: 2,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
    match_score: 92,
    reasons: [
      'Phân khu bàn giao cao cấp chuẩn Ruby',
      'Đã trang bị full nội thất cao cấp vào ở ngay',
      'Tầm nhìn trực diện biển hồ nước mặn 6.1ha'
    ],
    detail_url: '#'
  },
  {
    id: 'ocp2-cha-15',
    name: 'Liền kề Chà Là 15',
    subdivision: 'Ocean Park 2 (The Empire)',
    price_label: '6,8 tỷ',
    area_m2: 63,
    bedrooms: 4,
    bathrooms: 4,
    image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=600&q=80',
    match_score: 88,
    reasons: [
      'Nhà phố liền kề 4 tầng, tiềm năng tăng giá cao',
      'Kế bên công viên nội khu và trường học',
      'Phù hợp ở kết hợp kinh doanh shophouse'
    ],
    detail_url: '#'
  },
  {
    id: 'ocp2-sanho-09',
    name: 'Biệt thự San Hô 09',
    subdivision: 'Ocean Park 2 (The Empire)',
    price_label: '14,5 tỷ',
    area_m2: 120,
    bedrooms: 4,
    bathrooms: 5,
    image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80',
    match_score: 90,
    reasons: [
      'Biệt thự song lập góc 2 mặt tiền siêu đẹp',
      'Gần công viên Wave Park sóng nhân tạo lớn nhất thế giới',
      'Không gian sống đẳng cấp thượng lưu'
    ],
    detail_url: '#'
  },
  {
    id: 'ocp3-vt-02',
    name: 'Shophouse Vịnh Thiên Đường 02',
    subdivision: 'Ocean Park 3 (The Crown)',
    price_label: '9,2 tỷ',
    area_m2: 80,
    bedrooms: 4,
    bathrooms: 4,
    image_url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80',
    match_score: 89,
    reasons: [
      'Vị trí đắc địa trên trục đại lộ chính dự án',
      'Khai thác cho thuê kinh doanh sầm uất',
      'Tiện ích Vịnh thiên đường Paradise Bay kế bên'
    ],
    detail_url: '#'
  },
  {
    id: 'ocp1-zenpark-1904',
    name: 'The Zenpark — Căn 1904',
    subdivision: 'Ocean Park 1',
    price_label: '3,6 tỷ',
    area_m2: 67,
    bedrooms: 2,
    bathrooms: 2,
    image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80',
    match_score: 94,
    reasons: [
      'Phong cách Nhật Bản có vườn Nhật nội khu',
      'Đầy đủ tiện ích cao cấp: bể bơi 4 mùa, sân tennis',
      'Thiết kế căn hộ tối ưu không gian ánh sáng'
    ],
    detail_url: '#'
  }
]

export function filterMockListings(answers: Answers): Listing[] {
  let filtered = [...MOCK_LISTINGS]

  const nganSach = answers.ngan_sach as string
  if (nganSach === 'duoi_3ty') {
    filtered = filtered.filter(l => l.bedrooms <= 2)
  } else if (nganSach === '3_5ty') {
    filtered = filtered.filter(l => l.bedrooms === 2)
  } else if (nganSach === '5_8ty' || nganSach === '8_15ty' || nganSach === 'tren_15ty') {
    filtered = filtered.filter(l => l.bedrooms >= 3 || l.subdivision.includes('2') || l.subdivision.includes('3'))
  }

  const quyMo = answers.quy_mo as string
  if (quyMo === '1pn') {
    filtered = filtered.filter(l => l.bedrooms === 1 || l.bedrooms === 2)
  } else if (quyMo === '2pn') {
    filtered = filtered.filter(l => l.bedrooms === 2)
  } else if (quyMo === '3pn' || quyMo === '4pn_tro_len') {
    filtered = filtered.filter(l => l.bedrooms >= 3)
  }

  if (filtered.length === 0) {
    return MOCK_LISTINGS.slice(0, 3)
  }

  return filtered
}
