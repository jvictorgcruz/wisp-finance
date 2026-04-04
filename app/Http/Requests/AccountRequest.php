<?php

namespace App\Http\Requests;

use App\Enums\AccountType;
use App\Models\Account;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class AccountRequest extends FormRequest
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
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $ledgerId = session('current_ledger_id');

        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'type' => ['required', new Enum(AccountType::class)],
            'parent_id' => [
                'nullable',
                Rule::exists('accounts', 'id')->where(function ($query) use ($ledgerId) {
                    $query->where('ledger_id', $ledgerId);
                }),
                function ($attribute, $value, $fail) {
                    if ($value) {
                        $parent = Account::find($value);
                        if ($parent && $parent->type->value !== $this->input('type')) {
                            $fail(__('The account type must match the parent account type.'));
                        }
                    }
                },
            ],
        ];
    }
}
