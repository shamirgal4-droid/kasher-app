export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full border-4 border-kasher-blue/20 border-t-kasher-blue`} />
  )
}

export function FullPageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-kasher-light">
      <Spinner size="lg" />
    </div>
  )
}
