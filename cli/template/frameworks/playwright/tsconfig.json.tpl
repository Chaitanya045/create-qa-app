{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022"],
    "strict": true,
    "skipLibCheck": true,
    "types": ["node"],
    "noUncheckedIndexedAccess": true
  },
  "include": ["playwright.config.ts", "src/**/*.ts", "{{playwrightTestDirectory}}/**/*.ts"]
}
