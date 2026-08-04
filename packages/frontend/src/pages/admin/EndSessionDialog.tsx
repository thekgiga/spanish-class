/**
 * EndSessionDialog — confirmation dialog shown when professor clicks "End Class".
 * Offers an optional checkbox to copy the student observation into the
 * student's permanent record (StudentNote).
 */
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

interface EndSessionDialogProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: (copyObservation: boolean) => void;
  isLoading?: boolean;
  hasObservation: boolean;
}

export function EndSessionDialog({
  open,
  onCancel,
  onConfirm,
  isLoading = false,
  hasObservation,
}: EndSessionDialogProps) {
  const { t } = useTranslation('admin');
  const [copyObservation, setCopyObservation] = React.useState(false);

  // Reset checkbox when dialog reopens
  React.useEffect(() => {
    if (open) setCopyObservation(false);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('session.end_dialog_title')}</DialogTitle>
          <DialogDescription>{t('session.end_dialog_description')}</DialogDescription>
        </DialogHeader>

        {hasObservation && (
          <div className="px-6 -mt-1">
            <div className="flex items-start gap-3">
              <Checkbox
                id="copy-observation"
                checked={copyObservation}
                onCheckedChange={(checked) => setCopyObservation(checked === true)}
                className="mt-0.5"
              />
              <label
                htmlFor="copy-observation"
                className="text-small text-ink cursor-pointer"
              >
                {t('session.end_dialog_copy_observation')}
              </label>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {t('session.end_dialog_cancel')}
          </Button>
          <Button
            variant="danger"
            isLoading={isLoading}
            onClick={() => onConfirm(copyObservation)}
          >
            {t('session.end_dialog_confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
