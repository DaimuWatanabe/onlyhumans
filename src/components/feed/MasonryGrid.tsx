'use client'

import { motion } from 'framer-motion'
import { PinCard } from './PinCard'
import { PinCardData } from '@/types/pin'

interface MasonryGridProps {
  pins: PinCardData[]
  currentUserId?: string | null
}

export function MasonryGrid({ pins, currentUserId }: MasonryGridProps) {
  if (pins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
        <p className="text-lg font-medium">まだ投稿がありません</p>
        <p className="text-sm mt-1">最初の人間による作品を投稿してみましょう</p>
      </div>
    )
  }

  return (
    <motion.div
      className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 gap-4 px-4 md:px-6"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: { staggerChildren: 0.04 },
        },
      }}
    >
      {pins.map((pin, index) => (
        <PinCard
          key={pin.id}
          id={pin.id}
          image={pin.image}
          title={pin.title}
          c2paStatus={pin.c2paStatus}
          author={pin.author}
          index={index}
          currentUserId={currentUserId}
        />
      ))}
    </motion.div>
  )
}
