import React, { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('survey_agent_token'))
  const [agentPhone, setAgentPhone] = useState(() => localStorage.getItem('survey_agent_phone') || '')
  const [agentName, setAgentName] = useState(() => localStorage.getItem('survey_agent_name') || '')

  const login = (tok, phone, name) => {
    localStorage.setItem('survey_agent_token', tok)
    localStorage.setItem('survey_agent_phone', phone)
    localStorage.setItem('survey_agent_name', name || '')
    setToken(tok)
    setAgentPhone(phone)
    setAgentName(name || '')
  }

  const logout = () => {
    localStorage.removeItem('survey_agent_token')
    localStorage.removeItem('survey_agent_phone')
    localStorage.removeItem('survey_agent_name')
    setToken(null)
    setAgentPhone('')
    setAgentName('')
  }

  return (
    <AuthContext.Provider value={{ token, agentPhone, agentName, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
