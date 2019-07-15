# Giraphe

Making mind maps should be frictionless.

## How I think I'm going to structure data stuff:
- Store everything in a redis database
- When I start the app, read everything from the DB into a json file, to be used with the D3 stuff in index.html
- When I create a new node or link, write the node/link info to the db and add it to the in-memory object
- When I modify a node, modify the javascript object, and then find the object in the redis database by key and modify it there


## TODO:
- Create and use a database in the program
- Create function for adding new nodes into database
- Learn how to create local hotkeys (cmd + N, or something, only when it's pulled up, and also just how to listen for generic keys
- Learn how to apply modify operation over all elements in the graph (add / remove attribute and update node visualization accordingly)
- Learn how to group nodes together and combine them into a set
- Figure out how to store the graph internally, and how to split up the files across different mindmaps / graphs; currently, we could just use a json file for each graph, but maybe we could instead have a db indexed by the graph workspace and just load that whenever necessary.
- I feel like having the hotkeys working is a good first step; this will let me experiment more easily with the other pieces of functionality.
