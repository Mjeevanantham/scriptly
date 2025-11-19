# Python test file for Scriptly VS Code Extension
# Test code completion and chat features

# Example: Simple function
def greet(name):
    print(f"Hello, {name}!")

# Example: Class definition
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
    
    def get_display_name(self):
        # [CURSOR HERE] - Test completion
        pass

# Example: Async function
async def fetch_data(url):
    # [CURSOR HERE] - Test async completion
    pass

# Example: List comprehension
numbers = [1, 2, 3, 4, 5]
squared = [n * n for n in numbers]

# Example: Dictionary operations
user_data = {
    "name": "John",
    "age": 30,
    "city": "New York"
}

# Example: Exception handling
def divide(a, b):
    try:
        # [CURSOR HERE] - Test completion
        return a / b
    except ZeroDivisionError:
        return None

# Example: Type hints (Python 3.5+)
def process_items(items: list[int]) -> list[int]:
    # [CURSOR HERE] - Test completion with type hints
    pass

# Example: Context manager
def read_file(filename):
    # [CURSOR HERE] - Should suggest 'with open(...)'
    pass

# Example: Generator function
def generate_numbers(n):
    # [CURSOR HERE] - Test generator completion
    for i in range(n):
        yield i * 2

# Example: Decorator
def decorator(func):
    # [CURSOR HERE] - Test decorator pattern
    pass

# Test scenarios:
# 1. Press Tab after function definition to test completion
def calculate_total(items):
    # [CURSOR HERE] - Press Tab here
    pass

# 2. Test chat: Select code and ask "How can I optimize this?"
def inefficient_function(items):
    result = []
    for i in range(len(items)):
        for j in range(len(items)):
            if items[i].id == items[j].id:
                result.append(items[i])
    return result

# Example: Data class (Python 3.7+)
from dataclasses import dataclass

@dataclass
class Product:
    name: str
    price: float
    # [CURSOR HERE] - Test dataclass completion

# Example: Type checking
from typing import Optional, List, Dict

def find_user(users: List[User], user_id: int) -> Optional[User]:
    # [CURSOR HERE] - Test with type hints
    pass

