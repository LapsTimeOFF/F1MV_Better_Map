rm -rf out
pnpm package --platform=darwin --arch=universal
pnpm make --platform=darwin --arch=universal
pnpm package --platform=win32 --arch=universal
pnpm make --platform=win32 --arch=universal
pnpm package --platform=linux --arch=universal
pnpm make --platform=linux --arch=universal