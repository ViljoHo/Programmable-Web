import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setApiKey, clearApiKey } from '../services/apiClient'
import { getUser } from '../services/users'

const useUserStore = create(
    persist(
        (set) => ({
            user: null,
            apiKey: null,
            actions: {
                login: async (userName, apiKeyValue) => {
                    setApiKey(apiKeyValue)
                    try {
                        const userData = await getUser(userName)
                        set({ user: userData, apiKey: apiKeyValue })
                    } catch (error) {
                        clearApiKey()
                        throw error
                    }
                },
                logout: () => {
                    clearApiKey()
                    set({ user: null, apiKey: null })
                },
            },
        }),
        {
            name: 'issue-api-user',
            partialize: (state) => ({ user: state.user, apiKey: state.apiKey }),
            onRehydrateStorage: () => (state) => {
                if (state?.apiKey) {
                    setApiKey(state.apiKey)
                }
            },
        }
    )
)

/**
 * Hook to access the currently logged-in user's data.
 *
 * @returns {Object|null} The user object if logged in, otherwise null.
 */
export const useUser = () => useUserStore((state) => state.user)

/**
 * Hook to access user authentication action functions.
 *
 * @returns {Object} An object containing the `login` and `logout` methods.
 *                   `login(userName: string, apiKeyValue: string)` attempts to fetch user data and set the global API key.
 *                   Throws an error if login fails. Handled by showing an error message on the login form.
 *                   `logout()` clears the API key and removes the user from state.
 */
export const useUserActions = () => useUserStore((state) => state.actions)
