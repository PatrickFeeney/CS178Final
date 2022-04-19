function geographicalPlot(data)
{
    // set spacing
    img_width = 995;
    img_height = 823;
    margin = ({top: 40, right: 40, bottom: 40, left: 40});
    width = margin.left + img_width + margin.right;
    height = margin.top + img_height + margin.bottom;
    // create scales
    xScale = d3.scaleLinear()
        .domain([-120.0, -119.711751])
        .range([margin.left, margin.left + img_width])
    yScale = d3.scaleLinear()
        .domain([0.0, 0.238585])
        .range([img_height + margin.top, margin.top])
    colorScale = d3.scaleSequential(d3.extent(data, d => d.val), d3.interpolateReds);
    // create public colorScale for update function
    geoColorScale = colorScale;
    // create axes
    yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));
    xAxis = g => g
        .attr("transform", `translate(0,${img_height + margin.top})`)
        .call(d3.axisBottom(xScale));
    // create the chart
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("id", "geoSVG");
    // background image
    svg.append("svg:image")
        .attr("xlink:href", "MC2/data/StHimarkLabeledMap.png")
        .attr("transform", `translate(${margin.left},${margin.top})`);
    // axes and color bar
    svg.append("g")
        .call(xAxis);
    svg.append("g")
        .call(yAxis);
    // create points
    geographicalPlotPoints(data, svg);
    return svg.node();
}

function geographicalPlotPoints(data, svg, min_val=0, max_val=10000)
{
    // filter data before creating points
    filtered = data.filter((d) => {return d.val >= min_val && d.val <= max_val;});
    // points
    svg.append("g")
        .attr("stroke-width", 1.5)
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("id", "geoPoints")
        .selectAll("path")
        .data(filtered)
        .join("path")
            .attr("transform", d => `translate(${xScale(d.long)},${yScale(d.lat)})`)
            .attr("d", (d) => d3.symbol().type(d3.symbolCircle)())
            .attr("fill", d => geoColorScale(d.val))
            .append("title")
                .text(d => `${d.val}`);
}