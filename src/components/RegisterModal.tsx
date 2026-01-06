import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface RegisterModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RegisterModal({ open, onClose }: RegisterModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Welcome to Infinity Brain</DialogTitle>
          <DialogDescription>
            This feature is not currently available. Please use the Spark environment for full functionality.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3 mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
