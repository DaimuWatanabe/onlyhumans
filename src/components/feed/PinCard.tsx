'use client'

import { motion } from 'framer-motion'
import { Share2, MoreHorizontal, Bookmark } from 'lucide-react'
import { useState } from 'react'
import Image from 'next/image'
import { C2PABadge } from '@/components/pin/C2PABadge'
import { C2PAStatus } from '@/types/c2pa'

interface PinCardProps {
  id: string
  image: string
  title: string
  c2paStatus: C2PAStatus
  author: {
    name: string
    avatar: string | null
  }
  index: number
}

export function PinCard({ id, image, title, c2paStatus, author, index }: PinCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  return (
    <motion.div
      className="relative break-inside-avoid mb-4 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-pin-id={id}
    >
      <div className="relative rounded-2xl overflow-hidden group">
        {/* Main Image */}
        <Image
          src={image}
          alt={title}
          width={400}
          height={600}
          className="w-full h-auto object-cover"
          unoptimized
        />

        {/* C2PA Badge - Always Visible (verified_humanのみ表示) */}
        {c2paStatus === 'verified_human' && (
          <div className="absolute top-3 left-3 z-10">
            <C2PABadge status={c2paStatus} />
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div
          className="absolute inset-0 bg-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Hover Actions */}
        <motion.div
          className="absolute inset-0 p-4 flex flex-col justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Top Right - Save Button */}
          <div className="flex justify-end">
            <motion.button
              className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-colors ${
                isSaved
                  ? 'bg-foreground text-background'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                setIsSaved(!isSaved)
              }}
            >
              {isSaved ? '保存済み' : '保存'}
            </motion.button>
          </div>

          {/* Bottom Section */}
          <div className="flex items-end justify-between">
            {/* Author Info */}
            <div className="flex items-center gap-2">
              <div className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-background bg-muted flex items-center justify-center">
                {author.avatar ? (
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <span className="text-xs font-medium text-muted-foreground">
                    {author.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-background">{author.name}</span>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-1">
              <motion.button
                className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                aria-label="保存"
              >
                <Bookmark className="h-4 w-4 text-foreground" />
              </motion.button>
              <motion.button
                className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                aria-label="シェア"
              >
                <Share2 className="h-4 w-4 text-foreground" />
              </motion.button>
              <motion.button
                className="p-2 rounded-full bg-background/90 hover:bg-background transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
                aria-label="その他"
              >
                <MoreHorizontal className="h-4 w-4 text-foreground" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
