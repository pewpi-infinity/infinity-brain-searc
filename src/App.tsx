import { useState, useEffect } from 'react'

interface User {
  avatarUrl: string
  email: string
  id: number
  isOwner: boolean
  login: string
}

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      try {
        if (window.spark?.user) {
          const userData = await window.spark.user()
          setUser(userData)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <div>Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: "1rem" }}>
        <h1>Welcome to Spark Template</h1>
        <p>Authentication is handled by the Spark runtime</p>
      </div>
    )
  }

  return (
    <div style={{ padding: "2rem" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Spark Template</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <img src={user.avatarUrl} alt={user.login} style={{ width: "32px", height: "32px", borderRadius: "50%" }} />
          <span>Hello, {user.login}</span>
        </div>
      </header>
      <main>
        <p>You are successfully authenticated!</p>
        <p>Email: {user.email}</p>
        <p>User ID: {user.id}</p>
      </main>
    </div>
  )
}

export default App
