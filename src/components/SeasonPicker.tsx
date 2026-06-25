import type { SeasonPreference } from '../theme/season'
import Button from '@/primitives/Button'
import styles from './SeasonPicker.module.css'

type SeasonPickerProps = {
  value: SeasonPreference
  onChange: (v: SeasonPreference) => void
}

const options: { value: SeasonPreference; label: string; icon: string }[] = [
  { value: 'auto', label: '自动（按地区）', icon: 'auto_mode' },
  { value: 'spring', label: '春', icon: 'park' },
  { value: 'summer', label: '夏', icon: 'wb_sunny' },
  { value: 'autumn', label: '秋', icon: 'eco' },
  { value: 'winter', label: '冬', icon: 'ac_unit' },
  { value: 'off', label: '关闭', icon: 'block' },
]

export default function SeasonPicker({ value, onChange }: SeasonPickerProps) {
  return (
    <div className={styles.picker} role="group" aria-label="季节配色">
      {options.map((opt) => (
        <Button
          key={opt.value}
          variant={value === opt.value ? 'tonal' : 'text'}
          icon={opt.icon}
          className={styles.btn}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </Button>
      ))}
    </div>
  )
}
