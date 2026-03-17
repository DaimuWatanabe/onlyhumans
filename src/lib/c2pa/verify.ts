import { C2PAResult } from '@/types/c2pa'

// AI生成コンテンツを示すC2PAアサーションのリスト
const AI_GENERATION_ASSERTIONS = [
  'c2pa.training-mining',
  'com.adobe.generative-ai',
  'c2pa.ai_generative',
  'ai_tool',
  'com.openai',
  'com.stability.ai',
  'com.midjourney',
  'com.runway',
]

// AI生成ソフトウェアのリスト（小文字で比較）
const AI_SOFTWARE_NAMES = [
  'stable diffusion',
  'midjourney',
  'dall-e',
  'dalle',
  'firefly',
  'adobe firefly',
  'imagen',
  'sora',
  'runway',
  'pika',
  'kling',
  'flux',
  'generative fill',
  'content-aware fill',
]

export async function verifyC2PA(imageBuffer: Buffer, mimeType = 'image/jpeg'): Promise<C2PAResult> {
  try {
    // c2pa-nodeを動的インポート（Node.js Runtimeのみ使用可能）
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createC2pa } = require('c2pa-node')

    const c2pa = createC2pa()

    let manifest
    try {
      manifest = await c2pa.read({ buffer: imageBuffer, mimeType })
    } catch {
      // C2PAデータなし = 人間が作った可能性のある普通の画像
      return { status: 'no_data' }
    }

    if (!manifest || !manifest.active_manifest) {
      return { status: 'no_data' }
    }

    const activeManifest = manifest.active_manifest

    // --- AI フラグチェック ---

    // 1. アサーション（宣言）でAIフラグを確認
    const assertions = activeManifest.assertions || []
    for (const assertion of assertions) {
      const label = (assertion.label || '').toLowerCase()

      if (AI_GENERATION_ASSERTIONS.some(ai => label.includes(ai.toLowerCase()))) {
        return {
          status: 'rejected_ai',
          reason: `AI生成コンテンツのマーカーが検出されました: ${assertion.label}`,
        }
      }

      // do_not_train フラグ（AI学習拒否）は人間コンテンツの証拠
      // ここでは拒否の理由にはしない
    }

    // 2. ソフトウェア情報でAIツール使用を確認
    const claimGenerator = activeManifest.claim_generator || ''
    const softwareLower = claimGenerator.toLowerCase()

    for (const aiSoftware of AI_SOFTWARE_NAMES) {
      if (softwareLower.includes(aiSoftware)) {
        return {
          status: 'rejected_ai',
          reason: `AI生成ツール「${claimGenerator}」による画像が検出されました`,
        }
      }
    }

    // 3. 成分（ingredients）でAI生成元を確認
    const ingredients = activeManifest.ingredients || []
    for (const ingredient of ingredients) {
      const ingredientRelationship = ingredient.relationship || ''
      if (ingredientRelationship === 'parentOf') {
        const parentSoftware = (ingredient.claim_generator || '').toLowerCase()
        for (const aiSoftware of AI_SOFTWARE_NAMES) {
          if (parentSoftware.includes(aiSoftware)) {
            return {
              status: 'rejected_ai',
              reason: `AI生成コンテンツから派生した画像が検出されました`,
            }
          }
        }
      }
    }

    // --- Human検証 ---

    // 署名者情報を抽出
    const signerInfo: C2PAResult & { status: 'verified_human' } extends { signerInfo: infer T } ? T : never = {}

    if (activeManifest.signature_info) {
      const sig = activeManifest.signature_info
      if (sig.cert_serial_number) {
        signerInfo.name = sig.issuer || undefined
        signerInfo.timestamp = sig.time || undefined
      }
    }

    // デバイス情報を抽出（Exif相当）
    let deviceInfo: { make?: string; model?: string } | undefined
    for (const assertion of assertions) {
      if (assertion.label === 'stds.exif') {
        const data = assertion.data || {}
        if (data['Exif:Make'] || data['Exif:Model']) {
          deviceInfo = {
            make: data['Exif:Make'],
            model: data['Exif:Model'],
          }
        }
      }
    }

    // ソフトウェア情報
    const softwareInfo = claimGenerator
      ? { name: claimGenerator }
      : undefined

    return {
      status: 'verified_human',
      signerInfo,
      deviceInfo,
      softwareInfo,
      manifestJson: manifest as unknown as Record<string, unknown>,
    }
  } catch (error) {
    console.error('C2PA検証エラー:', error)
    // エラー時はno_dataとして扱う（ブロックしない）
    return { status: 'no_data' }
  }
}
