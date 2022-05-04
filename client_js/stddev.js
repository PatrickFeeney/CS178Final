async function updateTimeFromBrush()
{
    var brush_node = d3.select(".stdbrush").node();
    if (brush_node != null)
    {
        var selection = d3.brushSelection(brush_node);
        var val_range = null;
        if (selection != null)
        {
            val_range = selection.map(sensorSTDXScale.invert, sensorSTDXScale);
            if (val_range[1] - val_range[0] > 4)
            {
                val_range[1] = val_range[0] + 4;
            }
        }
        else
        {
            val_range = [0, 4];
        }
        d3.select(".stdbrush").transition().duration(400).call(brush.move,
            [sensorSTDXScale(val_range[0]), sensorSTDXScale(val_range[1])]);
        init_date = new Date("2020-04-06T00:00:00");
        start_date = new Date(init_date.setHours(init_date.getHours() + val_range[0]));
        init_date = new Date("2020-04-06T00:00:00");
        end_date = new Date(init_date.setHours(init_date.getHours() + val_range[1]));
        reloadVis(start_date.toISOString(), end_date.toISOString());
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
            .text("Hours since start of data"));

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
    const defaultSelection = [xScale(0), xScale(4)];
    brush = d3.brushX()
        .extent([[margin.left, margin.top], [width - margin.right, height - margin.bottom]])
        .on("end", updateTimeFromBrush);
    // Append brush component
    gbrush = svg.append("g")
        .attr("class", "stdbrush")
        .call(brush)
        .call(brush.move, defaultSelection);

    // plot line
    const dataNest = d3.group(sensorData, d => d.id)

    const linesg = svg.append('g')

    const line = d3.line()
    .x(d => {
        const f= xScale(d.dTime);
        return f})
    .y(d => {
        const s = yScale(d.std);
        return s
    })

    var color = d3.scaleOrdinal(d3.schemeCategory10).domain(sensorData.map(function(d) { return d.id; }));
    
    dataNest.forEach( function(d,i) {
        linesg.append('path')
        .attr("d", line(d) )
        .attr('stroke', d => color(i))
        .attr("fill", 'none')
        .append("title").html(d[0].id);
        
        
    });

    return svg.node();
}