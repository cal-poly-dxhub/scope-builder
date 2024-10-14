# start in /scripts

cd ..
yarn install 
yarn upgrade

python3 -m venv .venv

cp .env.example .env
cp env.d.ts.example env.d.ts

cd cdk
cdk bootstrap
cd ..

