// Setup DB
var sqlite = require("better-sqlite3");
var db = new sqlite('data.db');


var baseNodes = [
  { id: '0', workspace_id: 0, title: "First Note", info: "Text describing first idea"}//,
  // { id: '1', workspace_id: 0, title: "Second Note", info: "Text describing second idea"},
  // { id: '2', workspace_id: 0, title: "Third Note", info: "Text describing third idea"},
  // { id: '3', workspace_id: 0, title: "Fourth Note", info: "Text describing fourth idea"}
]
var baseLinks = [
  // { target: '1', source: '0' , strength: 0.7, workspace_id: 0 },
  // { target: '2', source: '1' , strength: 0.7, workspace_id: 0 },
  // { target: '0', source: '2' , strength: 0.7, workspace_id: 0 },
  // { target: '3', source: '2' , strength: 0.3, workspace_id: 0 },
]

create_nodes = db.prepare("CREATE TABLE nodes(id TEXT NOT NULL, workspace_id INT, title TEXT, info TEXT)");
create_links = db.prepare("CREATE TABLE links(target TEXT NOT NULL, source TEXT NOT NULL, strength FLOAT, workspace_id INT)");

create_nodes.run();
create_links.run();

var node_insert = db.prepare("INSERT INTO nodes VALUES (@id, @workspace_id, @title, @info)");
for (node_id in baseNodes) {
  var node = baseNodes[node_id];
  node_insert.run({
    id: node.id,
    workspace_id: node.workspace_id,
    title: node.title,
    info: node.info
  })
}

var link_insert = db.prepare("INSERT INTO links VALUES (@target, @source, @strength, @workspace_id)");
for (link_id in baseLinks) {
  var link = baseLinks[link_id];
  link_insert.run({
    target: link.target,
    source: link.source,
    strength: link.strength,
    workspace_id: link.workspace_id
  });
}
