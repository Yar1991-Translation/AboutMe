type TagChipProps = {
  label: string
}

function TagChip({ label }: TagChipProps) {
  return <mdui-chip className="tag-chip">{label}</mdui-chip>
}

export default TagChip

