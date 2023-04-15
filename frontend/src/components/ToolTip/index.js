import React from "react";

//first use of children
export default function Tooltip({children, spotName, }) {

   // Init state for showing or hiding the tooltip
  const [show, setShow] = React.useState(false);

    // Render the tooltip
  return (
    <div>

      <div className="tooltip" style={show ? { visibility: "visible" } : {}}>
        {spotName}
        <span className="tooltip-arrow" />

      </div>
      
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
          {children}
      </div>
    </div>
  );
}