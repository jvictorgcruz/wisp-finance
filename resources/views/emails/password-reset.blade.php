<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ __('mail.password_reset_title') }}</title>
    <style>
        body { font-family: 'Inter', system-ui, -apple-system, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
        .header { padding: 40px 40px 20px; text-align: center; }
        .logo-img { width: 24px; height: 24px; display: inline-block; vertical-align: middle; }
        .logo-text { font-weight: 900; font-size: 24px; color: #0f172a; letter-spacing: -0.05em; margin-left: 8px; vertical-align: middle; }
        .content { padding: 0 40px 40px; }
        .title { font-size: 20px; font-weight: 700; margin-bottom: 16px; color: #0f172a; }
        .text { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
        .button-container { text-align: center; margin-bottom: 32px; }
        .button { display: inline-block; padding: 12px 32px; background-color: #0f172a; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-size: 14px; font-weight: 700; transition: background-color 0.2s; }
        .footer { padding: 24px 40px; background-color: #f1f5f9; text-align: center; font-size: 12px; color: #94a3b8; }
        .secondary-text { font-size: 11px; color: #94a3b8; margin-top: 24px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{ asset('logo.png') }}" alt="Wisp Logo" class="logo-img" />
            <span class="logo-text">Wisp</span>
        </div>
        <div class="content">
            <div class="title">{{ __('mail.password_reset_greeting', ['name' => $name]) }}</div>
            <p class="text">{{ __('mail.password_reset_instructions') }}</p>
            
            <div class="button-container">
                <a href="{{ $url }}" class="button">{{ __('mail.password_reset_action') }}</a>
            </div>

            <p class="text">{{ __('mail.password_reset_expiry', ['count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]) }}</p>
            <p class="text">{{ __('mail.password_reset_ignore') }}</p>

            <div class="secondary-text">
                {{ __('mail.password_reset_trouble') }}<br>
                <a href="{{ $url }}">{{ $url }}</a>
            </div>
        </div>
        <div class="footer">
            &copy; {{ date('Y') }} Wisp Finance. {{ __('mail.footer_rights') }}
        </div>
    </div>
</body>
</html>
