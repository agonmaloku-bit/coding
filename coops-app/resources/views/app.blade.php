@if (file_exists(public_path('index.html')))
    {!! file_get_contents(public_path('index.html')) !!}
@else
    <!DOCTYPE html>
    <html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>{{ config('app.name', 'PSM') }}</title>
        </head>
        <body>
            <div id="app"></div>
        </body>
    </html>
@endif
