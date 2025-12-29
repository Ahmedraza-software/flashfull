import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple test component
const TestComponent = ({ count = 0, onIncrement }: { count?: number; onIncrement?: () => void }) => (
  <div>
    <span data-testid="count">Count: {count}</span>
    <button data-testid="increment" onClick={onIncrement} type="button">
      Increment
    </button>
  </div>
)

describe('Simple Component', () => {
  test('renders with default props', () => {
    render(<TestComponent />)
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 0')
    expect(screen.getByTestId('increment')).toBeInTheDocument()
  })

  test('renders with custom count', () => {
    render(<TestComponent count={5} />)
    expect(screen.getByTestId('count')).toHaveTextContent('Count: 5')
  })

  test('calls onIncrement when button is clicked', () => {
    const handleIncrement = jest.fn()
    render(<TestComponent onIncrement={handleIncrement} />)
    
    const button = screen.getByTestId('increment')
    fireEvent.click(button)
    
    expect(handleIncrement).toHaveBeenCalledTimes(1)
  })

  test('button is clickable', () => {
    render(<TestComponent />)
    const button = screen.getByTestId('increment')
    
    expect(button).not.toBeDisabled()
    expect(button).toHaveAttribute('type', 'button')
  })
})
