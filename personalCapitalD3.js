var margin = {top: 80, right: 30, bottom: 40, left: 30},
    width = 960 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.ordinal()
    .rangeRoundBands([0, height], 0.1);

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(0)
    .tickPadding(6);

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 50)
 	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


var tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("z-index", "10")
    .style("visibility", "hidden")
    .text("meh");

function sortNumbers(a,b)
{
	return a.value-b.value;
}

function type(d) {
  d.value = +d.value;
  return d;
}

var sort = false;
var data = [];

d3.csv("transactions.csv", type, function(error, data) 
{

  data.forEach(function(d) 
  {
    d.Amount = +d.Amount;
  });

  var aggregate = new Array();


  for(var i =0; i<data.length; ++i)
  {
  	if(data[i].Category in aggregate)
  	{
  		aggregate[data[i].Category]+=data[i].Amount
  	}
  	else
  	{
  		aggregate[data[i].Category]=data[i].Amount
  	}  	
  }

  x.domain(d3.extent(d3.entries(aggregate), function(d) { return d.value; })).nice();
  y.domain(d3.entries(aggregate).map(function(d) { return d.key; }));


  svg.selectAll(".bar")
    .data(d3.entries(aggregate))
  	.enter().append("rect")
  	.attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
  	.attr("x", function(d) { return x(Math.min(0, d.value)); })
  	.attr("y", function(d) { return y(d.key); })
  	.attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
  	.attr("height", y.rangeBand())
    .on("mouseover", function(d) 
      {   
        tooltip.style("visibility", "visible")
          .text("$"+Math.round(d.value));

        d3.select(this)
          .style("fill", "red");
      })                  
    .on("mousemove", function(d)
      {
        return tooltip.style("top", y(d.key) + margin.top+10).style("left",(event.pageX+10)+"px")})
    .on("mouseout", function(d) 
      {
          tooltip.style("visibility","hidden");
          d3.select(this).style("fill", d.value<0 ? "darkorange" : "steelblue");
      });


  svg.append("g")
      //.transition().duration(2000)
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  svg.append("g")
      //.transition().duration(2000)
      .attr("class", "y axis")
      .attr("transform", "translate(" + x(0) + ",0)")
      .call(yAxis);


  svg.append("text")
        .attr("x", x(0))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "24px") 
        .style("text-decoration", "bold")  
        .style("font-family","sans-serif")
        .text("What I Spend My Money On");

  svg.append("text")
        .attr("x", x(0))             
        .attr("y", height + 50)
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "bold")  
        .style("font-family","sans-serif")
        .text("Dollars");

  document.getElementById("click").onclick = function() {sortDisBitch()};

  function sortDisBitch() 
  {

    if(sort==false)
    {
      data = d3.entries(aggregate).sort(sortNumbers);
      sort=true;
    }
    else
    {
      data = d3.entries(aggregate);
      sort=false;
    }

    y.domain(data.map(function(d) { return d.key; }));
    x.domain(d3.extent(data, function(d) { return d.value; })).nice();

    svg.selectAll(".bar")
      .transition()
      .duration(250)
      .delay(function(d, i) { return i * 50; })
      .attr("class", function(d) { return "bar bar--" + (d.value < 0 ? "negative" : "positive"); })
      .attr("x", function(d) { return x(Math.min(0, d.value)); })
      .attr("y", function(d) { return y(d.key); })
      .attr("width", function(d) { return Math.abs(x(d.value) - x(0)); })
      .attr("height", y.rangeBand());

    svg.select("g.y.axis").selectAll(".tick")
      .transition()
      .duration(250)
      .delay(function(d, i) { return i * 50; })
      .attr("transform", function(d){
        var blah = y(d)+10;
        return "translate(0,"+blah+")"
      });
  }
});
