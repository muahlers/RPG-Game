#! /bin/sh
git status
git pull
rm -rf ../server/public
mkdir ../server/public
cp -R build/* ../server/public/
