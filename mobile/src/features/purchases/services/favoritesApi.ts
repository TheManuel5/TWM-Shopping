import type { CartItem } from '../purchaseTypes';

export function addFavoriteToCart(cart: CartItem[], favorite: CartItem): CartItem[] {
  const existingItem = cart.find((item) => item.id === favorite.id);
  if (existingItem) {
    return cart.map((item) =>
      item.id === favorite.id ? { ...item, quantity: item.quantity + 1 } : item,
    );
  }
  return [...cart, { ...favorite, quantity: 1 }];
}

export function removeFavorite(favorites: CartItem[], productId: number): CartItem[] {
  return favorites.filter((item) => item.id !== productId);
}
