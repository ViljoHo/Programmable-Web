import { create } from 'zustand'

const useNotificationStore = create((set) => ({
    message: null,
    msgType: '',
    actions: {
        showNotification: (message, msgType, time = 5) => {
            set({ message, msgType })
            setTimeout(() => {
                set({ message: null, msgType: '' })
            }, time * 1000)
        },
        clearNotification: () => {
            set({ message: null, msgType: '' })
        },
    },
}))

export const useNotification = () => useNotificationStore()

export const useNotificationActions = () =>
    useNotificationStore((state) => state.actions)
