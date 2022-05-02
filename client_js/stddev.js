async function updateGeoFromBrush()
{
    var brush_node = d3.select(".brush").node();
    if (brush_node != null)
    {
        var selection = d3.brushSelection(brush_node);
        var val_range = null;
        if (selection != null)
        {
            val_range = selection.map(sensorSTDXScale.invert, sensorSTDXScale);
        }
        else
        {
            d3.select(".brush").call(brush).call(brush.move, sensorSTDXScale.range())
            val_range = [0, 10000];
        }
        d3.select("#geoPoints").remove();
        geographicalPlotPoints(data["agg_data"], d3.select("#geoSVG"), val_range[0], val_range[1]);
    }
}

function stdvedgraph(sensorData){
    // set spacing
    plot_width = 995;
    plot_height = 200;
    margin = ({top: 40, right: 40, bottom: 40, left: 40});
    width = margin.left + plot_width + margin.right;
    height = margin.top + plot_height + margin.bottom;

    // create svg
    const svg = d3.create("svg")
    .attr("width", width)
    .attr("height", height)

    //  // create view
    //  const svg = d3.create("svg")
    //  .attr("width", width)
    //  .attr("height", height)
    //  .attr("viewBox", [0, 0, width, height])
    //  .attr("style", "max-width: 100%; height: auto; height: intrinsic;");



    // delta => { date = new Date("2020-04-06T00:00:00"); date.setHours(date.getHours() + sensorData['DeltaTime']); return date; }
    // create scales and axis
    const xScale = d3.scaleLinear().domain(d3.extent(sensorData, d => d.dTime)).range([margin.left, margin.left + plot_width]);
    const yScale = d3.scaleLinear().domain(d3.extent(sensorData, d => d.std)).range([margin.top + plot_height, margin.top]);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    // const xAxis = d3.axisBottom(xScale).tickValues(delta => { date = new Date("2020-04-06T00:00:00"); date.setHours(date.getHours() + delta); return date; });
    const yAxis = d3.axisLeft(yScale).tickValues([10, 100, 500, 1000]);
    
    // create public xScale for brush function
    sensorSTDXScale = xScale;
    // create group
    svg.append('g')
    //.attr("transform", `translate(${0}, ${plot_height})`)
    .attr("transform", `translate(0,${margin.top + plot_height})`)
    .call(xAxis)
    .call(g => g.append("text")
            .attr("x", margin.left + plot_width)
            .attr("y", 27)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Hours after first earthquake"));

    svg.append('g')
    //.attr("transform", `translate(${0}, 0)`)
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .call(g => g.append("text")
            .attr("x", -margin.left)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("Standard Deviation"));

    // Initialize brush component
    const defaultSelection = xScale.range();
    brush = d3.brushX()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("end", updateGeoFromBrush);
    // Append brush component
    gbrush = svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, defaultSelection);
    
    // initialize tooltip component
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // plot line
    const dataNest = d3.group(sensorData, d => d.id)

    const linesg = svg.append('g')

    const line = d3.line()
    .x(d => { 
        // console.log(d)
        const f= xScale(d.dTime);
        // console.log("x" + f)
        return f})
    .y(d => {
        // console.log(d)
        const s = yScale(d.std);
        // console.log("y" + s)
        return s
    })

    var color = d3.scaleOrdinal(d3.schemeCategory10).domain(sensorData.map(function(d) { return d.id; }));
    
    dataNest.forEach( function(d,i) {
        // console.log(i)
        linesg.append('path')
        .attr("d", line(d) )
        .attr('stroke', d => color(i))//function(d2) {
            //console.log(color(sensorData))
            //return color(d2);})
        .attr("fill", 'none')
        
        
    });

    svg.selectAll("g")
        .data(dataNest)
        .on("mouseover", function(event,d2) {
            console.log(event)
            div.transition()
            .duration(200)
            .style("opacity", .9);
            div.html(d2[0] + "<br/>")
            .style("left", (event.pageX) + "px")
            .style("top", (event.pageY - 28) + "px");
            })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
        });

    return svg.node();
}