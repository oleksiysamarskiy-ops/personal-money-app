import React, { createContext, useContext } from 'react'

const UserIdContext = createContext<string>('')

export const UserIdProvider = ({ userId, children }: { userId: string; children: React.ReactNode }) => (
  <UserIdContext.Provider value={userId}>{children}</UserIdContext.Provider>
)

export const useUserId = () => useContext(UserIdContext)
