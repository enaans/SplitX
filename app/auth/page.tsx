"use client"

import { useState } from "react"
import { LoginForm } from "@/components/auth/login-form"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-2">Splitwise</h1>
          <p className="text-muted-foreground">Split expenses with friends easily</p>
        </div>

        {isLogin ? <LoginForm /> : <RegisterForm />}

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
          </p>
          <Button variant="outline" className="w-full bg-transparent" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? "Sign Up" : "Login"}
          </Button>
        </div>
      </div>
    </div>
  )
}
