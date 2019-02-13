import React from "react";

import './BookingsControls.css'

const bookingsControls = props => {
  return (
    <div className="bookings-controls">
      <button
        className={props.activeOutPutType === "bookings" ? "active" : ""}
        onClick={props.onChange.bind(this, "bookings")}
      >
        Bookings
      </button>
      <button
        className={props.activeOutPutType === "chart" ? "active" : ""}
        onClick={props.onChange.bind(this, "chart")}
      >
        Chart
      </button>
    </div>
  );
};

export default bookingsControls;
