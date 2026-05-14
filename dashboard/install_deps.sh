#!/bin/bash
cd "$(dirname "$0")"
npm install -D @vitejs/plugin-react@4.2.1 typescript@5.2.2 vite@5.0.8 tailwindcss@3.4.0 postcss@8.4.32 autoprefixer@10.4.16 @types/react@18.2.43 @types/react-dom@18.2.17 > install.log 2>&1
echo "DONE" >> install.log
