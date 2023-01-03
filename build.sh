rm -rf out
electron-forge package --platform=darwin --arch=universal
electron-forge make --platform=darwin --arch=universal
electron-forge package --platform=win32 --arch=universal
electron-forge make --platform=win32 --arch=universal
electron-forge package --platform=linux --arch=universal
electron-forge make --platform=linux --arch=universal