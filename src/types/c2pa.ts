export type C2PAStatus = 'pending' | 'verified_human' | 'no_data' | 'rejected_ai'

export type C2PAResult =
  | {
      status: 'verified_human'
      signerInfo: {
        name?: string
        organization?: string
        timestamp?: string
      }
      deviceInfo?: {
        make?: string
        model?: string
      }
      softwareInfo?: {
        name?: string
        version?: string
      }
      manifestJson: Record<string, unknown>
    }
  | {
      status: 'no_data'
    }
  | {
      status: 'rejected_ai'
      reason: string
    }
