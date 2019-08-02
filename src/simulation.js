// Setup DB
var sqlite = require("better-sqlite3");
var db = new sqlite('data.db');

// Define global variables
var nodeElements, textElements, linkElements;
var nodes, links;


// Grabs all nodes from the DB
function getNodesFromDb() {
  output = [];
  all_nodes = db.prepare("SELECT * FROM nodes").all();
  for (node_id in all_nodes) {
    node = all_nodes[node_id];
    output.push(node)
  }
  return output;
}

// Grabs all nodes from the DB within a certain workspace
function getWorkspaceNodesFromDb(workspace_id) {
  output = [];
  all_nodes = db.prepare("SELECT * FROM nodes WHERE workspace_id = " + workspace_id).all();
  for (node_id in all_nodes) {
    node = all_nodes[node_id];
    output.push(node)
  }
  return output;
}

// Grabs all links from the DB
function getLinksFromDb() {
  output = [];
  all_links = db.prepare("SELECT * FROM links").all();
  for (link_id in all_links) {
    link = all_links[link_id];
    output.push(link)
  }
  return output;
}

// Grabs all links from the DB within a certain workspace
function getWorkspaceLinksFromDb(workspace_id) {
	// TODO: update DB schema
  output = [];
  all_links = db.prepare("SELECT * FROM links WHERE workspace_id = " + workspace_id).all();
  for (link_id in all_links) {
    link = all_links[link_id];
    output.push(link)
  }
  return output;
}

function insertNodeIntoDb(node_id, workspace_id, title, info) {
	node_insert = db.prepare("INSERT INTO nodes VALUES (@id, @workspace_id, @title, @info)");
	node_insert.run({
		id: node_id, workspace_id: workspace_id, title: title, info: info
	})
}

function insertNodeIntoDbTest() {
	node_insert = db.prepare("INSERT INTO nodes VALUES (@id, @workspace_id, @title, @info)");
	node_insert.run({
		id: nodes.length, workspace_id: 0, title: "Inserted Note", info: "Inserted Info"
	})
}

function removeNodeFromDb(node) {
	const node_id = node.id;
	const workspace_id = node.workspace_id;
	node_removal = db.prepare("REMOVE FROM nodes WHERE id = @node_id AND workspace_id = @workspace_id");
	node_removal.run({
		id: node.id, workspace_id: workspace_id
	})
}

// Set the values of the nodes and links
nodes = getWorkspaceNodesFromDb(0);
links = getWorkspaceLinksFromDb(0);

// Modify the links data structure to include actual node values
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

function createNewNode() {

}

function createEmptyNode() {
	const new_node_id = Math.trunc(nodes.length).toString();
	node = {
		id: new_node_id,
		workspace_id: 0,
		title: "Title",
		info: "Info",
		x: width / 2,
		y: height / 2
	};
	insertNodeIntoDb(node.id, node.workspace_id, node.title, node.info)
	nodes.push(node);

	// Go through standard update pattern
	updateSimulation();
	updateNodeListeners();
	document.getElementById('node' + new_node_id).focus();
	return node;
}

function createNewNodeFromSelectedNode() {
	target_node = createEmptyNode();
	if (currentlySelectedNode != null) {
		createNewLink(currentlySelectedNode, target_node);
		// currentlySelectedNode = target_node;
		selectNode(target_node);
	}
	// Go through standard update pattern
	updateSimulation();
	updateNodeListeners();
}

function updateNodeInDb(node) {
	node_id = node.id;
	newTitle = node.title;
	newInfo = node.info;
	update_stmt = db.prepare("UPDATE nodes SET title = @title, info = @info WHERE id = @id")
	update_stmt.run({
		title: newTitle, info: newInfo, id: node_id
	})
}

function createNewLink(source_node, target_node) {
	if (source_node.workspace_id != target_node.workspace_id) {
		console.log("Error: Trying to connect nodes from different workspaces.");
	}
	link = {
		target: target_node.id,
		source: source_node.id,
		strength: .7,
		workspace_id: target_node.workspace_id
	};
	link_insert = db.prepare("INSERT INTO links VALUES (@target, @source, @strength, @workspace_id)")
	link_insert.run(link)
	link.target = target_node;
	link.source = source_node;
	links.push(link)
}

function getNeighbors(node) {
  return links.reduce(function (neighbors, link) {
      if (link.target.id === node.id) {
        neighbors.push(link.source.id)
      } else if (link.source.id === node.id) {
        neighbors.push(link.target.id)
      }
      return neighbors
    },
    [node.id]
  )
}
function isNeighborLink(node, link) {
  return link.target.id === node.id || link.source.id === node.id
}
function getNodeColor(node, neighbors) {
  if (Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1) {
    return node.level === 1 ? 'blue' : 'green'
  }
  return node.level === 1 ? 'red' : 'gray'
}
function getLinkColor(node, link) {
  return isNeighborLink(node, link) ? 'green' : '#E5E5E5'
}
function getTextColor(node, neighbors) {
  return Array.isArray(neighbors) && neighbors.indexOf(node.id) > -1 ? 'green' : 'black'
}
var width = window.innerWidth
var height = window.innerHeight
var svg = d3.select('svg')
svg.attr('width', width).attr('height', height)
// simulation setup with all forces
var linkForce = d3
  .forceLink()
  .id(function (link) { return link.id })
  .strength(function (link) { return link.strength / 10 })
var simulation = d3
  .forceSimulation()
  .force('link', linkForce)
  .force('charge', d3.forceManyBody().strength(-2000))
	.force('center', d3.forceCenter(width / 2, height / 2))
	.force('collision', d3.forceCollide().radius(function(node) {
    return 90
		// node.radius
  }))

	// .force('center', d3.forceCenter(width / 4, height / 4))
var dragDrop = d3.drag().on('start', function (node) {
  node.fx = node.x
  node.fy = node.y
}).on('drag', function (node) {
  simulation.alphaTarget(0.7).restart()
  node.fx = d3.event.x
  node.fy = d3.event.y
}).on('end', function (node) {
  if (!d3.event.active) {
    simulation.alphaTarget(0)
  }
  node.fx = null
  node.fy = null
})




// There should always be a selected node.
// This is to allow you to always be able to add a node that is connected to the graph.
// Might change this later.
function selectNode(selectedNode) {
  // var neighbors = getNeighbors(selectedNode)
  // we modify the styles to highlight selected nodes
  // nodeElements.attr('fill', function (node) { return getNodeColor(node, neighbors) })
  // textElements.attr('fill', function (node) { return getTextColor(node, neighbors) })
	// 						.attr('foreignObject')
  // linkElements.attr('stroke', function (link) { return getLinkColor(selectedNode, link) })
	simulation.alphaTarget(0.7)

	if (currentlySelectedNode == null || currentlySelectedNode.id != selectedNode.id) {
		currentlySelectedNode = selectedNode;
		nodeElements.attr('fill', function(node) {
			if (node.id == selectedNode.id) {
				return 'red';
			} else {
				return 'gray'
			}
		})
	} else {
		// currentlySelectedNode = null;
		// nodeElements.attr('fill', 'gray');
	}
}

function getTextAreaFromId(node_id) {
	return d3.select('[id="node' + node.id + '"]');
}

function getForeignObjectFromId(node_id) {
	return getTextAreaFromId(node_id).select(function() {return this.parentNode});
}

var linkGroup = svg.append('g').attr('class', 'links');
var nodeGroup = svg.append('g').attr('class', 'nodes');
var textGroup = svg.append('g').attr('class', 'texts');

var linkElements = linkGroup.selectAll("line")
  .data(links)
  .enter().append("line")
    .attr("stroke-width", 1)
	  .attr("stroke", "rgba(50, 50, 50, 0.2)")
var nodeElements = nodeGroup.selectAll("circle")
  .data(nodes)
  .enter().append("circle")
    .attr('r', 90)
    .attr("fill", getNodeColor)
    .call(dragDrop)
    .on('click', selectNode)
var textElements = textGroup.selectAll("foreignObject")
  .data(nodes)
  .enter()
		.append("foreignObject");

textElements.attr('width', 150)
		.attr('height', 30)
		.append("xhtml:textarea")
	  .attr("type", "text")
		.attr('width', 150)
		.attr('height', 30)
		.attr("id", function(node) {return "node" + node.id})
		.attr("value", function(node) {return node.title})
		.property("value", function(node) {return node.title})
		.on("keyup", function(node){
			updateNode(node);
		})
		.on("keydown", function(node) {
				var scrollHeight = d3.select('#node' + node.id).property("scrollHeight");
				// d3.select('#node' + node.id).attr("width", scrollHeight).select(function() {return this.parentNode}).attr("width", scrollHeight);
				d3.select('#node' + node.id).attr("height", scrollHeight).select(function() {return this.parentNode}).attr("height", scrollHeight);
		})
// textElements.attr('x', function (node) {
// 				var radius = d3.select('#node' + node.id).attr("width") / 2;
// 				return node.x - radius;
// 			})
// 	    .attr('y', function (node) {
// 				var radius = d3.select('#node' + node.id).attr("height") / 2;
// 				return node.y - radius;
// 			})

var currentlySelectedNode = nodes[nodes.length - 1];
selectNode(currentlySelectedNode);

function updateNode(node) {
	const title = d3.select('#node' + node.id).property('value');
	const info = node.info;

	node.info = info;
	node.title = title;
	updateNodeInDb(node);
}

function calculateMinBoxSize(node) {
	// """
	// Takes in a node, and calculates the minimum box size necessary for capturing
	// the elements inside. This shouldn't be too expensive as it'll be called
	// quite often.
	// """
	return Math.sqrt(node.title.length) * 10
}

function collide(node) {
	return function(quad, x1, y1, x2, y2) {
		var updated = false;
		if (quad.point && (quad.point !== node)) {

			var x = node.x - quad.point.x,
				y = node.y - quad.point.y,
				xSpacing = (quad.point.width + node.width) / 2,
				ySpacing = (quad.point.height + node.height) / 2,
				absX = Math.abs(x),
				absY = Math.abs(y),
				l,
				lx,
				ly;

			if (absX < xSpacing && absY < ySpacing) {
				l = Math.sqrt(x * x + y * y);

				lx = (absX - xSpacing) / l;
				ly = (absY - ySpacing) / l;

				// the one that's barely within the bounds probably triggered the collision
				if (Math.abs(lx) > Math.abs(ly)) {
					lx = 0;
				} else {
					ly = 0;
				}

				node.x -= x *= lx;
				node.y -= y *= ly;
				quad.point.x += x;
				quad.point.y += y;

				updated = true;
			}
		}
		return updated;
	};
}



simulation.nodes(nodes).on('tick', () => {
	// var q = d3.geom.quadtree(nodes),
	// 	i = 0,
	// 	n = nodes.length;

	// while (++i < n) {
	// 	q.visit(collide(nodes[i]));
	// }

  nodeElements
    .attr('cx', function (node) {
			const boundary = 50;
			return (node.x = Math.max(boundary, Math.min(width - boundary, node.x)));
		})
    .attr('cy', function (node) {
			const boundary = 50;
			return (node.y = Math.max(boundary, Math.min(height - boundary, node.y)));
		})
  textElements
		.attr('x', function (node) {
			var radius = d3.select('#node' + node.id).attr("width") / 2;

			return node.x - radius;
		})
		.attr('y', function (node) {
			var radius = d3.select('#node' + node.id).attr("height") / 2;
			return node.y - radius;
		})

  linkElements
    .attr('x1', function (link) { return link.source.x })
    .attr('y1', function (link) { return link.source.y })
    .attr('x2', function (link) { return link.target.x })
    .attr('y2', function (link) { return link.target.y })
})

function updateGraph() {
	nodeElements = nodeGroup.selectAll('circle')
	 .data(nodes)
 	nodeElements.exit().remove()
	var nodeEnter = nodeElements
    .enter()
    .append('circle')
    .attr('r', 75)
    .attr('fill', function (node) { return node.level === 1 ? 'red' : 'gray' })
    .call(dragDrop)
		.on('click', selectNode)

    // we link the selectNode method here
    // to update the graph on every click
  nodeElements = nodeEnter.merge(nodeElements)

	// links
  linkElements = linkGroup.selectAll('line')
    .data(links, function (link) {
      return link.target.id + link.source.id
    })
  linkElements.exit().remove()
  var linkEnter = linkElements
    .enter().append('line')
    .attr('stroke-width', 1)
    .attr('stroke', 'rgba(50, 50, 50, 0.2)')
  linkElements = linkEnter.merge(linkElements)

	// texts
  textElements = textGroup.selectAll('foreignObject')
    .data(nodes)
  textElements.exit().remove()
  var textEnter = textElements
    .enter()
		.append("foreignObject");
	textEnter
		.attr('width', 150)
		.attr('height', 30)
		.append("xhtml:textarea")
		.attr('width', 150)
		.attr('height', 30)
		.attr("size",4)
	  .attr("type", "text")
		.attr("id", function(node) {return "node" + node.id})
		.attr("value", function(node) {return node.title})
		.on("keyup", function(node){
			updateNode(node);
		})
		.on("keydown", function(node) {
			var scrollHeight = d3.select('#node' + node.id).property("scrollHeight");
			d3.select('#node' + node.id).attr("height", scrollHeight).select(function() {return this.parentNode}).attr("height", scrollHeight);
		})
  textElements = textEnter.merge(textElements)
}

function updateSimulation() {
  updateGraph()
	simulation.nodes(nodes).on('tick', () => {
	  nodeElements
	    .attr('cx', function (node) {
				const boundary = 50;
				return (node.x = Math.max(boundary, Math.min(width - boundary, node.x)));
			})
	    .attr('cy', function (node) {
				const boundary = 50;
				return (node.y = Math.max(boundary, Math.min(height - boundary, node.y)));
			})
	  textElements
	    .attr('x', function (node) {
				var radius = d3.select('#node' + node.id).attr("width") / 2;
				console.log(radius)
				return node.x - radius;
			})
	    .attr('y', function (node) {
				var radius = d3.select('#node' + node.id).attr("height") / 2;
				console.log(radius)
				return node.y - radius;
			})
	  linkElements
	    .attr('x1', function (link) { return link.source.x })
	    .attr('y1', function (link) { return link.source.y })
	    .attr('x2', function (link) { return link.target.x })
	    .attr('y2', function (link) { return link.target.y })
	})
  simulation.force('link').links(links)
  simulation.alphaTarget(0.7).restart()
}

var observe;
if (window.attachEvent) {
	 observe = function (element, event, handler) {
			 element.attachEvent('on'+event, handler);
	 };
}
else {
	 observe = function (element, event, handler) {
			 element.addEventListener(event, handler, false);
	 };
}

function updateNodeListeners() {
	for (node_number in nodes) {
		const node = nodes[node_number];
		const textInput = document.getElementById("node" + node.id);
		function resize () {
			textInput.style.height = 'auto';
			textInput.style.height = textInput.scrollHeight + 'px';
	  }
	  /* 0-timeout to get the already changed text */
		function delayedResize () {
	  	window.setTimeout(resize, 0);
	  }

    observe(textInput, 'change',  resize);
    observe(textInput, 'cut',     delayedResize);
    observe(textInput, 'paste',   delayedResize);
    observe(textInput, 'drop',    delayedResize);
    observe(textInput, 'keydown', delayedResize);

    resize();
	}
}

updateNodeListeners();
simulation.force("link").links(links)
updateSimulation();
