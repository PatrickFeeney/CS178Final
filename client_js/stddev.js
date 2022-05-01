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



    // delta => { date = new Date("2020-04-06T00:00:00"); date.setHours(date.getHours() + sensorData['DeltaTime']); return date; }
    
    // create scales 
    // console.log(sensorData)
    // console.log(d3.extent(sensorData, function(d) {return d.dTime}))
    const xScale = d3.scaleLinear().domain(d3.extent(sensorData, d => d.dTime)).range([0, plot_width]);
    const yScale = d3.scaleLinear().domain(d3.extent(sensorData, d => d.std)).range([plot_height, 0]);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).tickValues([1, 20, 300, 1000, 50000]);
    // create group
    svg.append('g')
    .attr("transform", `translate(${0}, ${plot_height})`)
    .call(xAxis)

    svg.append('g')
    .attr("transform", `translate(${0}, 0)`)
    .call(yAxis)

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

    return svg.node();
}