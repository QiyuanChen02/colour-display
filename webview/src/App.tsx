import { useEffect, useState } from 'react'
import './App.css'

interface CssVariable {
  name: string
  value: string
}

interface CssVariableGroup {
  group: string
  variables: CssVariable[]
}

// Extract all CSS variables from the DOM
const extractCssVariables = (): CssVariable[] => {
  const root = document.documentElement
  const styles = root.style
  const vars: CssVariable[] = []

  for (let i = 0; i < styles.length; i++) {
    const name = styles[i]
    if (name.startsWith('--')) {
      const value = styles.getPropertyValue(name).trim()
      console.log(`Found variable: ${name} = ${value}`)
      vars.push({ name, value })
    }
  }

  return vars
}

function App() {
  const [variables, setVariables] = useState<CssVariableGroup[]>([])
  const [filter, setFilter] = useState('')
  const [filteredVariables, setFilteredVariables] = useState<CssVariableGroup[]>([])

  // Check if a value is a valid color (hex or rgba)
  const isColorValue = (value: string): boolean => {
    return /^#([0-9a-f]{3,8})$/i.test(value) || /^rgba?\([\d\s,.]+\)$/i.test(value)
  }

  // Extract group name from variable name
  // Example: --vscode-editor-background => "editor"
  const extractGroupName = (variableName: string): string => {
    const match = variableName.match(/^--vscode-([^-]+)-/)
    return match ? match[1] : 'other'
  }

  // Load and process CSS variables on mount
  useEffect(() => {

    // Group variables by their category
    const groupVariables = (colorVars: CssVariable[]): CssVariableGroup[] => {
      const groupMap = new Map<string, CssVariable[]>()

      // Organize variables into groups
      colorVars.forEach(variable => {
        const group = extractGroupName(variable.name)
        if (!groupMap.has(group)) {
          groupMap.set(group, [])
        }
        groupMap.get(group)!.push(variable)
      })

      // Convert to array and sort
      return Array.from(groupMap.entries())
        .map(([group, variables]) => ({
          group,
          variables: variables.sort((a, b) => a.name.localeCompare(b.name))
        }))
        .sort((a, b) => a.group.localeCompare(b.group))
    }

    try {
      console.log('Loading CSS variables from :root...')
      
      // Extract all CSS variables
      const allVars = extractCssVariables()
      
      // Filter to only color variables
      const colorVars = allVars.filter(v => isColorValue(v.value))
      
      // Group by category
      const grouped = groupVariables(colorVars)
      
      setVariables(grouped)
      setFilteredVariables(grouped)
      console.log('Grouped variables:', grouped)
    } catch (error) {
      console.error('Failed to load variables:', error)
    }
  }, [])

  // Apply filter with debouncing
  useEffect(() => {
    const handler = setTimeout(() => {
      if (!filter) {
        setFilteredVariables(variables)
        return
      }

      const lowerFilter = filter.toLowerCase()
      const filtered = variables
        .map(group => ({
          group: group.group,
          variables: group.variables.filter(variable =>
            variable.name.toLowerCase().includes(lowerFilter)
          )
        }))
        .filter(group => group.variables.length > 0)
      
      setFilteredVariables(filtered)
    }, 500)

    return () => clearTimeout(handler)
  }, [filter, variables])

  // Calculate total number of variables
  const totalVariables = filteredVariables.reduce((acc, group) => acc + group.variables.length, 0)

  return (
    <div className="app">
      <header className="header">
        <h1>VSCode CSS Variables</h1>
        <p className="subtitle">
          {(() => {
            return `${totalVariables} variable${totalVariables === 1 ? '' : 's'} found`
          })()}
        </p>
        <input
          type="text"
          placeholder="Filter variables... (e.g., 'editor', 'button', 'foreground')"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        />
      </header>

      <div className="color-groups">
        {filteredVariables.map(group => (
          <div key={group.group} className="color-group">
            <h2 className="group-title">{group.group}</h2>
            <div className="color-grid">
              {group.variables.map(variable => (
                <div key={variable.name} className="color-card">
                  <div
                    className="color-swatch"
                    style={{ backgroundColor: variable.value }}
                    title={variable.value}
                  />
                  <div className="color-info">
                    <div className="color-name">{variable.name}</div>
                    <div className="color-value">{variable.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredVariables.length === 0 && filter && (
        <div className="no-results">
          No variables found matching "{filter}"
        </div>
      )}
    </div>
  )
}

export default App
