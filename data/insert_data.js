var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('data.db');

var baseNodes = [
  { id: '0', workspace_id: 0, title: "First Note", info: "Text describing first idea"},
  { id: '1', workspace_id: 0, title: "Second Note", info: "Text describing second idea"},
  { id: '2', workspace_id: 0, title: "Third Note", info: "Text describing third idea"},
  { id: '3', workspace_id: 0, title: "Fourth Note", info: "Text describing fourth idea"}
]
var baseLinks = [
  { target: '1', source: '0' , strength: 0.7 },
  { target: '2', source: '1' , strength: 0.7 },
  { target: '0', source: '2' , strength: 0.7 },
  { target: '3', source: '2' , strength: 0.3 },
]

db.serialize(function() {
  db.run("CREATE TABLE nodes(id TEXT NOT NULL, workspace_id INT, title TEXT, info TEXT)");
  db.run("CREATE TABLE links(target TEXT NOT NULL, source TEXT NOT NULL, strength FLOAT)");

  // var stmt = db.prepare("INSERT INTO nodes VALUES (?, ?, ?, ?)");
  // for (var i = 0; i < 10; i++) {
  //     stmt.run("Ipsum " + i);
  // }

  var node_stmt = db.prepare("INSERT INTO nodes VALUES (?, ?, ?, ?)");
  for (node_id in baseNodes) {
    var node = baseNodes[node_id];
    node_stmt.run(node.id, node.workspace_id, node.title, node.info)
  }
  node_stmt.finalize();

  var link_stmt = db.prepare("INSERT INTO links VALUES (?, ?, ?)");
  for (link_id in baseLinks) {
    var link = baseLinks[link_id];
    link_stmt.run(link.target, link.source, link.strength);
  }
  link_stmt.finalize();
});
