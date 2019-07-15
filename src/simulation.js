var sqlite3 = require('sqlite3').verbose();
var sqlite = require("better-sqlite3");

var db = new sqlite3.Database('data.db');
// var db = new sqlite('data.db');






var nodeElements, textElements, linkElements;
var nodes, links;


function getNodeColor(node) {
  return node.workspace_id === 0 ? 'red' : 'gray'
}

async function getNodesFromDb() {
  var output = [];
  db.serialize(function () {
    db.each("SELECT * FROM nodes", function(err, row) {
      output.push(row);
    });
  })
  nodes = output;
  return output;
}

async function getLinksFromDb() {
  var output = [];
  db.serialize(function () {
    db.each("SELECT * FROM links", function(err, row) {
      output.push(row);
    });
  });
  links = output;
  console.log(links)

  setTimeout(function(){
    var new_nodes= {}
    for (node_id in nodes) {
      node = nodes[node_id];
      new_nodes[node.id] = node;
    }
    for (link_id in links) {
      link = links[link_id]
      link.source = new_nodes[link.source]
      link.target = new_nodes[link.target]
    }
    console.log("Old Links")
    console.log(links)
  }, 500)

  return output;
}

getNodesFromDb().then(getLinksFromDb()).then(function(data) {
  const width = window.innerWidth;
  const height = window.innerHeight;
  console.log(links)
  console.log(nodes)
  const svg = d3.select('svg')
    .attr('width', width)
    .attr('height', height)

  const simulation = d3.forceSimulation()
    .force('charge', d3.forceManyBody().strength(-20))
    .force('center', d3.forceCenter(width / 2, height / 2))

  setTimeout(function() {
    nodeElements = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
        .attr('r', function(node) {
          // console.log(node.title.length)
          // return node.title.length;
          return 10;
        })
        .attr('fill', getNodeColor)

    textElements = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
        .text(node => node.title)
        .attr('font-size', 15)
        // .attr("text-anchor", "middle")

        .attr('dx', 15)
        .attr('dy', 4)

    linkElements = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter().append('line')
        .attr('stroke-width', 1)
        .attr('stroke', '#E5E5E5')

    simulation.force('link', d3.forceLink()
      .id(link => link.id)
      .strength(link => link.strength))

    // simulation.force('link').link(links)


    simulation.nodes(data).on('tick', () => {
      nodeElements
        .attr("cx", node => node.x)
        .attr("cy", node => node.y)
      textElements
        .attr("x", node => node.x)
        .attr("y", node => node.y)
      linkElements
        .attr('x1', link => link.source.x)
        .attr('y1', link => link.source.y)
        .attr('x2', link => link.target.x)
        .attr('y2', link => link.target.y)
        // .attr('x1', link => 500)
        // .attr('y1', link => 500)
        // .attr('x2', link => 200)
        // .attr('y2', link => 200)
      // console.log(links)
    })

  }, 1000)

})




// nodeElements = svg.append('g')
//   .selectAll('circle')
//   .data(nodes)
//   .enter().append('circle')
//     .attr('r', 10)
//     .attr('fill', getNodeColor)
//







// nodes = getNodesFromDb();
