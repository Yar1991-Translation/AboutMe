import type { SeasonPreference } from '../theme/season'

type SeasonPickerProps = {
  value: SeasonPreference
  onChange: (v: SeasonPreference) => void
}

const options: { value: SeasonPreference; label: string }[] = [
  { value: 'auto', label: '自动（按地区）' },
  { value: 'spring', label: '春' },
  { value: 'summer', label: '夏' },
  { value: 'autumn', label: '秋' },
  { value: 'winter', label: '冬' },
  { value: 'off', label: '关闭季节（固定主题）' },
]

function SeasonPicker({ value, onChange }: SeasonPickerProps) {
  return (
    <div className="season-picker" role="group" aria-label="季节配色">
      {options.map((opt) => (
        <mdui-button
          key={opt.value}
          variant={value === opt.value ? 'tonal' : 'text'}
          className="season-picker__btn"
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </mdui-button>
      ))}
    </div>
  )
}

export default SeasonPicker




