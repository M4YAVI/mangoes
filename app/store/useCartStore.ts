import { create } from 'zustand'
import { persist, createJSONStorage, devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

export interface CartItem {
  id: number
  name: string
  image: string
  weight: number
  pricePerKg: number
  quantity: number
  totalPrice: number
}

interface CartState {
  items: CartItem[]
  isCartOpen: boolean

  _hasHydrated: boolean
}

interface CartActions {
  addItem: (item: Omit<CartItem, 'totalPrice' | 'quantity'>) => void
  removeItem: (id: number, weight: number) => void
  updateWeight: (id: number, oldWeight: number, newWeight: number) => void
  updateQuantity: (id: number, weight: number, delta: number) => void
  clearCart: () => void
  toggleCart: (isOpen?: boolean) => void

  setHasHydrated: (state: boolean) => void
}

type CartStore = CartState & CartActions

export const useCartStore = create<CartStore>()(
  devtools(
    persist(
      immer((set) => ({
        items: [],
        isCartOpen: false,

        _hasHydrated: false,

        setHasHydrated: (state) => {
          set({ _hasHydrated: state })
        },

        toggleCart: (isOpen) => {
          set((state) => {
            state.isCartOpen = isOpen !== undefined ? isOpen : !state.isCartOpen
          })
        },



        addItem: (newItem) => {
          set((state) => {
            const existingItem = state.items.find(
              (item) => item.id === newItem.id && item.weight === newItem.weight
            )

            if (existingItem) {
              existingItem.quantity += 1
              existingItem.totalPrice = existingItem.quantity * existingItem.weight * existingItem.pricePerKg
            } else {
              state.items.push({
                ...newItem,
                quantity: 1,
                totalPrice: newItem.weight * newItem.pricePerKg,
              })
            }
          })
        },

        removeItem: (id, weight) => {
          set((state) => {
            state.items = state.items.filter(
              (item) => !(item.id === id && item.weight === weight)
            )
          })
        },

        updateWeight: (id, oldWeight, newWeight) => {
          set((state) => {
            const item = state.items.find(
              (i) => i.id === id && i.weight === oldWeight
            )
            if (item) {
              item.weight = newWeight
              item.totalPrice = item.quantity * newWeight * item.pricePerKg
            }
          })
        },

        updateQuantity: (id, weight, delta) => {
          set((state) => {
            const item = state.items.find(
              (i) => i.id === id && i.weight === weight
            )
            if (item) {
              const newQty = item.quantity + delta
              if (newQty > 0) {
                item.quantity = newQty
                item.totalPrice = newQty * item.weight * item.pricePerKg
              }
            }
          })
        },

        clearCart: () => {
          set((state) => {
            state.items = []
          })
        },
      })),
      {
        name: 'mango-cart-storage',
        storage: createJSONStorage(() => localStorage),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true)
        },
      }
    ),
    { name: 'MangoCartStore' }
  )
)
