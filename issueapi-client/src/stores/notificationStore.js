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

/**
 * Hook to access the current notification state.
 *
 * @returns {Object} The notification state, containing `message` and `msgType`.
 */
export const useNotification = () => useNotificationStore()

/**
 * Hook to access the notification action functions.
 *
 * @returns {Object} An object containing the `showNotification` and `clearNotification` methods.
 *                   `showNotification(message: string, msgType: string, time?: number)` sets a temporary message.
 *                   `clearNotification()` immediately removes the message.
 */
export const useNotificationActions = () =>
    useNotificationStore((state) => state.actions)
