#!/bin/zsh

main_file="nicovideo_add_stars_to_tags.user.js"

if [ `git branch -l | grep -c "^* release$"` = '0' ]; then
  echo "Error: Current branch is not release" 1>&2
  exit 1
fi

date_string=`date +"%Y-%m-%d"`
last_version=`git tag -l "${date_string}[a-z]" | sort -r | head -n 1`

if [ ! $last_version ]; then
  echo "This is first release of today" 1>&2
  new_version="${date_string}a"
  last_version=`cat $main_file | grep "@version" | sed -e "s/^.\+@version\s\+\([0-9]\{4\}-[0-9]\{2\}-[0-9]\{2\}[a-z]\).*$/\1/"`
elif [ $last_version = "${date_string}z" ]; then
  echo "Error: There are too many releases on today" 1>&2 
  exit 1
else
  new_version=`echo -n $last_version | tr "[a-w]" "[b-z]"` 
fi

echo "Last version: $last_version" 1>&2
echo "New  version: $new_version" 1>&2
sed -i "/==UserScript==/,/==\/UserScript==/s/$last_version/$new_version/g" $main_file
git add $main_file
git commit -m "Release $new_version"
git tag "$new_version"

