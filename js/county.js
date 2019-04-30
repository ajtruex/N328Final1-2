
// create variables for height and width
var width = 1200,
    height = 1200;

//create variable for path for the map
var path = d3.geo.path().projection(null);

// variable for color using colorbrewer
var colors = d3.scale.threshold().range(colorbrewer.Greens[6]);


//svg variable that scales the map position
var svg = d3.select("body").append("svg")
    .attr("width", width/2)
    .attr("height", height/2);

//variable that scales the canvas position
var canvas = d3.select("body").append("svg")
    .attr("width", width/2)
    .attr("height", height/2)
    .attr("transform", "translate(20,0)");

//tooltip variable for all the styling
var tooltip = d3.select("body").append("div").attr("class", "tooltip");

// variable for legend scale, the scale is by the 1000 and so any time the county jumps up by 1000 it gets a new shade
var threshold = d3.scale.threshold()
  .domain([.1, 1, 2, 3, 4])
  .range(colorbrewer.Greens[6]);
var x = d3.scale.linear()
  .domain([-0.6, 5])
  .range([0, 400]);
var xAxis = d3.svg.axis()
  .scale(x)
  .orient("bottom")
  .tickSize(13)
  .tickValues(threshold.domain())
  .tickFormat(function(d) { return (1000 * d); });




//https://factfinder.census.gov/faces/tableservices/jsf/pages/productview.xhtml?src=bkmk
//linked data to get the information from the csv file
d3.csv("data/caPopulationChange.csv", function(error,data) {


  //makes the color green and sets the shade to how many people live in the county
  colors.domain([ 100000, 1000000, 2000000,3000000, 4000000]);

  //imports the data that creates the map
  d3.json("data/ca_min.json", function(error, ca) {

    //binds the data from the js file and the json file to let the program make the map
    var counties_json = topojson.feature(ca, ca.objects.counties);
    for (var i = 0; i < data.length; i++) {
      var county_name = data[i].counties;
      var population_value = parseFloat(data[i].populationvalue2011);

      for (var j = 0; j < counties_json.features.length; j++) {
        var ca_county = counties_json.features[j].properties.name;
        if (county_name == ca_county) {
          counties_json.features[j].properties.value = population_value;
          break;
        }
      }
    }
  //function to differenciate between thousands and millions
  function populationString(d) {
    if (d < 999999) return d.toLocaleString();
    else return d.toLocaleString();
  }

    //displays the actual data on hover and colors the tiles
    svg.selectAll("path")
      .data(counties_json.features)
      .enter()
      .append("path")
      .attr("class", ".county-border")
      .attr("d", path)
      .style("fill", function(d) { return colors(d.properties.value); })
      .on("mouseover", function(d) {
        tooltip.transition()
        .duration(200)
        .style("opacity", .9);
        tooltip.html(d.properties.name + "</br>" + "Population: " +
                     populationString(d.properties.value))
        .style("left", (d3.event.pageX + 5) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
      })
      .on("mouseout", function(d) {
        tooltip.transition()
        .duration(400)
        .style("opacity", 0);
      });

  //creates black lines between the counties.
    var counties_mesh = topojson.mesh(ca, ca.objects.counties);
    svg.append("path")
      .datum(counties_mesh, function(a, b) { return a !== b; })
      .attr("class", "bb")
      .attr("d", path);
//code for legend
var legend = svg.append("g")
.attr("class", "bar")
.attr("transform", "translate(130,520)");

legend.selectAll("rect")
.data(threshold.range().map(function(color) {
  var d = threshold.invertExtent(color);
  if (d[0] == null) d[0] = x.domain()[0];
  if (d[1] == null) d[1] = x.domain()[1];
  return d;
}))
.enter().append("rect")
.attr("height", 8)
.attr("x", function(d) { return x(d[0]); })
.attr("width", function(d) { return x(d[1]) - x(d[0]); })
.style("fill", function(d) { return threshold(d[0]); });

legend.call(xAxis).append("text")
.attr("class", "legend")
.attr("y", -6)
.text("Population (in Thousands) ");


  });
});

