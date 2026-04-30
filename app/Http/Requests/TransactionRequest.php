<?php

namespace App\Http\Requests;

use App\Enums\AccountType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'amount' => ['required', 'integer', 'min:1'],
            'date' => ['required', 'date'],
            'description' => ['required', 'string', 'max:255'],
            'source_account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('ledger_id', \App\Support\LedgerContext::currentId()),
            ],
            'destination_account_id' => [
                'required',
                Rule::exists('accounts', 'id')->where('ledger_id', \App\Support\LedgerContext::currentId()),
                'different:source_account_id',
            ],
            'metadata' => ['nullable', 'array'],
        ];
    }
}
