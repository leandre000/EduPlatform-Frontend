"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react"
import Cookies from 'js-cookie';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Login failed")
      }

      const { data } = await response.json()

      if (!data?.jwt || !data?.role) {
        throw new Error("Invalid response from server")
      }

      // Store token and role in localStorage
      // Note: For production, consider using more secure storage methods
      localStorage.setItem("token", data.jwt)
      localStorage.setItem("jwtToken", data.jwt)
      localStorage.setItem("userRole", data.role)
console.log("Login successful:", data)
      // Keep loading state active during navigation
      setIsLoading(false)
  Cookies.set('jwtToken', data.jwt, {
      expires: 1, // 1 day
      secure: true,
      sameSite: 'Strict',
    });

      // Redirect based on role using router.replace() instead of push()
      // replace() prevents going back to login page after successful login
      try {
        switch (data.role) {
          case "STUDENT":
            console.log("Redirecting to student dashboard")
            await router.replace("/student/dashboard")
            break
          case "INSTRUCTOR":
            await router.replace("/instructor/dashboard")
            break
          case "ADMIN":
            await router.replace("/admin/home")
            break
          default:
            await router.replace("/dashboard/home")
        }
      } catch (navError) {
        console.error("Navigation error:", navError)
        setError("Error navigating to dashboard. Please try again.")
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-green-50 dark:from-teal-950 dark:to-green-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue learning</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <Link
                href="/forgot-password"
                className="text-sm text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300"
              >
                Forgot password?
              </Link>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link
              href="/register"
              className="text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium"
            >
              Sign up
            </Link>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/register?role=student">Register as Student</Link>
            </Button>
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/register?role=instructor">Register as Instructor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
