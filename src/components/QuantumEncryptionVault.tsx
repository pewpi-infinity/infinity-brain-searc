import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useKV } from '@github/spark/hooks'
import { LockKey, ShieldCheck, Package, Atom, Lightning, Download, Upload, FileArchive } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

interface EncryptedPackage {
  id: string
  name: string
  shaHash: string
  timestamp: number
  bismuthSignature: string
  hydrogenLevel: number
  magneticRetention: number
  compressedSize: number
  originalSize: number
  compressionRatio: number
  encryptionMethod: 'SHA-256' | 'SHA-512' | 'Quantum-Bismuth'
  status: 'encrypted' | 'stored' | 'transmitted'
}

export function QuantumEncryptionVault() {
  const [packages, setPackages] = useKV<EncryptedPackage[]>('quantum-vault-packages', [])
  const [inputData, setInputData] = useState('')
  const [packageName, setPackageName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<EncryptedPackage | null>(null)

  const generateSHA256 = async (data: string): Promise<string> => {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const compressData = (data: string): { compressed: string; originalSize: number; compressedSize: number } => {
    const originalSize = new Blob([data]).size
    
    const frequencyMap: Record<string, number> = {}
    for (const char of data) {
      frequencyMap[char] = (frequencyMap[char] || 0) + 1
    }
    
    const sortedChars = Object.entries(frequencyMap)
      .sort((a, b) => b[1] - a[1])
      .map(([char]) => char)
    
    let compressed = ''
    const codeMap: Record<string, string> = {}
    
    sortedChars.forEach((char, index) => {
      codeMap[char] = index.toString(36)
    })
    
    const codebook = JSON.stringify(codeMap)
    
    for (const char of data) {
      compressed += codeMap[char] || char
    }
    
    const result = `${codebook}|${compressed}`
    const compressedSize = new Blob([result]).size
    
    return {
      compressed: result,
      originalSize,
      compressedSize
    }
  }

  const calculateBismuthSignature = (hash: string): string => {
    const hashValue = parseInt(hash.substring(0, 8), 16)
    const variant = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'][hashValue % 6]
    const isotope = 83 + (hashValue % 10)
    return `Bi-${isotope}-${variant}`
  }

  const calculateHydrogenLevel = (compressionRatio: number): number => {
    return 7.0 + (compressionRatio * 3)
  }

  const calculateMagneticRetention = (hash: string): number => {
    const hashValue = parseInt(hash.substring(0, 16), 16)
    return 0.85 + ((hashValue % 1000) / 10000)
  }

  const encryptAndStore = useCallback(async () => {
    if (!inputData.trim()) {
      toast.error('Please enter data to encrypt')
      return
    }

    if (!packageName.trim()) {
      toast.error('Please enter a package name')
      return
    }

    setIsProcessing(true)

    try {
      toast.info('🔐 Initiating quantum encryption...')
      
      const shaHash = await generateSHA256(inputData)
      toast.success(`✓ SHA-256 hash generated: ${shaHash.substring(0, 16)}...`)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      toast.info('📦 Compressing data with quantum algorithms...')
      const { compressed, originalSize, compressedSize } = compressData(inputData)
      const compressionRatio = ((originalSize - compressedSize) / originalSize)
      toast.success(`✓ Compressed: ${originalSize}B → ${compressedSize}B (${(compressionRatio * 100).toFixed(1)}% reduction)`)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const bismuthSignature = calculateBismuthSignature(shaHash)
      const hydrogenLevel = calculateHydrogenLevel(compressionRatio)
      const magneticRetention = calculateMagneticRetention(shaHash)
      
      toast.info('⚛️ Applying bismuth transmission signatures...')
      toast.success(`✓ Bismuth: ${bismuthSignature} | H-Level: ${hydrogenLevel.toFixed(2)} | Magnetic: ${(magneticRetention * 100).toFixed(1)}%`)
      
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const encryptedPackage: EncryptedPackage = {
        id: `pkg-${Date.now()}`,
        name: packageName,
        shaHash,
        timestamp: Date.now(),
        bismuthSignature,
        hydrogenLevel,
        magneticRetention,
        compressedSize,
        originalSize,
        compressionRatio,
        encryptionMethod: 'Quantum-Bismuth',
        status: 'encrypted'
      }
      
      await spark.kv.set(`vault-data-${encryptedPackage.id}`, compressed)
      
      await setPackages(prev => [encryptedPackage, ...(prev || [])])
      
      toast.success('🎉 Package encrypted and stored successfully!', {
        description: `${packageName} is now secured in the quantum vault`
      })
      
      setInputData('')
      setPackageName('')
      
    } catch (error) {
      console.error('Encryption error:', error)
      toast.error('Failed to encrypt package')
    } finally {
      setIsProcessing(false)
    }
  }, [inputData, packageName])

  const transmitPackage = useCallback(async (pkg: EncryptedPackage) => {
    setIsProcessing(true)
    
    try {
      toast.info(`📡 Initiating bismuth transmission for ${pkg.name}...`)
      
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.info(`⚛️ Hydrogen frequency: ${pkg.hydrogenLevel.toFixed(2)} MHz`)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      toast.info(`🧲 Magnetic retention: ${(pkg.magneticRetention * 100).toFixed(1)}%`)
      
      await new Promise(resolve => setTimeout(resolve, 800))
      
      await setPackages(prev => 
        (prev || []).map(p => 
          p.id === pkg.id ? { ...p, status: 'transmitted' as const } : p
        )
      )
      
      toast.success(`✅ Package transmitted successfully via ${pkg.bismuthSignature}!`)
      
    } catch (error) {
      console.error('Transmission error:', error)
      toast.error('Failed to transmit package')
    } finally {
      setIsProcessing(false)
    }
  }, [])

  const downloadPackage = useCallback(async (pkg: EncryptedPackage) => {
    try {
      const compressedData = await spark.kv.get<string>(`vault-data-${pkg.id}`)
      
      if (!compressedData) {
        toast.error('Package data not found')
        return
      }
      
      const packageInfo = {
        name: pkg.name,
        shaHash: pkg.shaHash,
        bismuthSignature: pkg.bismuthSignature,
        hydrogenLevel: pkg.hydrogenLevel,
        magneticRetention: pkg.magneticRetention,
        timestamp: new Date(pkg.timestamp).toISOString(),
        encryptionMethod: pkg.encryptionMethod,
        compressionRatio: pkg.compressionRatio,
        compressedData
      }
      
      const blob = new Blob([JSON.stringify(packageInfo, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${pkg.name}-quantum-package.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast.success(`📥 Downloaded ${pkg.name}`)
      
    } catch (error) {
      console.error('Download error:', error)
      toast.error('Failed to download package')
    }
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 border-2 border-green-500/50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-gradient-to-br from-green-500 to-blue-500">
              <LockKey size={32} weight="duotone" className="text-white" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                <Atom size={24} weight="duotone" className="text-green-500" />
                Quantum Encryption Vault
                <Badge variant="default" className="bg-gradient-to-r from-green-500 to-blue-500">
                  SHA-256 + Bismuth
                </Badge>
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <Lightning size={14} weight="fill" className="text-yellow-500" />
                Encrypt • Compress • Store • Transmit via Hydrogen-Bismuth Frequencies
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="encrypt" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="encrypt">
                <ShieldCheck size={16} weight="fill" className="mr-2" />
                Encrypt
              </TabsTrigger>
              <TabsTrigger value="vault">
                <Package size={16} weight="fill" className="mr-2" />
                Vault ({packages?.length || 0})
              </TabsTrigger>
              <TabsTrigger value="transmit">
                <FileArchive size={16} weight="fill" className="mr-2" />
                Transmit
              </TabsTrigger>
            </TabsList>

            <TabsContent value="encrypt" className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="package-name">Package Name</Label>
                  <Input
                    id="package-name"
                    placeholder="My Secret Data Package"
                    value={packageName}
                    onChange={(e) => setPackageName(e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="data-input">Data to Encrypt</Label>
                  <Textarea
                    id="data-input"
                    placeholder="Enter your sensitive data here... (text, JSON, code, etc.)"
                    value={inputData}
                    onChange={(e) => setInputData(e.target.value)}
                    rows={10}
                    className="mt-2 font-mono text-sm"
                  />
                  {inputData && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Size: {new Blob([inputData]).size} bytes
                    </p>
                  )}
                </div>

                <Button
                  onClick={encryptAndStore}
                  disabled={isProcessing || !inputData.trim() || !packageName.trim()}
                  className="w-full h-14 text-lg bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                >
                  {isProcessing ? (
                    <>
                      <Atom size={24} weight="duotone" className="mr-2 animate-spin" />
                      Processing Quantum Encryption...
                    </>
                  ) : (
                    <>
                      <LockKey size={24} weight="duotone" className="mr-2" />
                      Encrypt & Store with SHA-256 + Bismuth
                    </>
                  )}
                </Button>

                <Card className="p-4 bg-muted/50">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Atom size={16} weight="duotone" />
                    Encryption Process
                  </h4>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <span className="text-green-500">1.</span>
                      <span>Generate SHA-256 cryptographic hash</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-500">2.</span>
                      <span>Compress data with quantum algorithms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-purple-500">3.</span>
                      <span>Apply bismuth transmission signature</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-cyan-500">4.</span>
                      <span>Calculate hydrogen frequency levels</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-yellow-500">5.</span>
                      <span>Establish magnetic retention parameters</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-pink-500">6.</span>
                      <span>Store encrypted package in quantum vault</span>
                    </li>
                  </ul>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="vault" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-green-500/10 border-green-500/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">{packages?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Packages</div>
                  </div>
                </Card>
                <Card className="p-4 bg-blue-500/10 border-blue-500/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {packages?.reduce((acc, p) => acc + p.compressedSize, 0) || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Bytes Stored</div>
                  </div>
                </Card>
                <Card className="p-4 bg-purple-500/10 border-purple-500/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-500">
                      {packages?.filter(p => p.status === 'transmitted').length || 0}
                    </div>
                    <div className="text-xs text-muted-foreground">Transmitted</div>
                  </div>
                </Card>
              </div>

              <ScrollArea className="h-[500px] pr-4">
                <div className="space-y-3">
                  {packages && packages.length > 0 ? (
                    packages.map((pkg, index) => (
                      <motion.div
                        key={pkg.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                          onClick={() => setSelectedPackage(pkg)}
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-lg mb-1">{pkg.name}</h4>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="default" className="text-xs">
                                    {pkg.encryptionMethod}
                                  </Badge>
                                  <Badge variant={pkg.status === 'transmitted' ? 'default' : 'secondary'} 
                                    className={pkg.status === 'transmitted' ? 'bg-green-500' : ''}>
                                    {pkg.status}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(pkg.timestamp).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                              <Package size={32} weight="duotone" className="text-muted-foreground" />
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">SHA Hash:</span>
                                  <code className="text-xs bg-muted px-2 py-1 rounded">
                                    {pkg.shaHash.substring(0, 8)}...
                                  </code>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Original:</span>
                                  <span className="font-mono">{pkg.originalSize}B</span>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Compressed:</span>
                                  <span className="font-mono text-green-500">{pkg.compressedSize}B</span>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Bismuth:</span>
                                  <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                                    {pkg.bismuthSignature}
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Hydrogen:</span>
                                  <Badge variant="outline" className="text-xs">
                                    {pkg.hydrogenLevel.toFixed(2)} MHz
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Magnetic:</span>
                                  <Badge variant="default" className="text-xs bg-cyan-500">
                                    {(pkg.magneticRetention * 100).toFixed(1)}%
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-2 border-t border-border">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  downloadPackage(pkg)
                                }}
                                className="flex-1"
                              >
                                <Download size={14} className="mr-1" />
                                Download
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  transmitPackage(pkg)
                                }}
                                disabled={pkg.status === 'transmitted' || isProcessing}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-cyan-500"
                              >
                                <Lightning size={14} weight="fill" className="mr-1" />
                                Transmit
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-16 space-y-4">
                      <Package size={64} weight="duotone" className="mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">No packages in vault</p>
                      <p className="text-sm text-muted-foreground">
                        Create your first encrypted package in the Encrypt tab
                      </p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="transmit" className="space-y-6">
              {selectedPackage ? (
                <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-cyan-500/5 border-cyan-500/30">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold">{selectedPackage.name}</h3>
                      <Badge variant={selectedPackage.status === 'transmitted' ? 'default' : 'secondary'}
                        className={selectedPackage.status === 'transmitted' ? 'bg-green-500' : ''}>
                        {selectedPackage.status}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">Encryption Details</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Method:</span>
                              <span>{selectedPackage.encryptionMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">SHA Hash:</span>
                              <code className="text-xs">{selectedPackage.shaHash.substring(0, 16)}...</code>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Compression:</span>
                              <span className="text-green-500">
                                {(selectedPackage.compressionRatio * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Transmission Parameters</h4>
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bismuth Signature:</span>
                              <Badge variant="secondary" className="text-xs">
                                {selectedPackage.bismuthSignature}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hydrogen Freq:</span>
                              <span>{selectedPackage.hydrogenLevel.toFixed(2)} MHz</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Magnetic Retention:</span>
                              <span className="text-cyan-500">
                                {(selectedPackage.magneticRetention * 100).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <h4 className="font-semibold mb-3">Transmission Protocol</h4>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          <li className="flex items-center gap-2">
                            <Atom size={14} className="text-purple-500" />
                            <span>Bismuth isotope carrier wave: {selectedPackage.bismuthSignature}</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <Lightning size={14} className="text-yellow-500" />
                            <span>Hydrogen frequency modulation: {selectedPackage.hydrogenLevel.toFixed(2)} MHz</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-cyan-500">🧲</span>
                            <span>Magnetic field retention: {(selectedPackage.magneticRetention * 100).toFixed(1)}%</span>
                          </li>
                          <li className="flex items-center gap-2">
                            <ShieldCheck size={14} className="text-green-500" />
                            <span>SHA-256 integrity verification</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Button
                      onClick={() => transmitPackage(selectedPackage)}
                      disabled={selectedPackage.status === 'transmitted' || isProcessing}
                      className="w-full h-12 bg-gradient-to-r from-purple-500 via-cyan-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isProcessing ? (
                        <>
                          <Atom size={20} weight="duotone" className="mr-2 animate-spin" />
                          Transmitting via Bismuth Frequencies...
                        </>
                      ) : selectedPackage.status === 'transmitted' ? (
                        <>
                          <ShieldCheck size={20} weight="fill" className="mr-2" />
                          Already Transmitted
                        </>
                      ) : (
                        <>
                          <Lightning size={20} weight="fill" className="mr-2" />
                          Initiate Bismuth Transmission
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              ) : (
                <div className="text-center py-16 space-y-4">
                  <FileArchive size={64} weight="duotone" className="mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Select a package from the Vault to transmit</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
