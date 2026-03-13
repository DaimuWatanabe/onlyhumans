'use client'

import { Search, Bell, MessageCircle, User, Upload } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface HeaderProps {
  onUploadClick?: () => void
}

export function Header({ onUploadClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Only Human
          </span>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-2xl mx-4 md:mx-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="人間が作ったアートを検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-input rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
          </div>
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={onUploadClick}
            variant="default"
            size="sm"
            className="rounded-full hidden sm:flex"
          >
            <Upload className="h-4 w-4 mr-1" />
            投稿
          </Button>
          <button
            className="p-3 rounded-full hover:bg-secondary transition-colors"
            aria-label="通知"
          >
            <Bell className="h-5 w-5 text-foreground" />
          </button>
          <button
            className="p-3 rounded-full hover:bg-secondary transition-colors"
            aria-label="メッセージ"
          >
            <MessageCircle className="h-5 w-5 text-foreground" />
          </button>
          <button
            className="p-3 rounded-full hover:bg-secondary transition-colors"
            aria-label="プロフィール"
          >
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <User className="h-4 w-4 text-primary-foreground" />
            </div>
          </button>
        </div>
      </div>
    </header>
  )
}
