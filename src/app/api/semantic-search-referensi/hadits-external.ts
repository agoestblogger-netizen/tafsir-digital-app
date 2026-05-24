import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }
  if (normA === 0 || normB === 0) return 0
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  })
  return response.data[0].embedding
}

interface ExternalHaditsRecommendation {
  perawi: string
  nomor: number
}

export async function searchHaditsExternal(query: string): Promise<any[]> {
  try {
    console.log(`[Hadits External] Searching for: "${query}"`)

    // Step 1: Ask GPT-4o-mini for 3 relevant perawi & hadith numbers
    const prompt = `Berikan 3 hadits yang relevan dengan query ini: '${query}'
Format JSON array: [{"perawi": "bukhari", "nomor": 123}, ...]
Perawi valid: bukhari, muslim, abu-daud, tirmidzi, nasai, ibnu-majah, ahmad, malik, darimi
Jawab HANYA JSON array, tidak ada teks lain.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const responseText = completion.choices[0]?.message?.content ?? '{"hadits": []}'
    let recommendations: ExternalHaditsRecommendation[] = []

    try {
      const parsed = JSON.parse(responseText.trim())
      // gpt-4o-mini might return {"hadits": [...]} or just [...] depending on formatting, let's parse both
      const list = Array.isArray(parsed) ? parsed : (parsed.hadits ?? parsed.data ?? [])
      if (Array.isArray(list)) {
        recommendations = list as ExternalHaditsRecommendation[]
      }
    } catch (parseErr) {
      console.error('[Hadits External] Failed to parse GPT recommendation response JSON:', responseText, parseErr)
      return []
    }

    console.log(`[Hadits External] GPT Recommendations:`, recommendations)

    // Step 2 & 3: Fetch hadiths from the Gading API and query embedding concurrently
    const queryEmbeddingPromise = getEmbedding(query)

    const haditsPromises = recommendations.map(async (rec) => {
      const perawiClean = rec.perawi.toLowerCase().trim().replace(/\s+/g, '-')
      const nomorClean = rec.nomor

      try {
        const res = await fetch(`https://api.hadith.gading.dev/books/${perawiClean}/${nomorClean}`)
        if (!res.ok) {
          console.warn(`[Hadits External] API fetch failed for ${perawiClean}/${nomorClean}: Status ${res.status}`)
          return null
        }
        
        const json = await res.json()
        if (json.code !== 200 || !json.data) {
          return null
        }

        const data = json.data
        return {
          perawi: perawiClean,
          nomor: nomorClean,
          arab: data.arab ?? '',
          id: data.id ?? '' // translation text (Indonesian)
        }
      } catch (err) {
        console.error(`[Hadits External] Fetch error for ${perawiClean}/${nomorClean}:`, err)
        return null
      }
    })

    const fetchedHaditsList = (await Promise.all(haditsPromises)).filter((h): h is NonNullable<typeof h> => h !== null)
    if (fetchedHaditsList.length === 0) {
      return []
    }

    const queryEmbedding = await queryEmbeddingPromise

    // Step 4, 5, 6, 7 & 8: Calculate similarity and format results
    const results: any[] = []

    for (const h of fetchedHaditsList) {
      if (!h.id || h.id.trim().length === 0) continue

      try {
        const matanEmbedding = await getEmbedding(h.id)
        const similarity = cosineSimilarity(queryEmbedding, matanEmbedding)
        
        console.log(`[Hadits External] Similarity for ${h.perawi}/${h.nomor}:`, similarity.toFixed(4))

        if (similarity >= 0.20) {
          const capitalizedPerawi = h.perawi.charAt(0).toUpperCase() + h.perawi.slice(1)
          
          results.push({
            id: `ext-${h.perawi}-${h.nomor}`,
            type: 'hadits' as const,
            judul: `Hadits (${capitalizedPerawi}) — No. ${h.nomor} (Eksternal)`,
            deskripsi_singkat: h.id.slice(0, 120) + '...',
            relevansi_score: Math.round(similarity * 100),
            data: {
              id: `ext-${h.perawi}-${h.nomor}`,
              arab: h.arab,
              matan: h.arab,
              terjemah: h.id,
              perawi: h.perawi,
              nomor: String(h.nomor),
              topik_nama: `Hadits Eksternal ${capitalizedPerawi}`,
              tags: [],
              konteks_hadits: { ringkasan: h.id.slice(0, 120) + '...' },
              similarity: similarity,
              sumber: 'external'
            }
          })
        }
      } catch (err) {
        console.error(`[Hadits External] Error processing embedding/similarity for ${h.perawi}/${h.nomor}:`, err)
      }
    }

    return results

  } catch (err) {
    console.error('[Hadits External] Main workflow error:', err)
    return []
  }
}
