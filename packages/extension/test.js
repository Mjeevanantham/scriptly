// Test file for Scriptly VS Code Extension
// Use this file to test code completion, chat, and other features

// Example: Simple function
function greet(name) {
  console.log(`Hello, ${name}!`)
}

// Example: Async function
async function fetchUserData(userId) {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
}

// Example: Class with methods
class UserManager {
  constructor() {
    this.users = []
  }

  addUser(user) {
    this.users.push(user)
  }

  findUser(id) {
    return this.users.find(u => u.id === id)
  }
}

// Example: Array operations
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
const even = numbers.filter(n => n % 2 === 0)

// Example: Error handling
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero')
  }
  return a / b
}

// Example: Promise chain
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    console.log('Data:', data)
  })
  .catch(error => {
    console.error('Error:', error)
  })

// Example: Destructuring
const person = { name: 'John', age: 30, city: 'New York' }
const { name, age } = person

// Example: Template literals
const message = `User ${name} is ${age} years old`

// Example: Arrow functions
const multiply = (a, b) => a * b

// Example: Spread operator
const arr1 = [1, 2, 3]
const arr2 = [...arr1, 4, 5]

// TODO: Implement user authentication
// TODO: Add error logging
// TODO: Optimize database queries

// Test scenarios for AI completion:
// 1. Press Tab after the function declaration below to test completion
function processData(data) {
  // [CURSOR HERE] - Press Tab to get AI completion
}

// 2. Test chat: Select this code and ask "How can I optimize this function?"
function inefficientFunction(items) {
  const result = []
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      if (items[i].id === items[j].id) {
        result.push(items[i])
      }
    }
  }
  return result
}

// 3. Test completion with context
const userService = {
  getAllUsers: async () => {
    // [CURSOR HERE] - Should suggest code based on fetchUserData above
  }
}

// 4. Test with TypeScript-like patterns
function calculateTotal(items) {
  // [CURSOR HERE] - Should suggest reduce or similar patterns
}

// Example with comments for chat testing
function complexFunction() {
  // This function does multiple things - test asking "How can I refactor this?"
  const data = fetchUserData(123)
  const processed = data.map(x => x.value * 2)
  const filtered = processed.filter(x => x > 10)
  return filtered.sort((a, b) => b - a)
}

// Example: Event handlers
document.addEventListener('click', (event) => {
  // [CURSOR HERE] - Test completion
})

// Example: React-like component (for testing)
function Component(props) {
  const [state, setState] = useState(0)
  
  useEffect(() => {
    // [CURSOR HERE] - Test completion with React patterns
  }, [])
  
  return null
}

// Test completion in different contexts
const obj = {
  method1() {
    // [CURSOR HERE]
  },
  method2() {
    // [CURSOR HERE]
  }
}

// Export for module testing
module.exports = {
  greet,
  fetchUserData,
  UserManager,
  divide
}

