export const desktopHeaderHeight = 64
export const mobileHeaderHeight = 124

export const headerOffset = {
  xs: `var(--shopping-header-height, ${mobileHeaderHeight}px)`,
  md: `var(--shopping-header-height, ${desktopHeaderHeight}px)`,
}
