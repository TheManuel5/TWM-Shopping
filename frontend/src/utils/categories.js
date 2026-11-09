export function flattenCategories(tree) {
  const result = []
  const visit = (items, group, parent = null) => items.forEach(item => {
    result.push({ ...item, group, parent })
    visit(item.children || [], group, item.id)
  })
  Object.entries(tree).forEach(([group, items]) => visit(items, group))
  return result
}
export function mapCategoryTree(tree, id, transform) {
  const walk = items => items.flatMap(item => {
    if (item.id === id) { const updated = transform(item); return updated ? [updated] : [] }
    return [{ ...item, children: walk(item.children || []) }]
  })
  return Object.fromEntries(Object.entries(tree).map(([group, items]) => [group, walk(items)]))
}

// Los ID relacionales son numéricos; la jerarquía viene de children, no del ID.
export function categoryNamesUnder(tree, name) {
  const names = new Set()
  const collect = node => { names.add(node.name); (node.children || []).forEach(collect) }
  const find = items => items.forEach(node => { if (node.name === name) collect(node); else find(node.children || []) })
  Object.values(tree).forEach(find)
  return names.size ? [...names] : [name]
}
