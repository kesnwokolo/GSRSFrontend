setup_git() {
  cd ../
ls
  git clone https://GsrsBot:${GIT_ACCESS_TOKEN}@github.com/ncats/gsrs-ci.git
cd gsrs-ci
ls
git status
git fetch
git branch -a
git status
git checkout fda_staged_sync
  git pull
  git merge origin/fda
  cd gsrs-ci

cp -r frontend/src/main/resources/static/substanceRelationshipVisualizer ./
rm -rf frontend/src/main/resources/static
mkdir frontend/src/main/resources/static
cp -r ../GSRSFrontend/dist/browser/* frontend/src/main/resources/static/
cp -r ./substanceRelationshipVisualizer frontend/src/main/resources/static/
rm -rf ./substanceRelationshipVisualizer
git add frontend/src/main/resources/static
git add -u 
git commit -m "pushing new frontend build"
git status
ls
git push -u origin fda_staged_sync



}


setup_git
