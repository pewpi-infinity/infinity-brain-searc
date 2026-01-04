import { ShieldCheck } from '@phosphor-icons/react'

export function SafetyFooter() {
  return (
    <footer className="mt-16 py-6 border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <ShieldCheck size={20} weight="duotone" className="text-green-600" />
          <p className="text-center">
            <strong className="text-foreground">No action here can break your computer, steal your account, or cost money without clear confirmation.</strong>
          </p>
        </div>
      </div>
    </footer>
  )
}
