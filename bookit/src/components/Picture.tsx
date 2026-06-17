interface PictureProps {
  avif?: string
  webp?: string
  fallback: string
  alt: string
  className?: string
}

export default function Picture({ avif, webp, fallback, alt, className }: PictureProps) {
  return (
    <picture>
      {avif && <source srcSet={avif} type="image/avif" />}
      {webp && <source srcSet={webp} type="image/webp" />}
      <img src={fallback} alt={alt} className={className} />
    </picture>
  )
}