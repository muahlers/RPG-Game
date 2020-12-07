#! /bin/sh
npm run build
rm -rf ../../../html/cliente-MMORPG
mkdir ../../../html/cliente-MMORPG
cp -R build/* ../../../html/cliente-MMORPG
