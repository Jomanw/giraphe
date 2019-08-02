# Giraphe

Making mind maps should be frictionless.

## How I think I'm going to structure data stuff:
- Store everything in a redis database
- When I start the app, read everything from the DB into a json file, to be used with the D3 stuff in index.html
- When I create a new node or link, write the node/link info to the db and add it to the in-memory object
- When I modify a node, modify the javascript object, and then find the object in the redis database by key and modify it there


## TODO:
- Learn how to group nodes together and combine them into a set
- Feature for moving between workspaces
- Collision detection for text boxes
- dynamic resizing to make the text box into a square
- Centering text boxes onto each node
- Making node diameter equal to box width/height
