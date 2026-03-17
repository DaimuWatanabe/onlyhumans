// Supabase データベース型定義（手動作成）
// supabase gen types typescript でも自動生成可能
// @supabase/supabase-js v2.99.x が要求する GenericSchema 互換の型構造

export type C2paStatus = 'pending' | 'verified_human' | 'no_data' | 'rejected_ai'
export type ReactionType = 'like' | 'love' | 'fire' | 'wow'
export type NotificationType = 'like' | 'comment' | 'follow' | 'mention' | 'board_add'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string | null
          avatar_url: string | null
          bio: string | null
          website_url: string | null
          is_verified: boolean
          follower_count: number
          following_count: number
          image_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          is_verified?: boolean
          follower_count?: number
          following_count?: number
          image_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          username?: string
          display_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website_url?: string | null
          is_verified?: boolean
          follower_count?: number
          following_count?: number
          image_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      images: {
        Row: {
          id: string
          user_id: string
          legacy_pin_id: string | null
          title: string
          description: string | null
          image_url: string
          storage_path: string | null
          width: number | null
          height: number | null
          file_size: number | null
          mime_type: string | null
          c2pa_status: C2paStatus
          manifest_json: Record<string, unknown> | null
          signer_info: Record<string, unknown> | null
          device_info: Record<string, unknown> | null
          software_info: Record<string, unknown> | null
          is_ai_flagged: boolean
          view_count: number
          like_count: number
          comment_count: number
          save_count: number
          is_public: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          legacy_pin_id?: string | null
          title: string
          description?: string | null
          image_url: string
          storage_path?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          mime_type?: string | null
          c2pa_status?: C2paStatus
          manifest_json?: Record<string, unknown> | null
          signer_info?: Record<string, unknown> | null
          device_info?: Record<string, unknown> | null
          software_info?: Record<string, unknown> | null
          is_ai_flagged?: boolean
          is_public?: boolean
        }
        Update: {
          title?: string
          description?: string | null
          c2pa_status?: C2paStatus
          is_public?: boolean
          view_count?: number
          like_count?: number
          comment_count?: number
          save_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'images_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      boards: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          cover_image_url: string | null
          is_private: boolean
          image_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          cover_image_url?: string | null
          is_private?: boolean
        }
        Update: {
          name?: string
          description?: string | null
          cover_image_url?: string | null
          is_private?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'boards_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      board_images: {
        Row: {
          id: string
          board_id: string
          image_id: string
          added_at: string
        }
        Insert: {
          id?: string
          board_id: string
          image_id: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'board_images_board_id_fkey'
            columns: ['board_id']
            isOneToOne: false
            referencedRelation: 'boards'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'board_images_image_id_fkey'
            columns: ['image_id']
            isOneToOne: false
            referencedRelation: 'images'
            referencedColumns: ['id']
          }
        ]
      }
      comments: {
        Row: {
          id: string
          image_id: string
          user_id: string
          parent_id: string | null
          content: string
          like_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          image_id: string
          user_id: string
          parent_id?: string | null
          content: string
        }
        Update: {
          content?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'comments_image_id_fkey'
            columns: ['image_id']
            isOneToOne: false
            referencedRelation: 'images'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'comments_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      reactions: {
        Row: {
          id: string
          image_id: string
          user_id: string
          type: ReactionType
          created_at: string
        }
        Insert: {
          id?: string
          image_id: string
          user_id: string
          type?: ReactionType
        }
        Update: {
          type?: ReactionType
        }
        Relationships: [
          {
            foreignKeyName: 'reactions_image_id_fkey'
            columns: ['image_id']
            isOneToOne: false
            referencedRelation: 'images'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'reactions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'follows_follower_id_fkey'
            columns: ['follower_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'follows_following_id_fkey'
            columns: ['following_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string | null
          type: NotificationType
          image_id: string | null
          comment_id: string | null
          board_id: string | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id?: string | null
          type: NotificationType
          image_id?: string | null
          comment_id?: string | null
          board_id?: string | null
          is_read?: boolean
        }
        Update: {
          is_read?: boolean
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          image_count: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          image_count?: number
        }
        Relationships: []
      }
      image_tags: {
        Row: {
          id: string
          image_id: string
          tag_id: string
        }
        Insert: {
          id?: string
          image_id: string
          tag_id: string
        }
        Update: Record<string, never>
        Relationships: [
          {
            foreignKeyName: 'image_tags_image_id_fkey'
            columns: ['image_id']
            isOneToOne: false
            referencedRelation: 'images'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'image_tags_tag_id_fkey'
            columns: ['tag_id']
            isOneToOne: false
            referencedRelation: 'tags'
            referencedColumns: ['id']
          }
        ]
      }
      search_history: {
        Row: {
          id: string
          user_id: string
          query: string
          result_count: number | null
          searched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          query: string
          result_count?: number | null
        }
        Update: Record<string, never>
        Relationships: []
      }
      view_history: {
        Row: {
          id: string
          image_id: string
          user_id: string | null
          viewer_ip: string | null
          viewed_at: string
        }
        Insert: {
          id?: string
          image_id: string
          user_id?: string | null
          viewer_ip?: string | null
        }
        Update: Record<string, never>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      c2pa_status: C2paStatus
      reaction_type: ReactionType
      notification_type: NotificationType
    }
    CompositeTypes: Record<string, never>
  }
}
