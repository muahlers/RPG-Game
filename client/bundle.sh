#! /bin/sh
rm -rf ../server/public
mkdir ../server/public
cp -R build/* ../server/public/
cd ..
git status
git subtree push --prefix server heroku master
