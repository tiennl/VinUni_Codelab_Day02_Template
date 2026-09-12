import { expect, it } from 'vitest'
import { MOCK_FLOW, MOCK_TOTAL, labelOf } from './mock-flow'

it('có đúng 5 câu, đúng thứ tự id như spec', () => {
  expect(MOCK_FLOW.map((step) => step.id)).toEqual([
    'khu_vuc',
    'loai_hinh',
    'muc_dich',
    'ngan_sach',
    'quy_mo',
  ])
  expect(MOCK_FLOW).toHaveLength(MOCK_TOTAL)
})

it('mỗi câu có ít nhất 2 lựa chọn và value không trùng nhau', () => {
  for (const step of MOCK_FLOW) {
    expect(step.options.length).toBeGreaterThanOrEqual(2)
    const values = step.options.map((option) => option.value)
    expect(new Set(values).size).toBe(values.length)
  }
})

it('chỉ câu khu_vuc là multi', () => {
  expect(MOCK_FLOW.filter((step) => step.type === 'multi').map((step) => step.id)).toEqual([
    'khu_vuc',
  ])
})

it('labelOf trả label, fallback về value khi không tìm thấy', () => {
  expect(labelOf('ngan_sach', '3_5ty')).toBe('3 - 5 tỷ')
  expect(labelOf('ngan_sach', 'khong_ton_tai')).toBe('khong_ton_tai')
})
