{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM"],
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"],
    "noUncheckedIndexedAccess": true
  },
  "include": [
    "playwright.config.ts",
    "src/**/*.ts",
    "config/**/*.ts",
    "pages/**/*.ts",
    "fixtures/**/*.ts",
    "utils/**/*.ts",
    "data/**/*.ts",
    "types/**/*.ts",
    "{{playwrightTestDirectory}}/**/*.ts"
  ]
}
