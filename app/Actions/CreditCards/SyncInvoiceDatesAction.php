<?php

namespace App\Actions\CreditCards;

use App\Models\CreditCardDetail;
use Illuminate\Support\Carbon;

class SyncInvoiceDatesAction
{
    /**
     * Synchronize invoice dates (closing and due) based on current card settings.
     * Only affects invoices that are not yet fully paid.
     */
    public function execute(CreditCardDetail $card): void
    {
        // Get all invoices for this card that are NOT fully paid
        $invoices = $card->invoices()
            ->get()
            ->filter(fn ($invoice) => ! $invoice->isPaid());

        foreach ($invoices as $invoice) {
            // reference_year_month is 'Y-m'
            $reference = Carbon::parse($invoice->reference_year_month . '-01');
            $newDueDate = $reference->copy()->day($card->due_day);
            $newClosingDate = $reference->copy()->day($card->closing_day);
            
            $invoice->update([
                'closing_date' => $newClosingDate,
                'due_date' => $newDueDate,
            ]);

            // Sync pending expected cash flows linked to this invoice
            $invoice->expectedCashFlows()
                ->where('status', 'PENDING')
                ->update(['due_date' => $newDueDate]);
        }
    }
}
