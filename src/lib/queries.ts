import { keepPreviousData, useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { api } from './api';
import type { Category, Home, LegalPage, Listing, Meta, Order, OrderSummary, Paged, ProductDetail, Product, Review, Sale } from './types';
import { useCurrency } from '@/providers/CurrencyProvider';

// Every price-carrying query includes the display currency in its key, so switching currency refetches.
export const useMeta = () => useQuery({ queryKey: ['meta'], queryFn: () => api<Meta>('/meta/', { auth: false }), staleTime: 5 * 60_000 });
export const useHome = () => {
  const { currency } = useCurrency();
  return useQuery({ queryKey: ['home', currency], queryFn: () => api<Home>('/home/', { auth: false }) });
};
export const useCategories = () => useQuery({ queryKey: ['categories'], queryFn: () => api<Category[]>('/categories/', { auth: false }), staleTime: 5 * 60_000 });

export type ProductFilters = { q?: string; category?: string; export?: boolean; seller?: 'official' | 'marketplace' | ''; sort?: string };
export function useProducts(filters: ProductFilters) {
  const { currency } = useCurrency();
  return useInfiniteQuery({
    queryKey: ['products', currency, filters],
    initialPageParam: 1,
    placeholderData: keepPreviousData,
    queryFn: ({ pageParam }) => api<Paged<Product>>('/products/', { auth: false, query: { ...filters, export: filters.export ? 1 : undefined, page: pageParam } }),
    getNextPageParam: (last, all) => (last.next ? all.length + 1 : undefined),
  });
}
export function useProduct(slug: string) {
  const { currency } = useCurrency();
  return useQuery({ queryKey: ['product', slug, currency], queryFn: () => api<ProductDetail>(`/products/${slug}/`, { auth: false }) });
}
export function useRelated(slug: string) {
  const { currency } = useCurrency();
  return useQuery({ queryKey: ['related', slug, currency], queryFn: () => api<Product[]>(`/products/${slug}/related/`, { auth: false }) });
}
export const useReviews = (slug: string) => useQuery({ queryKey: ['reviews', slug], queryFn: () => api<Paged<Review>>(`/products/${slug}/reviews/`, { query: { page_size: 50 } }) });

export function useOrders(enabled = true) {
  const { currency } = useCurrency();
  return useQuery({ queryKey: ['orders', currency], enabled, queryFn: () => api<Paged<OrderSummary>>('/orders/', { query: { page_size: 50 } }) });
}
export function useOrder(reference: string) {
  const { currency } = useCurrency();
  return useQuery({ queryKey: ['order', reference, currency], queryFn: () => api<Order>(`/orders/${reference}/`) });
}
export const useLegal = (slug: string) => useQuery({ queryKey: ['legal', slug], queryFn: () => api<LegalPage>(`/legal/${slug}/`, { auth: false }), staleTime: 10 * 60_000 });

export const useListings = () => useQuery({ queryKey: ['seller', 'listings'], queryFn: () => api<Paged<Listing>>('/seller/listings/', { query: { page_size: 50 } }) });
export const useListing = (id: number, enabled = true) => useQuery({ queryKey: ['seller', 'listing', id], enabled, queryFn: () => api<Listing>(`/seller/listings/${id}/`) });
export function useSales() {
  const { currency } = useCurrency();
  return useQuery({ queryKey: ['seller', 'sales', currency], queryFn: () => api<Paged<Sale>>('/seller/sales/', { query: { page_size: 50 } }) });
}
