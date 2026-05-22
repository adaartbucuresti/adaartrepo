export default function LogoWatermark({ className = '' }) {
  return (
    <div
      aria-hidden="true"
      className={[
        'pointer-events-none absolute bottom-3 right-3 h-8 w-24 bg-white opacity-15 sm:bottom-4 sm:right-4 sm:h-9 sm:w-28',
        className,
      ].join(' ')}
      style={{
        WebkitMaskImage: 'url(/logo.svg)',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskSize: 'contain',
        WebkitMaskPosition: 'center',
        maskImage: 'url(/logo.svg)',
        maskRepeat: 'no-repeat',
        maskSize: 'contain',
        maskPosition: 'center',
      }}
    />
  )
}
