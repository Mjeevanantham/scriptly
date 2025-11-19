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
}

// Example: Generic function
function processItems<T>(items: T[]): T[] {
  // [CURSOR HERE] - Test completion
}

// Example: Async/await with types
async function fetchUsers(): Promise<UserResponse> {
  // [CURSOR HERE] - Should suggest fetch and type casting
}

// Example: Class with TypeScript features
class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(endpoint: string): Promise<T> {
    // [CURSOR HERE] - Test completion
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    // [CURSOR HERE] - Test completion
  }
}

// Example: Type guards
function isUser(obj: unknown): obj is User {
  // [CURSOR HERE] - Test completion for type guard
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
}

// Example: Array methods with types
const users: User[] = []

function findActiveUsers(): User[] {
  // [CURSOR HERE] - Test completion with array methods
}

// Example: Promise handling
function fetchAndProcess(): Promise<void> {
  // [CURSOR HERE] - Test async/await patterns
}

// Example: React component with TypeScript
interface ComponentProps {
  title: string
  count: number
  onUpdate?: (value: number) => void
}

function ReactComponent({ title, count, onUpdate }: ComponentProps) {
  // [CURSOR HERE] - Test React + TypeScript patterns
}

// Example: Error boundaries
function handleError(error: unknown): string {
  // [CURSOR HERE] - Test error handling completion
}

// Example: Decorator pattern (for future support)
class Service {
  // [CURSOR HERE] - Test method completion
}

// Export types
export type { User, UserResponse, Status }
export { ApiClient, getUserById, fetchUsers }

