<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Laravel API Status</title>

        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    </head>
    <body class="bg-slate-900 font-['Figtree'] text-slate-100 flex items-center justify-center min-h-screen antialiased selection:bg-emerald-500/30 selection:text-emerald-400">
        
        <div class="relative w-full max-w-md p-8 mx-4 overflow-hidden border border-slate-800 bg-slate-950/50 rounded-2xl backdrop-blur-xl">
            <div class="absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 bg-emerald-500/10 blur-2xl pointer-events-none"></div>
            
            <div class="flex flex-col items-center text-center">
                <div class="relative flex w-16 h-16 mb-6 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <span class="absolute inline-flex w-3 h-3 rounded-full opacity-75 animate-ping bg-emerald-400"></span>
                    <span class="relative inline-flex w-3 h-3 rounded-full bg-emerald-500"></span>
                </div>

                <h1 class="text-2xl font-semibold tracking-tight text-white mb-2">
                    Laravel Backend API
                </h1>
                <p class="text-sm text-slate-400 font-medium px-3 py-1 bg-slate-900 rounded-full border border-slate-800 flex items-center gap-2">
                    Status: <span class="text-emerald-400 font-semibold">Running</span>
                </p>

                <hr class="w-full border-slate-800/80 my-6">

                <div class="w-full text-left space-y-2 text-xs text-slate-500">
                    <div class="flex justify-between">
                        <span>Environment</span>
                        <span class="font-mono text-slate-400">Development</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Framework</span>
                        <span class="font-mono text-slate-400">Laravel v{{ app()->version() }}</span>
                    </div>
                </div>
            </div>
        </div>

    </body>
</html>