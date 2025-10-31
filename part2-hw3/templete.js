// Load the data
const socialMedia = d3.csv("socialMedia.csv");

// Once the data is loaded, proceed with plotting
socialMedia.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  let width = 500,
    height = 500;

  let margin = {
    top: 50,
    bottom: 50,
    left: 50,
    right: 50,
  };

  // Create the SVG container
  let svg = d3
    .select("#boxplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightyellow");

  // Set up scales for x and y axes
  // You can use the range 0 to 1000 for the number of Likes, or if you want, you can use
  // d3.min(data, d => d.Likes) to achieve the min value and
  // d3.max(data, d => d.Likes) to achieve the max value
  // For the domain of the xscale, you can list all three age groups or use
  // [...new Set(data.map(d => d.AgeGroup))] to achieve a unique list of the age group

  // Add scales
  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.Likes)])
    .range([height - margin.bottom, margin.top]);

  let xScale = d3
    .scaleBand()
    .domain([...new Set(data.map((d) => d.AgeGroup))])
    .range([margin.left, width - margin.right])
    .padding(0.5);

  let yAxis = svg
    .append("g")
    .call(d3.axisLeft().scale(yScale))
    .attr("transform", `translate(${margin.left}, 0)`);

  let xAxis = svg
    .append("g")
    .call(d3.axisBottom().scale(xScale))
    .attr("transform", `translate(0, ${height - margin.bottom})`);

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 5)
    .attr("text-anchor", "middle")
    .text("Age Group");

  // Add y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Number of Likes");

  const rollupFunction = function (groupData) {
    const values = groupData.map((d) => d.Likes).sort(d3.ascending);
    const min = d3.min(values);
    const q1 = d3.quantile(values, 0.25);
    const median = d3.quantile(values, 0.5);
    const q3 = d3.quantile(values, 0.75);
    const max = d3.max(values);
    return { min, q1, median, q3, max };
  };

  //groups by AgeGroup and computes and returns a quantile statistics for each group
  const quantilesByGroups = d3.rollup(data, rollupFunction, (d) => d.AgeGroup);

  //iterate through each age group and the quantiles to make the boxplots
  quantilesByGroups.forEach((quantiles, AgeGroup) => {
    //get the x-coordinate position for the center of a age group's boxplot
    const x = xScale(AgeGroup);
    //get the width for each boxplot using the scaleBand's bandwidth
    const boxWidth = xScale.bandwidth();

    // Draw vertical lines
    svg
      .append("line")
      .attr("x1", x + boxWidth / 2)
      .attr("x2", x + boxWidth / 2)
      .attr("y1", yScale(quantiles.min))
      .attr("y2", yScale(quantiles.max))
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    // Draw box
    svg
      .append("rect")
      .attr("x", x)
      .attr("y", yScale(quantiles.q3))
      .attr("width", boxWidth)
      .attr("height", yScale(quantiles.q1) - yScale(quantiles.q3))
      .attr("fill", "lightyellow")
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Draw median line (horizontal line through the middle of the box)
    svg
      .append("line")
      .attr("x1", x)
      .attr("x2", x + boxWidth)
      .attr("y1", yScale(quantiles.median))
      .attr("y2", yScale(quantiles.median))
      .attr("stroke", "black")
      .attr("stroke-width", 2);
  });
});

// Prepare you data and load the data again.
// This data should contains three columns, platform, post type and average number of likes.
const socialMediaAvg = d3.csv("SocialMediaAvg.csv");

socialMediaAvg.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.Likes = +d.Likes;
  });

  // Define the dimensions and margins for the SVG
  let width = 700,
    height = 500;

  let margin = {
    top: 50,
    bottom: 70,
    left: 60,
    right: 210,
  };

  // Create the SVG container
  let svg = d3
    .select("#barplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightyellow");

  // Define four scales
  // Scale x0 is for the platform, which divide the whole scale into 4 parts
  // Scale x1 is for the post type, which divide each bandwidth of the previous x0 scale into three part for each post type
  // Recommend to add more spaces for the y scale for the legend
  // Also need a color scale for the post type

  const x0 = d3
    .scaleBand()
    .domain([...new Set(data.map((d) => d.Platform))])
    .range([margin.left, width - margin.right])
    .padding(0.2);

  const x1 = d3
    .scaleBand()
    .domain([...new Set(data.map((d) => d.PostType))])
    .range([0, x0.bandwidth()])
    .padding(0.05);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.AvgLikes)])
    .range([height - margin.bottom, margin.top]);

  const color = d3
    .scaleOrdinal()
    .domain([...new Set(data.map((d) => d.PostType))])
    .range(["#1f77b4", "#ff7f0e", "#2ca02c"]);

  // Add scales x0 and y
  svg
    .append("g")
    .call(d3.axisBottom(x0))
    .attr("transform", `translate(0, ${height - margin.bottom})`);

  svg
    .append("g")
    .call(d3.axisLeft(y))
    .attr("transform", `translate(${margin.left}, 0)`);

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Platform");

  // Group container for bars
  const barGroups = svg
    .selectAll("bar")
    .data(data)
    .enter()
    .append("g")
    .attr("transform", (d) => `translate(${x0(d.Platform)},0)`);

  // Draw bars

  barGroups
    .append("rect")
    .attr("x", (d) => x1(d.PostType)) // Position within platform group
    .attr("y", (d) => y(d.AvgLikes)) 
    .attr("width", x1.bandwidth()) 
    .attr("height", (d) => y(0) - y(d.AvgLikes)) // Height from baseline to value
    .attr("fill", (d) => color(d.PostType)); // Color by post type

  // Add the legend
  const legend = svg
    .append("g")
    .attr("transform", `translate(${width - 150}, ${margin.top})`);

  const types = [...new Set(data.map((d) => d.PostType))];

  types.forEach((type, i) => {
    // Alread have the text information for the legend.
    // Now add a small square/rect bar next to the text with different color.
    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", i * 20)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(type));
    legend
      .append("text")
      .attr("x", 20)
      .attr("y", i * 20 + 12)
      .text(type)
      .attr("alignment-baseline", "middle");
  });
});

// Prepare you data and load the data again.
// This data should contains two columns, date (3/1-3/7) and average number of likes.

const socialMediaTime = d3.csv("socialMediaTime.csv");

socialMediaTime.then(function (data) {
  // Convert string values to numbers
  data.forEach(function (d) {
    d.AvgLikes = +d.AvgLikes;
  });
  // Define the dimensions and margins for the SVG
  let width = 600,
    height = 500;

  let margin = {
    top: 50,
    bottom: 100, // Extra space for rotated labels
    left: 60,
    right: 50,
  };

  // Create the SVG container
  let svg = d3
    .select("#lineplot")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .style("background", "lightyellow");

  // Set up scales for x and y axes
  let xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.Date))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  let yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => d.AvgLikes)])
    .range([height - margin.bottom, margin.top]);

  // Draw the x-axis with rotated text
  svg
    .append("g")
    .call(d3.axisBottom(xScale))
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("transform", "rotate(-25)");

  // Draw the y-axis
  svg
    .append("g")
    .call(d3.axisLeft(yScale))
    .attr("transform", `translate(${margin.left}, 0)`);

  // Add x-axis label
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", height - 10)
    .attr("text-anchor", "middle")
    .text("Date");

  // Add y-axis label
  svg
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -(height / 2))
    .attr("y", 20)
    .attr("text-anchor", "middle")
    .text("Average Likes");

  // Draw the line and path using curveNatural
  let line = d3
    .line()
    .x((d) => xScale(d.Date) + xScale.bandwidth() / 2)
    .y((d) => yScale(d.AvgLikes))
    .curve(d3.curveNatural);

  svg
    .append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);
});
