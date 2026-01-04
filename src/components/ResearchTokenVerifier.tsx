import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { toast } from 'sonner'
import { ShieldCheck, MagnifyingGlass, CheckCircle, XCircle, Info } from '@phosphor-icons/react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface ResearchToken {
  id: string
  title: string
  abstract: string
  content: string
  hash: string
  verificationHash: string
  author: string
  authorGitHub: string
  timestamp: number
  links: string[]
  citations: string[]
  category: string
  value: number
  verified: boolean
  repository?: string
}

export function ResearchTokenVerifier() {
  const [tokens] = useLocalStorage<ResearchToken[]>('research-tokens', [])
  const [tokenId, setTokenId] = useState('')
  const [verificationResult, setVerificationResult] = useState<{
    found: boolean
    valid: boolean
    token?: ResearchToken
    computedHash?: string
    computedVerificationHash?: string
  } | null>(null)
  const [isVerifying, setIsVerifying] = useState(false)

  const generateHash = async (data: string): Promise<string> => {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const generateVerificationHash = async (token: ResearchToken): Promise<string> => {
    const verificationData = `${token.title}|${token.abstract}|${token.content}|${token.timestamp}|${token.author}`
    return await generateHash(verificationData)
  }

  const verifyToken = async () => {
    if (!tokenId.trim()) {
      toast.error('Please enter a token ID')
      return
    }

    setIsVerifying(true)
    setVerificationResult(null)

    try {
      const token = tokens?.find(t => t.id === tokenId.trim())

      if (!token) {
        setVerificationResult({
          found: false,
          valid: false
        })
        toast.error('Token not found')
      } else {
        const computedContentHash = await generateHash(token.content)
        const computedVerificationHash = await generateVerificationHash(token)

        const isValid = 
          computedContentHash === token.hash &&
          computedVerificationHash === token.verificationHash

        setVerificationResult({
          found: true,
          valid: isValid,
          token,
          computedHash: computedContentHash,
          computedVerificationHash
        })

        if (isValid) {
          toast.success('Token verified successfully!', {
            description: 'All hashes match - this is an authentic research token'
          })
        } else {
          toast.error('Verification failed', {
            description: 'Token hashes do not match - content may have been tampered with'
          })
        }
      }
    } catch (error) {
      console.error('Verification error:', error)
      toast.error('Verification failed')
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <Card className="gradient-border">
      <CardHeader>
        <div className="flex items-center gap-3">
          <ShieldCheck size={32} weight="duotone" className="text-primary" />
          <div>
            <CardTitle className="text-3xl">Research Token Verifier</CardTitle>
            <CardDescription>
              Verify the authenticity and integrity of research tokens using cryptographic hash verification
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token-id">Token ID</Label>
            <div className="flex gap-2">
              <Input
                id="token-id"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                placeholder="Enter token ID (e.g., RES-1234567890-abc123)"
                className="flex-1"
              />
              <Button 
                onClick={verifyToken} 
                disabled={isVerifying || !tokenId.trim()}
                className="bg-gradient-to-r from-primary to-secondary"
              >
                <MagnifyingGlass size={20} weight="bold" className="mr-2" />
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>

          {verificationResult && (
            <div className="space-y-4 mt-6">
              {!verificationResult.found ? (
                <Alert className="border-destructive/50 bg-destructive/10">
                  <XCircle size={20} weight="fill" className="text-destructive" />
                  <AlertDescription className="ml-2">
                    <strong>Token Not Found</strong>
                    <p className="text-sm mt-1">No research token exists with ID: {tokenId}</p>
                  </AlertDescription>
                </Alert>
              ) : (
                <>
                  <Alert className={verificationResult.valid ? "border-green-500/50 bg-green-500/10" : "border-destructive/50 bg-destructive/10"}>
                    {verificationResult.valid ? (
                      <>
                        <CheckCircle size={20} weight="fill" className="text-green-500" />
                        <AlertDescription className="ml-2">
                          <strong className="text-green-500">Verification Successful</strong>
                          <p className="text-sm mt-1">This research token is authentic and has not been tampered with</p>
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <XCircle size={20} weight="fill" className="text-destructive" />
                        <AlertDescription className="ml-2">
                          <strong className="text-destructive">Verification Failed</strong>
                          <p className="text-sm mt-1">Hash mismatch detected - content may have been modified</p>
                        </AlertDescription>
                      </>
                    )}
                  </Alert>

                  {verificationResult.token && (
                    <Card className="border-accent/20">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CardTitle className="text-xl">{verificationResult.token.title}</CardTitle>
                              {verificationResult.valid && (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle size={14} weight="fill" className="mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-2">
                              <Badge variant="secondary">{verificationResult.token.category}</Badge>
                              <Badge variant="outline" className="font-mono">{verificationResult.token.id}</Badge>
                            </div>
                            <CardDescription>
                              By {verificationResult.token.author} • {new Date(verificationResult.token.timestamp).toLocaleDateString()} • {verificationResult.token.value.toLocaleString()} INF
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {verificationResult.token.abstract && (
                          <div>
                            <h4 className="font-semibold mb-2">Abstract</h4>
                            <p className="text-sm text-muted-foreground">{verificationResult.token.abstract}</p>
                          </div>
                        )}

                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold mb-2">Content Hash Verification</h4>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Stored Hash:</span>
                                <code className="block bg-muted p-2 rounded mt-1 break-all font-mono">
                                  {verificationResult.token.hash}
                                </code>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Computed Hash:</span>
                                <code className="block bg-muted p-2 rounded mt-1 break-all font-mono">
                                  {verificationResult.computedHash}
                                </code>
                              </div>
                              <div className="flex items-center gap-2">
                                {verificationResult.computedHash === verificationResult.token.hash ? (
                                  <>
                                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                                    <span className="text-green-500 font-semibold">Match</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={16} weight="fill" className="text-destructive" />
                                    <span className="text-destructive font-semibold">Mismatch</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2">Verification Hash Check</h4>
                            <div className="space-y-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Stored Verification Hash:</span>
                                <code className="block bg-muted p-2 rounded mt-1 break-all font-mono">
                                  {verificationResult.token.verificationHash}
                                </code>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Computed Verification Hash:</span>
                                <code className="block bg-muted p-2 rounded mt-1 break-all font-mono">
                                  {verificationResult.computedVerificationHash}
                                </code>
                              </div>
                              <div className="flex items-center gap-2">
                                {verificationResult.computedVerificationHash === verificationResult.token.verificationHash ? (
                                  <>
                                    <CheckCircle size={16} weight="fill" className="text-green-500" />
                                    <span className="text-green-500 font-semibold">Match</span>
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={16} weight="fill" className="text-destructive" />
                                    <span className="text-destructive font-semibold">Mismatch</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Alert>
                          <Info size={16} />
                          <AlertDescription className="ml-2 text-xs">
                            <strong>How Verification Works:</strong>
                            <p className="mt-1">
                              The content hash is computed from the research content using SHA-256. 
                              The verification hash is computed from title, abstract, content, timestamp, and author. 
                              Both hashes must match the stored values for the token to be considered authentic.
                            </p>
                          </AlertDescription>
                        </Alert>

                        {verificationResult.token.repository && (
                          <div>
                            <h4 className="font-semibold mb-2">Repository</h4>
                            <a 
                              href={verificationResult.token.repository} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-accent hover:underline"
                            >
                              {verificationResult.token.repository}
                            </a>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
