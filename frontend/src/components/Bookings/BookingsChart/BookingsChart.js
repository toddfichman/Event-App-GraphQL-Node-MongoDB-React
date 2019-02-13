import React from "react";

import { Bar as BarChart } from "react-chartjs";

const BOOKINGS_CATEGORIES = {
  $: {
    min: 0,
    max: 75
  },
  $$: {
    min: 75,
    max: 149
  },
  $$$: {
    min: 149,
    max: 1000000000
  }
};

const bookingsChart = props => {
  const chartData = { labels: [], datasets: [] };
  let values = [];
  for (const category in BOOKINGS_CATEGORIES) {
    //counting up the number of bookins that fit into each caterogy
    const filteredBookingsCount = props.bookings.reduce((prev, current) => {
      //current is refering to a booking obj
      if (
        current.event.price > BOOKINGS_CATEGORIES[category].min &&
        current.event.price < BOOKINGS_CATEGORIES[category].max
      ) {
        return prev + 1;
      } else {
        return prev;
      }
    }, 0);
    values.push(filteredBookingsCount);
    chartData.labels.push(category);
    chartData.datasets.push({
      // label: "My First dataset",
      fillColor: "rgba(220,220,220,0.5)",
      strokeColor: "rgba(220,220,220,0.8)",
      highlightFill: "rgba(220,220,220,0.75)",
      highlightStroke: "rgba(220,220,220,1)",
      data: values
    });
    values = [...values];
    values[values.length - 1] = 0; //reseting value on each pass of for...in loop, so not all data goes in first column
  }
  console.log(chartData);

  return (
    <div style={{ textAlign: "center" }}>
      <BarChart data={chartData} />
    </div>
  );
};

export default bookingsChart;
