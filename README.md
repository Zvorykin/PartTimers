# PartTimers

This was real Node.js + Vue.js SPA successfully running on my previous job since 2017.
Is definitely has some architectural mistakes but it was done as it was done.

Now it was rewritten using Ruby on Rails and became simple pet project to improve RoR skills.

As usual `bundle` then `yarn`

This app has no real authorization cause it was run on single laptop and there was two user types:
* 'user' that can only view and add tickets
* 'admin' that can work with tickets, generate reports and edit app's dictionaries

So there are simplified login form (admin pass `admin`) :-)
Still original app rejected queries to protected resources unless they were fired from localhost.

Run:
* rails `./bin/rails server` `(http://127.0.0.1:3000/)`
* webpack `ruby ./bin/webpack-dev-server`
* tests `./bin/rake test`
