#!/bin/sh
set -e

echo "Aguardando banco..."
until npx prisma db push; do
  sleep 2
done

echo "Rodando seed..."
npm run seed

echo "Iniciando backend..."
npm run start
