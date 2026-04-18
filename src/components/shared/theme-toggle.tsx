import { Moon, Sun, SunMoon } from 'lucide-react'
import { Button } from '#/components/ui/button'
import { setTheme, useTheme } from '#/stores/theme'

export function ThemeToggle() {
  const theme = useTheme()

  const options = [
    { value: 'light', icon: Sun, label: '亮色' },
    { value: 'dark', icon: Moon, label: '深色' },
    { value: 'system', icon: SunMoon, label: '跟随系统' },
  ] as const

  const currentOption = options.find((opt) => opt.value === theme) || options[0]

  const handleToggle = () => {
    const currentIndex = options.findIndex((opt) => opt.value === theme)
    const nextIndex = (currentIndex + 1) % options.length
    setTheme(options[nextIndex].value)
  }

  const Icon = currentOption.icon

  return (
    <Button
      variant='ghost'
      size='icon-sm'
      onClick={handleToggle}
      className='rounded-full'
    >
      <Icon className='size-4' />
    </Button>
  )
}
