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

export const useUser = () => useUserStore((state) => state.user)

export const useUserActions = () => useUserStore((state) => state.actions)
