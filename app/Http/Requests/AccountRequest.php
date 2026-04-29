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
        if ($this->isMethod('PUT') || $this->isMethod('PATCH')) {
            $account = $this->route('account') ?: $this->route('category');

            if (!$account) {
                return false;
            }
            
            $isChildAccount = $account->parent_id !== null;
            if ($isChildAccount) {
                return true;
            }

            $isCategoryAccount = in_array($account->type->value, [AccountType::REVENUE->value, AccountType::EXPENSE->value]);
            return $isCategoryAccount;
        }

        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $ledgerId = \App\Support\LedgerContext::currentId();

        return [
            'name' => ['required', 'string', 'min:2', 'max:255'],
            'type' => [
                'required', 
                new Enum(AccountType::class),
                function ($attribute, $value, $fail) {
                    if (($this->isMethod('PUT') || $this->isMethod('PATCH')) && $this->route('account') || $this->route('category')) {
                        $account = $this->route('account') ?: $this->route('category');
                        if ($account && $account->type->value !== $value) {
                            $fail(__('The account type cannot be changed after creation.'));
                        }
                    }
                }
            ],
            'parent_id' => [
                'required_if:type,asset,liability',
                'nullable',
                Rule::exists('accounts', 'id')->where(fn ($query) => $query->where('ledger_id', $ledgerId)),
                fn ($attribute, $value, $fail) => $this->validateHierarchy($value, $fail),
            ],
            'ui_metadata' => ['required', 'array'],
            'ui_metadata.icon' => [
                'nullable', 
                'string',
                Rule::requiredIf(fn() => $this->input('parent_id') === null && !in_array($this->type, [AccountType::ASSET, AccountType::LIABILITY])),
                Rule::in(\App\Support\DefaultAccountDefinitions::getAvailableIcons())
            ],
            'ui_metadata.color' => [
                'required', 
                'string', 
                'regex:/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/',
                Rule::in(\App\Support\DefaultAccountDefinitions::getAvailableColors())
            ],
            'is_credit_card' => ['sometimes', 'boolean'],
            'credit_card_details' => [
                'required_if:is_credit_card,true',
                'array',
                function ($attribute, $value, $fail) {
                    if ($this->input('is_credit_card') && $this->input('type') !== AccountType::LIABILITY->value) {
                        $fail(__('Credit cards must be of type Liability.'));
                    }
                }
            ],
            'credit_card_details.limit' => ['required_if:is_credit_card,true', 'integer', 'min:0'],
            'credit_card_details.closing_day' => ['required_if:is_credit_card,true', 'integer', 'min:1', 'max:31'],
            'credit_card_details.due_day' => ['required_if:is_credit_card,true', 'integer', 'min:1', 'max:31'],
        ];
    }

    /**
     * Validate the account hierarchy and structural integrity.
     */
    private function validateHierarchy(?int $parentId, callable $fail): void
    {
        if (! $parentId) {
            return;
        }

        $parent = Account::find($parentId);
        
        if (! $parent) {
            return;
        }

        // Rule: Matching Types
        if ($parent->type->value !== $this->input('type')) {
            $fail(__('The account type must match the parent account type.'));
        }

        // Rule 1: Max Depth (Depth 2: Root -> Child only)
        if ($parent->parent_id !== null) {
            $fail(__('The selected parent is already a child account. Maximum depth is 2 levels.'));
        }

        // Rule 2: Structural Lock (Parents cannot become children)
        if ($this->isMethod('PUT') && $this->isAccountAParent()) {
            $account = $this->route('account') ?: $this->route('category');
            if ($account->parent_id != $parentId) {
                $fail(__('This account has children and cannot be moved under another parent.'));
            }
        }
    }

    /**
     * Determine if the current account in the request has children.
     */
    private function isAccountAParent(): bool
    {
        $account = $this->route('account') ?: $this->route('category');

        return $account instanceof Account && $account->children()->exists();
    }
}
