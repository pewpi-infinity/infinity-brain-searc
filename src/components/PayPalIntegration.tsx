import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { CreditCard, CheckCircle, Copy, Warning } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PayPalPaymentProps {
  amount: number
  auctionId: string
  auctionName: string
  onPaymentComplete?: (transactionId: string) => void
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PayPalPaymentDialog({
  amount,
  auctionId,
  auctionName,
  onPaymentComplete,
  open,
  onOpenChange
}: PayPalPaymentProps) {
  const [transactionId, setTransactionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)

  const paypalEmail = 'marvaseater@gmail.com'
  const contactName = 'Kris Watson'
  const contactPhone = '808-342-9975'
  
  const paymentNote = `Infinity Brain Auction - ${auctionId} - ${auctionName}`

  const handlePayPalPayment = () => {
    const paypalUrl = `https://www.paypal.com/paypalme/marvaseater/${amount}`
    window.open(paypalUrl, '_blank', 'noopener,noreferrer')
    toast.info('PayPal opened in new tab', {
      description: 'Complete your payment and return to enter the transaction ID'
    })
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const handleConfirmPayment = async () => {
    if (!transactionId.trim()) {
      toast.error('Please enter your PayPal transaction ID')
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPaymentConfirmed(true)
      
      toast.success('Payment confirmation recorded!', {
        description: 'Your bid has been registered. The auction creator will verify your payment.'
      })

      if (onPaymentComplete) {
        onPaymentComplete(transactionId)
      }

      setTimeout(() => {
        onOpenChange(false)
        setPaymentConfirmed(false)
        setTransactionId('')
      }, 2000)
    } catch (error) {
      toast.error('Failed to record payment confirmation')
      console.error('Payment confirmation error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard size={24} weight="duotone" className="text-accent" />
            PayPal Payment
          </DialogTitle>
          <DialogDescription>
            Complete your USD payment via PayPal
          </DialogDescription>
        </DialogHeader>

        {!paymentConfirmed ? (
          <div className="space-y-4">
            <Card className="p-4 bg-gradient-to-br from-primary/5 to-accent/5 border-2 border-accent/20">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Auction:</span>
                  <span className="font-semibold">{auctionName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount:</span>
                  <span className="text-2xl font-bold text-accent">
                    ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Auction ID:</span>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {auctionId.slice(0, 16)}...
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(auctionId, 'Auction ID')}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            <div className="space-y-3 p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-start gap-2">
                <Warning size={20} weight="duotone" className="text-accent mt-0.5" />
                <div className="space-y-2 flex-1">
                  <p className="font-semibold text-sm">Payment Instructions:</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">PayPal Email:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {paypalEmail}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(paypalEmail, 'PayPal email')}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Contact:</span>
                      <span className="font-medium">{contactName}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Phone:</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono text-xs">
                          {contactPhone}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(contactPhone, 'Phone number')}
                        >
                          <Copy size={14} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/50">
                    <p className="text-xs text-muted-foreground">
                      <strong>Important:</strong> Include the auction ID in your payment note:
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <code className="text-xs bg-background px-2 py-1 rounded flex-1">
                        {paymentNote}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyToClipboard(paymentNote, 'Payment note')}
                      >
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={handlePayPalPayment}
              className="w-full bg-gradient-to-r from-[#0070ba] to-[#1546a0] hover:opacity-90 text-white"
              size="lg"
            >
              <CreditCard size={20} className="mr-2" />
              Pay ${amount.toLocaleString()} via PayPal
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  After payment
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transaction-id">PayPal Transaction ID</Label>
              <Input
                id="transaction-id"
                placeholder="Enter your PayPal transaction ID"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                You'll receive this ID in your PayPal receipt after completing the payment
              </p>
            </div>

            <Button
              onClick={handleConfirmPayment}
              className="w-full bg-gradient-to-r from-accent to-primary"
              disabled={isSubmitting || !transactionId.trim()}
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Payment Sent'}
            </Button>
          </div>
        ) : (
          <div className="py-8 space-y-4 text-center">
            <CheckCircle size={64} weight="duotone" className="mx-auto text-green-500" />
            <div>
              <h3 className="text-xl font-bold">Payment Recorded!</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Your bid has been registered and is pending verification
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export function PayPalBadge() {
  return (
    <Badge variant="outline" className="gap-1.5 bg-[#0070ba]/10 text-[#0070ba] border-[#0070ba]/30">
      <CreditCard size={14} weight="duotone" />
      PayPal Accepted
    </Badge>
  )
}
