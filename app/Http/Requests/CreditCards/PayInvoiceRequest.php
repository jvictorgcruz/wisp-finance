<?php

namespace App\Http\Requests\CreditCards;

use App\Enums\AccountType;
use App\Support\LedgerContext;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PayInvoiceRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Authorization handled in controller/policy
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $accountParam = $this->route('account');
        $ledgerId = ($accountParam instanceof \App\Models\Account ? $accountParam->ledger_id : null)
            ?? \App\Models\Account::find($accountParam)?->ledger_id
            ?? LedgerContext::currentId();

        return [
            'source_account_id' => [
                'required',
                'integer',
                Rule::exists('accounts', 'id')->where(function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId)
                        ->where('type', AccountType::ASSET);
                }),
            ],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'date' => ['required', 'date'],
        ];
    }
}
