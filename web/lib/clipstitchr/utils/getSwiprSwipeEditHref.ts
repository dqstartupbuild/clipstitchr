export function getSwiprSwipeEditHref(swipeId: string) {
  return `/dashboard/swipr?mode=edit&swipe=${encodeURIComponent(swipeId)}`;
}
