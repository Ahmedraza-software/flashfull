import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button, Card, Space } from 'antd'

describe('Ant Design Components', () => {
  test('Button renders correctly', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  test('Button handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const button = screen.getByRole('button', { name: /click me/i })
    fireEvent.click(button)
    
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  test('Card renders with title', () => {
    render(<Card title="Test Card">Content</Card>)
    expect(screen.getByText('Test Card')).toBeInTheDocument()
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  test('Space renders children', () => {
    render(
      <Space>
        <span>Item 1</span>
        <span>Item 2</span>
      </Space>
    )
    
    expect(screen.getByText('Item 1')).toBeInTheDocument()
    expect(screen.getByText('Item 2')).toBeInTheDocument()
  })
})
