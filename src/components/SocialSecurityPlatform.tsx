import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { useKV } from '@github/spark/hooks'
import { 
  Heart, 
  ShieldCheck, 
  CurrencyDollar, 
  CheckCircle, 
  Users,
  Sparkles,
  HandHeart,
  House,
  FirstAidKit,
  Wallet,
  Storefront,
  BookOpen,
  ArrowRight,
  Info,
  WarningCircle,
  CalendarBlank
} from '@phosphor-icons/react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

interface SocialSecurityApplication {
  id: string
  applicantName: string
  age: number
  hasDisability: boolean
  disabilityDescription?: string
  durationNeeded: 'short-term' | 'medium-term' | 'long-term' | 'permanent'
  estimatedMonths?: number
  status: 'pending' | 'approved' | 'review' | 'flagged'
  submittedAt: number
  approvedAt?: number
  monthlyBenefit: number
  totalReceived: number
  trustScore: number
  applicationData?: any
}

interface BenefitPayment {
  id: string
  applicationId: string
  amount: number
  timestamp: number
  status: 'completed' | 'pending'
}

interface FraudFlag {
  id: string
  applicationId: string
  reason: string
  severity: 'low' | 'medium' | 'high'
  requiresReview: boolean
  timestamp: number
}

export function SocialSecurityPlatform() {
  const [applications, setApplications] = useKV<SocialSecurityApplication[]>('ss-applications', [])
  const [payments, setPayments] = useKV<BenefitPayment[]>('ss-payments', [])
  const [fraudFlags, setFraudFlags] = useKV<FraudFlag[]>('ss-fraud-flags', [])
  
  // Application form state
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [hasDisability, setHasDisability] = useState(false)
  const [disabilityDescription, setDisabilityDescription] = useState('')
  const [duration, setDuration] = useState<'short-term' | 'medium-term' | 'long-term' | 'permanent'>('medium-term')
  const [estimatedMonths, setEstimatedMonths] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // User's application
  const [userApplication, setUserApplication] = useState<SocialSecurityApplication | null>(null)

  const currentApplications = applications || []
  const currentPayments = payments || []
  const currentFlags = fraudFlags || []

  useEffect(() => {
    // Check if user has an existing application (simple check by name for demo)
    if (name) {
      const existing = currentApplications.find(app => 
        app.applicantName.toLowerCase() === name.toLowerCase()
      )
      setUserApplication(existing || null)
    }
  }, [name, currentApplications])

  // Fraud detection logic - bias toward approval
  const detectFraud = (application: Partial<SocialSecurityApplication>): FraudFlag[] => {
    const flags: FraudFlag[] = []
    
    // Only flag obvious fraud patterns, not legitimate edge cases
    
    // 1. Age validation (very lenient)
    if (application.age && (application.age < 0 || application.age > 150)) {
      flags.push({
        id: `fraud-${Date.now()}-age`,
        applicationId: application.id || '',
        reason: 'Age outside realistic range',
        severity: 'high',
        requiresReview: true,
        timestamp: Date.now()
      })
    }
    
    // 2. Duplicate detection (same person applying multiple times in short period)
    const recentApps = currentApplications.filter(app => 
      app.applicantName.toLowerCase() === application.applicantName?.toLowerCase() &&
      Date.now() - app.submittedAt < 86400000 // 24 hours
    )
    
    if (recentApps.length > 2) {
      flags.push({
        id: `fraud-${Date.now()}-duplicate`,
        applicationId: application.id || '',
        reason: 'Multiple applications in 24 hours - possible duplicate',
        severity: 'medium',
        requiresReview: false, // Don't block, just log
        timestamp: Date.now()
      })
    }
    
    // Community trust score (simplified - would use blockchain in production)
    // Default to high trust, only flag very suspicious patterns
    
    return flags
  }

  const calculateBenefit = (app: Partial<SocialSecurityApplication>): number => {
    // Base benefit calculation - generous by default
    let baseBenefit = 2000 // $2000/month base
    
    // Adjust based on need duration
    switch (app.durationNeeded) {
      case 'permanent':
        baseBenefit = 3000 // Higher for permanent needs
        break
      case 'long-term':
        baseBenefit = 2500
        break
      case 'medium-term':
        baseBenefit = 2000
        break
      case 'short-term':
        baseBenefit = 1500
        break
    }
    
    // Disability adjustment
    if (app.hasDisability) {
      baseBenefit *= 1.5 // 50% increase for disability support
    }
    
    // Age-based adjustment (elderly support)
    if (app.age && app.age >= 65) {
      baseBenefit *= 1.3
    }
    
    return Math.round(baseBenefit)
  }

  const handleSubmitApplication = async () => {
    // Validation - minimal but necessary
    if (!name || !age) {
      toast.error('Please provide your name and age')
      return
    }

    const ageNum = parseInt(age)
    if (isNaN(ageNum) || ageNum < 0 || ageNum > 150) {
      toast.error('Please provide a valid age')
      return
    }

    if (hasDisability && !disabilityDescription.trim()) {
      toast.error('Please describe your disability support needs')
      return
    }

    setIsSubmitting(true)

    // Create application
    const newApplication: SocialSecurityApplication = {
      id: `app-${Date.now()}`,
      applicantName: name,
      age: ageNum,
      hasDisability,
      disabilityDescription: hasDisability ? disabilityDescription : undefined,
      durationNeeded: duration,
      estimatedMonths: estimatedMonths ? parseInt(estimatedMonths) : undefined,
      status: 'pending',
      submittedAt: Date.now(),
      monthlyBenefit: 0,
      totalReceived: 0,
      trustScore: 100 // Start with full trust
    }

    // Run fraud detection
    const flags = detectFraud(newApplication)
    
    // Save any flags (for transparency and improvement)
    if (flags.length > 0) {
      setFraudFlags(prev => [...(prev || []), ...flags])
    }

    // Calculate benefit
    newApplication.monthlyBenefit = calculateBenefit(newApplication)

    // Determine status - BIAS TOWARD APPROVAL
    const hasBlockingFlags = flags.some(f => f.requiresReview && f.severity === 'high')
    
    if (hasBlockingFlags) {
      newApplication.status = 'review'
      toast.info('Application submitted for review', {
        description: 'We need to verify a few details. You\'ll hear from us within 24 hours.'
      })
    } else {
      // INSTANT APPROVAL - this is the default path
      newApplication.status = 'approved'
      newApplication.approvedAt = Date.now()
      
      toast.success('Application Approved! 🎉', {
        description: `You'll receive $${newApplication.monthlyBenefit}/month in INF tokens starting immediately.`
      })
    }

    // Save application
    setApplications(prev => [...(prev || []), newApplication])
    setUserApplication(newApplication)

    // Clear form
    setName(name) // Keep name to show their application
    setAge(age)
    setHasDisability(false)
    setDisabilityDescription('')
    setDuration('medium-term')
    setEstimatedMonths('')
    
    setIsSubmitting(false)
  }

  const generatePayment = (application: SocialSecurityApplication) => {
    const payment: BenefitPayment = {
      id: `payment-${Date.now()}`,
      applicationId: application.id,
      amount: application.monthlyBenefit,
      timestamp: Date.now(),
      status: 'completed'
    }

    setPayments(prev => [...(prev || []), payment])
    
    setApplications(prev => 
      (prev || []).map(app => 
        app.id === application.id 
          ? { ...app, totalReceived: app.totalReceived + payment.amount }
          : app
      )
    )

    toast.success('Benefit Payment Received!', {
      description: `$${payment.amount} in INF tokens added to your wallet`
    })
  }

  const stats = {
    totalApplications: currentApplications.length,
    approved: currentApplications.filter(a => a.status === 'approved').length,
    totalBenefitsDistributed: currentApplications.reduce((sum, app) => sum + app.totalReceived, 0),
    approvalRate: currentApplications.length > 0 
      ? (currentApplications.filter(a => a.status === 'approved').length / currentApplications.length * 100)
      : 0
  }

  return (
    <div className="space-y-6">
      <Card className="gradient-border">
        <CardHeader>
          <div className="flex items-center gap-3">
            <HandHeart size={32} weight="duotone" className="text-accent" />
            <div>
              <CardTitle className="text-3xl">Infinity Social Security</CardTitle>
              <CardDescription className="text-base">
                Compassionate, decentralized support built on trust and technology
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Users size={24} className="text-primary" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Applications</p>
                    <p className="text-2xl font-bold">{stats.totalApplications}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle size={24} className="text-green-500" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="text-2xl font-bold">{stats.approved}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CurrencyDollar size={24} className="text-accent" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Distributed</p>
                    <p className="text-2xl font-bold">${(stats.totalBenefitsDistributed / 1000).toFixed(1)}K</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Sparkles size={24} className="text-secondary" weight="duotone" />
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Rate</p>
                    <p className="text-2xl font-bold">{stats.approvalRate.toFixed(0)}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-accent/10 border-2 border-accent/30 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Heart size={24} className="text-accent flex-shrink-0 mt-0.5" weight="fill" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Our Promise</h3>
                <p className="text-sm leading-relaxed">
                  This is a <strong>trust-first, technology-enhanced</strong> mutual aid system. 
                  We believe in helping people without bureaucratic barriers. Applications are 
                  approved by default unless clear fraud patterns are detected. We use blockchain 
                  for transparency, not gatekeeping.
                </p>
              </div>
            </div>
          </div>

          <Tabs defaultValue={userApplication ? "status" : "apply"} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="apply">Apply for Support</TabsTrigger>
              <TabsTrigger value="status">My Benefits</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="community">Community</TabsTrigger>
            </TabsList>

            <TabsContent value="apply" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles size={24} weight="duotone" />
                    Simple Application - No Barriers
                  </CardTitle>
                  <CardDescription>
                    We need just a few pieces of information. No extensive documentation required.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-lg">Your Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="text-lg h-12"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="age" className="text-lg">Your Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="Enter your age"
                        className="text-lg h-12"
                      />
                    </div>

                    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="disability"
                          checked={hasDisability}
                          onCheckedChange={(checked) => setHasDisability(checked as boolean)}
                        />
                        <Label htmlFor="disability" className="text-lg font-normal cursor-pointer">
                          I have a disability or health condition that affects my ability to work
                        </Label>
                      </div>
                      
                      <AnimatePresence>
                        {hasDisability && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2 mt-3"
                          >
                            <Label htmlFor="disability-desc" className="text-base">
                              Brief description (optional but helps us provide better support)
                            </Label>
                            <Input
                              id="disability-desc"
                              value={disabilityDescription}
                              onChange={(e) => setDisabilityDescription(e.target.value)}
                              placeholder="e.g., mobility issues, chronic illness, etc."
                              className="text-base"
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duration" className="text-lg">How long do you need support?</Label>
                      <Select value={duration} onValueChange={(val: any) => setDuration(val)}>
                        <SelectTrigger id="duration" className="text-base h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short-term">Short-term (1-3 months)</SelectItem>
                          <SelectItem value="medium-term">Medium-term (3-12 months)</SelectItem>
                          <SelectItem value="long-term">Long-term (1-2 years)</SelectItem>
                          <SelectItem value="permanent">Permanent support needed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {duration !== 'permanent' && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="months" className="text-base">
                          Estimated months (optional)
                        </Label>
                        <Input
                          id="months"
                          type="number"
                          value={estimatedMonths}
                          onChange={(e) => setEstimatedMonths(e.target.value)}
                          placeholder="e.g., 6"
                          className="text-base"
                        />
                      </motion.div>
                    )}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-blue-900 dark:text-blue-100">
                          What happens next?
                        </p>
                        <p className="text-blue-800 dark:text-blue-200">
                          Most applications are <strong>approved instantly</strong>. You'll receive 
                          your monthly benefit in INF tokens, which you can use in our marketplace 
                          or convert to other currencies. Benefits start immediately.
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleSubmitApplication}
                    disabled={isSubmitting || !name || !age}
                    size="lg"
                    className="w-full h-14 text-lg"
                  >
                    {isSubmitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <CheckCircle size={24} className="mr-2" />
                        Submit Application
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="status" className="space-y-6">
              {userApplication ? (
                <>
                  <Card className="gradient-border">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Application Status</CardTitle>
                          <CardDescription>Your benefit information and history</CardDescription>
                        </div>
                        <Badge
                          variant={
                            userApplication.status === 'approved' ? 'default' :
                            userApplication.status === 'review' ? 'secondary' :
                            'outline'
                          }
                          className="text-base px-4 py-1"
                        >
                          {userApplication.status === 'approved' && '✓ Approved'}
                          {userApplication.status === 'review' && '⏳ In Review'}
                          {userApplication.status === 'pending' && '📋 Pending'}
                          {userApplication.status === 'flagged' && '⚠️ Under Review'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-1">Monthly Benefit</p>
                            <p className="text-3xl font-bold text-accent">
                              ${userApplication.monthlyBenefit}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">in INF tokens</p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-1">Total Received</p>
                            <p className="text-3xl font-bold text-primary">
                              ${userApplication.totalReceived}
                            </p>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="pt-6">
                            <p className="text-sm text-muted-foreground mb-1">Trust Score</p>
                            <p className="text-3xl font-bold text-green-500">
                              {userApplication.trustScore}%
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {userApplication.status === 'approved' && (
                        <>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold">Next Payment</h4>
                              <CalendarBlank size={20} weight="duotone" />
                            </div>
                            <Progress value={75} className="h-3" />
                            <p className="text-sm text-muted-foreground">
                              Next benefit payment in 7 days
                            </p>
                          </div>

                          <Button
                            onClick={() => generatePayment(userApplication)}
                            size="lg"
                            className="w-full"
                          >
                            <CurrencyDollar size={24} className="mr-2" />
                            Generate Test Payment (Demo)
                          </Button>
                        </>
                      )}

                      {userApplication.status === 'review' && (
                        <div className="bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-start gap-3">
                            <WarningCircle size={24} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                            <div className="text-sm space-y-1">
                              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                                Application In Review
                              </p>
                              <p className="text-yellow-800 dark:text-yellow-200">
                                We're verifying a few details to ensure we can provide you with the 
                                best support. This typically takes less than 24 hours. You'll be 
                                notified as soon as your application is approved.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Payment History</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {currentPayments.filter(p => p.applicationId === userApplication.id).length > 0 ? (
                        <div className="space-y-2">
                          {currentPayments
                            .filter(p => p.applicationId === userApplication.id)
                            .map(payment => (
                              <div key={payment.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                  <CheckCircle size={20} className="text-green-500" weight="fill" />
                                  <div>
                                    <p className="font-medium">${payment.amount}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(payment.timestamp).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <Badge variant="outline">{payment.status}</Badge>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <CurrencyDollar size={48} className="mx-auto mb-3 opacity-50" weight="duotone" />
                          <p>No payments yet. Your first payment will arrive soon!</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <HandHeart size={64} className="mx-auto mb-4 text-muted-foreground" weight="duotone" />
                    <h3 className="text-xl font-semibold mb-2">No Active Application</h3>
                    <p className="text-muted-foreground mb-6">
                      Apply for support to see your benefit status here
                    </p>
                    <Button size="lg">
                      Go to Application
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="resources" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connect to Resources</CardTitle>
                  <CardDescription>
                    Use your benefits throughout the Infinity Brain ecosystem
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-between h-16" size="lg">
                    <div className="flex items-center gap-3">
                      <Wallet size={24} weight="duotone" />
                      <div className="text-left">
                        <p className="font-semibold">My Wallet</p>
                        <p className="text-xs text-muted-foreground">View and manage your INF tokens</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </Button>

                  <Button variant="outline" className="w-full justify-between h-16" size="lg">
                    <div className="flex items-center gap-3">
                      <Storefront size={24} weight="duotone" />
                      <div className="text-left">
                        <p className="font-semibold">Marketplace</p>
                        <p className="text-xs text-muted-foreground">Spend tokens on real goods and services</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </Button>

                  <Button variant="outline" className="w-full justify-between h-16" size="lg">
                    <div className="flex items-center gap-3">
                      <BookOpen size={24} weight="duotone" />
                      <div className="text-left">
                        <p className="font-semibold">Resources & Programs</p>
                        <p className="text-xs text-muted-foreground">Find additional assistance programs</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </Button>

                  <Button variant="outline" className="w-full justify-between h-16" size="lg">
                    <div className="flex items-center gap-3">
                      <House size={24} weight="duotone" />
                      <div className="text-left">
                        <p className="font-semibold">Housing Support</p>
                        <p className="text-xs text-muted-foreground">Connect with housing assistance</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </Button>

                  <Button variant="outline" className="w-full justify-between h-16" size="lg">
                    <div className="flex items-center gap-3">
                      <FirstAidKit size={24} weight="duotone" />
                      <div className="text-left">
                        <p className="font-semibold">Healthcare Resources</p>
                        <p className="text-xs text-muted-foreground">Access healthcare support services</p>
                      </div>
                    </div>
                    <ArrowRight size={20} />
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="community" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={24} weight="duotone" />
                    Community Support
                  </CardTitle>
                  <CardDescription>
                    Connect with others and share your journey
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gradient-to-r from-accent/20 to-primary/20 border-2 border-accent/30 rounded-lg p-6">
                    <h3 className="font-semibold text-lg mb-2">We're Better Together</h3>
                    <p className="text-sm leading-relaxed">
                      This platform is built on the idea that when we support each other, 
                      everyone thrives. Share your story, help others navigate the system, 
                      and build connections that last beyond financial support.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <Users size={48} className="mx-auto text-primary" weight="duotone" />
                          <h4 className="font-semibold">Community Forum</h4>
                          <p className="text-sm text-muted-foreground">
                            Share experiences and advice
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Join Discussion
                          </Button>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-center space-y-2">
                          <Heart size={48} className="mx-auto text-accent" weight="duotone" />
                          <h4 className="font-semibold">Peer Support</h4>
                          <p className="text-sm text-muted-foreground">
                            Connect with mentors and helpers
                          </p>
                          <Button variant="outline" size="sm" className="mt-2">
                            Find Support
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Platform Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-primary">{stats.totalApplications}</p>
                        <p className="text-xs text-muted-foreground">People Helped</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-accent">{stats.approvalRate.toFixed(0)}%</p>
                        <p className="text-xs text-muted-foreground">Approval Rate</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-secondary">${(stats.totalBenefitsDistributed / 1000).toFixed(0)}K</p>
                        <p className="text-xs text-muted-foreground">Total Support</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-green-500">98%</p>
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Progressive Enhancement Journey */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles size={24} weight="duotone" />
            Your Journey to Independence
          </CardTitle>
          <CardDescription>
            We're here to help you build a path forward
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1 text-center p-4 bg-accent/10 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="font-semibold">Apply</p>
              <p className="text-xs text-muted-foreground">Simple, compassionate process</p>
            </div>
            <ArrowRight size={24} className="hidden md:block text-muted-foreground" />
            <div className="flex-1 text-center p-4 bg-primary/10 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="font-semibold">Receive Support</p>
              <p className="text-xs text-muted-foreground">Instant approval, immediate benefits</p>
            </div>
            <ArrowRight size={24} className="hidden md:block text-muted-foreground" />
            <div className="flex-1 text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="font-semibold">Access Resources</p>
              <p className="text-xs text-muted-foreground">Marketplace, programs, community</p>
            </div>
            <ArrowRight size={24} className="hidden md:block text-muted-foreground" />
            <div className="flex-1 text-center p-4 bg-green-500/10 rounded-lg">
              <div className="text-2xl mb-2">4️⃣</div>
              <p className="font-semibold">Build Independence</p>
              <p className="text-xs text-muted-foreground">Thrive with ongoing support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
