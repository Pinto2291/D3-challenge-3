// Get the Information

fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json').then((n) => n.json()).then((n) => {

    // Main Data
    const data = n;

    const baseTemp = n.baseTemperature; // 8.66
    const months = n['monthlyVariance']; // length = 3153 - year, month, variance
    const totalData = []; // [year, month, variance]
    const monthsNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    months.map((n) => {
        return totalData.push([n.year, n.month, n.variance])
    }); 

    // Temperature colors
    let color1 = '#1B1464';
    let color2 = '#0652DD';
    let color3 = '#74b9ff';
    let color4 = '#ecf0f1';
    let color5 = '#f1c40f';
    let color6 = '#e67e22';
    let color7 = '#eb2f06';
    let color8 = '#b71540';

    function temperatureComparison(n) {
        return baseTemp + n > 0 && baseTemp +  n <= 3.9 ? color1
        : baseTemp + n > 3.9 && baseTemp +  n <= 5 ? color2
        : baseTemp + n > 5 && baseTemp + n <= 6 ? color3
        : baseTemp + n > 6 && baseTemp +  n <= 7 ? color4
        : baseTemp + n > 7 && baseTemp +  n <= 8 ? color5
        : baseTemp + n > 8 && baseTemp +  n <= 9.5 ? color6
        : baseTemp + n > 9.5 && baseTemp +  n <= 10.5 ? color7
        : baseTemp + n > 10.5 && baseTemp +  n <= 12.5 ? color8
        : color8 
    }

    // Max and min year
    const min_x = d3.min(totalData, (d) => d[0]); // 1753
    const max_x = d3.max(totalData, (d) => d[0]); // 2015

    const min_y = d3.min(totalData, (d) => d[1]); // 1 - january
    const max_y = d3.max(totalData, (d) => d[1]); // 12 - december

    const dateTest = new Date(totalData[0][0], totalData[0][1])

    // General SVG dimentions
    const w = 1250;
    const h = 400;
    const l = 80;
    const pad = 50;

    // SVG
    const general = d3.select('#main')
        .append('svg')
        .attr('width', w + pad*2)
        .attr('height', h + pad*2)
        .style('background-color', '#bdc3c7')

    // Scales    
    const xScale = d3.scaleLinear()
        .domain([min_x, max_x])
        .range([0, w])

    const yScale = d3.scaleBand()
        .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
        .range([0, h])

    // Axis
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))
        .ticks(30)
        .tickSize(10);

    const yAxis = d3.axisLeft(yScale)
        .tickSize(10)
        .tickValues(yScale.domain())
        .tickFormat((n) => {
            let date = new Date(0);
            date.setUTCMonth(n);
            let format = d3.timeFormat('%B');
            return format(date)
        })

    general.append('g')
        .attr('transform', `translate(${l}, ${h+pad})`)
        .call(xAxis)
        .style('font-size', '14px')
        .attr('id', 'x-axis')
        .style('font-weight', 'bold')

    general.append('g')
        .attr('transform', `translate(${l}, ${pad})`)
        .call(yAxis)
        .style('font-size', '12px')
        .attr('id', 'y-axis')
        .style('font-weight', 'bold')

    // Tooltip 
    
    let tooltip = d3.select('body')
        .append('div')
        .attr('id', 'tooltip')
        .attr('class', 'tooltip')
        .style('visibility', 'hidden')

    // Rectangles    

    general.selectAll('rect')
        .data(totalData)
        .enter()
        .append('rect')
        .attr('x', (d) => xScale(d[0]) + l)
        .attr('y', (d) => yScale(d[1]) + pad+4) // the position 'pad + 4' is directly related to the height of the element in this h/18
        .attr('width', w/(max_x-min_x))
        .attr('height', (h)/18)
        .attr('class', 'cell')
        .attr('data-month', (d) => d[1]-1)
        .attr('data-year', (d) => d[0])
        .attr('data-temp', (d) => d[2])
        .attr('fill', (d) => temperatureComparison(d[2]) )
        .on('mouseover', (e, d) => {
            tooltip.transition()
            .duration(600)
            .style('opacity', 0.8)
            .style('visibility', 'visible')
            .style('background-color', temperatureComparison(d[2]))
            .style('color', (temperatureComparison(d[2]) == color1 || temperatureComparison(d[2]) == color2 || temperatureComparison(d[2]) == color7 ? '#fff'
            : 'black' )) 
            .attr('data-month',  d[1] - 1)
            .attr('data-year', d[0])
            .attr('data-temp', d[2]);
            tooltip.html(`<strong>Year:</strong> ${d[0]} <br>
            <strong>Month:</strong> ${monthsNames[d[1]-1]} <br>
            <strong>Variance:</strong> ${d[2]}`)
        })
        .on('mousemove', (e, d) => {
            tooltip.style('top', (event.pageY-100)+ 'px')
            .style('left', (event.pageX-60) + 'px')
            .attr('data-year', d[0])
        })
        .on('mouseout', (e, d) => {
            tooltip.transition()
            .duration(500)
            .style('opacity', 0.9)
            .style('visibility', 'hidden')
        })

    // Subtitle
    const subtitle = d3.select('#description')
        .text(`${min_x} - ${max_x}: base Temperature ${baseTemp} °C - Based on Total of ${totalData.length} values`)

    // Legend
    const w_legend = w/4;
    const h_legend = 125;

    const legend = d3.select('#legend')
        .append('svg')
        .attr('width', w_legend+100)
        .attr('height', h_legend-20)

    // Legend scale
    const legendScale = d3.scaleBand()
        .domain([0, 3.9, 5, 6, 7, 8, 9.5, 10.5, 12.5])
        .range([0, w_legend])

    const legendAxis = d3.axisBottom(legendScale)
        .tickSize(10)
        .tickValues(legendScale.domain())

    legend.append('g')
        .attr('transform', `translate(${w_legend/8}, ${h_legend/2})`)
        .call(legendAxis)
        .style('font-size', '12px')

    const legendRectangles = [0, 3.9, 5, 6, 7, 8, 9.5, 10.5];

    legend.selectAll('rect')
        .data(legendRectangles)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i + legendScale(d) + w_legend/6)
        .attr('y', h_legend/2 - h_legend/4)
        .attr('width', w_legend/(legendRectangles.length))
        .attr('height', h_legend/4)
        .attr('stroke', 'black')
        .attr('fill', (d, i) => {
            return d == 0 ? color1
            : d == 3.9 ? color2
            : d == 5 ? color3
            : d == 6 ? color4
            : d == 7 ? color5
            : d == 8 ? color6
            : d == 9.5 ? color7
            : color8
        })
})