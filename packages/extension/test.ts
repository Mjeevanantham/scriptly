// TypeScript test file for Scriptly VS Code Extension
// Test completion, chat, and type-aware features

interface User {
  id: number
  name: string
  email: string
  age?: number
}

interface UserResponse {
  users: User[]
  total: number
}

// Example: TypeScript function with types
function getUserById(id: number): User | null {
  // [CURSOR HERE] - Test completion with type awareness
  return null // Stub implementation
}

// Example: Generic function
function processItems<T>(items: T[]): T[] {
  // [CURSOR HERE] - Test completion
  return items // Stub implementation
}

// Example: Async/await with types
async function fetchUsers(): Promise<UserResponse> {
  // [CURSOR HERE] - Should suggest fetch and type casting
  return { users: [], total: 0 } // Stub implementation
}

// Example: Class with TypeScript features
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    // [CURSOR HERE] - Test completion
    throw new Error('Not implemented') // Stub implementation
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // [CURSOR HERE] - Test completion
    throw new Error('Not implemented') // Stub implementation
  }
}

// Example: Type guards
function isUser(obj: unknown): obj is User {
  // [CURSOR HERE] - Test completion for type guard
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  ) // Stub implementation
}

// Example: Error handling with types
class CustomError extends Error {
  constructor(
    message: string,
    public code: number,
    public status: string
  ) {
    super(message)
    this.name = 'CustomError'
  }
}

// Example: Union types
type Status = 'pending' | 'completed' | 'failed'

function updateStatus(status: Status): void {
  // [CURSOR HERE] - Test completion with union types
}

// Example: Optional chaining and nullish coalescing
function getUserEmail(user: User | null): string {
  // [CURSOR HERE] - Should suggest optional chaining
  return user?.email ?? '' // Stub implementation
}

// Example: Array methods with types
const users: User[] = []

function findActiveUsers(): User[] {
  // [CURSOR HERE] - Test completion with array methods
  return users.filter(user => user.age !== undefined && user.age > 0) // Stub implementation
}

// Example: Promise handling
function fetchAndProcess(): Promise<void> {
  // [CURSOR HERE] - Test async/await patterns
  return Promise.resolve() // Stub implementation
}

// Example: React component with TypeScript
interface ComponentProps {
  title: string
  count: number
  onUpdate?: (value: number) => void
}

function ReactComponent({ title, count, onUpdate }: ComponentProps) {
  // [CURSOR HERE] - Test React + TypeScript patterns
  return null // Stub implementation (React component would return JSX)
}

// Example: Error boundaries
function handleError(error: unknown): string {
  // [CURSOR HERE] - Test error handling completion
  if (error instanceof Error) {
    return error.message
  }
  return String(error) // Stub implementation
}

// Example: Decorator pattern (for future support)
class Service {
  // [CURSOR HERE] - Test method completion
}

// Export types
export type { User, UserResponse, Status }
export { ApiClient, getUserById, fetchUsers }

