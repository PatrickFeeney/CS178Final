async function updateGeoFromBrush()
{
    var brush_node = d3.select(".brush").node();
    if (brush_node != null)
    {
        var selection = d3.brushSelection(brush_node);
        var val_range = null;
        if (selection != null)
        {
            val_range = selection.map(sensorHistXScale.invert, sensorHistXScale);
        }
        else
        {
            d3.select(".brush").call(brush).call(brush.move, sensorHistXScale.range())
            val_range = [0, 10000];
        }
        d3.select("#geoPoints").remove();
        geographicalPlotPoints(data["agg_data"], d3.select("#geoSVG"), val_range[0], val_range[1]);
    }
}

function sensorHistogram(sensorData, selectedTag)
{
    // modified from this tutorial:
    // https://observablehq.com/@d3/histogram
    // set spacing
    plot_width = 995;
    plot_height = 200;
    margin = ({top: 40, right: 40, bottom: 40, left: 40});
    width = margin.left + plot_width + margin.right;
    height = margin.top + plot_height + margin.bottom;
    // set parameters
    thresholds = 40;
    insetLeft = .5;
    insetRight = .5;
    // compute values
    const X = d3.map(sensorData, d => d.val);
    const Y0 = d3.map(sensorData, () => 1);
    const I = d3.range(X.length);
    // compute bins
    const bins = d3.bin().thresholds(thresholds).value(i => X[i])(I);
    const Y = Array.from(bins, I => d3.sum(I, i => Y0[i]));
    const Y_sel = Array.from(bins, I => d3.sum(I, i => (
        sensorData[i].id == selectedTag ||
        selectedTag == "All" ||
        (selectedTag == "All Mobile" && sensorData[i].id.search("Static:") == -1) ||
        (selectedTag == "All Static" && sensorData[i].id.search("Static:") != -1))
        ? 1 : 0));
    // create domains
    xDomain = [bins[0].x0, bins[bins.length - 1].x1];
    yDomain = [0, d3.max(Y)];
    // create scales and axes
    const xScale = d3.scaleLinear(xDomain, [margin.left, margin.left + plot_width]);
    const yScale = d3.scaleSymlog(yDomain, [margin.top + plot_height, margin.top]);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).tickValues([1, 10, 100, 1000, 10000]);
    // create public xScale for brush function
    sensorHistXScale = xScale;
    // create view
    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");
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
    // create y axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", plot_width)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -margin.left)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text("Frequency"));
    // create x axis
    svg.append("g")
        .attr("transform", `translate(0,${margin.top + plot_height})`)
        .call(xAxis)
        .call(g => g.append("text")
            .attr("x", margin.left + plot_width)
            .attr("y", 27)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text("Radiation"));
    // create selected bars
    svg.append("g")
        .attr("fill", "blue")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => xScale(d.x0) + insetLeft)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight))
        .attr("y", (d, i) => yScale(Y_sel[i]))
        .attr("height", (d, i) => yScale(0) - yScale(Y_sel[i]))
        .append("title")
        .text((d, i) => [`${d.x0} ≤ x < ${d.x1}`, Y_sel[i]].join("\n"));
    // create unselected bars
    svg.append("g")
        .attr("fill", "black")
        .selectAll("rect")
        .data(bins)
        .join("rect")
        .attr("x", d => xScale(d.x0) + insetLeft)
        .attr("width", d => Math.max(0, xScale(d.x1) - xScale(d.x0) - insetLeft - insetRight))
        .attr("y", (d, i) => yScale(Y[i]))
        .attr("height", (d, i) => yScale(Y_sel[i]) - yScale(Y[i]))
        .append("title")
        .text((d, i) => [`${d.x0} ≤ x < ${d.x1}`, Y[i] - Y_sel[i]].join("\n"));

    return svg.node();
}
