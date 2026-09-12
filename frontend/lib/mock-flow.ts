import type { Step } from './types'

export const MOCK_TOTAL = 5

export const MOCK_FLOW: Step[] = [
  {
    id: 'khu_vuc',
    type: 'multi',
    question: 'Bạn quan tâm phân khu nào?',
    hint: 'Chọn được nhiều phân khu',
    options: [
      { value: 'ocp1', label: 'Ocean Park 1' },
      { value: 'ocp2', label: 'Ocean Park 2 (The Empire)' },
      { value: 'ocp3', label: 'Ocean Park 3 (The Crown)' },
      { value: 'chua_ro', label: 'Chưa rõ, gợi ý giúp mình' },
    ],
  },
  {
    id: 'loai_hinh',
    type: 'single',
    question: 'Bạn tìm loại hình nào?',
    hint: null,
    options: [
      { value: 'can_ho', label: 'Căn hộ chung cư' },
      { value: 'shophouse', label: 'Shophouse, nhà phố thương mại' },
      { value: 'biet_thu', label: 'Biệt thự' },
      { value: 'lien_ke', label: 'Liền kề' },
    ],
  },
  {
    id: 'muc_dich',
    type: 'single',
    question: 'Bạn mua với mục đích gì?',
    hint: null,
    options: [
      { value: 'o_luon', label: 'Ở luôn' },
      { value: 'cho_thue', label: 'Đầu tư cho thuê' },
      { value: 'tang_gia', label: 'Đầu tư chờ tăng giá' },
      { value: 'nguoi_than', label: 'Mua cho người thân' },
    ],
  },
  {
    id: 'ngan_sach',
    type: 'single',
    question: 'Ngân sách dự kiến của bạn?',
    hint: 'Chọn khoảng gần nhất, mình sẽ linh động ±10%',
    options: [
      { value: 'duoi_3ty', label: 'Dưới 3 tỷ' },
      { value: '3_5ty', label: '3 - 5 tỷ' },
      { value: '5_8ty', label: '5 - 8 tỷ' },
      { value: '8_15ty', label: '8 - 15 tỷ' },
      { value: 'tren_15ty', label: 'Trên 15 tỷ' },
    ],
  },
  {
    id: 'quy_mo',
    type: 'single',
    question: 'Bạn cần quy mô thế nào?',
    hint: null,
    options: [
      { value: '1pn', label: '1 phòng ngủ' },
      { value: '2pn', label: '2 phòng ngủ' },
      { value: '3pn', label: '3 phòng ngủ' },
      { value: '4pn_tro_len', label: '4 phòng ngủ trở lên' },
    ],
  },
]

export function labelOf(stepId: string, value: string): string {
  const step = MOCK_FLOW.find((item) => item.id === stepId)
  return step?.options.find((option) => option.value === value)?.label ?? value
}
