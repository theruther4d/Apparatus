# Ubershit
A mac app that let's you create and display widgets on your desktop. Build widgets using web languages that you already know and love, so you can focus on having fun.

## Building
### Clone the repo:
```sh
git clone git@github.com:theruther4d/Ubershit.git
```

### Run npm install
```sh
cd Ubershit
npm install
```
### Run in development
```sh
electron .
```

### Package for production
We're using [`electron-packager`](https://www.npmjs.com/package/electron-packager). Check out the options on [npm](https://www.npmjs.com/package/electron-packager).
```sh
npm install -g electron-packager
electron-packager ~/ubershit ubershit --platform=darwin --arch=x64 --version=0.36.10 --overwrite
```
